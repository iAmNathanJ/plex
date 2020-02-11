import { encode } from "./deps.ts";

export enum CURSOR {
  SAVE = "\x1B[s",
  RESTORE = "\x1B[u",
  HIDE = "\x1B[?25l",
  SHOW = "\x1B[?25h",

  CLEAR_RIGHT = "\x1B[0K",
  CLEAR_LEFT = "\x1B[1K",
  CLEAR_LINE = "\x1B[2K",

  CLEAR_DOWN = "\x1B[0J",
  CLEAR_UP = "\x1B[1J",
  CLEAR_SCREEN = "\x1B[2J",

  NEXT_LINE = "\x1B[1E",
  PREV_LINE = "\x1B[1F",
  COLUMN = "\x1B[1G",
  HOME = "\x1B[H",

  UP = "\x1B[1A",
  DOWN = "\x1B[1B",
  FORWARD = "\x1B[1C",
  BACKWARD = "\x1B[1D"
}

async function cursorAcion(action: CURSOR | string): Promise<void> {
  await Deno.stdout.write(encode(action));
}

async function hideCursor(): Promise<void> {
  await cursorAcion(CURSOR.HIDE);
}

async function showCursor(): Promise<void> {
  await cursorAcion(CURSOR.SHOW);
}

async function clearLeft(): Promise<void> {
  await cursorAcion(CURSOR.CLEAR_LEFT);
}

async function clearRight(): Promise<void> {
  await cursorAcion(CURSOR.CLEAR_RIGHT);
}

async function clearLine(): Promise<void> {
  await cursorAcion(CURSOR.CLEAR_LINE);
}

async function clearScreen(): Promise<void> {
  await cursorAcion(CURSOR.CLEAR_SCREEN);
}

async function nextLine(): Promise<void> {
  await cursorAcion(CURSOR.NEXT_LINE);
}

async function prevLine(): Promise<void> {
  await cursorAcion(CURSOR.PREV_LINE);
}

async function goHome(): Promise<void> {
  await cursorAcion(CURSOR.HOME);
}

async function goUp(y = 1): Promise<void> {
  await cursorAcion(`\x1B[${y}A`);
}

async function goDown(y = 1): Promise<void> {
  await cursorAcion(`\x1B[${y}B`);
}

async function goLeft(x = 1): Promise<void> {
  await cursorAcion(`\x1B[${x}C`);
}

async function goRight(x = 1): Promise<void> {
  await cursorAcion(`\x1B[${x}D`);
}

async function goTo(x: number, y: number): Promise<void> {
  await cursorAcion(`\x1B[${y};${x}H`);
}

export {
  hideCursor,
  showCursor,
  clearLeft,
  clearRight,
  clearLine,
  clearScreen,
  nextLine,
  prevLine,
  goHome,
  goUp,
  goDown,
  goLeft,
  goRight,
  goTo
};
