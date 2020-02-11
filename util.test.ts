import { test, assertStrictEq, assertEquals } from "./deps-testing.ts";
import { poll, concatBuffer } from "./util.ts";

test("concatBuffer", () => {
  const buf1 = new Uint8Array([0]);
  const buf2 = new Uint8Array([1]);
  const result = Array.from(concatBuffer(buf1, buf2));
  assertEquals(result, [0, 1]);
});

test("poll", async () => {
  // const pollFn = sinon.stub.returns(false);
  const pollFn = () => false;

  await poll({
    fn: pollFn,
    INTERVAL: 10,
    MAX_TRIES: 3
  });

  assertStrictEq(pollFn, 3);
});
