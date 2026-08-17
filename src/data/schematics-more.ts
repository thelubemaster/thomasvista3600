import type { FlowMap } from "@/data/schematics";

function map(
  id: string,
  title: string,
  crit: boolean,
  power: string,
  blurb: string,
  from: string,
  fromSub: string,
  to: string,
  toSub: string,
  mid?: { id: string; label: string; sub: string },
): FlowMap {
  const nodes: FlowMap["nodes"] = [
    { id: "a", label: from, sub: fromSub, kind: "source", x: 120, y: 120, detail: blurb, look: from },
  ];
  const wires: FlowMap["wires"] = [];
  if (mid) {
    nodes.push({ id: "m", label: mid.label, sub: mid.sub, kind: "connector", x: 500, y: 120, detail: mid.label, look: mid.label, pins: mid.sub });
    nodes.push({ id: "b", label: to, sub: toSub, kind: "load", x: 880, y: 120, detail: to, look: to });
    wires.push({ id: "w1", from: "a", to: "m", circuit: id, color: "ign" });
    wires.push({ id: "w2", from: "m", to: "b", circuit: id, color: "a" });
  } else {
    nodes.push({ id: "b", label: to, sub: toSub, kind: "load", x: 700, y: 120, detail: to, look: to });
    wires.push({ id: "w1", from: "a", to: "b", circuit: id, color: "ign" });
  }
  nodes.push({
    id: "gndCab",
    label: "CAB / ENGINE GROUND (11)",
    sub: "Circuit 11",
    kind: "source",
    x: mid ? 880 : 700,
    y: 280,
    detail: "Every load returns on circuit 11. Cab ring, engine block, or frame.",
    look: "Ring terminal.",
    pins: "GND",
  });
  wires.push({ id: "wg", from: "b", to: "gndCab", circuit: "11", color: "gnd", label: "11" });
  return {
    id,
    number: id,
    title,
    blurb,
    engineCritical: crit,
    power,
    defaultId: "a",
    height: 380,
    nodes,
    wires,
    legend: [
      { id, cavity: "CID p.108–109", note: title },
      { id: "11", cavity: "GROUND", note: "Load return. Circuit 11." },
    ],
  };
}

