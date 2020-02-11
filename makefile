.PHONY: test
.PHONY: fmt

test:
	deno test --allow-env --allow-write --allow-net **/*.test.ts

fmt:
	deno fmt **/*.ts
