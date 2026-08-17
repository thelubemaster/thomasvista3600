/** Locked to this bus: 7.3 T444E, not the I6-HEUI. */
export const ENGINE = {
  id: "t444e",
  code: "T444E",
  name: "T444E 7.3 POWER STROKE",
  liters: "7.3",
  banks: 2,
  cylinders: 8,
  glowPlugs: 8,
  cec: "CEC CONTROL MODULE (379)",
  startRelay: "START RELAY W/ T444E & I6-HEUI (387)",
  filter: "FUEL FILTER WIRING SYSTEM W/T444E, I6-HEUI",
  inline: "FUEL FILTER IN-LINE CONNECTION W/NGD V8, I6 HEUI (401)",
} as const;

/** Book pages that apply only to the I6. Skip on this 7.3. */
export const i6Only = new Set(["21"]);

export function onThisEngine(circuit: string) {
  return !i6Only.has(circuit.replace(/\D.*/, "") || circuit);
}
