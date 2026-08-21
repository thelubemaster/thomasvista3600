import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLUSTER_BOT_L,
  CLUSTER_BOT_R,
  CLUSTER_TOP_L,
  CLUSTER_TOP_R,
  DASH2_LEFT_COLS,
  DASH2_RIGHT_COLS,
  DASH2_ROWS,
  ENGINE2A_COLS,
  FILTER6_ROWS,
  FRONT2B_COLS,
  ISO_MICRO,
} from "../data/plug-face.ts";

test("dash connector (2) matches printed page 78", () => {
  assert.deepEqual([...DASH2_LEFT_COLS], ["4", "5", "6", "7"]);
  assert.deepEqual([...DASH2_RIGHT_COLS], ["3", "2", "1"]);
  assert.deepEqual([...DASH2_ROWS], ["A", "B", "C", "D", "E", "F", "G", "H"]);
});

test("engine 2A and front 2B columns match printed page 79", () => {
  assert.deepEqual([...ENGINE2A_COLS], ["7", "6", "5", "4"]);
  assert.deepEqual([...FRONT2B_COLS], ["1", "2", "3"]);
});

test("fuel filter 6-way is D C / E B / F A like printed page 83", () => {
  assert.deepEqual(
    FILTER6_ROWS.map((r) => [...r]),
    [
      ["D", "C"],
      ["E", "B"],
      ["F", "A"],
    ],
  );
});

test("ISO micro relay is the plus face from printed page 82", () => {
  assert.deepEqual([...ISO_MICRO], ["4", "5", "3", "2", "1"]);
});

test("cluster 17-way is split by the center latch like printed page 81", () => {
  assert.deepEqual([...CLUSTER_TOP_L], ["17", "16", "15", "14"]);
  assert.deepEqual([...CLUSTER_TOP_R], ["13", "12", "11", "10"]);
  assert.deepEqual([...CLUSTER_BOT_L], ["9", "8", "7", "6"]);
  assert.deepEqual([...CLUSTER_BOT_R], ["5", "4", "3", "2", "1"]);
  assert.equal(CLUSTER_TOP_L.length + CLUSTER_TOP_R.length + CLUSTER_BOT_L.length + CLUSTER_BOT_R.length, 17);
});
