export const circuitNames: Record<string, string> = {
  "1": "GENERATOR - FIELD",
  "2": "GENERATOR - CHARGE",
  "7": "GENERATOR - REGULATOR",
  "11": "GROUND",
  "12": "ACCESSORY FEED",
  "13": "IGNITION FEED",
  "14": "BATTERY FEED",
  "15": "KEY SWITCH FEED",
  "17": "STARTER CONTROL",
  "18": "GLOW PLUGS/PRE-HEATER",
  "19": "FUEL SHUT-OFF SOLENOID, FUEL FILTER",
  "21": "ETHER START",
  "23": "FAN AND SHUTTER CONTROLS",
  "24": "EXHAUST BRAKE",
  "25": "PYROMETER",
  "26": "AMMETER",
  "27": "VOLTMETER",
  "28": "INSTRUMENTS AND GAUGES-FEEDS",
  "29": "ENGINE WATER TEMPERATURE",
  "30": "ENGINE OIL TEMPERATURE",
  "31": "TRANSMISSION OIL TEMPERATURE",
  "32": "AXLE OIL TEMPERATURE",
  "33": "ENGINE OIL LEVEL",
  "34": "COOLANT LEVEL",
  "35": "ENGINE OIL PRESSURE",
  "36": "FUEL LEVEL",
  "37": "FUEL PUMP",
  "39": "AIR DRYER HEATER",
  "40": "LOW AIR PRESSURE WARNING",
  "43": "POWER DIVIDER LOCK (PDL)",
  "44": "BRAKE SYSTEM WARNING",
  "46": "POWER TAKE OFF (PTO) WARNING",
  "47": "SPEEDOMETER",
  "48": "TACHOMETER",
  "49": "DIFFERENTIAL LOCK ENGAGED WARNING",
  "50": "HEADLIGHTS-FEED",
  "51": "DIMMER SWITCH-FEED",
  "52": "HEADLIGHT - HI BEAM",
  "53": "HEADLIGHT - LO BEAM",
  "54": "MARKER AND PARK LIGHTS",
  "55": "TURN SIGNAL LIGHTS-FEED",
  "56": "LEFT TURN SIGNAL",
  "57": "RIGHT TURN SIGNAL",
  "58": "CLEARANCE/IDENTIFICATION",
  "60": "HAZARD FLASHER-FEED",
  "61": "AIR SUSPENSION RELEASE",
  "62": "PANEL LIGHTS",
  "64": "FOG/DRIVE LIGHTS",
  "65": "CAB REAR FLOOD LIGHT(S)",
  "66": "DAYTIME RUNNING LIGHTS",
  "68": "TAIL LIGHTS",
  "70": "STOP LIGHTS",
  "71": "BACK-UP LIGHTS",
  "85": "HORN",
  "90": "HYDRAULIC BRAKE PUMP MOTOR",
  "92": "ALLISON AUTOMATIC TRANSMISSION-ELECTRONIC",
  "93": "TWO SPEED AXLE SHIFT",
  "94": "ANTI-LOCK BRAKES",
  "97": "AUTO CRUISE/ENGINE CONTROLS",
  "98": "COMPUTER DATA LINK/TEST",
  "99": "ACCELLERATOR POSITION SENSOR",
};

export function circuitFamily(circuit: string): string {
  const raw = circuit.trim().toUpperCase();
  if (!raw || raw === "---" || raw === "—" || raw === "PLUG") return "";
  if (raw.startsWith("CAN")) return "CAN";
  if (raw === "SHIELD" || raw === "SHLD") return "CAN";
  const m = raw.match(/^(\d+)/);
  return m?.[1] ?? raw;
}

export function circuitLabel(circuit: string): string {
  const fam = circuitFamily(circuit);
  if (!fam) return "Empty / unused";
  if (fam === "CAN") return "J1939 / data link";
  return circuitNames[fam] ?? `Circuit ${fam}`;
}
