export type DxJump = {
  tab: "shop" | "book" | "wall" | "relays" | "circuits" | "pins" | "panel" | "all" | "job" | "dx";
  hint?: string;
  label: string;
};

export type DxChoice = {
  id: string;
  label: string;
  next?: string;
  result?: string;
};

export type DxStep = {
  id: string;
  title: string;
  where: string;
  do: string;
  expect: string;
  caution?: string;
  jumps?: DxJump[];
  choices: DxChoice[];
};

export type DxResult = {
  id: string;
  title: string;
  body: string;
  jumps?: DxJump[];
};

export type DxFlow = {
  id: string;
  title: string;
  blurb: string;
  start: string;
};

export const dxFlows: DxFlow[] = [
  {
    id: "no-crank",
    title: "No crank",
    blurb: "Key to START. Silence. Relay does not click. Engine does not turn.",
    start: "nc-fuse",
  },
  {
    id: "click-no-crank",
    title: "Click, no crank",
    blurb: "387 clicks or you hear a solenoid, but the engine does not spin.",
    start: "ck-which",
  },
  {
    id: "no-rpm",
    title: "Cranks, tach 0",
    blurb: "Engine spins. Cluster RPM stays at 0. 7.3 will not fire without CPS.",
    start: "rpm-confirm",
  },
  {
    id: "no-fire",
    title: "Cranks, has RPM, no start",
    blurb: "Tach moves. No combustion. Fuel / CEC / glow — not the starter.",
    start: "nf-confirm",
  },
];

