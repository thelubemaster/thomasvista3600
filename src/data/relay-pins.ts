export type RelayPin = {
  id: string;
  iso: string;
  circuit: string;
  role: "Load in" | "Load out" | "Coil +" | "Coil −" | "NC" | "In" | "Out";
  goes: string;
  power: "Battery" | "Key / IGN" | "Ground" | "Signal";
};

export type RelayFace = {
  id: string;
  tag: string;
  name: string;
  page: string;
  where: string;
  look: string;
  engineCritical: boolean;
  fused: string;
  layout: "iso4" | "iso5" | "flash2";
  pins: RelayPin[];
  more: string;
};

export const relayFaces: RelayFace[] = [
  {
    id: "387",
    tag: "387",
    name: "START RELAY W/ T444E & I6-HEUI",
    page: "89",
    where: "Cab — black harness",
    look: "Black 4-cavity. Mating end printed page 89: 4=17B 3=17F 1=17D 2=17C.",
    engineCritical: true,
    fused: "17-FL at J31 into pin 4. Coil is key ST 17C through 661 — not H1.",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "17B", role: "Load in", goes: "Always-hot from J31 through 17-FL 14GY / 17B 10PK. Dedicated wall pass, not (2).", power: "Battery" },
      { id: "3", iso: "87", circuit: "17F", role: "Load out", goes: "17F 16PK through (2) G6 to J30. Same 87 also feeds 17C 10PK to J31 S.", power: "Battery" },
      { id: "1", iso: "85", circuit: "17D", role: "Coil −", goes: "Thermal overcrank on the starter, then 17-G to ENGINE BLOCK. Not dash ground. CONNECT TOGETHER W/O THERMAL OVERCRANK.", power: "Ground" },
      { id: "2", iso: "86", circuit: "17C", role: "Coil +", goes: "661 pin 4 (17A) from key ST 17C 16PK. Hot only in START.", power: "Key / IGN" },
    ],
    more: "ISO cube: 86 = coil +, 85 = coil ground, 30 = battery, 87 = load. Printed page 20 writes “85=17C / 86=17D” — on a Bosch-stamped cube those ISO numbers are swapped vs that sentence. Probe the socket: the blade hot in START is coil +. The other coil blade is constant ground through thermal overcrank. Grounding 85 while 86 is hot must click the relay. If 85 is open, 12 V from 86 floats onto 85 through the coil. Four wires. Two fat: 17B in, 17F out. Two skinny: coil. 17F feeds magnetic switch J30 (engine-top), not J31.",
  },
  {
    id: "396",
    tag: "396",
    name: "MODULE POWER RELAY",
    page: "88",
    where: "On the engine, next to the CEC",
    look: "ISO 4-cavity. 30=14B battery in, 87=97CT to (3) F / C2, 85=97AH coil +, 86=97CM coil −.",
    engineCritical: true,
    fused: "C2 10A DIAG on 97CT. 14B into 30 is POS BATT / 426, not C2.",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "14B", role: "Load in", goes: "POS BATT / battery harness 426. Not C2.", power: "Battery" },
      { id: "3", iso: "87", circuit: "97CT", role: "Load out", goes: "ENGINE DASH (3) F → fuse C2. Does not land on the CEC", power: "Battery" },
      { id: "1", iso: "86", circuit: "97CM", role: "Coil −", goes: "Coil return / CEC logic", power: "Signal" },
      { id: "2", iso: "85", circuit: "97AH", role: "Coil +", goes: "IGN / CEC (tied to C1 97CR path)", power: "Key / IGN" },
    ],
    more: "I6-HEUI four-wire cube. Same circuits as T444E 662 on printed page 70 / 104. 97CT goes to (3) F / C2, not into the CEC. Pull this relay and the CEC dies.",
  },
  {
    id: "300",
    tag: "300",
    name: "HYDRAULIC BRAKE BOOSTER RELAY",
    page: "85A / 44",
    where: "Engine harness, at the Hydro-Max — not in the cab",
    look: "5-cavity micro. Mating end printed page 85A: 1=90A 2=90H 3=ground 4=90N 5=90J.",
    engineCritical: false,
    fused: "E3 10A BRAKE (key) plus 90A from J31",
    layout: "iso5",
    pins: [
      { id: "1", iso: "30", circuit: "90A", role: "Load in", goes: "J31 via 90-FL 16BK. 90B is a tap of this same always-hot through (2) A6 to E3-A", power: "Battery" },
      { id: "2", iso: "87", circuit: "90H", role: "Load out", goes: "Pump motor on the engine. Cab 90H at (2) A7 is the diode-C sense, not the motor feed", power: "Battery" },
      { id: "3", iso: "86", circuit: "11", role: "Coil −", goes: "Engine ground", power: "Ground" },
      { id: "4", iso: "87a", circuit: "90N", role: "NC", goes: "Labeled 90N on page 85A. Unused on page 44", power: "Signal" },
      { id: "5", iso: "85", circuit: "90J", role: "Coil +", goes: "90J coil. 90M splices off through (2) A4 to 49-A", power: "Signal" },
    ],
    more: "Five blades, four wires used on page 44. 90A never crosses the firewall. Pedal goes hard if this is unplugged; engine still runs.",
  },
  {
    id: "61",
    tag: "61",
    name: "HORN RELAY",
    page: "82",
    where: "Cab, next to the fuse panel",
    look: "ISO 4-cavity. Mating end: 4=85A, 3=85C, 1=85B, 2=85.",
    engineCritical: false,
    fused: "F3 20A HORN (battery) — must be a fuse",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "85A", role: "Load in", goes: "Fuse F3-B (always hot)", power: "Battery" },
      { id: "3", iso: "87", circuit: "85C", role: "Load out", goes: "Front 2B-F1 → horn 605", power: "Battery" },
      { id: "1", iso: "86", circuit: "85B", role: "Coil −", goes: "Horn button / slip ring J3 (grounds the coil)", power: "Ground" },
      { id: "2", iso: "85", circuit: "85 / 85D", role: "Coil +", goes: "Coil feed from the same F3 family", power: "Battery" },
    ],
    more: "Four wires. Button does not carry the horn current — it only grounds pin 1. Pin 3 is the fat wire to the horn.",
  },
  {
    id: "431",
    tag: "431",
    name: "FUEL FILTER HEATER RELAY",
    page: "50",
    where: "Cab / filter overlay",
    look: "Standard ISO 4-pin cube. No separate face drawing — circuits from the filter schematic.",
    engineCritical: false,
    fused: "D2 20A FUEL HTR (battery)",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "19D", role: "Load in", goes: "Overlay 399-A. D2-B 14GY is on cab 399-A — printed page 50", power: "Battery" },
      { id: "3", iso: "87", circuit: "19A", role: "Load out", goes: "Straight to 399-D (19A), through the plug and DASH CONNECTOR (2) H5 to the FUEL HEATER. No jumper", power: "Battery" },
      { id: "2", iso: "85", circuit: "19F", role: "Coil +", goes: "Overlay 399-B splice (18GY)", power: "Key / IGN" },
      { id: "1", iso: "86", circuit: "19E", role: "Coil −", goes: "CAB GROUND (18GY)", power: "Ground" },
    ],
    more: "399 is a pass-through. 30 is 19D on cavity A (D2 on the other face). 87 is 19A on cavity D, straight through to (2) H5 and the FUEL HEATER. 19A does not jumper into B. 85=19F, 86=19E.",
  },
  {
    id: "615",
    tag: "615",
    name: "TRANSMISSION NEUTRAL RELAY W/MD TRANSMISSION",
    page: "101",
    where: "Cab — Allison MD overlay only. Not a typical 3600. W/MD is Allison MD automatic, not a manual trans",
    look: "ISO 4-cavity. Mating end: 4=143C, 3=97P, 1=97AV, 2=123.",
    engineCritical: false,
    fused: "H1 10A START (key)",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "143C", role: "Load in", goes: "Trans park/neutral 143C into cavity 4", power: "Signal" },
      { id: "3", iso: "87", circuit: "97P", role: "Load out", goes: "97P start-enable — H1 / dash 2-B6 / START RELAY (387) coil path", power: "Key / IGN" },
      { id: "1", iso: "86", circuit: "97AV", role: "Coil −", goes: "97AV on cavity 1", power: "Signal" },
      { id: "2", iso: "85", circuit: "123", role: "Coil +", goes: "Trans control 123 on cavity 2", power: "Signal" },
    ],
    more: "Four wires on printed page 101. W/MD TRANSMISSION means Allison MD (WTEC) automatic — not a manual trans, and not the default 3600 hydraulic auto. A typical 3600 uses NEUTRAL POSITION SWITCH W/AUTO XMSN. If you do not have an MD/Allison electronic trans, you do not have this cube. 97AV from cavity 1 does not land on CRANK RELAY (661) pin 2; that pin is empty on page 104.",
  },
  {
    id: "661",
    tag: "661",
    name: "CRANK RELAY (661)",
    page: "104 / 20",
    where: "Cab — optional starter overcrank / crank inhibit",
    look: "5-cavity micro. Mating end printed page 104: 4 top, 2-3-5 across, 1 bottom.",
    engineCritical: true,
    fused: "Via key ST 17C. Coil from CEC 97H / 97L",
    layout: "iso5",
    pins: [
      { id: "4", iso: "87", circuit: "17A (3600) / 17F", role: "Load out", goes: "W/3600 = 17A to 387 pin 2. W/3800,4000FBC = 17F.", power: "Key / IGN" },
      { id: "5", iso: "30", circuit: "17C (3600)", role: "Load in", goes: "Key ST 17C through STARTER INTERRUPT (shipped connected)", power: "Key / IGN" },
      { id: "2", iso: "85", circuit: "97H", role: "Coil +", goes: "CEC pin 46 via ENGINE DASH (3) U. Printed page 104: 97H lands on 2, not 3.", power: "Signal" },
      { id: "1", iso: "86", circuit: "97L", role: "Coil −", goes: "AUTO XMSN 97L spliced with CEC 26 97A via (3) I", power: "Signal" },
      { id: "3", iso: "87a", circuit: "—", role: "NC", goes: "Unlabeled / empty on page 104. Not 97AV from 615.", power: "Signal" },
    ],
    more: "Optional crank inhibit. On a 3600: 5=17C in, 4=17A out, 2=97H, 1=97L. Pin 3 is empty — not 97AV. If the bus has no overcrank option this plug may be jumpered or unused — START RELAY (387) still cranks.",
  },
  {
    id: "662",
    tag: "662",
    name: "CEC MODULE PWR RELAY W/T444E",
    page: "104",
    where: "On the engine, next to CEC CONTROL MODULE (379) — this is the 7.3 face",
    look: "ISO 4-cavity. Mating end printed page 104: 1=14B 2=97AH 3=97CT 4=97CM.",
    engineCritical: true,
    fused: "C2 10A DIAG on the 97CT net. 14B into pin 1 is POS BATT / 426, not C2.",
    layout: "iso4",
    pins: [
      { id: "1", iso: "30", circuit: "14B", role: "Load in", goes: "POS BATT (412-A) 14B 10RD through battery harness 426-B. Not C2.", power: "Battery" },
      { id: "2", iso: "85", circuit: "97AH", role: "Coil", goes: "CEC pin 25 MPR 18VT", power: "Signal" },
      { id: "3", iso: "87", circuit: "97CT", role: "Load out", goes: "ENGINE DASH (3) F → fuse C2. Does not land on the CEC", power: "Battery" },
      { id: "4", iso: "86", circuit: "97CM", role: "Coil", goes: "Splice to CEC 21/22/41 DC/DC (+) 97CL / 97CK / 97AL. Not chassis ground", power: "Signal" },
    ],
    more: "T444E 7.3 module-power relay. I6-HEUI uses 396 for the same four circuits. Pull 662 and the CEC dies.",
  },
  {
    id: "100",
    tag: "100",
    name: "LIFT TO DIM RELAY W/3600",
    page: "84 / 60",
    where: "Cab — headlight / stationary column W/DRL",
    look: "ISO 4-cavity. Printed page 84. 4=51/51F, 3=52C, 1=51/51F, 2=53A.",
    engineCritical: false,
    fused: "Headlight feed (J1 / switch 60)",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "51 / 51F", role: "Load in", goes: "HEADLIGHT SWITCH (60) dimmer feed", power: "Battery" },
      { id: "3", iso: "87", circuit: "52C", role: "Load out", goes: "Hi-beam feed to headlights / 2-E1", power: "Battery" },
      { id: "1", iso: "86", circuit: "51 / 51F", role: "Coil −", goes: "Same 51 family / switch return", power: "Signal" },
      { id: "2", iso: "85", circuit: "53A / 51G / 51D", role: "Coil +", goes: "Lo-beam sense 53A. Schematic also shows 51D 18YL", power: "Signal" },
    ],
    more: "Used with W/005AAA stationary column and DRL. Lifts lo beam to hi when you pull the stalk. Not needed to run the 7.3.",
  },
  {
    id: "101",
    tag: "101",
    name: "FLASH TO PASS RELAY",
    page: "84 / 61",
    where: "Cab — FTP & LTD control in the turn signal switch",
    look: "ISO 4-cavity. 4=52B, 3=52C, 1=51C/50A, 2=51E.",
    engineCritical: false,
    fused: "D3 30A (50A feed) / headlight",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "52B", role: "Load out", goes: "Hi-beam flash to LEFT/RIGHT HEADLIGHT", power: "Battery" },
      { id: "3", iso: "87", circuit: "52C", role: "Load in", goes: "Hi-beam bus / LTD output", power: "Battery" },
      { id: "1", iso: "86", circuit: "51C / 50A", role: "Coil −", goes: "50A 14YL from fuse D3 30A", power: "Battery" },
      { id: "2", iso: "85", circuit: "51E", role: "Coil +", goes: "FTP switch (N.O.) 51E 18OR", power: "Signal" },
    ],
    more: "Momentary hi-beam flash. FTP is N.O. on the turn stalk. Skip if you do not care about flash-to-pass.",
  },
  {
    id: "284",
    tag: "284",
    name: "ABS WARNING LIGHT RELAY (MICRO)",
    page: "84A",
    where: "ABS cab overlay harness",
    look: "5-cavity micro. 1=94L 2=94H 3=94E 4=94-GB 5 empty.",
    engineCritical: false,
    fused: "ABS / 94 family",
    layout: "iso5",
    pins: [
      { id: "1", iso: "86", circuit: "94L", role: "Coil −", goes: "ABS cab overlay", power: "Signal" },
      { id: "2", iso: "85", circuit: "94H", role: "Coil +", goes: "ABS cab overlay", power: "Signal" },
      { id: "3", iso: "30", circuit: "94E", role: "Load in", goes: "ABS warning lamp feed", power: "Key / IGN" },
      { id: "4", iso: "87", circuit: "94-GB", role: "Load out", goes: "ABS warning lamp", power: "Key / IGN" },
      { id: "5", iso: "87a", circuit: "—", role: "NC", goes: "Empty", power: "Signal" },
    ],
    more: "Lamp relay only. Hyd 3600 with no ABS can skip this.",
  },
  {
    id: "286",
    tag: "286",
    name: "ABS ENGINE BRAKE CONTROL RELAY (MICRO)",
    page: "84A",
    where: "ABS cab overlay harness",
    look: "5-cavity micro. Pins change N/ELECT TRANS vs W/ELECT TRANS.",
    engineCritical: false,
    fused: "ABS / exhaust brake 24",
    layout: "iso5",
    pins: [
      { id: "1", iso: "86", circuit: "94C / 24B", role: "Coil −", goes: "N/elect trans = 94C. W/elect trans = 24B", power: "Signal" },
      { id: "2", iso: "85", circuit: "94J", role: "Coil +", goes: "ABS / Allison interconnect", power: "Signal" },
      { id: "3", iso: "30", circuit: "24 / 24A", role: "Load in", goes: "Exhaust brake feed", power: "Key / IGN" },
      { id: "4", iso: "87", circuit: "24AC / 94-GD", role: "Load out", goes: "N/elect = 24AC. W/elect = 94-GD", power: "Signal" },
      { id: "5", iso: "87a", circuit: "—", role: "NC", goes: "Empty", power: "Signal" },
    ],
    more: "Drops the exhaust brake when ABS is active. No ABS / no exhaust brake = skip.",
  },
  {
    id: "403",
    tag: "403",
    name: "AUTOMATIC XMSN MODULATOR SHIFT RELAY",
    page: "90",
    where: "Transmission harness",
    look: "ISO 4-cavity. 4=92C 3=97E 1=92B 2=92E.",
    engineCritical: false,
    fused: "Allison / 92 family",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "92C", role: "Load in", goes: "Allison modulator", power: "Key / IGN" },
      { id: "3", iso: "87", circuit: "97E", role: "Load out", goes: "Shift solenoid / CEC related", power: "Signal" },
      { id: "1", iso: "86", circuit: "92B", role: "Coil −", goes: "Trans harness", power: "Signal" },
      { id: "2", iso: "85", circuit: "92E", role: "Coil +", goes: "Trans harness", power: "Signal" },
    ],
    more: "Allison modulator shift. Keep if the MD stays. Not required for the 7.3 to idle.",
  },
  {
    id: "423",
    tag: "423",
    name: "ABS WARNING LIGHT RELAY",
    page: "92",
    where: "ABS cab overlay",
    look: "5-cavity. 4=94-GC (3600) / 94-GA. 3=94E. 1=94B / 13J. 2=94H.",
    engineCritical: false,
    fused: "ABS / IGN 13J on 3800",
    layout: "iso5",
    pins: [
      { id: "4", iso: "30", circuit: "94-GC (3600) / 94-GA", role: "Load in", goes: "* W/3600 = 94-GC. ** W/3800,4000FBC = 94-GA", power: "Key / IGN" },
      { id: "3", iso: "87", circuit: "94E", role: "Load out", goes: "ABS WARNING LIGHT (422)", power: "Key / IGN" },
      { id: "1", iso: "86", circuit: "94B / 13J", role: "Coil −", goes: "** 13J on 3800/4000FBC", power: "Signal" },
      { id: "2", iso: "85", circuit: "94H", role: "Coil +", goes: "ABS cab overlay", power: "Signal" },
      { id: "5", iso: "87a", circuit: "—", role: "NC", goes: "Empty", power: "Signal" },
    ],
    more: "Second ABS lamp relay face (ISO cube). Hyd 3600 without ABS can skip.",
  },
  {
    id: "639",
    tag: "639",
    name: "TRANSMISSION BACKUP RELAY W/MD TRANSMISSION",
    page: "103",
    where: "MD transmission overlay",
    look: "ISO 4-cavity. 4=13 3=71 1=71A 2=148C.",
    engineCritical: false,
    fused: "IGN 13 / backup 71",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "13", role: "Load in", goes: "Ignition feed", power: "Key / IGN" },
      { id: "3", iso: "87", circuit: "71", role: "Load out", goes: "BACK UP LIGHT SWITCH path", power: "Key / IGN" },
      { id: "1", iso: "86", circuit: "71A", role: "Coil −", goes: "Backup lamp feed", power: "Key / IGN" },
      { id: "2", iso: "85", circuit: "148C", role: "Coil +", goes: "MD trans reverse signal", power: "Signal" },
    ],
    more: "MD trans reverse lamp relay. Keep if you want backup lights with the Allison.",
  },
  {
    id: "995",
    tag: "995",
    name: "STOP LIGHT RELAY",
    page: "106",
    where: "Cab overlay — retarder / MD",
    look: "5-cavity. 4=92M/70A 3=70B 1=92-GF.",
    engineCritical: false,
    fused: "Stop 70 / Allison 92",
    layout: "iso5",
    pins: [
      { id: "4", iso: "30", circuit: "92M / 70A", role: "Load in", goes: "Stop-lamp / retarder feed", power: "Key / IGN" },
      { id: "3", iso: "87", circuit: "70B", role: "Load out", goes: "Stop lamps", power: "Key / IGN" },
      { id: "1", iso: "86", circuit: "92-GF", role: "Coil −", goes: "Retarder overlay", power: "Signal" },
      { id: "2", iso: "85", circuit: "—", role: "Coil +", goes: "Not labeled on the face", power: "Signal" },
      { id: "5", iso: "87a", circuit: "—", role: "NC", goes: "Empty", power: "Signal" },
    ],
    more: "Retarder stop-lamp interlock. Bare hyd 3600 without a retarder usually has no 995.",
  },
  {
    id: "996",
    tag: "996",
    name: "RETARDER ENABLE RELAY",
    page: "106",
    where: "Cab overlay — retarder",
    look: "5-cavity. 4=92A 3=13M/92A 1=92P 2=97T.",
    engineCritical: false,
    fused: "IGN 13M / Allison 92",
    layout: "iso5",
    pins: [
      { id: "4", iso: "30", circuit: "92A", role: "Load in", goes: "Allison retarder enable", power: "Key / IGN" },
      { id: "3", iso: "87", circuit: "13M / 92A", role: "Load out", goes: "Retarder enable out", power: "Key / IGN" },
      { id: "1", iso: "86", circuit: "92P", role: "Coil −", goes: "Retarder overlay", power: "Signal" },
      { id: "2", iso: "85", circuit: "97T", role: "Coil +", goes: "CEC / cluster 97T", power: "Signal" },
      { id: "5", iso: "87a", circuit: "—", role: "NC", goes: "Empty", power: "Signal" },
    ],
    more: "Allison retarder enable. Skip if the bus has no retarder.",
  },
  {
    id: "GP",
    tag: "GP",
    name: "GLOW PLUGS/PRE-HEATER RELAY",
    page: "33 / 18",
    where: "Engine / inner fender — high current",
    look: "Large high-current relay. Fat 30/87 cables. Skinny 85/86 from the CEC.",
    engineCritical: true,
    fused: "Battery via fusible link (not a panel fuse)",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "18", role: "Load in", goes: "Battery / fusible link", power: "Battery" },
      { id: "3", iso: "87", circuit: "18", role: "Load out", goes: "Glow plugs in the head", power: "Battery" },
      { id: "1", iso: "86", circuit: "11", role: "Coil −", goes: "Ground (front 2B-G3 is 18-G related)", power: "Ground" },
      { id: "2", iso: "85", circuit: "97", role: "Coil +", goes: "CEC wait-to-start", power: "Key / IGN" },
    ],
    more: "Four connections. Two are welding-cable thick (battery and plugs). Two are the CEC coil. Cold start needs this.",
  },
  {
    id: "1",
    tag: "R1",
    name: "FLASHER",
    page: "77",
    where: "Sits in the fuse-panel lid (circle on the cover)",
    look: "Round 2-blade can. R1-A is feed, R1-B is load.",
    engineCritical: false,
    fused: "C3 30A TURN (battery)",
    layout: "flash2",
    pins: [
      { id: "A", iso: "X", circuit: "55", role: "In", goes: "Fuse C3-B", power: "Battery" },
      { id: "B", iso: "L", circuit: "55A / 60", role: "Out", goes: "Turn / hazard switch 459", power: "Battery" },
    ],
    more: "Two blades only. Swap for an electronic flasher if you add LED lamps.",
  },
  {
    id: "99",
    tag: "99",
    name: "FOG LIGHT RELAY",
    page: "84",
    where: "Cab overlay",
    look: "ISO 4-cavity. 4=64-C, 3=64B, 1=64G, 2=64BA. 64 on the body.",
    engineCritical: false,
    fused: "F3 / fog feed",
    layout: "iso4",
    pins: [
      { id: "4", iso: "30", circuit: "64-C", role: "Load in", goes: "Fog feed", power: "Battery" },
      { id: "3", iso: "87", circuit: "64B", role: "Load out", goes: "Fog lamps", power: "Battery" },
      { id: "1", iso: "86", circuit: "64G", role: "Coil −", goes: "Ground", power: "Ground" },
      { id: "2", iso: "85", circuit: "64BA", role: "Coil +", goes: "Fog switch", power: "Key / IGN" },
    ],
    more: "Four wires if the bus has fog lamps. Skip on a bare 3600.",
  },
];

export function relaysForCircuit(circuit: string): { face: RelayFace; pin: RelayPin }[] {
  const n = circuit.match(/\d+/)?.[0] ?? "";
  const hits: { face: RelayFace; pin: RelayPin }[] = [];
  for (const f of relayFaces) {
    for (const p of f.pins) {
      if (p.circuit === "—" || p.circuit === "11" && n !== "11") continue;
      if (p.circuit.includes(n) || circuit.includes(p.circuit.split(" ")[0])) {
        if (n && (p.circuit.match(/\d+/)?.[0] === n || p.circuit.startsWith(n))) {
          hits.push({ face: f, pin: p });
        }
      }
    }
  }
  return hits;
}
