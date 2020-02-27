# `Plex`

Simple process runner for [Deno] - a thin wrapper around `Deno.run`.

## Usage

### Single Process

```js
import { Process } from "https://cdn.jsdelivr.net/gh/iamnathanj/plex@v1.0.0/mod.ts";

const proc = new Process({
  name: "my-process",
  cmd: "deno some-file.ts"
});

proc.on("stdout", event => {
  // e.target will be a Process object
  Deno.stdout.writeSync(event.detail);
});

proc.on("stderr", event => {
  // e.target will be a Process object
  Deno.stderr.writeSync(event.detail);
});

proc.start();

await proc.complete();
```

### Multiple Processes

```js
import { Process, Plex } from "https://cdn.jsdelivr.net/gh/iamnathanj/plex@v1.0.0/mod.ts";

const multiProcess = new Plex([
  new Process({
    name: "process-1",
    cmd: "echo 1"
  }),
  new Process({
    name: "process-2",
    cmd: "echo 2"
  })
]);

// .listen will read from both stdout and stderr
multiProcess.listen(e => {
  // e.target will be a Process object
  Deno.stdout.writeSync(e.detail);
});

multiProcess.start()

await multiProcess.complete();
```

### Watching

Watching uses file system polling with [fs-poll]. This is temporary and will be replaced with Deno [fsEvents] soon.

```js
new Process({ name: "my process", cmd: "long running"}).watch({ root: Deno.cwd() });
```

### Chaining
Things are chainable if you like that sort of thing.
```js
await new Process({ name: "my process", cmd: "some task" })
  .watch({ root: Deno.cwd() })
  .on("stdout", e => Deno.stdout.writeSync(e.detail))
  .on("stderr", e => Deno.stdout.writeSync(e.detail))
  .start()
  .complete();
```

```js
await new Plex([
  new Process({ name: "proc-1", cmd: "my cmd"}).watch({ root: "./some/dir" }),
  new Process({ name: "proc-2", cmd: "my cmd 2" }).watch({ root: "some/other/dir" })
])
  .listen(e => Deno.stdout.writeSync(e.detail))
  .start()
  .complete();
```

[Deno]: https://deno.land/
[fs-poll]: https://github.com/iAmNathanJ/fs-poll
[fsEvents]: https://github.com/denoland/deno/pull/3452
