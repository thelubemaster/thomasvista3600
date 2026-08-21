export type PowerSource = "battery" | "key" | "acc" | "mixed";

export type Fuse = {
  id: string;
  cover: string;
  size: string;
  source: PowerSource;
  description: string;
  relay?: string;
  engineCritical: boolean;
  notes: string;
  circuits?: string[];
};

export type Relay = {
  id: string;
  name: string;
  fused: string;
  loadSide: string;
  coilSide: string;
  engineCritical: boolean;
  notes: string;
};

export const fuses: Fuse[] = [
  {
    id: "A1",
    cover: "B/U",
    size: "10A",
    source: "key",
    description: "Back-up lights, low air alarm, oil/water warning",
    engineCritical: false,
    notes: "Also feeds the audible alarm (201). Not required to run the engine.",
  },
  {
    id: "A2",
    cover: "INST",
    size: "5A",
    source: "key",
    description: "Instrument cluster feed + fuel filter",
    engineCritical: true,
    notes: "Must use a fuse (not a breaker). Feeds part of the Circuit 19 fuel-filter group.",
    circuits: ["19"],
  },
  {
    id: "B1",
    cover: "—",
    size: "20A",
    source: "key",
    description: "Allison IGN (92D) + shutter (97K)",
    engineCritical: true,
    notes:
      "Printed page 10: B1 feeds 92D 14GY to DASH CONNECTOR 2M-B1 (Allison). Second wire is 97K shutter/fan. NOT the fuel-filter 19 family — that is A2 (19J) and D2 (19D).",
    circuits: ["92", "23"],
  },
  {
    id: "C1",
    cover: "ENGINE",
    size: "5A",
    source: "key",
    description: "CEC ignition + ATA",
    engineCritical: true,
    notes: "Engine computer ignition power. Engine will not run correctly if this is out.",
  },
  {
    id: "C2",
    cover: "DIAG",
    size: "10A",
    source: "battery",
    description: "Diagnostic connector + module power relay",
    relay: "CEC / Module Power Relay",
    engineCritical: true,
    notes: "Always hot. Two wires: diagnostic plug and Module Power Relay coil/control. Pair with the 40A ECM power fuse.",
  },
  {
    id: "C3",
    cover: "TURN",
    size: "30A",
    source: "battery",
    description: "Turn signals & hazard lights",
    relay: "Flasher (1)",
    engineCritical: false,
    notes: "Always hot so hazards work with the key off. Flasher unit sits in the fuse panel.",
  },
  {
    id: "D1",
    cover: "AIR DRYER",
    size: "20A",
    source: "acc",
    description: "Air dryer & two-speed axle",
    engineCritical: false,
    notes: "Accessory-switched. Safe to drop if you have no air dryer / two-speed axle.",
  },
  {
    id: "D2",
    cover: "FUEL HTR",
    size: "20A",
    source: "battery",
    description: "Fuel filter heater",
    relay: "Fuel Filter Heater Relay (431)",
    engineCritical: false,
    notes: "Always hot. Main battery feed into the Circuit 19 fuel-filter / heater system.",
    circuits: ["19"],
  },
  {
    id: "D3",
    cover: "STOP",
    size: "30A",
    source: "battery",
    description: "Stop lights",
    engineCritical: false,
    notes: "Always hot. Keep if you want working brake lights.",
  },
  {
    id: "E1",
    cover: "ABS ACC",
    size: "10A",
    source: "acc",
    description: "Accessory + ABS",
    engineCritical: false,
    notes: "Accessory feed. Empty ABS connectors on this chassis are normal if ABS was never installed.",
  },
  {
    id: "E2",
    cover: "TAIL / PNL",
    size: "30A",
    source: "battery",
    description: "Panel & marker lights",
    engineCritical: false,
    notes: "Always hot. Park / marker / panel lamps.",
  },
  {
    id: "E3",
    cover: "BRAKE",
    size: "10A",
    source: "key",
    description: "Hydraulic brake system",
    engineCritical: false,
    notes: "Hydro-Max control. Chart does not prefix BAT/IGN; diagrams treat it as switched, not a J1 always-hot feed. Critical for hydraulic brakes, not for the engine.",
  },
  {
    id: "F1",
    cover: "ABS IGN",
    size: "10A",
    source: "key",
    description: "ABS / Allison ignition feed",
    engineCritical: false,
    notes: "Needed if you keep Allison electronics or ABS. Not required just to spin the engine.",
  },
  {
    id: "F2",
    cover: "ABS BATT",
    size: "30A",
    source: "battery",
    description: "ABS battery feed",
    engineCritical: false,
    notes: "Always hot. Leave empty / unused if no ABS module is plugged in.",
  },
  {
    id: "F3",
    cover: "HORN / FOG",
    size: "20A",
    source: "battery",
    description: "Horn & fog lights",
    relay: "Horn Relay (61)",
    engineCritical: false,
    notes: "Must use a fuse (not a breaker). Horn button typically grounds the relay coil.",
  },
  {
    id: "G1",
    cover: "IGN / AUTO XMSN",
    size: "15A",
    source: "key",
    description: "Allison automatic transmission + low coolant level",
    engineCritical: true,
    notes: "Only 15A fuse in the panel. Cover labels it both IGN and AUTO XMSN — same fuse.",
  },
  {
    id: "H1",
    cover: "START",
    size: "10A",
    source: "key",
    description: "Neutral safety + idle verification",
    relay: "Transmission Neutral Relay (615)",
    engineCritical: true,
    notes: "Start-enable circuit, not the high-current starter feed. Blown H1 = no crank.",
  },
];

