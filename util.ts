function concatBuffer(buf1: Uint8Array, buf2: Uint8Array): Uint8Array {
  const newBuf = new Uint8Array(buf1.byteLength + buf2.byteLength);
  newBuf.set(new Uint8Array(buf1), 0);
  newBuf.set(new Uint8Array(buf2), buf1.byteLength);
  return newBuf;
}

interface PollOptions {
  fn(): boolean;
  MAX_TRIES?: number;
  INTERVAL?: number;
}

async function poll(
  { fn, MAX_TRIES = 10, INTERVAL = 500 }: PollOptions,
  currentTry = 1
) {
  if (!fn() || currentTry < MAX_TRIES) {
    await wait(INTERVAL);
    poll({ fn }, currentTry + 1);
  }
}

async function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export { concatBuffer, poll };
