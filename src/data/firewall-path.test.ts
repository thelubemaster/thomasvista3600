import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { hopsThatSkipFirewall } from "./firewall-path.ts";

function circuit19FromSource() {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "schematics.ts"), "utf8");
  const start = src.indexOf('id: "19"');
  const end = src.indexOf('\n  {\n    id: "13"');
  assert.ok(start >= 0 && end > start, "circuit 19 block");
  const block = src.slice(start, end);
  const fx = Number(/firewallX:\s*(\d+)/.exec(block)?.[1]);
  assert.ok(Number.isFinite(fx), "firewallX");
  const nodes: { id: string; x: number }[] = [];
  const nodeRe = /\{ id: "([^"]+)",[\s\S]*?x: (\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = nodeRe.exec(block))) {
    if (m.index > block.indexOf("wires:")) break;
    nodes.push({ id: m[1], x: Number(m[2]) });
  }
  const wires: { id: string; from: string; to: string }[] = [];
  const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)"/g;
  while ((m = wireRe.exec(block))) {
    wires.push({ id: m[1], from: m[2], to: m[3] });
  }
  return { firewallX: fx, nodes, wires };
}

test("circuit 19: no wire crosses the firewall except at DASH CONNECTOR (2)", () => {
  const { firewallX, nodes, wires } = circuit19FromSource();
  const skips = hopsThatSkipFirewall(nodes, wires, firewallX);
  assert.deepEqual(
    skips.map((w) => `${w.id}:${w.from}->${w.to}`),
    [],
    "every cab/engine hop must land on the firewall connector",
  );
});
