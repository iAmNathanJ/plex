import { watch, WatchOptions } from "./deps.ts";

type OutputChannel = "stdout" | "stderr";
type CustomEventListener = (event: CustomEvent) => void | Promise<void>;

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

  on(type: OutputChannel, handler: CustomEventListener) {
    super.addEventListener(type, handler as EventListener);
    return this;
  }

  off(type: OutputChannel, handler: CustomEventListener) {
    super.removeEventListener(type, handler as EventListener);
    return this;
  }

  watch(options?: Partial<WatchOptions>) {
    watch({
      ...(options ?? {}),
      handle: (e: any) => {
        this.kill();
        options?.handle?.(e);
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
    handler: CustomEventListener,
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
    handler: CustomEventListener,
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

  start() {
    this.processes.forEach(p => p.start());
    return this;
  }

  kill() {
    this.processes.forEach(p => p.kill());
  }

  watch(options?: Partial<WatchOptions>) {
    watch({
      ...(options ?? {}),
      handle: (e: any) => {
        this.kill();
        options?.handle?.(e);
        this.start();
      }
    });
    return this;
  }

  complete() {
    return Promise.all([...this.processes].map(p => p.complete()));
  }
}

export { Plex, Process, ProcessParams };
