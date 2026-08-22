import assert from "node:assert/strict";
import { test } from "node:test";
import { withGrounds } from "./grounds.ts";
import type { FlowMap } from "./schematics.ts";

test("withGrounds does not add a sixth wire to 5-cavity crank relay 661", () => {
  const map = withGrounds({
    id: "17",
    number: "17",
    title: "STARTER CONTROL",
    blurb: "",
    engineCritical: true,
    power: "Mixed",
    defaultId: "r661",
    nodes: [
      {
        id: "r661",
        label: "CRANK RELAY (661)",
        sub: "5-cavity",
        kind: "relay",
        x: 500,
        y: 160,
        detail: "5=17C 4=17A 3=97H 1=97L pin 2 empty",
        look: "5-cavity micro.",
        pins: "1 2 3 4 5",
        relayId: "661",
      },
      { id: "int", label: "STARTER INTERRUPT", kind: "connector", x: 280, y: 160, detail: "", pins: "2" },
      { id: "rel", label: "START RELAY (387)", kind: "relay", x: 720, y: 80, detail: "", look: "Black 4-cavity.", pins: "30 87 85 86" },
      { id: "cec", label: "CEC (379)", kind: "module", x: 500, y: 40, detail: "" },
      { id: "neut", label: "NEUTRAL POSITION SWITCH", kind: "connector", x: 500, y: 300, detail: "", pins: "2" },
    ],
    wires: [
      { id: "w2", from: "int", to: "r661", circuit: "17C", color: "ign", label: "5" },
      { id: "w3", from: "r661", to: "rel", circuit: "17A", color: "ign", label: "4" },
      { id: "w4", from: "cec", to: "r661", circuit: "97H", color: "c", label: "3" },
      { id: "w5", from: "neut", to: "r661", circuit: "97L", color: "c", label: "1" },
    ],
  } as FlowMap);
  const hits = map.wires.filter((w) => w.from === "r661" || w.to === "r661");
  assert.equal(hits.length, 4, hits.map((w) => `${w.id}:${w.from}->${w.to}`).join(", "));
  assert.equal(hits.some((w) => w.circuit === "97AV"), false);
});

test("withGrounds does not invent a 434 ground back to 399", () => {
  const map = withGrounds({
    id: "19",
    number: "19",
    title: "FUEL SHUT-OFF SOLENOID, FUEL FILTER",
    blurb: "",
    engineCritical: true,
    power: "Key + Battery",
    defaultId: "lamp434",
    nodes: [
      {
        id: "lamp434",
        label: "FUEL FILTER LIGHT (434)",
        sub: "19K only",
        kind: "load",
        x: 130,
        y: 340,
        detail: "One-wire dash lamp.",
        look: "1-cavity dash lamp.",
        pins: "1",
      },
      { id: "spliceWlB", label: "SPLICE", kind: "splice", x: 280, y: 190, detail: "" },
      { id: "ff399", label: "FUEL FILTER (399)", kind: "connector", x: 620, y: 325, detail: "", pins: "A B C D E F" },
    ],
    wires: [{ id: "w10", from: "spliceWlB", to: "lamp434", circuit: "19K", color: "c", label: "434" }],
  } as FlowMap);
  const hits = map.wires.filter((w) => w.from === "lamp434" || w.to === "lamp434");
  assert.equal(hits.length, 1, hits.map((w) => `${w.id}:${w.from}->${w.to}:${w.circuit}`).join(", "));
  assert.equal(hits[0]?.circuit, "19K");
  assert.equal(
    map.wires.some((w) => w.color === "gnd" && (w.from === "lamp434" || w.to === "lamp434")),
    false,
  );
  assert.equal(
    map.wires.some(
      (w) =>
        (w.from === "lamp434" && w.to === "ff399") || (w.from === "ff399" && w.to === "lamp434"),
    ),
    false,
  );
});

test("withGrounds does not add a fifth wire to 4-cavity WIF module 470", () => {
  const map = withGrounds({
    id: "19",
    number: "19",
    title: "FUEL SHUT-OFF SOLENOID, FUEL FILTER",
    blurb: "",
    engineCritical: true,
    power: "Key + Battery",
    defaultId: "mod470",
    nodes: [
      {
        id: "mod470",
        label: "WATER-IN-FUEL MODULE (470)",
        sub: "4 wires · A B C D",
        kind: "module",
        x: 130,
        y: 500,
        detail: "Four wires only.",
        look: "4-cavity weather pack on the warning-light overlay.",
        pins: "A=IGN / B=OUT / D=PROBE / C=TEST",
      },
      { id: "spliceWlB", label: "SPLICE", kind: "splice", x: 280, y: 190, detail: "" },
      { id: "wif433", label: "WIF LIGHT (433)", kind: "load", x: 130, y: 700, detail: "", pins: "2" },
      { id: "ff399", label: "FUEL FILTER (399)", kind: "connector", x: 620, y: 325, detail: "", pins: "A B C D E F" },
      { id: "diode1cr", label: "BLOCKING DIODE (1CR)", kind: "load", x: 280, y: 280, detail: "", look: "2-pin diode.", pins: "A / B" },
    ],
    wires: [
      { id: "w11", from: "spliceWlB", to: "mod470", circuit: "19J", color: "ign", label: "470 IGN" },
      { id: "w12", from: "mod470", to: "wif433", circuit: "19L", color: "a", label: "OUT" },
      { id: "w18", from: "ff399", to: "mod470", circuit: "19B", color: "b", label: "E → PROBE" },
      { id: "w21", from: "diode1cr", to: "mod470", circuit: "19M", color: "c", label: "TEST" },
    ],
  } as FlowMap);
  const hits = map.wires.filter((w) => w.from === "mod470" || w.to === "mod470");
  assert.equal(hits.length, 4, hits.map((w) => `${w.id}:${w.from}->${w.to}:${w.circuit}`).join(", "));
  assert.deepEqual(
    hits.map((w) => w.circuit).sort(),
    ["19B", "19J", "19L", "19M"],
  );
});
