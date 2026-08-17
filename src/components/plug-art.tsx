import type { ReactNode } from "react";
import type { Pin } from "@/data/connectors";
import { circuitFamily } from "@/data/circuits";
import { cn } from "@/lib/utils";

type ArtProps = {
  pins: Pin[];
  active?: string | null;
  family?: string;
  onPick: (cavity: string) => void;
};

function pinAt(pins: Pin[], cav: string) {
  return pins.find((p) => p.cavity === cav);
}
function empty(p?: Pin) {
  return !p || p.circuit === "---" || p.circuit === "—";
}

const ink = "#1a1814";
const paper = "#f4f0e6";
const lab = { fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 600 };

function Hole({
  x,
  y,
  size = 22,
  cavity,
  pin,
  active,
  family,
  onPick,
  round = false,
}: {
  x: number;
  y: number;
  size?: number;
  cavity: string;
  pin?: Pin;
  active?: boolean;
  family?: string;
  onPick: (c: string) => void;
  round?: boolean;
}) {
  const vacant = empty(pin);
  const lit = !vacant && !!family && circuitFamily(pin!.circuit) === family;
  const fill = active ? "#c4783a" : lit ? "#8fa3b8" : paper;
  const stroke = active ? "#8a4e1c" : ink;
  const r = round ? size / 2 : 1.5;
  return (
    <g
      role="button"
      tabIndex={0}
      className="cursor-pointer"
      onClick={() => onPick(cavity)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPick(cavity);
      }}
    >
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={active ? 2 : 1.4}
      />
      {!vacant ? (
        <text
          x={x + size / 2}
          y={y + size / 2 + 3}
          textAnchor="middle"
          fill={active ? "#1a120c" : ink}
          style={{ fontSize: pin!.circuit.length > 4 ? 6.5 : 7.5, fontFamily: "ui-monospace, monospace", fontWeight: 600 }}
        >
          {pin!.circuit.length > 5 ? pin!.circuit.slice(0, 5) : pin!.circuit}
        </text>
      ) : null}
    </g>
  );
}

