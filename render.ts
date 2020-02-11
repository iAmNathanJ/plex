import { encode, decode } from "./deps.ts";
import { processes, Plex } from "./process.ts";
import { concatBuffer } from "./util.ts";
import {
  hideCursor,
  showCursor,
  goHome,
  nextLine,
  clearRight,
  clearScreen,
} from "./cursor.ts";

let processOutput = new Map<Plex, string[]>();

interface Component {
  name: string;
  homeLine: number;
  lineCount: number;
  message: Uint8Array;
}

// move all content up from
async function shiftUp({ from, to }) {}
async function shiftDown({ from, to }) {}
async function renderHead(plex: Plex) {}
async function renderBody(plex: Plex) {}
async function render2(plex: Plex) {
  renderHead(plex);
  renderBody(plex);
}

function setProcess(plex: Plex, message: Uint8Array) {
  const lines = decode(message).split("\n");
  processOutput.set(plex, lines);
}

async function render() {
  // await clearScreen();
  await goHome();
  for (const [plex, lines] of processOutput) {
    for (const line of lines) {
      await Deno.stdout.write(
        concatBuffer(nameFormatter(plex.name), encode(line))
      );
      await clearRight();
      await nextLine();
    }
  }
}

async function start(): Promise<void> {
  await setup();
  handleShutdown();
  for (const plex of processes) {
    plex.addEventListener("stdout", async (e: CustomEvent) => {
      setProcess(plex, e.detail);
      await render();
    });
    plex.addEventListener("stderr", async (e: CustomEvent) => {
      setProcess(plex, e.detail);
      await render();
    });
  }
}

let nameFormatter = (name: string): Uint8Array => {
  return encode(name);
};

function formatProcessName(fn: (name: string) => Uint8Array) {
  nameFormatter = fn;
}

async function setup() {
  Deno.run({ args: ["clear"] });
  await hideCursor();
  await goHome();
}

async function handleShutdown() {
  await Promise.race([
    Deno.signals.interrupt(),
    Deno.signals.quit()
  ]);
  await showCursor();
  Deno.exit();
}

export { start, formatProcessName };
