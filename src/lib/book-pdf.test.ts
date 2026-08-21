import assert from "node:assert/strict";
import { test } from "node:test";
import { printedToPdfPage } from "./book-pdf.ts";

test("printed page 77 is PDF page 82", () => {
  assert.equal(printedToPdfPage("77"), 82);
});

test("printed page 1 skips the cover sheets", () => {
  assert.equal(printedToPdfPage("1"), 6);
});

test("printed 84A sits after 84", () => {
  assert.equal(printedToPdfPage("84"), 89);
  assert.equal(printedToPdfPage("84A"), 90);
  assert.equal(printedToPdfPage("85"), 91);
  assert.equal(printedToPdfPage("85A"), 92);
});

test("page ranges open at the first sheet", () => {
  assert.equal(printedToPdfPage("38–43"), 43);
  assert.equal(printedToPdfPage("108–109"), 115);
});
