import { assertEquals, decode } from "./dev-deps.ts";
import { delay } from "./deps.ts";
import { Process, Plex } from "./process.ts";

Deno.test("Process runs a process", async () => {
  let output: string;

  await new Process({
    name: "test-process",
    cmd: "echo testing"
  })
    .on("stdout", e => {
      output = decode(e.detail).trim();
    })
    .start()
    .complete();

  await delay(1);
  assertEquals(output!, "testing");
});

Deno.test("Plex runs multiple processes", async () => {
  const output: string[] = [];

  await new Plex([
    new Process({
      name: "test-process1",
      cmd: "echo testing 1"
    }),
    new Process({
      name: "test-process2",
      cmd: "echo testing 2"
    })
  ])
    .listen(e => {
      output.push(decode(e.detail).trim());
    })
    .start()
    .complete();

  await delay(1);
  assertEquals(output[0], "testing 1");
  assertEquals(output[1], "testing 2");
});

// Deno.test("Process.watch calls the passed handler", () => {});
// Deno.test("Plex.watch calls the passed handler", () => {});