export const relays: Relay[] = [
  {
    id: "61",
    name: "HORN RELAY (61)",
    fused: "F3 20A BAT",
    loadSide: "Battery",
    coilSide: "Horn button (usually ground)",
    engineCritical: false,
    notes: "Easy to keep or replace.",
  },
  {
    id: "387",
    name: "START RELAY W/ T444E & I6-HEUI (387)",
    fused: "High current — fusible link / unfused",
    loadSide: "Battery (direct)",
    coilSide: "Key Start + Neutral Safety / Crank Inhibit",
    engineCritical: true,
    notes: "Do not eliminate. High-current side is not a 10A panel fuse.",
  },
  {
    id: "661",
    name: "CRANK RELAY (661)",
    fused: "Key ST 17C. Coil CEC 97H / 97L",
    loadSide: "Key / Ignition (17C in, 17A out on 3600)",
    coilSide: "CEC 97H + 97L",
    engineCritical: true,
    notes: "Printed page 104 / 20. Optional overcrank. 3600 cavities: 5=17C, 4=17A, 3=97H, 1=97L.",
  },
  {
    id: "396",
    name: "CEC MODULE RELAY (396)",
    fused: "C2 10A BAT + 40A ECM fuse",
    loadSide: "Battery",
    coilSide: "Key / ECM logic",
    engineCritical: true,
    notes: "Keeps the CEC/ECM alive. Extremely critical.",
  },
  {
    id: "GP",
    name: "GLOW PLUGS/PRE-HEATER RELAY",
    fused: "High current, battery-fed",
    loadSide: "Battery",
    coilSide: "ECM / Wait-to-Start (key-related)",
    engineCritical: true,
    notes: "Critical on diesel. Wait-to-Start lamp on printed page 33.",
  },
  {
    id: "1",
    name: "FLASHER (R1)",
    fused: "C3 30A BAT",
    loadSide: "Battery",
    coilSide: "Turn / Hazard switch",
    engineCritical: false,
    notes: "Sits in the fuse panel (circle on the cover). Can be replaced with an electronic flasher.",
  },
  {
    id: "431",
    name: "FUEL FILTER HEATER RELAY (431)",
    fused: "D2 20A BAT (related to A2)",
    loadSide: "Battery",
    coilSide: "Temp switch / key",
    engineCritical: false,
    notes: "Keep if you want the fuel heater. Part of Circuit 19.",
  },
  {
    id: "615",
    name: "TRANSMISSION NEUTRAL RELAY (615)",
    fused: "Via H1 circuits",
    loadSide: "Key-related",
    coilSide: "Transmission position",
    engineCritical: true,
    notes: "Needed for a proper starting interlock. Mating end page 101: 4=143C, 3=97P, 1=97AV, 2=123.",
  },
  {
    id: "662",
    name: "CEC MODULE PWR RELAY W/T444E (662)",
    fused: "C2 10A + 40A ECM / 14B",
    loadSide: "Battery 14B",
    coilSide: "97AH / 97CM",
    engineCritical: true,
    notes: "The 7.3 face of module power. Same circuits as 396. Printed page 104.",
  },
  {
    id: "100",
    name: "LIFT TO DIM RELAY W/3600 (100)",
    fused: "Headlight feed",
    loadSide: "51 / 52C hi beam",
    coilSide: "53A / 51D",
    engineCritical: false,
    notes: "Printed page 84 / 60. DRL / stationary column.",
  },
  {
    id: "101",
    name: "FLASH TO PASS RELAY (101)",
    fused: "D3 30A / 50A",
    loadSide: "52B / 52C hi beam",
    coilSide: "51E FTP switch",
    engineCritical: false,
    notes: "Printed page 84 / 61.",
  },
  {
    id: "284",
    name: "ABS WARNING LIGHT RELAY (MICRO) (284)",
    fused: "ABS 94",
    loadSide: "94E / 94-GB",
    coilSide: "94L / 94H",
    engineCritical: false,
    notes: "Printed page 84A. Skip if no ABS.",
  },
  {
    id: "286",
    name: "ABS ENGINE BRAKE CONTROL RELAY (MICRO) (286)",
    fused: "ABS / exhaust brake 24",
    loadSide: "24 / 24A",
    coilSide: "94J / 94C",
    engineCritical: false,
    notes: "Printed page 84A. Skip if no ABS / exhaust brake.",
  },
  {
    id: "403",
    name: "AUTOMATIC XMSN MODULATOR SHIFT RELAY (403)",
    fused: "Allison 92",
    loadSide: "92C / 97E",
    coilSide: "92B / 92E",
    engineCritical: false,
    notes: "Printed page 90.",
  },
  {
    id: "423",
    name: "ABS WARNING LIGHT RELAY (423)",
    fused: "ABS 94-GC on 3600",
    loadSide: "94-GC / 94E",
    coilSide: "94B / 94H",
    engineCritical: false,
    notes: "Printed page 92.",
  },
  {
    id: "639",
    name: "TRANSMISSION BACKUP RELAY W/MD TRANSMISSION (639)",
    fused: "IGN 13",
    loadSide: "71 / 71A",
    coilSide: "148C reverse",
    engineCritical: false,
    notes: "Printed page 103.",
  },
  {
    id: "995",
    name: "STOP LIGHT RELAY (995)",
    fused: "70 / 92",
    loadSide: "70A / 70B",
    coilSide: "92-GF",
    engineCritical: false,
    notes: "Printed page 106. Retarder buses.",
  },
  {
    id: "996",
    name: "RETARDER ENABLE RELAY (996)",
    fused: "13M / 92",
    loadSide: "92A",
    coilSide: "92P / 97T",
    engineCritical: false,
    notes: "Printed page 106. Skip if no retarder.",
  },
];

