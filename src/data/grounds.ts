import type { FlowMap, FlowNode, FlowWire } from "@/data/schematics";

function nodeCavities(n: FlowNode): number | null {
  const t = `${n.label} ${n.sub ?? ""} ${n.look ?? ""} ${n.pins ?? ""}`;
  const lookN = /(\d+)\s*[-–]?\s*(?:way|cavity|cavities|pin|pins)\b/i.exec(t);
  if (lookN) return Number(lookN[1]);
  if (/\bISO 4\b/i.test(t)) return 4;
  if (n.kind === "relay") return 4;
  if (n.kind === "fuse") return 2;
  return null;
}

type GndSpec = {
  id: string;
  label: string;
  sub: string;
  circuit: string;
  detail: string;
};

function specFor(node: FlowNode, map: FlowMap): GndSpec {
  const t = `${node.label} ${node.sub ?? ""} ${map.title} ${map.number}`.toLowerCase();
  if (/cec|379|module pwr|396|662/.test(t)) {
    return {
      id: "gndCec",
      label: "CEC GROUND (11)",
      sub: "11-GW / GX / GY / GZ",
      circuit: "11-GW",
      detail: "CEC CONTROL MODULE (379) pins 1=11-GW, 2=11-GX, 23=11-GY, 42=11-GZ. Required for the 7.3 to run.",
    };
  }
  if (/starter|crank motor|j31|387/.test(t)) {
    return {
      id: "gndFrame",
      label: "FRAME / ENGINE GROUND",
      sub: "11-GJ / 2/0",
      circuit: "11-GJ",
      detail: "Printed page 20. 11-GJ 12WH to ENGINE BLOCK. 2/0 to LEFT FRAME GROUND. Start relay coil 17D is also a ground.",
    };
  }
  if (/glow/.test(t)) {
    return {
      id: "gndGlow",
      label: "GLOW GROUND (18-G)",
      sub: "FRONT END (2B) G3",
      circuit: "18-G",
      detail: "GLOW PLUGS/PRE-HEATER return. FRONT END CONNECTOR (2B) cavity G3.",
    };
  }
  if (/horn|61 /.test(t) || map.number === "85") {
    return {
      id: "gndHorn",
      label: "HORN GROUND (11)",
      sub: "605-B / J3",
      circuit: "11",
      detail: "HORN CONNECTOR (605) cavity B. Coil 85B is grounded by HORN SLIP RING (J3).",
    };
  }
  if (/aps|382|accelerator/.test(t)) {
    return {
      id: "gndAps",
      label: "APS GROUND",
      sub: "97CD / CEC 29",
      circuit: "97CD",
      detail: "ACCELERATION POSITION SWITCH (382) sensor ground back to CEC pin 29 / ENGINE DASH (3) S.",
    };
  }
  if (/cluster|26|27|28|instrument|gauge|panel/.test(t) && !/sender|temp|oil|fuel level/.test(t)) {
    return {
      id: "gndCl",
      label: "CLUSTER GROUND (28-G)",
      sub: "Cab · 11 / 28-G",
      circuit: "28-G",
      detail: "Instrument cluster grounds. Circuit 11 / 28-G on the YELLOW / GREEN / NATURAL 17-ways.",
    };
  }
  if (/headlight|turn|stop|marker|tail|park|fog|lamp|flood|clearance/.test(t)) {
    return {
      id: "gndLamp",
      label: "LAMP GROUND (11)",
      sub: "11-G*",
      circuit: "11",
      detail: "Lamp return. Circuit 11 (11-GB / 11-GE / 11-GF / 11-GG on the front lamps).",
    };
  }
  if (/filter|heater|probe|401|399/.test(t)) {
    return {
      id: "gndFilt",
      label: "ENGINE GROUND (11)",
      sub: "Filter / 19E",
      circuit: "11",
      detail: "Heater relay pin 86 is 19E CAB GROUND. The can on the engine returns on circuit 11.",
    };
  }
  if (/booster|300|hyd|pump|diff/.test(t)) {
    return {
      id: "gndHyd",
      label: "ENGINE GROUND (11)",
      sub: "Relay 300 pin 86",
      circuit: "11",
      detail: "HYDRAULIC BRAKE BOOSTER RELAY (300) pin 86 is engine ground. Pump case also grounds.",
    };
  }
  if (/allison|xmsn|615|403|639|trans/.test(t)) {
    return {
      id: "gndXmsn",
      label: "TRANS / CAB GROUND (11)",
      sub: "MD overlay",
      circuit: "11",
      detail: "Allison / MD transmission overlay grounds. Circuit 11.",
    };
  }
  if (/engine|sender|solenoid|alt|alternator|shutter|glow|block/.test(t)) {
    return {
      id: "gndEng",
      label: "ENGINE BLOCK GROUND (11)",
      sub: "Circuit 11",
      circuit: "11",
      detail: "ENGINE BLOCK / FRAME GROUND. Circuit 11.",
    };
  }
  return {
    id: "gndCab",
    label: "CAB GROUND (11)",
    sub: "Circuit 11",
    circuit: "11",
    detail: "CAB GROUND. Ring terminal on the cab / dash. Circuit 11.",
  };
}

