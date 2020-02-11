import { encode, decode } from "./deps.ts";
import { poll } from "./util.ts";

type OutputChannel = "stdout" | "stderr";
type EventHandler = (event: Event) => Promise<void> | void;

export const processes = new Set<Plex>();

export class Plex extends EventTarget {
  readonly name: string;
  readonly cmd: string;
  readonly process: Deno.Process;

  constructor({ name, cmd, process }) {
    super();
    this.name = name;
    this.process = process;
  }

  on(type: OutputChannel, handler: EventHandler) {
    super.addEventListener(type, handler);
    return this;
  }

  off(type: OutputChannel, handler: EventHandler) {
    super.removeEventListener(type, handler);
    return this;
  }

  kill() {
    kill(this);
  }
}

function createProcess(name: string, cmd: string): Plex {
  const process = Deno.run({
    args: cmd.split(/\s+/g),
    stdout: "piped",
    stderr: "piped"
  });

  const plex = new Plex({ name, cmd, process });
  processes.add(plex);
  syncOutput(plex, "stdout").catch((e: Error) => handleProcessError(plex, e));
  syncOutput(plex, "stderr").catch((e: Error) => handleProcessError(plex, e));

  return plex;
}

async function syncOutput(plex: Plex, channel: OutputChannel): Promise<void> {
  for await (const message of Deno.toAsyncIterator(plex.process[channel])) {
    plex.dispatchEvent(
      new CustomEvent(channel, {
        detail: encode(decode(message).trim())
      })
    );
  }
}

async function handleProcessError(plex: Plex, err: Error) {
  plex.dispatchEvent(new CustomEvent("error", err as CustomEventInit));
  await tryRestart(plex);
  kill(plex);
}

function tryRestart(plex: Plex) {
  plex.dispatchEvent(
    new CustomEvent("stderr", {
      detail: encode("Error: attempting restart")
    })
  );
  return poll({
    fn: () => !!createProcess(plex.name, plex.cmd)
  });
}

function kill(plex: Plex) {
  plex.process.kill(0);
  processes.delete(plex);
}

export { createProcess };
