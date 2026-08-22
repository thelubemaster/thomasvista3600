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
        detail: "5=17C 4=17A 3=97H 1=97L 2=97AV",
        look: "5-cavity micro.",
        pins: "1 2 3 4 5",
        relayId: "661",
      },
      { id: "int", label: "STARTER INTERRUPT", kind: "connector", x: 280, y: 160, detail: "", pins: "2" },
      { id: "rel", label: "START RELAY (387)", kind: "relay", x: 720, y: 80, detail: "", look: "Black 4-cavity.", pins: "30 87 85 86" },
      { id: "cec", label: "CEC (379)", kind: "module", x: 500, y: 40, detail: "" },
      { id: "neut", label: "NEUTRAL POSITION SWITCH", kind: "connector", x: 500, y: 300, detail: "", pins: "2" },
      { id: "r615", label: "TRANSMISSION NEUTRAL RELAY (615)", kind: "relay", x: 720, y: 300, detail: "", look: "ISO 4-cavity.", pins: "4 3 1 2" },
    ],
    wires: [
      { id: "w2", from: "int", to: "r661", circuit: "17C", color: "ign", label: "5" },
      { id: "w3", from: "r661", to: "rel", circuit: "17A", color: "ign", label: "4" },
      { id: "w4", from: "cec", to: "r661", circuit: "97H", color: "c", label: "3" },
      { id: "w5", from: "neut", to: "r661", circuit: "97L", color: "c", label: "1" },
      { id: "w8", from: "r615", to: "r661", circuit: "97AV", color: "a", label: "2" },
    ],
  } as FlowMap);
  const hits = map.wires.filter((w) => w.from === "r661" || w.to === "r661");
  assert.equal(hits.length, 5, hits.map((w) => `${w.id}:${w.from}->${w.to}`).join(", "));
});