function alreadyGrounded(id: string, wires: FlowWire[]) {
  return wires.some(
    (w) =>
      w.color === "gnd" &&
      (w.from === id || w.to === id),
  );
}

function incidentCount(id: string, wires: FlowWire[]) {
  return wires.filter((w) => w.from === id || w.to === id).length;
}

export function withGrounds(map: FlowMap): FlowMap {
  if (map.id === "11") return map;

  const nodes = [...map.nodes];
  const wires = [...map.wires];
  const legend = [...(map.legend ?? [])];

  const targets = nodes.filter((n) => {
    if (!(n.kind === "load" || n.kind === "relay" || n.kind === "module")) return false;
    if (alreadyGrounded(n.id, wires)) return false;
    if (/ground|gnd|battery|j1 stud|feed stud|ign 13|acc 12|st 17|^ign$|^acc$|^st /i.test(n.label)) return false;
    if (/^(IGN|ACC|ST)\b/.test(n.label)) return false;
    const cav = nodeCavities(n);
    if (cav != null && incidentCount(n.id, wires) >= cav) return false;
    // 661 pin 2 is NC empty — do not invent a chassis ground there.
    if (n.relayId === "661" || /crank relay \(661\)/i.test(n.label)) return false;
    return true;
  });

  if (!targets.length) {
    if (!legend.some((l) => /^11/.test(l.id))) {
      legend.push({
        id: "11",
        cavity: "GROUND",
        note: "Returns on circuit 11 (cab / engine / frame ring terminals).",
      });
    }
    return { ...map, legend };
  }

  const groups = new Map<string, { spec: GndSpec; items: FlowNode[] }>();
  for (const n of targets) {
    const spec = specFor(n, map);
    const g = groups.get(spec.id) ?? { spec, items: [] };
    g.items.push(n);
    groups.set(spec.id, g);
  }

  const maxY = Math.max(...nodes.map((n) => n.y), 200);
  let slot = 0;
  for (const { spec, items } of groups.values()) {
    const xs = items.map((n) => n.x);
    const x = Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
    const y = maxY + 130;
    if (!nodes.some((n) => n.id === spec.id)) {
      nodes.push({
        id: spec.id,
        label: spec.label,
        sub: spec.sub,
        kind: "source",
        x: Math.min(Math.max(x + (slot % 3) * 20, 80), Math.max((map.width ?? 1320) - 80, 80)),
        y,
        detail: spec.detail,
        page: "70 / 108",
        look: "Ring terminal. Cream / white 11-G* in this shop.",
        pins: "GND",
      });
      slot += 1;
    }
    for (const n of items) {
      wires.push({
        id: `wg-${n.id}-${spec.id}`,
        from: n.id,
        to: spec.id,
        circuit: spec.circuit,
        color: "gnd",
        label: spec.circuit,
      });
    }
    if (!legend.some((l) => l.id === spec.circuit)) {
      legend.push({ id: spec.circuit, cavity: spec.label, note: spec.detail });
    }
  }

  const bottom = Math.max(...nodes.map((n) => n.y)) + 80;
  return {
    ...map,
    nodes,
    wires,
    legend,
    height: Math.max(map.height ?? 420, bottom),
  };
}
