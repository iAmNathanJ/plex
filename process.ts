import { watch, WatchOptions } from "./deps.ts";

type OutputChannel = "stdout" | "stderr";
type EventHandler = (event: Event) => void | null;
type CustomEventHandler = (event: CustomEvent) => any;

type ProcessParams = {
  name: string;
  cmd: string;
};

const { run, toAsyncIterator } = Deno;

class Process extends EventTarget {
  readonly name: string;
  readonly cmd: string;
  public process: Deno.Process | undefined;

  constructor({ name, cmd }: ProcessParams) {
    super();
    this.name = name;
    this.cmd = cmd;
  }

  start() {
    this.process = run({
      args: this.cmd.split(/\s+/g),
      stdout: "piped",
      stderr: "piped"
    });

    this.publishOutput("stdout");
    this.publishOutput("stderr");

    return this;
  }

  async complete() {
    return this.process?.status();
  }

  kill() {
    if (!this.process) return;
    this.process.kill(1);
  }

  on(type: OutputChannel, handler: CustomEventHandler) {
    super.addEventListener(type, handler as EventHandler);
    return this;
  }

  off(type: OutputChannel, handler: CustomEventHandler) {
    super.removeEventListener(type, handler as EventHandler);
    return this;
  }

  watch(options: WatchOptions) {
    watch({
      ...options,
      handle: (e: any) => {
        console.log(e);
        this.kill();
        this.start();
      }
    });
    return this;
  }

  private async publishOutput(channel: OutputChannel): Promise<void> {
    if (!this.process) return;
    for await (const message of toAsyncIterator(this.process[channel]!)) {
      this.dispatchEvent(
        new CustomEvent(channel, {
          detail: message
        })
      );
    }
  }
}

class Plex {
  private processes: Set<Process>;

  constructor(processes: Process[]) {
    this.processes = new Set(processes);
  }

  listen(
    handler: CustomEventHandler,
    channels: OutputChannel[] = ["stdout", "stderr"]
  ) {
    for (const p of this.processes) {
      channels.forEach(channel => {
        p.on(channel, handler);
        p.on(channel, handler);
      });
    }
    return this;
  }

  ignore(
    handler: CustomEventHandler,
    channels: OutputChannel[] = ["stdout", "stderr"]
  ) {
    for (const p of this.processes) {
      channels.forEach(channel => {
        p.off(channel, handler);
        p.off(channel, handler);
      });
    }
    return this;
  }

  start(handler?: CustomEventHandler) {
    if (typeof handler === "function") {
      this.listen(handler);
    }
    this.processes.forEach(p => p.start());
    return this;
  }

  complete() {
    return Promise.all([...this.processes].map(p => p.complete()));
  }
}

export { Plex, Process, ProcessParams };