export const dxSteps: DxStep[] = [
  {
    id: "nc-fuse",
    title: "H1 10A START",
    where: "Fuse panel cover — H1. Red 10A. Cover says START.",
    do: "Key ON (not START). Probe both sides of H1 to ground. Pull it and look. It is IGN-fed, not battery.",
    expect: "Both sides ~12 V key ON. Fuse intact.",
    caution: "H1 blown = no crank. It feeds 97P to DASH CONNECTOR (2) B6 (neutral start-enable), not the fat starter cable. Relay 615 is Allison MD overlay only.",
    jumps: [
      { tab: "panel", hint: "H1", label: "Fuse H1" },
      { tab: "circuits", hint: "17", label: "Circuit 17" },
    ],
    choices: [
      { id: "ok", label: "H1 is good · 12 V both sides", next: "nc-find-387" },
      { id: "out", label: "H1 open / no power", result: "r-h1" },
    ],
  },
  {
    id: "nc-find-387",
    title: "Find START RELAY (387)",
    where: "Cab, black 4-cavity on the black harness. Mating end: 17B / 17F on top, 17D / 17C on the bottom.",
    do: "Pull the cube. Confirm four wires: two fat (30/87), two skinny (coil).",
    expect: "This is 387. Not the firewall triple. Not a buzzer pair. Not the BAP.",
    caution:
      "Wrong parts on this bus: firewall 3-cube = glow / ECM power / chassis. Under-dash Hella BUZZER + 984322B are not 387. BAROMETRIC PRESSURE (406) 1807253C1 is not the start circuit.",
    jumps: [
      { tab: "relays", hint: "387", label: "387 pinout" },
      { tab: "shop", hint: "r387", label: "Shop · 387" },
    ],
    choices: [
      { id: "got", label: "Got 387. Socket is empty, ready to probe", next: "nc-86" },
      { id: "wrong", label: "I was on a different relay", result: "r-wrong-relay" },
    ],
  },
  {
    id: "nc-86",
    title: "ISO 86 — coil +",
    where: "387 socket. Bosch stamp 86. Skinny coil cavity that is circuit 17C (cavity 2).",
    do: "Key START (helper or a remote). Probe ISO 86 to ground (volts) or 86 to the key ST terminal (ohms, key off).",
    expect: "12 V only in START. Continuity to key ST. This blade is coil +.",
    caution:
      "Printed page 20 writes “85=17C / 86=17D”. On a Bosch-stamped cube those ISO numbers are swapped vs that sentence. Probe: the blade that goes hot in START is coil +. The other coil blade is the ground path.",
    jumps: [
      { tab: "relays", hint: "387", label: "387 face" },
      { tab: "circuits", hint: "17", label: "Starter control" },
    ],
    choices: [
      { id: "hot", label: "86 goes 12 V in START", next: "nc-85" },
      { id: "dead", label: "86 stays dead in START", next: "nc-86-dead" },
    ],
  },
  {
    id: "nc-86-dead",
    title: "86 dead — work back the START feed",
    where: "Key ST → STARTER INTERRUPT (shipped jumpered) → CRANK RELAY (661) → 387 pin 86.",
    do: "Check the interrupt is jumpered. If 661 is fitted, 5=17C in, 4=17A out. Park/neutral on the AUTO XMSN switch. Skip 615 unless the bus has Allison MD.",
    expect: "17C 16PK live at the interrupt in START. If 661 is unused, the plug is jumpered and 17C continues to 387.",
    jumps: [
      { tab: "relays", hint: "661", label: "661 crank inhibit" },
      { tab: "circuits", hint: "17", label: "Circuit 17" },
    ],
    choices: [
      { id: "fixed", label: "Feed is back · 86 is hot in START", next: "nc-85" },
      { id: "still", label: "Still no 12 V at 86", result: "r-86-open" },
    ],
  },
  {
    id: "nc-85",
    title: "ISO 85 — coil ground (constant)",
    where: "387 socket ISO 85. Circuit 17D (cavity 1). Grounds through optional thermal overcrank 17-G on the starter.",
    do: "Key OFF. Ohms from ISO 85 to battery negative / engine block. Then key START and watch volts on 85.",
    expect:
      "Ohms: ~0–3 Ω is a real ground. 30–40 Ω is a dirty splice. OL is an open (overcrank or 17D broken). Volts: 85 should stay near 0 V. If 85 is open, 12 V from 86 floats across the coil onto 85 — that is “voltage jumping over,” not a second power feed.",
    caution: "85 is NOT key-switched. It is a constant ground path. Manually grounding 85 while 86 is hot must click the relay.",
    jumps: [{ tab: "circuits", hint: "17", label: "Circuit 17" }],
    choices: [
      { id: "good", label: "85 is ~0–3 Ω to ground", next: "nc-jump" },
      { id: "high", label: "85 is 20–40 Ω (high resistance)", next: "nc-overcrank" },
      { id: "ol", label: "85 is OL / infinite", next: "nc-overcrank" },
    ],
  },
  {
    id: "nc-overcrank",
    title: "Thermal overcrank",
    where: "On the starter. Small connector, 17-G 10WH. Not the fat battery cables. Not the green-ring magnetic switch on top of the engine.",
    do: "Factory note on page 20: CONNECT TOGETHER W/O THERMAL OVERCRANK. Unplug the thermal. Splice the two wires (the two that were in that connector) so 17D / 17-G is a solid ground. Re-ohm 387 pin 85.",
    expect: "After a clean splice, 85 should drop to a couple of ohms. 39 Ω means the splice is still dirty or there is another joint in the path.",
    caution: "Cutting the connector out is the factory no-overcrank jumper. You are not deleting a required safety on a 1998 3600 that never had the option armed.",
    jumps: [
      { tab: "circuits", hint: "17", label: "Cranking page" },
      { tab: "shop", hint: "starter", label: "Shop · starter" },
    ],
    choices: [
      { id: "now", label: "85 is now a real ground", next: "nc-jump" },
      { id: "still", label: "85 still OL or high", result: "r-85-open" },
    ],
  },
  {
    id: "nc-jump",
    title: "Prove the coil",
    where: "387 socket. Relay installed or a jumper across the coil.",
    do: "Helper on key START. Jumper ISO 85 to a known-good ground (battery negative). Listen for the click. Then probe ISO 87.",
    expect: "Relay clicks. ISO 87 goes 12 V in START. That 12 V is 17F to the engine-top magnetic switch.",
    choices: [
      { id: "click87", label: "Clicks, 87 goes 12 V", next: "nc-mag" },
      { id: "click-no87", label: "Clicks, 87 stays dead", result: "r-30-87" },
      { id: "noclick", label: "Still no click with 85 grounded", result: "r-relay-dead" },
    ],
  },
  {
    id: "nc-mag",
    title: "Magnetic switch (engine-top)",
    where: "Solenoid on top of the engine / inner fender. Two green ring terminals. This is J30 magnetic switch — not the starter-motor solenoid J31 on the starter.",
    do: "Key START. Volts at the green-ring S feed vs battery. Loaded and unloaded. Do not jump the starter motor itself.",
    expect:
      "12 V in START on the control feed. If you see 3–4 V open that collapses to 0 V connected, 17F has high resistance (dash 2-G6, fusible link, 387-87). Feeding S with 12 V still needs the key in START — you are not spinning the motor directly.",
    caution: "Power to this S terminal + key START is a valid control test. It is not a starter jump.",
    jumps: [
      { tab: "circuits", hint: "17", label: "17F path" },
      { tab: "shop", hint: "starter", label: "Shop · starter" },
    ],
    choices: [
      { id: "12v", label: "12 V at S in START, switch closes", result: "r-downstream" },
      { id: "drop", label: "3–4 V open, 0 V loaded", result: "r-17f-drop" },
      { id: "none", label: "No voltage at the green rings", result: "r-17f-open" },
    ],
  },
  {
    id: "ck-which",
    title: "Which click?",
    where: "Cab vs engine.",
    do: "Key START. One person at 387, one at the engine-top magnetic switch, one at the starter.",
    expect: "Name the click: 387 cube, engine-top magnetic switch, or J31 on the starter.",
    choices: [
      { id: "387", label: "387 clicks", next: "nc-mag" },
      { id: "mag", label: "Engine-top solenoid clicks / tries", result: "r-j31" },
      { id: "none", label: "Not sure / only a faint tick", next: "nc-find-387" },
    ],
  },
  {
    id: "rpm-confirm",
    title: "Confirm tach while cranking",
    where: "Cluster. Circuit 48 TACHOMETER. CEC CONTROL MODULE (379) needs RPM to fire HEUI.",
    do: "Crank 5–8 seconds. Watch tach. If you have a scan tool, watch RPM on the CEC.",
    expect: "Tach should leave 0 while the engine is spinning. 0 RPM with a spinning engine = CPS (or its harness), not the starter.",
    jumps: [{ tab: "circuits", hint: "48", label: "Circuit 48" }],
    choices: [
      { id: "zero", label: "Tach stays 0", next: "rpm-cps" },
      { id: "moves", label: "Tach moves — this is not a CPS miss", result: "r-has-rpm" },
    ],
  },
  {
    id: "rpm-cps",
    title: "Camshaft position sensor",
    where: "T444E front cover, reading the harmonic balancer / pulse wheel. Not the BAP on the engine valley.",
    do: "Inspect the CPS connector and the 2-wire back to CEC (379). Check for oil in the plug, broken clip, or a sensor sitting half-out of the cover.",
    expect: "Clean dry plug, sensor fully seated. Cranking RPM on a scan tool. No RPM = replace CPS before chasing fuel.",
    caution: "BAROMETRIC PRESSURE (406) 1807253C1 is the purple-wire sensor. It is not the crank circuit and it is not the CPS.",
    jumps: [
      { tab: "shop", hint: "cps", label: "Shop · CPS" },
      { tab: "circuits", hint: "48", label: "Tach 48" },
    ],
    choices: [
      { id: "bad", label: "CPS unplugged / oily / suspect", result: "r-cps" },
      { id: "ok", label: "CPS looks seated, still 0 RPM", result: "r-cps-harness" },
    ],
  },
  {
    id: "nf-confirm",
    title: "Has RPM, no fire",
    where: "Not circuit 17. Starter did its job.",
    do: "Wait-to-start lamp. Glow relay (inner fender, fat cables). Fuel filter 399 / 19 family. CEC 379 module power 396/662.",
    expect: "Glow relay clicks cold. 396/662 feeding CEC. Filter heater/WIF not the crank path.",
    jumps: [
      { tab: "circuits", hint: "18", label: "Glow 18" },
      { tab: "circuits", hint: "19", label: "Fuel 19" },
      { tab: "relays", hint: "662", label: "CEC power 662" },
    ],
    choices: [
      { id: "glow", label: "No wait-to-start / no glow click", result: "r-glow" },
      { id: "cec", label: "No CEC power", result: "r-cec-pwr" },
      { id: "fuel", label: "CEC is alive, still no fire", result: "r-fuel" },
    ],
  },
];