/** DASH CONNECTOR (2) — printed page 78. One housing, two banks, bolt in the middle. */
export function Dash2Art({ pins, active, family, onPick }: ArtProps) {
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const leftCols = ["4", "5", "6", "7"];
  const rightCols = ["3", "2", "1"];
  const cell = 18;
  const gap = 3;
  const lx = 52;
  const rx = 178;
  const oy = 52;
  return (
    <SvgPlate caption="DASH CONNECTOR (2) · cab side · mating end" find="Big black bulkhead in the firewall. Bolt in the middle. Two grids: engine 4–7 on the left, lamps 3–2–1 on the right. Mounting holes top and bottom.">
      <path
        d="M 36 18
           C 36 10 48 8 70 8
           L 170 8
           C 192 8 204 10 204 18
           L 228 48
           L 228 252
           L 204 282
           C 204 290 192 292 170 292
           L 70 292
           C 48 292 36 290 36 282
           L 12 252
           L 12 48 Z"
        fill={paper}
        stroke={ink}
        strokeWidth="2.4"
      />
      <circle cx="120" cy="16" r="7" fill="none" stroke={ink} strokeWidth="1.8" />
      <circle cx="120" cy="284" r="7" fill="none" stroke={ink} strokeWidth="1.8" />
      <circle cx="148" cy="150" r="8" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="148" cy="150" r="3" fill={ink} />
      {leftCols.map((c, i) => (
        <text key={`lt${c}`} x={lx + i * (cell + gap) + cell / 2} y={oy - 8} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {rightCols.map((c, i) => (
        <text key={`rt${c}`} x={rx + i * (cell + gap) + cell / 2} y={oy - 8} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {rows.map((r, ri) => {
        const y = oy + ri * (cell + gap);
        return (
          <g key={r}>
            <text x={lx - 8} y={y + 13} textAnchor="end" fill={ink} style={lab}>
              {r}
            </text>
            {leftCols.map((c, ci) => (
              <Hole
                key={`L${r}${c}`}
                x={lx + ci * (cell + gap)}
                y={y}
                size={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
            <text x={rx - 8} y={y + 13} textAnchor="end" fill={ink} style={lab}>
              {r}
            </text>
            {rightCols.map((c, ci) => (
              <Hole
                key={`R${r}${c}`}
                x={rx + ci * (cell + gap)}
                y={y}
                size={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
            <text x={rx + 3 * (cell + gap) + 6} y={y + 13} fill={ink} style={lab}>
              {r}
            </text>
          </g>
        );
      })}
      {leftCols.map((c, i) => (
        <text key={`lb${c}`} x={lx + i * (cell + gap) + cell / 2} y={oy + 8 * (cell + gap) + 12} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {rightCols.map((c, i) => (
        <text key={`rb${c}`} x={rx + i * (cell + gap) + cell / 2} y={oy + 8 * (cell + gap) + 12} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
    </SvgPlate>
  );
}

/** ENGINE CONNECTOR (2A) — printed page 79. Latch hood on the left. Columns 7 6 5 4. */
export function Engine2AArt({ pins, active, family, onPick }: ArtProps) {
  const cols = ["7", "6", "5", "4"];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cell = 20;
  const gap = 3;
  const ox = 78;
  const oy = 40;
  return (
    <SvgPlate caption="ENGINE CONNECTOR (2A) · mating end" find="Same black family as Dash (2), engine harness side. Latch hood sticks out the left. Numbers read 7-6-5-4. Bolt in the middle of the grid.">
      <path
        d="M 36 16 L 214 16 L 222 28 L 222 272 L 36 272
           L 28 250 L 18 230 L 14 200 L 14 110 L 18 80 L 28 56 Z"
        fill={paper}
        stroke={ink}
        strokeWidth="2.4"
      />
      <path d="M 28 88 L 16 108 L 16 132 L 28 148" fill="none" stroke={ink} strokeWidth="1.6" />
      <path d="M 28 168 L 16 184 L 16 208 L 28 226" fill="none" stroke={ink} strokeWidth="1.6" />
      <circle cx="148" cy="148" r="7" fill="none" stroke={ink} strokeWidth="1.8" />
      {cols.map((c, i) => (
        <text key={c} x={ox + i * (cell + gap) + cell / 2} y={32} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {rows.map((r, ri) => {
        const y = oy + ri * (cell + gap);
        return (
          <g key={r}>
            <text x={ox - 8} y={y + 14} textAnchor="end" fill={ink} style={lab}>
              {r}
            </text>
            {cols.map((c, ci) => (
              <Hole
                key={`${r}${c}`}
                x={ox + ci * (cell + gap)}
                y={y}
                size={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
          </g>
        );
      })}
    </SvgPlate>
  );
}

/** FRONT END CONNECTOR (2B) — printed page 79. Tall 3×8, latch fingers on the left. */
export function Front2BArt({ pins, active, family, onPick }: ArtProps) {
  const cols = ["1", "2", "3"];
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const cell = 22;
  const gap = 3;
  const ox = 56;
  const oy = 40;
  return (
    <SvgPlate caption="FRONT END CONNECTOR (2B) · cab side · mating end" find="Tall skinny black plug, 3 wide by 8 tall. Latch clip on the left. Letters A–H down the right. Lamp / horn half.">
      <path
        d="M 38 14 L 168 14 L 174 22 L 174 278 L 38 278 L 32 270 L 32 22 Z"
        fill={paper}
        stroke={ink}
        strokeWidth="2.4"
      />
      <path d="M 32 14 L 20 14 L 14 28 L 14 70 L 20 82 L 32 82" fill="none" stroke={ink} strokeWidth="1.8" />
      <path d="M 32 110 L 20 110 L 14 124 L 14 176 L 20 190 L 32 190" fill="none" stroke={ink} strokeWidth="1.8" />
      <path d="M 32 218 L 20 218 L 14 232 L 14 268 L 20 278 L 32 278" fill="none" stroke={ink} strokeWidth="1.8" />
      {cols.map((c, i) => (
        <text key={c} x={ox + i * (cell + gap) + cell / 2} y={32} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {rows.map((r, ri) => {
        const y = oy + ri * (cell + gap);
        return (
          <g key={r}>
            {cols.map((c, ci) => (
              <Hole
                key={`${r}${c}`}
                x={ox + ci * (cell + gap)}
                y={y}
                size={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
            <text x={ox + 3 * (cell + gap) + 8} y={y + 15} fill={ink} style={lab}>
              {r}
            </text>
          </g>
        );
      })}
    </SvgPlate>
  );
}

/** Printed page 80 — CAB HARNESS face, letters next to holes. */
const CAB3: { c: string; x: number; y: number; lx: number; ly: number }[] = [
  { c: "P", x: 112, y: 58, lx: 112, ly: 46 },
  { c: "S", x: 140, y: 50, lx: 140, ly: 38 },
  { c: "T", x: 168, y: 58, lx: 168, ly: 46 },
  { c: "O", x: 86, y: 84, lx: 72, ly: 80 },
  { c: "N", x: 118, y: 78, lx: 118, ly: 68 },
  { c: "M", x: 162, y: 78, lx: 162, ly: 68 },
  { c: "L", x: 194, y: 84, lx: 210, ly: 80 },
  { c: "Q", x: 70, y: 118, lx: 54, ly: 122 },
  { c: "R", x: 108, y: 128, lx: 96, ly: 118 },
  { c: "K", x: 210, y: 114, lx: 226, ly: 118 },
  { c: "A", x: 70, y: 156, lx: 54, ly: 160 },
  { c: "B", x: 102, y: 150, lx: 90, ly: 140 },
  { c: "H", x: 180, y: 148, lx: 194, ly: 140 },
  { c: "J", x: 214, y: 150, lx: 230, ly: 154 },
  { c: "C", x: 88, y: 186, lx: 72, ly: 200 },
  { c: "V", x: 116, y: 176, lx: 116, ly: 164 },
  { c: "U", x: 140, y: 174, lx: 140, ly: 162 },
  { c: "G", x: 168, y: 178, lx: 168, ly: 166 },
  { c: "I", x: 198, y: 188, lx: 214, ly: 200 },
  { c: "D", x: 108, y: 214, lx: 108, ly: 232 },
  { c: "E", x: 140, y: 222, lx: 140, ly: 240 },
  { c: "F", x: 172, y: 214, lx: 172, ly: 232 },
];

/** Printed page 80 — ENGINE HARNESS mate. */
const ENG3: { c: string; x: number; y: number; lx: number; ly: number }[] = [
  { c: "M", x: 118, y: 56, lx: 118, ly: 44 },
  { c: "N", x: 140, y: 48, lx: 140, ly: 36 },
  { c: "O", x: 162, y: 56, lx: 162, ly: 44 },
  { c: "L", x: 90, y: 80, lx: 76, ly: 76 },
  { c: "T", x: 118, y: 76, lx: 118, ly: 66 },
  { c: "S", x: 162, y: 76, lx: 162, ly: 66 },
  { c: "P", x: 190, y: 80, lx: 206, ly: 76 },
  { c: "J", x: 74, y: 110, lx: 58, ly: 114 },
  { c: "K", x: 98, y: 104, lx: 98, ly: 94 },
  { c: "Q", x: 112, y: 130, lx: 100, ly: 122 },
  { c: "G", x: 176, y: 152, lx: 190, ly: 146 },
  { c: "R", x: 206, y: 104, lx: 222, ly: 108 },
  { c: "I", x: 68, y: 146, lx: 52, ly: 150 },
  { c: "H", x: 212, y: 146, lx: 228, ly: 150 },
  { c: "A", x: 200, y: 172, lx: 218, ly: 176 },
  { c: "B", x: 96, y: 180, lx: 80, ly: 192 },
  { c: "U", x: 122, y: 174, lx: 122, ly: 162 },
  { c: "V", x: 148, y: 174, lx: 148, ly: 162 },
  { c: "C", x: 178, y: 180, lx: 194, ly: 192 },
  { c: "F", x: 110, y: 210, lx: 110, ly: 228 },
  { c: "E", x: 140, y: 218, lx: 140, ly: 236 },
  { c: "D", x: 170, y: 210, lx: 170, ly: 228 },
];

function Engine3Pin({
  p,
  ox,
  pins,
  active,
  family,
  onPick,
}: {
  p: { c: string; x: number; y: number; lx: number; ly: number };
  ox: number;
  pins: Pin[];
  active?: string | null;
  family?: string;
  onPick: (c: string) => void;
}) {
  const pin = pinAt(pins, p.c);
  const vacant = empty(pin);
  const lit = !vacant && !!family && circuitFamily(pin!.circuit) === family;
  const on = active === p.c;
  return (
    <g
      role="button"
      tabIndex={0}
      className="cursor-pointer"
      onClick={() => onPick(p.c)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPick(p.c);
      }}
    >
      <circle
        cx={ox + p.x}
        cy={p.y}
        r={9}
        fill={on ? "#c4783a" : lit ? "#c5d0c4" : paper}
        stroke={on ? "#8a4e1c" : ink}
        strokeWidth={on ? 2.2 : 1.5}
      />
      <circle cx={ox + p.x} cy={p.y} r={3.2} fill={on ? "#1a120c" : ink} />
      <text
        x={ox + p.lx}
        y={p.ly}
        textAnchor="middle"
        fill={ink}
        style={{ fontSize: 12, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}
      >
        {p.c}
      </text>
    </g>
  );
}

/** ELECTRONIC ENGINE DASH CONNECTOR (3) — printed page 80. Both mating ends. */
export function Engine3Art({ pins, active, family, onPick }: ArtProps) {
  const cabPath =
    "M 140 22 L 158 22 L 158 12 L 122 12 L 122 22 C 86 28 58 62 58 108 C 58 168 86 228 140 238 C 194 228 222 168 222 108 C 222 62 194 28 140 22 Z";
  const oct = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI / 8) + (i * Math.PI) / 4;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  };
  return (
    <SvgPlate
      box="0 0 560 300"
      maxW={560}
      caption="ELECTRONIC ENGINE DASH CONNECTOR (3) · viewed from mating ends"
      find="Round 22-way on the firewall. GREEN cable seal (1652325C1). Two faces: CAB HARNESS (tabs top and bottom) and ENGINE HARNESS (octagon). Letters sit next to the holes — same as printed page 80."
    >
      <text x="140" y="14" textAnchor="middle" fill={ink} style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
        CAB HARNESS
      </text>
      <path d={cabPath} fill={paper} stroke={ink} strokeWidth="2.4" />
      <rect x="122" y="10" width="36" height="14" rx="2" fill={paper} stroke={ink} strokeWidth="1.8" />
      <rect x="122" y="236" width="36" height="14" rx="2" fill={paper} stroke={ink} strokeWidth="1.8" />
      <circle cx="140" cy="142" r="11" fill="none" stroke={ink} strokeWidth="1.6" />
      {CAB3.map((p) => (
        <Engine3Pin key={`c${p.c}`} p={p} ox={0} pins={pins} active={active} family={family} onPick={onPick} />
      ))}

      <text x="420" y="14" textAnchor="middle" fill={ink} style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
        ENGINE HARNESS
      </text>
      <path d={oct(420, 142, 108)} fill={paper} stroke={ink} strokeWidth="2.4" />
      <circle cx="420" cy="142" r="11" fill="none" stroke={ink} strokeWidth="1.6" />
      {ENG3.map((p) => (
        <Engine3Pin key={`e${p.c}`} p={p} ox={280} pins={pins} active={active} family={family} onPick={onPick} />
      ))}
    </SvgPlate>
  );
}

/** ISO 4-cavity cube — HORN RELAY (61), START (387), etc. Printed 82 / 88 / 89. */
export function Iso4Art({
  pins,
  active,
  family,
  onPick,
  labels,
}: ArtProps & { labels?: Record<string, string> }) {
  const map = [
    { id: "4", x: 70, y: 48, iso: "30" },
    { id: "3", x: 118, y: 48, iso: "87" },
    { id: "1", x: 70, y: 96, iso: "86" },
    { id: "2", x: 118, y: 96, iso: "85" },
  ];
  return (
    <SvgPlate caption="Mating end · 4-cavity cube" find="Small black cube. Four square holes. Numbers 4 and 3 on top, 1 and 2 on the bottom — same as the book.">
      <rect x="58" y="36" width="94" height="94" rx="4" fill={paper} stroke={ink} strokeWidth="2.2" />
      {map.map((s) => {
        const cav = labels?.[s.id] ?? s.id;
        const pin = pinAt(pins, cav) ?? pinAt(pins, s.iso) ?? pinAt(pins, s.id);
        const tag = pin?.cavity ?? cav;
        return (
          <g key={s.id}>
            <Hole
              x={s.x}
              y={s.y}
              size={36}
              cavity={tag}
              pin={pin}
              active={active === tag || active === s.id || active === s.iso}
              family={family}
              onPick={onPick}
            />
            <text x={s.x + 18} y={s.y + 14} textAnchor="middle" fill={ink} style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}>
              {s.id}
            </text>
          </g>
        );
      })}
    </SvgPlate>
  );
}

/** INSTRUMENT CLUSTER 17-way — YELLOW / GREEN / NATURAL. Printed page 81. */
export function Cluster17Art({
  pins,
  active,
  family,
  onPick,
  color,
}: ArtProps & { color: "YELLOW" | "GREEN" | "NATURAL" }) {
  const shell = color === "YELLOW" ? "#e2c14a" : color === "GREEN" ? "#6a9a62" : "#d8d2c6";
  const top = [17, 16, 15, 14, 13, 12, 11, 10];
  const bot = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  return (
    <SvgPlate caption={`INSTRUMENT CLUSTER · ${color} (mating end)`} find={`17-way. Housing is ${color}. Latch in the middle of the long edge. Left cluster = YELLOW, center = GREEN, right = NATURAL (off-white).`}>
      <rect x="16" y="36" width="268" height="78" rx="6" fill={shell} stroke={ink} strokeWidth="2.2" />
      <rect x="130" y="24" width="40" height="14" rx="3" fill={shell} stroke={ink} strokeWidth="1.5" />
      {top.map((n, i) => (
        <Hole
          key={n}
          x={36 + i * 28}
          y={46}
          size={22}
          cavity={String(n)}
          pin={pinAt(pins, String(n))}
          active={active === String(n)}
          family={family}
          onPick={onPick}
        />
      ))}
      {bot.map((n, i) => (
        <Hole
          key={n}
          x={22 + i * 28}
          y={78}
          size={22}
          cavity={String(n)}
          pin={pinAt(pins, String(n))}
          active={active === String(n)}
          family={family}
          onPick={onPick}
        />
      ))}
    </SvgPlate>
  );
}

/** KEY SWITCH (63) — printed page 83. Irregular 5-cavity. */
export function Key63Art({ pins, active, family, onPick }: ArtProps) {
  const spots = [
    { c: "BAT", x: 110, y: 36, lab: "15" },
    { c: "ACC", x: 48, y: 88, lab: "12" },
    { c: "IGN", x: 110, y: 88, lab: "13" },
    { c: "ST", x: 172, y: 88, lab: "17" },
    { c: "IGN2", x: 110, y: 140, lab: "13E" },
  ];
  return (
    <SvgPlate caption="KEY SWITCH (63) · mating end" find="On the steering column. Five blades: BAT (15), ACC (12), IGN (13), ST (17). Not a plastic grid plug.">
      <path d="M 70 24 L 170 24 L 200 70 L 200 170 L 40 170 L 40 70 Z" fill={paper} stroke={ink} strokeWidth="2.2" />
      {spots.map((s) => (
        <g key={s.c}>
          <Hole
            x={s.x}
            y={s.y}
            size={36}
            cavity={s.c}
            pin={pinAt(pins, s.c)}
            active={active === s.c}
            family={family}
            onPick={onPick}
          />
          <text x={s.x + 18} y={s.y + 48} textAnchor="middle" fill={ink} style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}>
            {s.c}
          </text>
        </g>
      ))}
    </SvgPlate>
  );
}

/** FUEL FILTER CAB HARNESS (71) / (399) — printed page 83. 2×3. */
export function Filter6Art({ pins, active, family, onPick }: ArtProps) {
  const grid = [
    ["D", "C"],
    ["B", "A"],
    ["F", "E"],
  ];
  return (
    <SvgPlate caption="FUEL FILTER CAB HARNESS (71) · mating end" find="Small 6-cavity on the filter head / cab harness. Two columns, three rows. D C on top, then B A, then F E.">
      <rect x="70" y="28" width="100" height="148" rx="4" fill={paper} stroke={ink} strokeWidth="2.2" />
      {grid.map((row, ri) =>
        row.map((c, ci) => (
          <g key={c}>
            <Hole
              x={86 + ci * 40}
              y={44 + ri * 40}
              size={32}
              cavity={c}
              pin={pinAt(pins, c)}
              active={active === c}
              family={family}
              onPick={onPick}
            />
            <text x={102 + ci * 40} y={40 + ri * 40} textAnchor="middle" fill={ink} style={{ fontSize: 9, fontFamily: "ui-monospace, monospace" }}>
              {c}
            </text>
          </g>
        )),
      )}
    </SvgPlate>
  );
}

/** AUDIBLE ALARM (20) — printed page 80. */
export function Alarm20Art({ pins, active, family, onPick }: ArtProps) {
  const spots = [
    { c: "4", x: 70, y: 40 },
    { c: "3", x: 118, y: 40 },
    { c: "1", x: 70, y: 88 },
    { c: "2", x: 118, y: 88 },
  ];
  return (
    <SvgPlate caption="AUDIBLE ALARM (20) · mating end" find="Cube next to the buzzer. Four square holes numbered 4-3 / 1-2. Same shape as a relay socket.">
      <rect x="58" y="28" width="94" height="94" rx="4" fill={paper} stroke={ink} strokeWidth="2.2" />
      {spots.map((s) => (
        <Hole
          key={s.c}
          x={s.x}
          y={s.y}
          size={36}
          cavity={s.c}
          pin={pinAt(pins, s.c)}
          active={active === s.c}
          family={family}
          onPick={onPick}
        />
      ))}
    </SvgPlate>
  );
}

/** CEC CONTROL MODULE (379) — 60-pin, 3 rows of 20. */
export function Cec60Art({ pins, active, family, onPick }: ArtProps) {
  const rows = [
    Array.from({ length: 20 }, (_, i) => String(i + 1)),
    Array.from({ length: 20 }, (_, i) => String(i + 21)),
    Array.from({ length: 20 }, (_, i) => String(i + 41)),
  ];
  return (
    <SvgPlate caption="CEC CONTROL MODULE (379) · 60-way mating end" find="Big black 60-pin on the engine computer. Three rows of 20. Hole in the middle. This is the brain plug." wide>
      <rect x="8" y="28" width="420" height="96" rx="6" fill={paper} stroke={ink} strokeWidth="2.2" />
      <circle cx="218" cy="76" r="8" fill="#f4f0e6" stroke={ink} strokeWidth="1.4" />
      {rows.map((row, ri) =>
        row.map((c, ci) => (
          <Hole
            key={c}
            x={14 + ci * 20.5}
            y={36 + ri * 26}
            size={18}
            cavity={c}
            pin={pinAt(pins, c)}
            active={active === c}
            family={family}
            onPick={onPick}
          />
        )),
      )}
    </SvgPlate>
  );
}

function SvgPlate({
  caption,
  find,
  children,
  wide,
  box,
  maxW,
}: {
  caption: string;
  find: string;
  children: ReactNode;
  wide?: boolean;
  box?: string;
  maxW?: number;
}) {
  const vb = box ?? (wide ? "0 0 440 240" : "0 0 280 300");
  return (
    <div className="space-y-2">
      <div className={cn("overflow-x-auto rounded-sm border border-[#c9c2b4] bg-[#f4f0e6] p-3 shadow-[inset_0_0_0_1px_#fff]")}>
        <svg
          viewBox={vb}
          className="mx-auto h-auto w-full"
          style={{ maxWidth: maxW ?? (wide ? 440 : 320) }}
          role="img"
        >
          {children}
        </svg>
      </div>
      <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">{caption}</p>
      <p className="text-sm leading-relaxed text-muted">
        <span className="font-mono text-[10px] tracking-widest text-subtle uppercase">Find it · </span>
        {find}
      </p>
    </div>
  );
}

export function PlugArt({
  tag,
  pins,
  active,
  family,
  onPick,
}: {
  tag: string;
  pins: Pin[];
  active?: string | null;
  family?: string;
  onPick: (cavity: string) => void;
}) {
  const p = { pins, active, family, onPick };
  if (tag === "2") return <Dash2Art {...p} />;
  if (tag === "2A") return <Engine2AArt {...p} />;
  if (tag === "2B" || tag === "2B-M") return <Front2BArt {...p} />;
  if (tag === "3") return <Engine3Art {...p} />;
  if (tag === "20") return <Alarm20Art {...p} />;
  if (tag === "26") return <Cluster17Art {...p} color="YELLOW" />;
  if (tag === "27") return <Cluster17Art {...p} color="GREEN" />;
  if (tag === "28") return <Cluster17Art {...p} color="NATURAL" />;
  if (tag === "63") return <Key63Art {...p} />;
  if (tag === "71" || tag === "399") return <Filter6Art {...p} />;
  if (tag === "379") return <Cec60Art {...p} />;
  if (["61", "387", "396", "431", "300", "615"].includes(tag)) return <Iso4Art {...p} />;
  return (
    <SvgPlate caption={`CONNECTOR ${tag} · mating end`} find="Cavities as listed in the book. Tap a hole.">
      <rect x="20" y="20" width="240" height="220" rx="6" fill={paper} stroke={ink} strokeWidth="2" />
      {pins.slice(0, 24).map((pin, i) => (
        <Hole
          key={pin.cavity}
          x={36 + (i % 6) * 36}
          y={40 + Math.floor(i / 6) * 36}
          size={28}
          cavity={pin.cavity}
          pin={pin}
          active={active === pin.cavity}
          family={family}
          onPick={onPick}
        />
      ))}
    </SvgPlate>
  );
}