export const sourceLabel: Record<PowerSource, string> = {
  battery: "Battery",
  key: "Key / IGN",
  acc: "Accessory",
  mixed: "Mixed",
};

export type SchematicNode = {
  id: string;
  label: string;
  sub?: string;
  kind: "source" | "fuse" | "connector" | "module" | "load";
  detail: string;
  page?: string;
};

export const schematicNodes: SchematicNode[] = [
  { id: "key", label: "KEY SWITCH (63)", sub: "IGN 13", kind: "source", detail: "IGN feeds A2 (19J). B1 is 92D Allison, not this circuit.", page: "10" },
  { id: "bat", label: "BATTERY FEED (14)", sub: "Always hot", kind: "source", detail: "Feeds FUSE D2 (19D) with the key off.", page: "8–9" },
  { id: "a2", label: "FUSE A2 5A INST", sub: "Key · 19J", kind: "fuse", detail: "19J 18GY to FUEL FILTER (399) B.", page: "10 / 50 / 76" },
  { id: "d2", label: "FUSE D2 20A FUEL HTR", sub: "Battery · 19D", kind: "fuse", detail: "19D 10GY to (399) A and HEATER RELAY (431) 30/87.", page: "50 / 76" },
  { id: "relay431", label: "HEATER RELAY (431)", sub: "Cab · 4 wires", kind: "module", detail: "30/87=19D. 85=19F from (399) B. 86=19E CAB GROUND.", page: "50" },
  { id: "ff399", label: "FUEL FILTER (399)", sub: "Cab 6-way A–F", kind: "connector", detail: "A=19D B=19J C=19H D=19A E=19B F=19C. Stays in the cab.", page: "50 / 83" },
  { id: "bulkhead", label: "DASH CONNECTOR (2)", sub: "H5 E4 H6", kind: "connector", detail: "H5=19A. E4=19B. H6=19C. Only these three cross the firewall.", page: "50 / 78" },
  { id: "inline", label: "IN-LINE (401)", sub: "A / B / C", kind: "connector", detail: "A=19A heater. B=19B probe. C=19C vacuum switch.", page: "50 / 90" },
  { id: "heater", label: "FUEL HEATER", sub: "Load", kind: "load", detail: "19A from 401-A. Other side ENGINE GROUND.", page: "50" },
  { id: "probe", label: "WATER PROBE", sub: "Sensor", kind: "load", detail: "19B from 401-B. Other side ENGINE GROUND.", page: "50" },
];

