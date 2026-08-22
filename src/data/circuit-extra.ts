export type Extra = {
  fuse?: string;
  power: string;
  engineCritical: boolean;
  ifCut: string;
  cab: string;
  engine: string;
  color?: string;
  relay?: string;
  more: string;
};

export const extras: Record<string, Extra> = {
  "1": {
    fuse: "Charging — unfused / fusible link",
    power: "Signal / alternator",
    engineCritical: false,
    ifCut: "Alternator will not excite. Engine still runs until the battery dies.",
    cab: "Dash 2-F6",
    engine: "Engine 2A-F6 (1-RW) → generator field",
    color: "Red/white on engine face",
    more: "Generator field. Keep if you want charging. Not needed to idle.",
  },
  "17": {
    fuse: "H1 10A START (neutral path) + key ST",
    power: "Key START",
    engineCritical: true,
    ifCut: "Starter will not crank. Engine can still run if already started.",
    cab: "Key 63 ST → start relay 387 → dash 2-G6",
    engine: "17F: 2A-G6 → magnetic switch J30. 17B 10PK pass: J31 → 387-30.",
    relay: "Start relay 387. Neutral is the AUTO XMSN switch — not 615",
    more: "Circuit 17F is 2-G6 to magnetic switch J30. J31 is the solenoid on the starter; 436 is the starter body. 615 is Allison MD overlay only.",
  },
  "18": {
    fuse: "High-current fusible link at glow relay",
    power: "Battery (load) + CEC (coil)",
    engineCritical: true,
    ifCut: "No glow. Cold start fails. Warm restart may still work.",
    cab: "Wait lamp on cluster 28-5 via FRONT END (2B) G3 (18-G).",
    engine: "Fat 18 to the plugs. Plug return is the head / block — not 2B. 18-G wait lamp leaves toward 2B-G3.",
    relay: "Glow plug relay",
    more: "2B-G3 is the wait lamp, not the glow-plug current return.",
  },
  "19": {
    fuse: "A2 5A INST (19J) + D2 20A FUEL HTR (19D). B1 is 92D, not 19.",
    power: "Key on A2 · Battery on D2",
    engineCritical: true,
    ifCut: "Heater and WIF die. 19H to the start switch also lives on (399) C. Engine may still run if the 7.3 CEC is powered.",
    cab: "399 is a pass-through. A 19D D2↔431-30. B 19J A2↔overlay B (470 IGN, 19K 434, 19F 431-85). C 19H start↔19M 1CR. D 19A 431-87 straight↔(2) H5 heater — no jumper. E 19B 470↔(2) E4. F 19C overlay↔(2) H6.",
    engine: "Cab 399-D/E/F → DASH CONNECTOR (2) H5/E4/H6 → IN-LINE (401) A/B/C → fuel heater / water probe / vacuum switch",
    relay: "FUEL FILTER HEATER RELAY (431)",
    more: "Page 50: D2 is on cab 399-A; 431 is on overlay 399-A. Only 19A / 19B / 19C cross at (2). 434 is a 1-cavity 19K lamp (page 96) — ground is dash/cluster, not through 399. 470 is 4 wires: A 19J, B 19L, C 19M TEST, D 19B — no ground pin.",
  },
  "26": {
    fuse: "Charging sense — through cluster",
    power: "Signal",
    engineCritical: false,
    ifCut: "Ammeter / charge gauge dies. Engine still runs.",
    cab: "Dash 2-F5 (26) and 2-E5 (26A) → cluster 26-7",
    engine: "Engine 2A-F5 / E5 → alternator sense",
    more: "Two sense wires through the firewall. Gauge only.",
  },
  "29": {
    fuse: "A2 5A INST (gauge feed)",
    power: "Signal",
    engineCritical: false,
    ifCut: "Water-temp gauge / lamp dies. Engine still runs.",
    cab: "Dash 2-D5 → cluster 26-16",
    engine: "Engine 2A-D5 is empty on some faces; sender is on the engine.",
    more: "Water temperature. Warning only.",
  },
  "31": {
    fuse: "A2 5A INST",
    power: "Signal",
    engineCritical: false,
    ifCut: "Trans-temp gauge dies. Engine and trans still work.",
    cab: "Dash 2-H4 → cluster 26-17",
    engine: "Engine 2A-H4 → sender 345",
    more: "Allison oil temperature gauge.",
  },
  "36": {
    fuse: "A2 5A INST",
    power: "Signal",
    engineCritical: false,
    ifCut: "Fuel gauge dies. Engine still runs.",
    cab: "Dash 2-C6 signal / 2-B5 ground → cluster 27-15",
    engine: "Engine 2A-C6 / B5 → sender 196",
    more: "Fuel level sender and its ground both cross the firewall.",
  },
  "47": {
    fuse: "CEC 5V / sensor",
    power: "Signal",
    engineCritical: false,
    ifCut: "Speedometer and cruise lose speed. Engine still runs.",
    cab: "Dash 2-B4 → CEC 57 / cluster",
    engine: "Engine 2A-B4 → speedo sensor 303",
    more: "Vehicle speed. Needed for cruise, not to idle.",
  },
  "71": {
    fuse: "A1 10A B/U",
    power: "Key / IGN",
    engineCritical: false,
    ifCut: "No reverse lamps. Engine still runs.",
    cab: "Dash 2-C5 (71) and 2-G5 (71A) → body builder D",
    engine: "Engine 2A-C5 → backup switch 304",
    more: "Two backup cavities. C5 is the switch, G5 is the body-builder feed.",
  },
  "90": {
    fuse: "E3 10A BRAKE",
    power: "Key / IGN",
    engineCritical: false,
    ifCut: "Hydro-Max pump dies. Engine still runs. Pedal goes hard.",
    cab: "E3 → dash 2-A4/A5/A6/A7 → booster 300 / monitor 49 / switch 50",
    engine: "2A-A4/A5/A6/A7 → pump motor + diff switch 301",
    relay: "Booster relay 300",
    more: "Whole top row of the firewall plug is hydraulic brakes. A6=power, A7=motor, A4=status, A5=diff pressure.",
  },
  "92": {
    fuse: "G1 15A IGN / AUTO XMSN",
    power: "Key / IGN",
    engineCritical: false,
    ifCut: "Allison will not shift. Engine still runs.",
    cab: "G1-B → interconnect 377 → front 2B-B1",
    engine: "Front mate B1 / Allison ECU",
    more: "92D also sits on the front-end firewall plug, not the dash/engine plug.",
  },
  "97": {
    fuse: "C1 5A ENGINE + C2 10A DIAG + H1 10A START",
    power: "Mixed — key and battery",
    engineCritical: true,
    ifCut: "CEC loses that pin. 97P (B6) = no crank. 97AP/97AU = engine control faults.",
    cab: "C1 / C2 through the firewall to the CEC on the engine",
    engine: "Engine dash 3 (A–V) carries most 97 family plus APS 99",
    relay: "Module power 396",
    more: "Treat 97 as engine wiring. Cruise suffixes (97B/CA/CF/DH) are the only optional ones.",
  },
  "98": {
    fuse: "C2 10A DIAG (power at the plug)",
    power: "Signal",
    engineCritical: false,
    ifCut: "Cannot scan the CEC. Engine still runs.",
    cab: "Diag 384 A=98B+ B=98D− C=97C. ATA 373 red / 374 blue.",
    engine: "Engine dash 3-B / C / D",
    more: "Data link. Red cap is +. Blue cap is −. 384 A/B are ATA, not C/D.",
  },
  "99": {
    fuse: "CEC 5V (97U)",
    power: "Signal",
    engineCritical: true,
    ifCut: "No throttle position. Engine will not control / may not run.",
    cab: "APS 382 at the pedal",
    engine: "Engine dash 3-N (99D), 3-P (99B), 3-Q (97U 5V)",
    more: "Accelerator. Lives on connector 3, not on dash connector 2.",
  },
};

export function extraFor(circuit: string): Extra | undefined {
  const n = circuit.match(/\d+/)?.[0];
  return n ? extras[n] : undefined;
}