export const dxResults: Record<string, DxResult> = {
  "r-h1": {
    id: "r-h1",
    title: "Fix H1 first",
    body: "H1 10A START is IGN, cover START. Replace it. If it blows again, 97P is shorted — not the starter motor. 615 is only in the picture on an Allison MD bus.",
    jumps: [{ tab: "panel", hint: "H1", label: "H1 on the cover" }],
  },
  "r-wrong-relay": {
    id: "r-wrong-relay",
    title: "You were on the wrong cube",
    body: "387 is the cab black 4-cavity, circuits 17B / 17F / 17D / 17C. Firewall triple = glow / ECM / chassis. Hella buzzer pair is not start. BAP 1807253C1 is barometric pressure.",
    jumps: [
      { tab: "relays", hint: "387", label: "387" },
      { tab: "relays", hint: "GP", label: "Glow relay" },
    ],
  },
  "r-86-open": {
    id: "r-86-open",
    title: "START feed never reaches 387",
    body: "Work key ST 17C through the interrupt jumper, optional 661, and the AUTO XMSN park/neutral switch. 86 must go hot in START before 85 matters. 615 is Allison MD overlay — most 3600s do not have it.",
    jumps: [
      { tab: "circuits", hint: "17", label: "Circuit 17" },
      { tab: "relays", hint: "661", label: "661" },
    ],
  },
  "r-85-open": {
    id: "r-85-open",
    title: "Ground path still open",
    body: "85 is constant ground via 17D / 17-G. After the thermal splice, 39 Ω is still a bad joint — re-do the crimp, then ohm from 85 all the way to the block. A jumper from 85 to battery negative is a valid get-home; it is not the repair.",
    jumps: [{ tab: "circuits", hint: "17", label: "17D / 17-G" }],
  },
  "r-30-87": {
    id: "r-30-87",
    title: "Coil works, load side does not",
    body: "ISO 30 (17B) is battery in from the starter / fusible link. ISO 87 (17F) is the load to the magnetic switch. No 12 V on 87 with the coil closed = open 30, cooked relay contacts, or a missing 17B.",
    jumps: [{ tab: "relays", hint: "387", label: "387 30/87" }],
  },
  "r-relay-dead": {
    id: "r-relay-dead",
    title: "Relay or 86 still dead",
    body: "With 85 jumpered to ground and key in START, a good cube must click. Swap a known-good ISO 4-pin. If the new one is silent, 86 is not actually hot — go back to the START feed.",
    jumps: [{ tab: "relays", hint: "387", label: "387" }],
  },
  "r-17f-drop": {
    id: "r-17f-drop",
    title: "High resistance on 17F",
    body: "3–4 V open that dies under the magnetic-switch coil is a classic voltage drop: dash connector 2-G6, 387 pin 87, or the fusible-link side. Repair the feed. Do not keep jumping the green rings.",
    jumps: [{ tab: "circuits", hint: "17", label: "17F" }],
  },
  "r-17f-open": {
    id: "r-17f-open",
    title: "No feed at the magnetic switch",
    body: "387-87 → dash 2-G6 → engine-top J30. If 87 is 12 V and the green rings are dead, the open is in that run. If 87 is dead, the relay is not closing or 30 is missing.",
    jumps: [{ tab: "wall", hint: "dash-2-hyd", label: "Dash connector 2" }],
  },
  "r-downstream": {
    id: "r-downstream",
    title: "Control side is good",
    body: "Magnetic switch is getting 12 V and closing. If it still will not spin, the problem is J31 / battery cables / starter ground 11-GJ — the fat stuff, not 387.",
    jumps: [{ tab: "shop", hint: "starter", label: "Starter" }],
  },
  "r-j31": {
    id: "r-j31",
    title: "Starter solenoid / cables",
    body: "Engine-top J30 clicked, motor did not. Load-test the battery cables, 11-GJ block ground, and J31 on the starter. That is not a 387 coil problem.",
    jumps: [{ tab: "shop", hint: "starter", label: "J31" }],
  },
  "r-cps": {
    id: "r-cps",
    title: "Replace / reseat the CPS",
    body: "T444E will crank all day with 0 RPM and never fire. CPS is on the front cover at the harmonic balancer. Unplug, inspect, replace if oily or loose. Then confirm tach while cranking.",
    jumps: [{ tab: "shop", hint: "cps", label: "CPS" }],
  },
  "r-cps-harness": {
    id: "r-cps-harness",
    title: "CPS harness / CEC RPM",
    body: "Sensor looks seated. Chase the 2-wire to CEC (379). Circuit 48 is the cluster tach — if the CEC sees RPM on a scan tool but the cluster does not, that is a gauge feed, not injection.",
    jumps: [
      { tab: "circuits", hint: "48", label: "48" },
      { tab: "shop", hint: "cec", label: "CEC 379" },
    ],
  },
  "r-has-rpm": {
    id: "r-has-rpm",
    title: "CPS is doing its job",
    body: "Tach moved. Leave the starter and CPS. Use the no-fire path: glow, CEC power, fuel 19.",
  },
  "r-glow": {
    id: "r-glow",
    title: "Glow / wait-to-start",
    body: "Inner-fender high-current relay, fat 30/87, skinny CEC coil. Cold 7.3 needs this. Firewall cubes are the usual home.",
    jumps: [
      { tab: "relays", hint: "GP", label: "Glow relay" },
      { tab: "circuits", hint: "18", label: "Circuit 18" },
    ],
  },
  "r-cec-pwr": {
    id: "r-cec-pwr",
    title: "CEC is dark",
    body: "MODULE POWER RELAY 396 / T444E 662. 14B battery in, 97CT keep-alive. Pull it and the computer dies. Not 387.",
    jumps: [{ tab: "relays", hint: "662", label: "662" }],
  },
  "r-fuel": {
    id: "r-fuel",
    title: "Fuel / HEUI after RPM",
    body: "Starter and CPS are out of the way. Fuel filter 399, 19 family, IPR/HEUI oil, and CEC inj control are next — that is not this cranking tree.",
    jumps: [{ tab: "circuits", hint: "19", label: "Fuel 19" }],
  },
};

