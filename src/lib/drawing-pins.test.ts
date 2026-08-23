import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { connectors } from "../data/connectors.ts";
import { pinsOnSchematic } from "./drawing-pins.ts";

function loadCircuit17() {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../data/schematics.ts"), "utf8");
  const start = src.indexOf('\n    id: "17"');
  const end17n = src.indexOf('\n    id: "17N"', start);
  const end = end17n > start ? end17n : src.indexOf('\n    id: "18"', start);
  const block = src.slice(start, end);
  const nodes: { id: string; pins?: string; sub?: string }[] = [];
  const nodeRe = /\{ id: "([^"]+)",[\s\S]*?x: \d+/g;
  const wiresStart = block.indexOf("wires:");
  let n: RegExpExecArray | null;
  while ((n = nodeRe.exec(block))) {
    if (wiresStart >= 0 && n.index > wiresStart) break;
    const slice = block.slice(n.index, n.index + 500);
    nodes.push({
      id: n[1],
      pins: /pins: "([^"]*)"/.exec(slice)?.[1],
      sub: /sub: "([^"]*)"/.exec(slice)?.[1],
    });
  }
  const wires: { from: string; to: string; circuit: string; label?: string }[] = [];
  const wireRe =
    /\{ id: "[^"]+", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)", color: "[^"]+"(?:, label: "([^"]+)")?/g;
  while ((n = wireRe.exec(block))) wires.push({ from: n[1], to: n[2], circuit: n[3], label: n[4] });
  return { id: "17", nodes, wires };
}

test("circuit 17 dash connector (2) shows G6 and B6", () => {
  const map = loadCircuit17();
  const conn = connectors.find((c) => c.id === "dash-2-hyd");
  assert.ok(conn);
  const pins = pinsOnSchematic(conn, map as never, "bulk");
  assert.deepEqual(
    pins.map((p) => `${p.cavity}=${p.circuit.split(" ")[0]}`).sort(),
    ["B6=97P", "G6=17F"],
  );
});

test("circuit 17 engine dash (3) shows U and I", () => {
  const map = loadCircuit17();
  const conn = connectors.find((c) => c.id === "eng-dash-3");
  assert.ok(conn);
  const pins = pinsOnSchematic(conn, map as never, "eng3");
  assert.deepEqual(
    pins.map((p) => p.cavity).sort(),
    ["I", "U"],
  );
});