export type SchematicWire = {
  id: string;
  from: string;
  to: string;
  circuit: string;
  color: "bat" | "ign" | "acc" | "a" | "b" | "c" | "gnd";
  label?: string;
};

export const schematicWires: SchematicWire[] = [
  { id: "w-key-a2", from: "key", to: "a2", circuit: "13", color: "ign" },
  { id: "w-bat-d2", from: "bat", to: "d2", circuit: "14", color: "bat" },
  { id: "w-d2-399", from: "d2", to: "ff399", circuit: "19D", color: "bat", label: "A" },
  { id: "w-d2-431", from: "d2", to: "relay431", circuit: "19D", color: "bat", label: "30" },
  { id: "w-a2-399", from: "a2", to: "ff399", circuit: "19J", color: "ign", label: "B" },
  { id: "w-a2-431", from: "a2", to: "relay431", circuit: "19F", color: "a", label: "85" },
  { id: "w-399-2a", from: "ff399", to: "bulkhead", circuit: "19A", color: "a", label: "D → H5" },
  { id: "w-399-2b", from: "ff399", to: "bulkhead", circuit: "19B", color: "b", label: "E → E4" },
  { id: "w-399-2c", from: "ff399", to: "bulkhead", circuit: "19C", color: "c", label: "F → H6" },
  { id: "w-2-401a", from: "bulkhead", to: "inline", circuit: "19A", color: "a", label: "H5 → A" },
  { id: "w-2-401b", from: "bulkhead", to: "inline", circuit: "19B", color: "b", label: "E4 → B" },
  { id: "w-2-401c", from: "bulkhead", to: "inline", circuit: "19C", color: "c", label: "H6 → C" },
  { id: "w-401-h", from: "inline", to: "heater", circuit: "19A", color: "bat", label: "A" },
  { id: "w-401-p", from: "inline", to: "probe", circuit: "19B", color: "c", label: "B" },
];

export const circuit19Legend = [
  { id: "19A", cavity: "399-D → (2) H5 → 401-A", role: "Fuel heater", note: "Crosses the firewall to the heater element." },
  { id: "19B", cavity: "399-E → (2) E4 → 401-B", role: "Water probe", note: "Crosses the firewall to the WIF probe." },
  { id: "19C", cavity: "399-F → (2) H6 → 401-C", role: "Vacuum switch / lamp test", note: "Crosses the firewall. Not a ground." },
];