export const dxLookalikes = [
  {
    id: "j30",
    name: "Engine-top solenoid (green rings)",
    fact: "Magnetic switch J30. Control only. 12 V on S still needs the key in START.",
  },
  {
    id: "j31",
    name: "Starter-mounted solenoid",
    fact: "J31 cranking-motor solenoid. Fat battery. This is the starter.",
  },
  {
    id: "387",
    name: "START RELAY (387)",
    fact: "Cab black 4-cavity. 30/87 fat, 85/86 skinny. The cube this book means by “start relay.”",
  },
  {
    id: "fw",
    name: "Firewall three-cube row",
    fact: "Glow / ECM power / chassis. Not 387.",
  },
  {
    id: "buzzer",
    name: "Hella BUZZER + 984322B pair",
    fact: "Under-dash buzzers. Not the start relay.",
  },
  {
    id: "bap",
    name: "1807253C1 purple-wire sensor",
    fact: "BAROMETRIC PRESSURE (406). Not crank, not CPS.",
  },
  {
    id: "thermal",
    name: "Small connector on the starter",
    fact: "Thermal overcrank 17-G. Splice the two wires if 387 pin 85 is OL.",
  },
  {
    id: "cps",
    name: "Front-cover CPS",
    fact: "Reads the harmonic balancer. Cranks with tach 0 = this, not 387.",
  },
];

export const isoPrimer = {
  title: "ISO mini-relay (Bosch cube)",
  pins: [
    { iso: "86", role: "Coil +", note: "On 387: key START (17C). Hot only in START." },
    { iso: "85", role: "Coil −", note: "On 387: constant ground via thermal overcrank (17D / 17-G)." },
    { iso: "30", role: "Battery in", note: "On 387: 17B from the starter / fusible link." },
    { iso: "87", role: "Load out", note: "On 387: 17F to magnetic switch J30." },
  ],
  float:
    "If 85 is open, 12 V on 86 appears on 85 through the coil. That is not a second power source — the ground side is floating.",
};

export function dxStep(id: string) {
  return dxSteps.find((s) => s.id === id);
}

export function dxResult(id: string) {
  return dxResults[id];
}

export function dxFlow(id: string) {
  return dxFlows.find((f) => f.id === id);
}
