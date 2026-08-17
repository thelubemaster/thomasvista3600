export type ManualEntry = {
  id: string;
  page: string;
  title: string;
  section: string;
  hyd: "3600 hyd" | "3600" | "3800/4000" | "air only" | "optional" | "all" | "chart";
  engineCritical: boolean;
  circuits: string[];
  mapId?: string;
  notes: string;
};

export const manualSections = [
  "Table / charts",
  "12 volt power distribution",
  "Cab accessories",
  "Engine systems",
  "Gauges",
  "Warning lights",
  "Chassis accessories",
  "Light systems",
  "Electronic engines",
  "Connector body composite",
] as const;

export const manual: ManualEntry[] = [
  { id: "toc", page: "1", title: "TABLE OF CONTENTS", section: "Table / charts", hyd: "chart", engineCritical: false, circuits: [], notes: "CTS-5123V index." },
  { id: "idx", page: "1–3", title: "CIRCUIT DIAGRAM INDEX", section: "Table / charts", hyd: "chart", engineCritical: false, circuits: [], notes: "Subject → printed page." },
  { id: "inst", page: "4–5", title: "CIRCUIT DIAGRAM INSTRUCTIONS", section: "Table / charts", hyd: "chart", engineCritical: false, circuits: [], notes: "Symbols, grounds, color abbreviations." },
  { id: "sym", page: "6–7", title: "SCHEMATIC SYMBOL CHART", section: "Table / charts", hyd: "chart", engineCritical: false, circuits: [], notes: "Relay, fuse, switch, sender symbols." },
  { id: "fuse-chart", page: "76", title: "FUSE, CIRCUIT BREAKER AND SWITCH CHART", section: "Table / charts", hyd: "all", engineCritical: true, circuits: [], mapId: "14", notes: "FUSE BLOCK cover labels and ratings." },
  { id: "fuse-block", page: "77", title: "FUSE BLOCK CONNECTIONS", section: "Table / charts", hyd: "all", engineCritical: true, circuits: [], notes: "FUSE BLOCK SHOWN FROM CABLE INSERTION END." },
  { id: "lamp", page: "107", title: "LAMP BULB CHART", section: "Table / charts", hyd: "chart", engineCritical: false, circuits: [], notes: "Trade numbers: 21620, 2458, 6053, H6054." },
  { id: "bb-data", page: "107", title: "BODY BUILDER ELECTRICAL CONNECTION DATA", section: "Table / charts", hyd: "3600", engineCritical: false, circuits: ["13", "56", "57", "58", "62", "70", "71"], notes: "BODY BUILDER (194) cavities A–H." },
  { id: "relay-data", page: "109", title: "RELAY PINOUT AND FUNCTION DATA", section: "Table / charts", hyd: "all", engineCritical: true, circuits: [], notes: "ISO 30/87/85/86 pinout." },
  { id: "junc", page: "109", title: "JUNCTION POINTS — POWER", section: "Table / charts", hyd: "all", engineCritical: true, circuits: ["14", "15", "85"], notes: "J1 BODY BUILDER FEED STUD. J2 ACCESSORY FEED. J3 HORN SLIP RING. J4 BODY BUILDER JUNCTION BLOCK. J30/J31/J33 BATTERY FEED." },
  { id: "tssw", page: "110", title: "NAVISTAR TURN SIGNAL SWITCH W/005AAA (STATIONARY STEERING COLUMN)", section: "Table / charts", hyd: "3600", engineCritical: false, circuits: ["55", "56", "57", "60"], mapId: "55", notes: "CONNECTOR 459." },
  { id: "cid", page: "108–109", title: "NAVISTAR CIRCUIT NUMBER IDENTIFICATION", section: "Table / charts", hyd: "chart", engineCritical: false, circuits: [], notes: "Official names for circuits 1–99." },

  { id: "bat3600", page: "8", title: "12V POWER DISTRIBUTION, BATTERY/ALTERNATOR VOLTAGE W/3600", section: "12 volt power distribution", hyd: "3600 hyd", engineCritical: true, circuits: ["14", "15", "17", "18", "26", "90"], mapId: "8", notes: "DUAL MOUNTED BATTERIES. BODY BUILDER FEED STUD (J1). START RELAY (387). HYD BRAKE PUMP MOTOR feed at start motor." },
  { id: "bat3800", page: "9", title: "12V POWER DISTRIBUTION, BATTERY W/3800 & 4000FBC", section: "12 volt power distribution", hyd: "3800/4000", engineCritical: true, circuits: ["14", "15"], notes: "Same idea, 3800/4000FBC battery layout." },
  { id: "key", page: "10", title: "KEY SWITCH", section: "12 volt power distribution", hyd: "all", engineCritical: true, circuits: ["12", "13", "15", "17"], mapId: "15", notes: "KEY SWITCH (63). BAT=15 ACC=12 IGN=13 ST=17." },

  { id: "horn", page: "11", title: "HORN", section: "Cab accessories", hyd: "all", engineCritical: false, circuits: ["85"], mapId: "85", notes: "HORN RELAY (61). FUSE E4 / F3 HORN/FOG." },
  { id: "turn-tilt", page: "12", title: "TURN SIGNALS TILT STEERING COLUMN", section: "Cab accessories", hyd: "3800/4000", engineCritical: false, circuits: ["55", "56", "57", "60"], notes: "Tilt column only." },
  { id: "turn-stat", page: "13", title: "TURN SIGNALS STATIONARY STEERING COLUMN", section: "Cab accessories", hyd: "3600", engineCritical: false, circuits: ["55", "56", "57", "60"], mapId: "55", notes: "3600 typical. FLASHER (R1). FUSE C3 30A TURN." },
  { id: "turn-dual-tilt", page: "14", title: "TURN SIGNALS W/DUAL FACE & TILT STEERING COLUMN", section: "Cab accessories", hyd: "3800/4000", engineCritical: false, circuits: ["55", "56", "57"], notes: "Dual face + tilt." },
  { id: "turn-dual-stat", page: "15", title: "TURN SIGNALS W/DUAL FACE & STATIONARY STEERING COLUMN", section: "Cab accessories", hyd: "optional", engineCritical: false, circuits: ["55", "56", "57"], notes: "Dual face + stationary." },

  { id: "chg3600", page: "18", title: "CHARGING SYSTEM (12V) W/3600 & W/DELCO 1100,130,145 AMP / L/N 1105 & 160 AMP", section: "Engine systems", hyd: "3600", engineCritical: true, circuits: ["1", "2", "7", "26"], mapId: "2", notes: "GENERATOR - FIELD / CHARGE / REGULATOR. AMMETER 26." },
  { id: "chg3800", page: "19", title: "CHARGING SYSTEM (12V) W/3800, 4000FBC", section: "Engine systems", hyd: "3800/4000", engineCritical: true, circuits: ["1", "2", "7"], notes: "3800/4000FBC charging." },
  { id: "crank3600", page: "20", title: "CRANKING SYSTEM (12V) (OPTIONAL STARTER OVERCRANK PROTECTION) W/3600", section: "Engine systems", hyd: "3600", engineCritical: true, circuits: ["17"], mapId: "17", notes: "START RELAY (387). CRANKING MOTOR SOLENOID (J31). Optional THERMAL OVERCRANK." },
  { id: "crank3800", page: "21", title: "CRANKING SYSTEM (12V) W/3800 & 4000FBC", section: "Engine systems", hyd: "3800/4000", engineCritical: true, circuits: ["17"], notes: "Same family, 3800/4000FBC." },
  { id: "ether", page: "22", title: "ETHER START W/I6-HEUI", section: "Engine systems", hyd: "optional", engineCritical: false, circuits: ["21"], mapId: "21", notes: "ETHER START. I6-HEUI only." },

  { id: "tot", page: "26", title: "TRANSMISSION OIL TEMP GAUGE", section: "Gauges", hyd: "3600", engineCritical: false, circuits: ["28", "31"], mapId: "31", notes: "TRANSMISSION OIL TEMPERATURE (345). FUSE A2 5A INST." },
  { id: "fuelg", page: "27", title: "FUEL LEVEL GAUGE", section: "Gauges", hyd: "3600", engineCritical: false, circuits: ["28", "36"], mapId: "36", notes: "FUEL LEVEL sender. FUSE A2." },
  { id: "tach", page: "28", title: "TACHOMETER GAUGE & SPEEDOMETER GAUGE SYSTEM", section: "Gauges", hyd: "3600", engineCritical: false, circuits: ["47", "48"], mapId: "47", notes: "SPEEDOMETER SENSOR (303)." },

  { id: "warn", page: "32", title: "ENGINE WARNING LIGHTS/ALARM & TEST SWITCH", section: "Warning lights", hyd: "3600", engineCritical: false, circuits: ["29", "35", "40", "201"], mapId: "32", notes: "AUDIBLE ALARM (20). FUSE A1 10A B/U." },
  { id: "wts", page: "33", title: "WAIT-TO-START LIGHT & PARKING BRAKE LIGHT", section: "Warning lights", hyd: "3600", engineCritical: false, circuits: ["18", "44"], mapId: "18", notes: "INSTRUMENT CLUSTER RIGHT — NATURAL (28) cavity 5 is wait lamp." },
  { id: "diag", page: "34", title: "DIAGNOSTIC/PROGRAMMABLE CONNECTOR & SELF-TEST SWITCH & WARNING LIGHT SYSTEMS", section: "Warning lights", hyd: "3600", engineCritical: true, circuits: ["97", "98"], mapId: "98", notes: "DIAGNOSTIC & PROGRAM CONNECTOR (384). FUSE C2 10A DIAG." },

  { id: "dryer", page: "36", title: "AIR DRYER (AD-9) W/004091,004092 (AIR BRAKES)", section: "Chassis accessories", hyd: "air only", engineCritical: false, circuits: ["39"], mapId: "39", notes: "AIR DRYER HEATER. Not on hyd 004040." },
  { id: "atmt", page: "37", title: "AUTOMATIC TRANSMISSION-ALLISON AT,MT", section: "Chassis accessories", hyd: "optional", engineCritical: false, circuits: ["92"], notes: "Older AT/MT. Not WTEC III." },
  { id: "wtec", page: "38–43", title: "AUTOMATIC TRANSMISSION-ALLISON ELECTRONIC", section: "Chassis accessories", hyd: "optional", engineCritical: false, circuits: ["92", "13"], mapId: "92", notes: "Allison WTEC III. FUSE G1 15A IGN / AUTO XMSN. CAB ABS/ALLISON INTERCONNECT (377)." },
  { id: "hyd", page: "44", title: "BRAKE SYSTEM (HYDRAULIC)", section: "Chassis accessories", hyd: "3600 hyd", engineCritical: false, circuits: ["90", "70", "44"], mapId: "90", notes: "W/004040. FUSE E3 10A BRAKE. HYDRAULIC BRAKE BOOSTER RELAY (300)." },
  { id: "ret", page: "45", title: "ALLISON AT RETARDER", section: "Chassis accessories", hyd: "optional", engineCritical: false, circuits: ["92"], notes: "Retarder option." },
  { id: "drain", page: "47", title: "DRAIN VALVE W/004091 & 004092 (AIR BRAKES)", section: "Chassis accessories", hyd: "air only", engineCritical: false, circuits: [], notes: "Air tanks only." },
  { id: "abs", page: "48–49", title: "BRAKE ANTI-LOCK", section: "Chassis accessories", hyd: "optional", engineCritical: false, circuits: ["94"], mapId: "94", notes: "ANTI-LOCK BRAKES. FUSES F2 / F1 / E2. CAB ABS/ALLISON INTERCONNECT (377)." },
  { id: "fuel", page: "50", title: "FUEL FILTER WIRING SYSTEM W/T444E, I6-HEUI", section: "Chassis accessories", hyd: "3600 hyd", engineCritical: true, circuits: ["19"], mapId: "19", notes: "FUEL FILTER (399). FUEL FILTER HEATER RELAY (431). WATER-IN-FUEL MODULE (470)." },
  { id: "axle-air", page: "52", title: "TWO SPEED AXLE W/3800 EXPORT ONLY, W/004091,004092 (AIR BRAKES)", section: "Chassis accessories", hyd: "air only", engineCritical: false, circuits: ["93"], notes: "Export 3800 air." },
  { id: "axle-hyd", page: "53", title: "TWO SPEED AXLE W/3800 EXPORT ONLY, 4000FBC & W/004040 (HYDRAULIC BRAKES)", section: "Chassis accessories", hyd: "optional", engineCritical: false, circuits: ["93"], mapId: "93", notes: "TWO SPEED AXLE SHIFT. Rare on a 3600 bus." },

  { id: "bu", page: "54", title: "BACK-UP LIGHTS", section: "Light systems", hyd: "3600", engineCritical: false, circuits: ["71"], mapId: "71", notes: "FUSE A1 10A B/U. BACK UP LIGHT SWITCH (304)." },
  { id: "fog", page: "55", title: "FOG LIGHTS W/DRL, N/DRL", section: "Light systems", hyd: "optional", engineCritical: false, circuits: ["64"], mapId: "64", notes: "FOG LIGHT RELAY (99). FUSE F3 HORN/FOG." },
  { id: "hdl-n", page: "56", title: "HEADLIGHT SYSTEM W/00570B,005710 (TILT STRG COLUMN) & N/DRL", section: "Light systems", hyd: "3800/4000", engineCritical: false, circuits: ["50", "51", "52", "53"], notes: "Tilt, no DRL." },
  { id: "hdl-3600", page: "57", title: "HEADLIGHT SYSTEM W/3800,4000FBC & W/005AAA (STATIONARY STRG COLUMN) & N/DRL", section: "Light systems", hyd: "3600", engineCritical: false, circuits: ["50", "51", "52", "53"], mapId: "50", notes: "Stationary column. Typical 3600." },
  { id: "hdl-tilt-drl", page: "59", title: "HEADLIGHT SYSTEM W/00570B,005710 (TILT STRG COLUMN) & W/DRL", section: "Light systems", hyd: "3800/4000", engineCritical: false, circuits: ["50", "66"], notes: "Tilt + DRL." },
  { id: "hdl-drl", page: "60–61", title: "HEADLIGHT SYSTEM W/3800,4000FBC & W/005AAA (STATIONARY STRG COLUMN) & W/DRL", section: "Light systems", hyd: "optional", engineCritical: false, circuits: ["50", "66"], notes: "Stationary + DRL." },
  { id: "panel", page: "62", title: "PANEL LIGHTS", section: "Light systems", hyd: "3600", engineCritical: false, circuits: ["62"], mapId: "62", notes: "PANEL LIGHTS. FUSE E1 TAIL/PNL." },
  { id: "park", page: "63", title: "PARK/SIDE MARKER LIGHTS W/3600 & 3800", section: "Light systems", hyd: "3600", engineCritical: false, circuits: ["54", "58"], mapId: "54", notes: "MARKER AND PARK LIGHTS / CLEARANCE/IDENTIFICATION." },
  { id: "stop-air", page: "64", title: "STOP LIGHT SWITCH W/004091 & 004092 (AIR BRAKES)", section: "Light systems", hyd: "air only", engineCritical: false, circuits: ["70"], notes: "Air stop switches (79)(80)." },
  { id: "stop-hyd", page: "65", title: "STOP LIGHT SWITCH W/004040 (HYDRAULIC BRAKES)", section: "Light systems", hyd: "3600 hyd", engineCritical: false, circuits: ["70"], mapId: "70", notes: "STOP LIGHT SWITCH W/004040 (51). FUSE D3 30A STOP." },
  { id: "shut", page: "66", title: "SHUTTER WIRING", section: "Light systems", hyd: "optional", engineCritical: false, circuits: ["23", "97K"], mapId: "23", notes: "FAN AND SHUTTER CONTROLS. From FUSE B1 (97K 18GY). RADIATOR SHUTTER SOLENOID (337)." },

  { id: "modpwr", page: "70", title: "MODULE POWER & GROUND SYSTEM", section: "Electronic engines", hyd: "3600 hyd", engineCritical: true, circuits: ["11", "14", "97"], mapId: "97", notes: "CEC CONTROL MODULE (379). CEC MODULE RELAY (396). Required grounds 11-GW/GX/GY/GZ." },
  { id: "aps", page: "71", title: "ACCELERATOR, BAP & MAP SYSTEMS", section: "Electronic engines", hyd: "3600 hyd", engineCritical: true, circuits: ["99", "97"], mapId: "99", notes: "ACCELERATION POSITION SWITCH (382). BAROMETRIC PRESSURE SENSOR (406)." },
  { id: "cruise", page: "72", title: "CRUISE CONTROL, ELECTRIC HAND THROTTLE SYSTEM", section: "Electronic engines", hyd: "optional", engineCritical: false, circuits: ["97"], mapId: "72", notes: "CRUISE ON/OFF SWITCH (391) BLACK. CRUISE SET/RESUME SWITCH (392) WHITE." },

  { id: "c2", page: "78", title: "DASH CONNECTOR (2) — ENGINE CONNECTOR W/HYD BRAKES (CAB SIDE)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["19", "90", "17", "97"], notes: "Mating-end grid. H5=19A E4=19B H6=19C. A4–A7 hyd." },
  { id: "c2a", page: "79", title: "ENGINE CONNECTOR (2A) W/004040 (HYD BRAKES)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["19", "90"], notes: "Engine harness mating face." },
  { id: "c2b", page: "79", title: "FRONT END CONNECTOR (2B)", section: "Connector body composite", hyd: "3600", engineCritical: false, circuits: ["50", "52", "53", "56", "85"], notes: "Columns 1–3. Lighting / horn." },
  { id: "c3", page: "80", title: "ELECTRONIC ENGINE DASH CONNECTOR (3)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["97", "99", "98"], notes: "22-way A–V. Cab harness ↔ engine harness." },
  { id: "c20", page: "80", title: "AUDIBLE ALARM (20)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: false, circuits: ["40", "90"], notes: "4-cavity. Hyd uses 136 / 90U." },
  { id: "c26", page: "81", title: "INSTRUMENT CLUSTER LEFT — YELLOW (26)", section: "Connector body composite", hyd: "3600", engineCritical: false, circuits: ["28", "29", "40", "90"], notes: "17-way YELLOW. 90T hyd brake lamp." },
  { id: "c27", page: "81", title: "INSTRUMENT CLUSTER CENTER — GREEN (27)", section: "Connector body composite", hyd: "3600", engineCritical: false, circuits: ["28", "36", "52", "62", "97"], notes: "17-way GREEN." },
  { id: "c28", page: "81", title: "INSTRUMENT CLUSTER RIGHT — NATURAL (28)", section: "Connector body composite", hyd: "3600", engineCritical: false, circuits: ["18", "28", "44", "62"], notes: "17-way NATURAL. Cavity 5 wait-to-start." },
  { id: "c47", page: "82", title: "BLOCKING DIODE ASSY W/004040, HYD BRAKES (47 & 48)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: false, circuits: ["90"], notes: "90F/90H/90D/90E/90U." },
  { id: "c49", page: "82", title: "HYDRAULIC BRAKE WARNING LIGHT W/004040 (49)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: false, circuits: ["90", "70"], notes: "Inline A–K monitor module." },
  { id: "c50", page: "82", title: "HYDRAULIC BRAKE SWITCH W/004040 (50)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: false, circuits: ["90"], notes: "A=90C B=97M/90D." },
  { id: "c51", page: "82", title: "STOP LIGHT SWITCH W/004040 (HYDRAULIC BRAKES) (51)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: false, circuits: ["70"], notes: "A=70 B=70C." },
  { id: "c60", page: "82", title: "HEADLIGHT SWITCH (60)", section: "Connector body composite", hyd: "3600", engineCritical: false, circuits: ["50", "51", "62"], notes: "Cavities A–H." },
  { id: "c61", page: "82", title: "HORN RELAY (61)", section: "Connector body composite", hyd: "all", engineCritical: false, circuits: ["85"], notes: "4-cavity 85A/85C/85B/85." },
  { id: "c63", page: "83", title: "KEY SWITCH (63)", section: "Connector body composite", hyd: "all", engineCritical: true, circuits: ["12", "13", "15", "17"], notes: "BAT ACC IGN ST." },
  { id: "c71", page: "83", title: "FUEL FILTER CAB HARNESS (71)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["19"], notes: "A=19D B=19J D=19A E=19B F=19C." },
  { id: "c300", page: "85A", title: "HYDRAULIC BRAKE BOOSTER RELAY (300)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: false, circuits: ["90"], notes: "5-cavity. 90B / 90H / 90M / ground." },
  { id: "c379", page: "87", title: "CEC CONTROL MODULE (379)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["97", "99", "11"], notes: "60-pin. Engine will not run without it." },
  { id: "c387", page: "89", title: "START RELAY W/ T444E & I6-HEUI (387)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["17"], notes: "17B / 17F / 17D / 17C." },
  { id: "c396", page: "88", title: "CEC MODULE RELAY (396)", section: "Connector body composite", hyd: "3600 hyd", engineCritical: true, circuits: ["14", "97"], notes: "14B / 97CT / 97AH / 97CM." },
  { id: "c391", page: "88", title: "CRUISE ON/OFF SWITCH (391) CAB HARNESS (BLACK)", section: "Connector body composite", hyd: "optional", engineCritical: false, circuits: ["97"], notes: "Black 6-way. Throttle on/off." },
  { id: "c392", page: "89", title: "CRUISE SET/RESUME SWITCH (392) CAB HARNESS (WHITE)", section: "Connector body composite", hyd: "optional", engineCritical: false, circuits: ["97"], notes: "White 6-way." },
];