export const moreMaps: FlowMap[] = [
  map("1", "GENERATOR - FIELD", false, "Battery", "Printed page 18. Field from the generator.", "GENERATOR", "Field", "BODY BUILDER FEED STUD (J1)", "Charge path"),
  map("7", "GENERATOR - REGULATOR", false, "Signal", "Regulator sense / field control.", "GENERATOR", "Regulator", "FUSE BLOCK", "Sense"),
  map("12", "ACCESSORY FEED", false, "Key ACC", "KEY SWITCH (63) ACC → J2 → D1 / E1.", "KEY SWITCH (63) ACC", "Circuit 12", "ACCESSORY FEED (J2)", "Left lower dash", { id: "fuse", label: "FUSE D1 / E1", sub: "ACC fuses" }),
  map("24", "EXHAUST BRAKE", false, "Signal", "CEC 15. Rare on a 3600 bus.", "CEC CONTROL MODULE (379)", "Pin 15", "EXHAUST BRAKE", "Optional"),
  map("25", "PYROMETER", false, "Signal", "Optional pyrometer gauge.", "ENGINE", "EGT probe", "INSTRUMENT CLUSTER", "Gauge"),
  map("26", "AMMETER", false, "Signal", "GENERATOR charge sense to cluster.", "GENERATOR", "Charge sense", "INSTRUMENT CLUSTER LEFT — YELLOW (26)", "Cavity 7"),
  map("27", "VOLTMETER", false, "Signal", "Optional voltmeter.", "BATTERY FEED", "Sense", "INSTRUMENT CLUSTER", "Voltmeter"),
  map("29", "ENGINE WATER TEMPERATURE", false, "Signal", "Sender through DASH CONNECTOR (2) to YELLOW (26) 16.", "ENGINE", "Water sender", "INSTRUMENT CLUSTER LEFT — YELLOW (26)", "Cavity 16", { id: "d2", label: "DASH CONNECTOR (2)", sub: "Firewall" }),
  map("30", "ENGINE OIL TEMPERATURE", false, "Signal", "Optional oil-temp sender.", "ENGINE", "Oil temp sender", "INSTRUMENT CLUSTER", "Gauge"),
  map("33", "ENGINE OIL LEVEL", false, "Signal", "Optional oil-level warning.", "ENGINE", "Level switch", "AUDIBLE ALARM (20)", "Warning"),
  map("34", "COOLANT LEVEL", false, "Key", "Low-coolant with G1 / Allison feed.", "FUSE G1 15A IGN/XMSN", "Key-on", "COOLANT LEVEL SWITCH", "Warning"),
  map("35", "ENGINE OIL PRESSURE", false, "Signal", "Oil-pressure sender / warning.", "ENGINE", "Oil pressure", "INSTRUMENT CLUSTER LEFT — YELLOW (26)", "Cavity 10"),
  map("37", "FUEL PUMP", false, "Key", "Electric pump if equipped.", "FUSE BLOCK", "Key-on", "FUEL PUMP", "Tank / frame"),
  map("40", "LOW AIR PRESSURE WARNING", false, "Signal", "Air-brake only. Not on hyd 004040.", "AIR SWITCH", "Low air", "AUDIBLE ALARM (20)", "Cavity 3"),
  map("43", "POWER DIVIDER LOCK (PDL)", false, "Signal", "Tandem / PDL option.", "PDL SWITCH", "Cab", "PDL SOLENOID", "Axle"),
  map("44", "BRAKE SYSTEM WARNING", false, "Signal", "Hyd monitor → NATURAL (28) cavity 17.", "HYDRAULIC BRAKE WARNING LIGHT W/004040 (49)", "Monitor", "INSTRUMENT CLUSTER RIGHT — NATURAL (28)", "Cavity 17"),
  map("46", "POWER TAKE OFF (PTO) WARNING", false, "Signal", "Optional PTO lamp.", "PTO SWITCH", "Cab", "INSTRUMENT CLUSTER", "PTO lamp"),
  map("48", "TACHOMETER", false, "Signal", "CEC / engine speed to cluster.", "CEC CONTROL MODULE (379)", "Tach out", "INSTRUMENT CLUSTER", "Tach"),
  map("49", "DIFFERENTIAL LOCK ENGAGED WARNING", false, "Signal", "Optional locker lamp.", "DIFF LOCK SWITCH", "Axle", "INSTRUMENT CLUSTER", "Lamp"),
  map("51", "DIMMER SWITCH-FEED", false, "Battery", "HEADLIGHT SWITCH (60) to dimmer.", "HEADLIGHT SWITCH (60)", "Feed", "FRONT END CONNECTOR (2B)", "HI / LO"),
  map("52", "HEADLIGHT - HI BEAM", false, "Battery", "2B to LEFT HEADLIGHT (502) / RIGHT (504).", "FRONT END CONNECTOR (2B)", "HI", "LEFT HEADLIGHT (502)", "HI 52", { id: "cl", label: "YELLOW (26) cavity 2", sub: "HI indicator" }),
  map("53", "HEADLIGHT - LO BEAM", false, "Battery", "2B to both headlights LO.", "FRONT END CONNECTOR (2B)", "LO", "LEFT HEADLIGHT (502)", "LO 53"),
  map("56", "LEFT TURN SIGNAL", false, "Battery", "TURN SIGNAL SWITCH (459) → lamp + GREEN (27) cavity 6.", "NAVISTAR TURN SIGNAL SWITCH (459)", "Left", "LEFT TURN SIGNAL", "Front / body", { id: "cl", label: "GREEN (27) cavity 6", sub: "Indicator" }),
  map("57", "RIGHT TURN SIGNAL", false, "Battery", "459 → right lamp + GREEN (27) cavity 12.", "NAVISTAR TURN SIGNAL SWITCH (459)", "Right", "RIGHT TURN", "Front / body", { id: "cl", label: "GREEN (27) cavity 12", sub: "Indicator" }),
  map("58", "CLEARANCE/IDENTIFICATION", false, "Battery", "Park / marker family to BODY BUILDER (194).", "HEADLIGHT SWITCH (60)", "Park", "BODY BUILDER (194)", "Clearance"),
  map("60", "HAZARD FLASHER-FEED", false, "Battery", "FLASHER (R1) hazard out.", "FLASHER (R1)", "Hazard", "NAVISTAR TURN SIGNAL SWITCH (459)", "Haz"),
  map("61", "AIR SUSPENSION RELEASE", false, "Signal", "Optional air-ride dump.", "DUMP SWITCH", "Cab", "AIR VALVE", "Bags"),
  map("65", "CAB REAR FLOOD LIGHT(S)", false, "Battery", "Optional rear flood.", "SWITCH", "Cab", "FLOOD LAMP", "Rear"),
  map("66", "DAYTIME RUNNING LIGHTS", false, "Key", "DRL module if equipped.", "DRL MODULE", "Optional", "HEADLIGHTS", "Reduced"),
  map("68", "TAIL LIGHTS", false, "Battery", "Park feed to BODY BUILDER (194) tails.", "HEADLIGHT SWITCH (60)", "Park", "BODY BUILDER (194)", "Tail"),
];
