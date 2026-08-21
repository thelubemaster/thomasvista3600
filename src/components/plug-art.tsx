import type { ReactNode } from "react";
import type { Pin } from "@/data/connectors";
import { circuitFamily } from "@/data/circuits";
import {
  CLUSTER_BOT_L,
  CLUSTER_BOT_R,
  CLUSTER_TOP_L,
  CLUSTER_TOP_R,
  DASH2_LEFT_COLS,
  DASH2_RIGHT_COLS,
  DASH2_ROWS,
  ENGINE2A_COLS,
  FILTER6_ROWS,
  FRONT2B_COLS,
} from "@/data/plug-face";

export {
  CLUSTER_BOT_L,
  CLUSTER_BOT_R,
  CLUSTER_TOP_L,
  CLUSTER_TOP_R,
  DASH2_LEFT_COLS,
  DASH2_RIGHT_COLS,
  DASH2_ROWS,
  ENGINE2A_COLS,
  FILTER6_ROWS,
  FRONT2B_COLS,
  ISO_MICRO,
} from "@/data/plug-face";

type ArtProps = {
  pins: Pin[];
  active?: string | null;
  family?: string;
  onPick: (cavity: string) => void;
};

function pinAt(pins: Pin[], cav: string) {
  return pins.find((p) => p.cavity === cav);
}
function pinAny(pins: Pin[], ids: string[]) {
  for (const id of ids) {
    const p = pinAt(pins, id);
    if (p) return p;
  }
  return undefined;
}
function empty(p?: Pin) {
  return !p || p.circuit === "---" || p.circuit === "—";
}

const ink = "#1a1814";
const paper = "#f4f0e6";
const lab = { fontSize: 11, fontFamily: "ui-monospace, monospace", fontWeight: 700 as const };

function Terminal({
  x,
  y,
  w = 16,
  h = 16,
  kind = "sq",
  cavity,
  pin,
  active,
  family,
  onPick,
  pick,
  label,
  lx,
  ly,
  inHole,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: "sq" | "rnd" | "slot";
  cavity: string;
  pin?: Pin;
  active?: boolean;
  family?: string;
  onPick: (c: string) => void;
  pick?: string;
  label?: string;
  lx?: number;
  ly?: number;
  inHole?: boolean;
}) {
  const vacant = empty(pin);
  const lit = !vacant && !!family && circuitFamily(pin!.circuit) === family;
  const on = !!active;
  const fill = on || lit ? "#c4783a" : paper;
  const stroke = on ? "#8a4e1c" : ink;
  const inner = on ? "#3a2414" : vacant ? paper : ink;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const hit = 4;
  return (
    <g
      role="button"
      tabIndex={0}
      className="cursor-pointer"
      onClick={() => onPick(pick ?? pin?.cavity ?? cavity)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onPick(pick ?? pin?.cavity ?? cavity);
      }}
    >
      <rect x={x - hit} y={y - hit} width={w + hit * 2} height={h + hit * 2} fill="transparent" />
      {kind === "rnd" ? (
        <>
          <circle cx={cx} cy={cy} r={w / 2} fill={fill} stroke={stroke} strokeWidth={on ? 2.2 : 1.5} />
          <circle cx={cx} cy={cy} r={Math.max(2.4, w / 2 - 4.5)} fill={inner} />
        </>
      ) : kind === "slot" ? (
        <>
          <rect x={x} y={y} width={w} height={h} rx={1.2} fill={fill} stroke={stroke} strokeWidth={on ? 2 : 1.4} />
          <rect x={x + 2.2} y={y + 3} width={w - 4.4} height={h - 6} rx={0.6} fill={inner} />
        </>
      ) : (
        <>
          <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={on ? 2 : 1.35} />
          <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} fill={inner} />
        </>
      )}
      {label && inHole ? (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill={vacant && !on && !lit ? ink : paper}
          style={{ fontSize: w > 16 ? 11 : 9, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}
        >
          {label}
        </text>
      ) : null}
      {label && !inHole && lx != null && ly != null ? (
        <text x={lx} y={ly} textAnchor="middle" fill={ink} style={lab}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

function SvgPlate({
  caption,
  find,
  children,
  box,
  maxW,
}: {
  caption: string;
  find: string;
  children: ReactNode;
  box?: string;
  maxW?: number;
}) {
  const vb = box ?? "0 0 280 320";
  return (
    <div>
      <div className="overflow-x-auto rounded-sm border border-[#c9c2b4] bg-[#f4f0e6] p-1.5">
        <svg viewBox={vb} className="mx-auto h-auto w-full" style={{ maxWidth: maxW ?? 420 }} role="img">
          {children}
        </svg>
      </div>
      <p className="mt-1 font-mono text-[10px] tracking-widest text-subtle uppercase">{caption}</p>
      <p className="text-[11px] leading-snug text-muted">{find}</p>
    </div>
  );
}

/** DASH CONNECTOR (2) — printed page 78. Shield housing, bolt top/bottom/center. */
export function Dash2Art({ pins, active, family, onPick }: ArtProps) {
  const cell = 17;
  const gap = 2.5;
  const lx = 48;
  const rx = 176;
  const oy = 58;
  return (
    <SvgPlate
      caption="DASH CONNECTOR (2) · cab side · mating end · p.78"
      find="Firewall bulkhead. Bolt top, center, and bottom. Engine half 4–7 on the left, lamp half 3–2–1 on the right. Same shield as the book."
      box="0 0 280 330"
    >
      <path
        d="M 140 10
           C 158 10 172 18 184 36
           L 228 78 L 232 110 L 232 210 L 228 248
           L 184 294
           C 172 312 158 320 140 320
           C 122 320 108 312 96 294
           L 52 248 L 48 210 L 48 110 L 52 78
           L 96 36
           C 108 18 122 10 140 10 Z"
        fill={paper}
        stroke={ink}
        strokeWidth="2.5"
      />
      <circle cx="140" cy="28" r="7" fill="none" stroke={ink} strokeWidth="1.8" />
      <circle cx="140" cy="302" r="7" fill="none" stroke={ink} strokeWidth="1.8" />
      <circle cx="152" cy="158" r="8" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="152" cy="158" r="3.2" fill={ink} />
      {DASH2_LEFT_COLS.map((c, i) => (
        <text key={`lt${c}`} x={lx + i * (cell + gap) + cell / 2} y={oy - 8} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {DASH2_RIGHT_COLS.map((c, i) => (
        <text key={`rt${c}`} x={rx + i * (cell + gap) + cell / 2} y={oy - 8} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {DASH2_ROWS.map((r, ri) => {
        const y = oy + ri * (cell + gap);
        return (
          <g key={r}>
            <text x={lx - 7} y={y + 13} textAnchor="end" fill={ink} style={lab}>
              {r}
            </text>
            {DASH2_LEFT_COLS.map((c, ci) => (
              <Terminal
                key={`L${r}${c}`}
                x={lx + ci * (cell + gap)}
                y={y}
                w={cell}
                h={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
            {DASH2_RIGHT_COLS.map((c, ci) => (
              <Terminal
                key={`R${r}${c}`}
                x={rx + ci * (cell + gap)}
                y={y}
                w={cell}
                h={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
            <text x={rx + 3 * (cell + gap) + 8} y={y + 13} fill={ink} style={lab}>
              {r}
            </text>
          </g>
        );
      })}
      {DASH2_LEFT_COLS.map((c, i) => (
        <text key={`lb${c}`} x={lx + i * (cell + gap) + cell / 2} y={oy + 8 * (cell + gap) + 14} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {DASH2_RIGHT_COLS.map((c, i) => (
        <text key={`rb${c}`} x={rx + i * (cell + gap) + cell / 2} y={oy + 8 * (cell + gap) + 14} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
    </SvgPlate>
  );
}

/** ENGINE CONNECTOR (2A) — printed page 79. Dual latch hoods on the left. */
export function Engine2AArt({ pins, active, family, onPick }: ArtProps) {
  const cell = 18;
  const gap = 2.5;
  const ox = 92;
  const oy = 46;
  return (
    <SvgPlate caption="ENGINE CONNECTOR (2A) · mating end · p.79" find="Engine-harness mate to Dash (2). Two latch hoods on the left. Numbers read 7-6-5-4. Bolt in the body.">
      <path d="M 54 22 L 230 22 L 238 36 L 238 270 L 54 270 L 54 22 Z" fill={paper} stroke={ink} strokeWidth="2.4" />
      <path d="M 54 58 L 22 58 L 14 78 L 14 118 L 22 136 L 54 136" fill={paper} stroke={ink} strokeWidth="2" />
      <path d="M 54 168 L 22 168 L 14 188 L 14 228 L 22 246 L 54 246" fill={paper} stroke={ink} strokeWidth="2" />
      <rect x="238" y="96" width="12" height="36" fill={paper} stroke={ink} strokeWidth="1.6" />
      <rect x="238" y="176" width="12" height="36" fill={paper} stroke={ink} strokeWidth="1.6" />
      <circle cx="74" cy="156" r="8" fill="none" stroke={ink} strokeWidth="1.8" />
      {ENGINE2A_COLS.map((c, i) => (
        <text key={c} x={ox + i * (cell + gap) + cell / 2} y={38} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {DASH2_ROWS.map((r, ri) => {
        const y = oy + ri * (cell + gap);
        return (
          <g key={r}>
            <text x={ox - 8} y={y + 13} textAnchor="end" fill={ink} style={lab}>
              {r}
            </text>
            {ENGINE2A_COLS.map((c, ci) => (
              <Terminal
                key={`${r}${c}`}
                x={ox + ci * (cell + gap)}
                y={y}
                w={cell}
                h={cell}
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

/** FRONT END CONNECTOR (2B) — printed page 79. Tall 3×8, latch fingers left. */
export function Front2BArt({ pins, active, family, onPick }: ArtProps) {
  const cell = 20;
  const gap = 3;
  const ox = 62;
  const oy = 44;
  return (
    <SvgPlate caption="FRONT END CONNECTOR (2B) · mating end · p.79" find="Tall 3-wide by 8-tall. Latch fingers on the left. Polarizing tabs top and bottom. Letters A–H down the right.">
      <rect x="28" y="8" width="18" height="10" fill={paper} stroke={ink} strokeWidth="1.6" />
      <rect x="28" y="282" width="18" height="10" fill={paper} stroke={ink} strokeWidth="1.6" />
      <path d="M 46 18 L 168 18 L 174 26 L 174 274 L 46 274 L 40 266 L 40 26 Z" fill={paper} stroke={ink} strokeWidth="2.4" />
      <rect x="18" y="36" width="22" height="52" fill={paper} stroke={ink} strokeWidth="1.8" />
      <rect x="18" y="124" width="22" height="52" fill={paper} stroke={ink} strokeWidth="1.8" />
      <rect x="18" y="212" width="22" height="52" fill={paper} stroke={ink} strokeWidth="1.8" />
      {FRONT2B_COLS.map((c, i) => (
        <text key={c} x={ox + i * (cell + gap) + cell / 2} y={36} textAnchor="middle" fill={ink} style={lab}>
          {c}
        </text>
      ))}
      {DASH2_ROWS.map((r, ri) => {
        const y = oy + ri * (cell + gap);
        return (
          <g key={r}>
            {FRONT2B_COLS.map((c, ci) => (
              <Terminal
                key={`${r}${c}`}
                x={ox + ci * (cell + gap)}
                y={y}
                w={cell}
                h={cell}
                cavity={`${r}${c}`}
                pin={pinAt(pins, `${r}${c}`)}
                active={active === `${r}${c}`}
                family={family}
                onPick={onPick}
              />
            ))}
            <text x={ox + 3 * (cell + gap) + 10} y={y + 15} fill={ink} style={lab}>
              {r}
            </text>
          </g>
        );
      })}
    </SvgPlate>
  );
}

/** Printed page 80 — letters live IN the holes. */
const CAB3: { c: string; x: number; y: number }[] = [
  { c: "O", x: 112, y: 62 },
  { c: "N", x: 140, y: 50 },
  { c: "M", x: 168, y: 62 },
  { c: "P", x: 86, y: 86 },
  { c: "S", x: 118, y: 80 },
  { c: "T", x: 162, y: 80 },
  { c: "L", x: 194, y: 86 },
  { c: "R", x: 68, y: 118 },
  { c: "Q", x: 100, y: 114 },
  { c: "K", x: 180, y: 114 },
  { c: "J", x: 212, y: 118 },
  { c: "A", x: 68, y: 154 },
  { c: "B", x: 102, y: 148 },
  { c: "H", x: 178, y: 148 },
  { c: "I", x: 212, y: 154 },
  { c: "C", x: 86, y: 188 },
  { c: "V", x: 118, y: 178 },
  { c: "U", x: 140, y: 176 },
  { c: "G", x: 162, y: 178 },
  { c: "D", x: 108, y: 214 },
  { c: "E", x: 140, y: 224 },
  { c: "F", x: 172, y: 214 },
];

const ENG3: { c: string; x: number; y: number }[] = [
  { c: "M", x: 118, y: 58 },
  { c: "N", x: 140, y: 48 },
  { c: "O", x: 162, y: 58 },
  { c: "L", x: 90, y: 82 },
  { c: "T", x: 118, y: 78 },
  { c: "S", x: 162, y: 78 },
  { c: "P", x: 190, y: 82 },
  { c: "J", x: 72, y: 112 },
  { c: "K", x: 100, y: 106 },
  { c: "Q", x: 180, y: 106 },
  { c: "R", x: 208, y: 112 },
  { c: "I", x: 68, y: 148 },
  { c: "H", x: 100, y: 148 },
  { c: "B", x: 180, y: 148 },
  { c: "A", x: 212, y: 148 },
  { c: "G", x: 90, y: 184 },
  { c: "U", x: 118, y: 178 },
  { c: "V", x: 162, y: 178 },
  { c: "C", x: 190, y: 184 },
  { c: "F", x: 108, y: 214 },
  { c: "E", x: 140, y: 224 },
  { c: "D", x: 172, y: 214 },
];

function RoundPin({
  p,
  ox,
  pins,
  active,
  family,
  onPick,
}: {
  p: { c: string; x: number; y: number };
  ox: number;
  pins: Pin[];
  active?: string | null;
  family?: string;
  onPick: (c: string) => void;
}) {
  return (
    <Terminal
      x={ox + p.x - 11}
      y={p.y - 11}
      w={22}
      h={22}
      kind="rnd"
      cavity={p.c}
      pin={pinAt(pins, p.c)}
      active={active === p.c}
      family={family}
      onPick={onPick}
      label={p.c}
      inHole
    />
  );
}

/** ELECTRONIC ENGINE DASH CONNECTOR (3) — printed page 80. */
export function Engine3Art({ pins, active, family, onPick }: ArtProps) {
  const cabPath =
    "M 140 22 L 156 22 L 156 10 L 124 10 L 124 22 C 88 30 58 68 58 118 C 58 176 88 230 140 242 C 192 230 222 176 222 118 C 222 68 192 30 140 22 Z";
  const oct = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return `M ${pts.join(" L ")} Z`;
  };
  return (
    <SvgPlate
      box="0 0 560 300"
      maxW={560}
      caption="ELECTRONIC ENGINE DASH CONNECTOR (3) · mating ends · p.80"
      find="Round 22-way. Green cable seal. Letters sit in the holes — cab harness on the left, engine octagon on the right."
    >
      <text x="140" y="12" textAnchor="middle" fill={ink} style={{ ...lab, fontSize: 11 }}>
        CAB HARNESS
      </text>
      <path d={cabPath} fill={paper} stroke={ink} strokeWidth="2.4" />
      <rect x="124" y="8" width="32" height="14" fill={paper} stroke={ink} strokeWidth="1.6" />
      <rect x="124" y="240" width="32" height="14" fill={paper} stroke={ink} strokeWidth="1.6" />
      <circle cx="140" cy="148" r="10" fill="none" stroke={ink} strokeWidth="1.6" />
      {CAB3.map((p) => (
        <RoundPin key={`c${p.c}`} p={p} ox={0} pins={pins} active={active} family={family} onPick={onPick} />
      ))}
      <text x="420" y="12" textAnchor="middle" fill={ink} style={{ ...lab, fontSize: 11 }}>
        ENGINE HARNESS
      </text>
      <path d={oct(420, 148, 108)} fill={paper} stroke={ink} strokeWidth="2.4" />
      <polygon
        points="420,138 428,148 420,158 412,148"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
      />
      {ENG3.map((p) => (
        <RoundPin key={`e${p.c}`} p={p} ox={280} pins={pins} active={active} family={family} onPick={onPick} />
      ))}
    </SvgPlate>
  );
}

/** Micro ISO 5-cavity plus — HORN (61), ALARM (20), START (387). Printed 80 / 82. */
export function Iso4Art({
  pins,
  active,
  family,
  onPick,
  labels,
}: ArtProps & { labels?: Record<string, string> }) {
  const spots: { id: string; iso: string; x: number; y: number }[] = [
    { id: "4", iso: "30", x: 102, y: 36 },
    { id: "5", iso: "87a", x: 58, y: 80 },
    { id: "3", iso: "87", x: 102, y: 80 },
    { id: "2", iso: "85", x: 146, y: 80 },
    { id: "1", iso: "86", x: 102, y: 124 },
  ];
  return (
    <SvgPlate caption="Mating end · 5-cavity micro · p.82" find="Same face as the book: 4 on top, 5-3-2 across, 1 on the bottom. Clip tabs on the right.">
      <rect x="48" y="24" width="140" height="148" rx="3" fill={paper} stroke={ink} strokeWidth="2.3" />
      <rect x="188" y="48" width="10" height="22" fill={paper} stroke={ink} strokeWidth="1.5" />
      <rect x="188" y="92" width="10" height="22" fill={paper} stroke={ink} strokeWidth="1.5" />
      <rect x="188" y="128" width="10" height="18" fill={paper} stroke={ink} strokeWidth="1.5" />
      <rect x="88" y="172" width="60" height="10" fill={paper} stroke={ink} strokeWidth="1.5" />
      {spots.map((s) => {
        const cav = labels?.[s.id] ?? s.id;
        const pin = pinAny(pins, [cav, s.iso, s.id]);
        const tag = pin?.cavity ?? cav;
        const on = active === tag || active === s.id || active === s.iso;
        return (
          <Terminal
            key={s.id}
            x={s.x}
            y={s.y}
            w={36}
            h={36}
            cavity={tag}
            pin={pin}
            active={on}
            family={family}
            onPick={onPick}
            pick={tag}
            label={s.id}
            inHole
          />
        );
      })}
    </SvgPlate>
  );
}

export function Alarm20Art(props: ArtProps) {
  return <Iso4Art {...props} />;
}

/** INSTRUMENT CLUSTER 17-way — printed page 81. Center latch splits the rows. */
export function Cluster17Art({
  pins,
  active,
  family,
  onPick,
  color,
}: ArtProps & { color: "YELLOW" | "GREEN" | "NATURAL" }) {
  const shell = color === "YELLOW" ? "#e2c14a" : color === "GREEN" ? "#6a9a62" : "#d8d2c6";
  const slot = (n: string, x: number, y: number) => (
    <Terminal
      key={n}
      x={x}
      y={y}
      w={14}
      h={28}
      kind="slot"
      cavity={n}
      pin={pinAt(pins, n)}
      active={active === n}
      family={family}
      onPick={onPick}
    />
  );
  return (
    <SvgPlate
      caption={`INSTRUMENT CLUSTER · ${color} · p.81`}
      find={`17-way. Housing is ${color}. Latch in the middle of the long edge — same bar as the book.`}
      box="0 0 320 140"
      maxW={480}
    >
      <rect x="16" y="36" width="288" height="78" rx="4" fill={shell} stroke={ink} strokeWidth="2.2" />
      <rect x="142" y="18" width="36" height="28" rx="2" fill={shell} stroke={ink} strokeWidth="1.7" />
      <rect x="148" y="44" width="24" height="62" fill={shell} stroke={ink} strokeWidth="1.4" />
      <text x="12" y="58" textAnchor="end" fill={ink} style={{ ...lab, fontSize: 10 }}>
        17
      </text>
      <text x="12" y="98" textAnchor="end" fill={ink} style={{ ...lab, fontSize: 10 }}>
        9
      </text>
      <text x="310" y="58" fill={ink} style={{ ...lab, fontSize: 10 }}>
        10
      </text>
      <text x="310" y="98" fill={ink} style={{ ...lab, fontSize: 10 }}>
        1
      </text>
      {CLUSTER_TOP_L.map((n, i) => slot(n, 28 + i * 26, 48))}
      {CLUSTER_TOP_R.map((n, i) => slot(n, 180 + i * 26, 48))}
      {CLUSTER_BOT_L.map((n, i) => slot(n, 28 + i * 26, 78))}
      {CLUSTER_BOT_R.map((n, i) => slot(n, 174 + i * 22, 78))}
    </SvgPlate>
  );
}

/** KEY SWITCH (63) — printed page 83. Star of A–F. */
export function Key63Art({ pins, active, family, onPick }: ArtProps) {
  const spots: { letter: string; aliases: string[]; x: number; y: number }[] = [
    { letter: "E", aliases: ["E", "BAT", "15"], x: 122, y: 28 },
    { letter: "D", aliases: ["D", "1"], x: 58, y: 78 },
    { letter: "A", aliases: ["A", "IGN", "13"], x: 186, y: 78 },
    { letter: "F", aliases: ["F"], x: 122, y: 92 },
    { letter: "C", aliases: ["C", "ACC", "12"], x: 70, y: 148 },
    { letter: "B", aliases: ["B", "ST", "17"], x: 174, y: 148 },
  ];
  return (
    <SvgPlate caption="KEY SWITCH (63) · mating end · p.83" find="Column switch. Six cavities in a star: E on top, A and D on the shoulders, F in the middle, C and B on the bottom.">
      <path d="M 110 18 L 170 18 L 214 78 L 200 190 L 80 190 L 66 78 Z" fill={paper} stroke={ink} strokeWidth="2.3" />
      {spots.map((s) => {
        const pin = pinAny(pins, s.aliases);
        const tag = pin?.cavity ?? s.letter;
        const on = s.aliases.includes(active ?? "") || active === tag;
        return (
          <g key={s.letter}>
            <Terminal
              x={s.x}
              y={s.y}
              w={34}
              h={28}
              cavity={tag}
              pin={pin}
              active={on}
              family={family}
              onPick={onPick}
              pick={tag}
              label={s.letter}
              inHole
            />
          </g>
        );
      })}
    </SvgPlate>
  );
}

/** FUEL FILTER CAB HARNESS (71) / (399) — printed page 83. D C / E B / F A. */
export function Filter6Art({ pins, active, family, onPick }: ArtProps) {
  return (
    <SvgPlate
      caption="FUEL FILTER (71 / 399) · 6-way mating end · p.83"
      find="Two columns, three rows. D C on top, E B in the middle, F A on the bottom — same face as the book."
      box="0 0 200 250"
      maxW={360}
    >
      <rect x="44" y="22" width="112" height="196" fill={paper} stroke={ink} strokeWidth="2.4" />
      <path d="M 84 218 L 84 236 L 116 236 L 116 218" fill="none" stroke={ink} strokeWidth="1.8" />
      {FILTER6_ROWS.map((row, ri) =>
        row.map((c, ci) => (
          <g key={c}>
            <Terminal
              x={56 + ci * 50}
              y={36 + ri * 56}
              w={42}
              h={42}
              cavity={c}
              pin={pinAt(pins, c)}
              active={active === c}
              family={family}
              onPick={onPick}
              label={c}
              inHole
            />
          </g>
        )),
      )}
    </SvgPlate>
  );
}

/** IN-LINE (401) — three cavities of the same family. */
export function Filter3Art({ pins, active, family, onPick }: ArtProps) {
  const cavs = ["A", "B", "C"];
  return (
    <SvgPlate caption="IN-LINE (401) · 3-way · p.90" find="Jumper on the engine side of Dash (2). A heater, B probe, C vacuum." box="0 0 240 160" maxW={360}>
      <rect x="28" y="36" width="184" height="88" fill={paper} stroke={ink} strokeWidth="2.3" />
      {cavs.map((c, i) => (
        <Terminal
          key={c}
          x={44 + i * 56}
          y={54}
          w={44}
          h={44}
          cavity={c}
          pin={pinAt(pins, c)}
          active={active === c}
          family={family}
          onPick={onPick}
          label={c}
          inHole
        />
      ))}
    </SvgPlate>
  );
}

/** CEC CONTROL MODULE (379) — 60-pin. */
export function Cec60Art({ pins, active, family, onPick }: ArtProps) {
  const rows = [
    Array.from({ length: 20 }, (_, i) => String(i + 1)),
    Array.from({ length: 20 }, (_, i) => String(i + 21)),
    Array.from({ length: 20 }, (_, i) => String(i + 41)),
  ];
  return (
    <SvgPlate caption="CEC CONTROL MODULE (379) · 60-way" find="Big 60-pin on the engine computer. Three rows of 20. Keying hole in the middle." box="0 0 440 150" maxW={520}>
      <rect x="8" y="20" width="424" height="110" rx="5" fill={paper} stroke={ink} strokeWidth="2.2" />
      <circle cx="220" cy="75" r="9" fill={paper} stroke={ink} strokeWidth="1.5" />
      {rows.map((row, ri) =>
        row.map((c, ci) => (
          <Terminal
            key={c}
            x={16 + ci * 20.4}
            y={30 + ri * 28}
            w={16}
            h={16}
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

/** 2-pin Weather Pack with wings — hyd switch / stop switch p.82. */
export function Weather2Art({ pins, active, family, onPick }: ArtProps) {
  const cavs = pins.length ? pins.map((p) => p.cavity).slice(0, 2) : ["A", "B"];
  return (
    <SvgPlate caption="2-way · mating end · p.82" find="Sealed 2-pin with latch wings. Same family as hyd switch (50) and stop switch (51).">
      <rect x="18" y="88" width="28" height="12" fill={paper} stroke={ink} strokeWidth="1.5" />
      <rect x="234" y="88" width="28" height="12" fill={paper} stroke={ink} strokeWidth="1.5" />
      <rect x="70" y="48" width="140" height="92" fill={paper} stroke={ink} strokeWidth="2.2" />
      <rect x="118" y="36" width="44" height="14" fill={paper} stroke={ink} strokeWidth="1.5" />
      {cavs.map((c, i) => (
        <Terminal
          key={c}
          x={88 + i * 54}
          y={68}
          w={42}
          h={42}
          cavity={c}
          pin={pinAt(pins, c)}
          active={active === c}
          family={family}
          onPick={onPick}
          label={c}
          inHole
        />
      ))}
    </SvgPlate>
  );
}

/** 3-pin — diode pack / sensors. */
export function Weather3Art({ pins, active, family, onPick }: ArtProps) {
  const cavs = pins.length ? pins.map((p) => p.cavity).slice(0, 3) : ["A", "B", "C"];
  const isDiode = cavs.includes("C") && cavs.includes("A") && cavs.includes("B") && cavs.length === 3;
  if (isDiode) {
    return (
      <SvgPlate caption="BLOCKING DIODE (47 & 48) · p.82" find="Three-cavity: C on the left, B over A on the right. Same stack as the book.">
        <path d="M 70 70 L 110 70 L 110 50 L 190 50 L 190 170 L 110 170 L 110 150 L 70 150 Z" fill={paper} stroke={ink} strokeWidth="2.2" />
        <Terminal x={78} y={86} w={28} h={48} cavity="C" pin={pinAt(pins, "C")} active={active === "C"} family={family} onPick={onPick} label="C" inHole />
        <Terminal x={128} y={58} w={48} h={48} cavity="B" pin={pinAt(pins, "B")} active={active === "B"} family={family} onPick={onPick} label="B" inHole />
        <Terminal x={128} y={114} w={48} h={48} cavity="A" pin={pinAt(pins, "A")} active={active === "A"} family={family} onPick={onPick} label="A" inHole />
      </SvgPlate>
    );
  }
  return (
    <SvgPlate caption="3-way sealed · mating end" find="Sealed 3-pin. Latch on the long edge.">
      <rect x="48" y="50" width="184" height="100" fill={paper} stroke={ink} strokeWidth="2.2" />
      <path d="M 118 50 L 118 36 L 162 36 L 162 50" fill="none" stroke={ink} strokeWidth="1.6" />
      {cavs.map((c, i) => (
        <Terminal
          key={c}
          x={62 + i * 54}
          y={70}
          w={42}
          h={42}
          cavity={c}
          pin={pinAt(pins, c)}
          active={active === c}
          family={family}
          onPick={onPick}
          label={c}
          inHole
        />
      ))}
    </SvgPlate>
  );
}

/** 4-pin lamp. */
export function Weather4Art({ pins, active, family, onPick }: ArtProps) {
  const cavs = pins.length ? pins.map((p) => p.cavity).slice(0, 4) : ["A", "B", "C", "D"];
  const pos = [
    [78, 56],
    [128, 56],
    [78, 108],
    [128, 108],
  ];
  return (
    <SvgPlate caption="4-way sealed · mating end" find="Square 4-pin. Headlamp and small harness plugs.">
      <rect x="62" y="40" width="116" height="120" rx="4" fill={paper} stroke={ink} strokeWidth="2.2" />
      <path d="M 104 40 L 104 28 L 136 28 L 136 40" fill="none" stroke={ink} strokeWidth="1.6" />
      {cavs.map((c, i) => (
        <Terminal
          key={c}
          x={pos[i][0]}
          y={pos[i][1]}
          w={36}
          h={36}
          cavity={c}
          pin={pinAt(pins, c)}
          active={active === c}
          family={family}
          onPick={onPick}
          label={c}
          inHole
        />
      ))}
    </SvgPlate>
  );
}

/** HYDRAULIC BRAKE WARNING LIGHT (49) — printed page 82. A–K slots. */
export function Monitor49Art({ pins, active, family, onPick }: ArtProps) {
  const cavs = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
  return (
    <SvgPlate caption="HYD BRAKE WARNING LIGHT (49) · p.82" find="Long 10-cavity bar, A on the left, K on the right. Polarizing slot in the middle. Same as the book." box="0 0 420 160" maxW={520}>
      <rect x="24" y="48" width="372" height="72" fill={paper} stroke={ink} strokeWidth="2.2" />
      <rect x="196" y="40" width="28" height="12" fill={paper} stroke={ink} strokeWidth="1.4" />
      {cavs.map((c, i) => (
        <g key={c}>
          <text x={42 + i * 36} y={42} textAnchor="middle" fill={ink} style={{ ...lab, fontSize: 10 }}>
            {c}
          </text>
          <Terminal
            x={34 + i * 36}
            y={58}
            w={16}
            h={48}
            kind="slot"
            cavity={c}
            pin={pinAt(pins, c)}
            active={active === c}
            family={family}
            onPick={onPick}
          />
        </g>
      ))}
    </SvgPlate>
  );
}

/** HEADLIGHT SWITCH (60) — printed page 82. */
export function Headlamp60Art({ pins, active, family, onPick }: ArtProps) {
  const spots: { c: string; x: number; y: number }[] = [
    { c: "A", x: 70, y: 36 },
    { c: "B", x: 118, y: 36 },
    { c: "H", x: 70, y: 84 },
    { c: "C", x: 150, y: 70 },
    { c: "G", x: 70, y: 132 },
    { c: "F", x: 130, y: 118 },
    { c: "E", x: 170, y: 148 },
    { c: "D", x: 200, y: 100 },
  ];
  return (
    <SvgPlate caption="HEADLIGHT SWITCH (60) · p.82" find="Irregular column switch. A/B on top, H/G down the left, C/F/E/D around the right — same as printed page 82.">
      <path d="M 58 28 L 150 28 L 168 52 L 210 70 L 230 110 L 210 170 L 58 170 Z" fill={paper} stroke={ink} strokeWidth="2.2" />
      {spots.map((s) => (
        <Terminal
          key={s.c}
          x={s.x}
          y={s.y}
          w={32}
          h={28}
          cavity={s.c}
          pin={pinAt(pins, s.c)}
          active={active === s.c}
          family={family}
          onPick={onPick}
          label={s.c}
          inHole
        />
      ))}
    </SvgPlate>
  );
}

/** BODY BUILDER (194) — printed page 85. */
export function Body194Art({ pins, active, family, onPick }: ArtProps) {
  const grid = [
    ["A", "H"],
    ["B", "G"],
    ["C", "F"],
    ["D", "E"],
  ];
  return (
    <SvgPlate caption="BODY BUILDER (194) · p.85" find="8-way: A–D down the left, H–E down the right." box="0 0 200 240" maxW={340}>
      <rect x="50" y="24" width="100" height="192" fill={paper} stroke={ink} strokeWidth="2.3" />
      {grid.map((row, ri) =>
        row.map((c, ci) => (
          <Terminal
            key={c}
            x={62 + ci * 40}
            y={36 + ri * 44}
            w={32}
            h={36}
            cavity={c}
            pin={pinAt(pins, c)}
            active={active === c}
            family={family}
            onPick={onPick}
            label={c}
            inHole
          />
        )),
      )}
    </SvgPlate>
  );
}

/** TURN SIGNAL 6-way — printed page 85. */
export function Turn6Art({ pins, active, family, onPick }: ArtProps) {
  const grid = [
    ["A", "F"],
    ["B", "E"],
    ["C", "D"],
  ];
  return (
    <SvgPlate caption="TURN SIGNAL (459) · p.85 / 110" find="6-way: A F on top, B E, C D on the bottom.">
      <rect x="70" y="40" width="120" height="160" fill={paper} stroke={ink} strokeWidth="2.2" />
      {grid.map((row, ri) =>
        row.map((c, ci) => (
          <Terminal
            key={c}
            x={86 + ci * 48}
            y={56 + ri * 44}
            w={36}
            h={36}
            cavity={c}
            pin={pinAt(pins, c)}
            active={active === c}
            family={family}
            onPick={onPick}
            label={c}
            inHole
          />
        )),
      )}
    </SvgPlate>
  );
}

export function Diag6Art({ pins, active, family, onPick }: ArtProps) {
  const cavs = ["A", "B", "C", "D", "E", "F"];
  return (
    <SvgPlate caption="DIAGNOSTIC & PROGRAM (384) · mating end" find="6-way under the dash. A–C on top, D–F on the bottom.">
      <rect x="48" y="48" width="184" height="120" rx="4" fill={paper} stroke={ink} strokeWidth="2.2" />
      <path d="M 118 48 L 118 34 L 162 34 L 162 48" fill="none" stroke={ink} strokeWidth="1.6" />
      {cavs.map((c, i) => {
        const ci = i % 3;
        const ri = Math.floor(i / 3);
        return (
          <Terminal
            key={c}
            x={66 + ci * 50}
            y={64 + ri * 48}
            w={36}
            h={36}
            cavity={c}
            pin={pinAt(pins, c)}
            active={active === c}
            family={family}
            onPick={onPick}
            label={c}
            inHole
          />
        );
      })}
    </SvgPlate>
  );
}

export function SealedRowArt({ pins, active, family, onPick }: ArtProps) {
  const cavs = pins.map((p) => p.cavity);
  const cols = Math.min(5, Math.max(2, Math.ceil(cavs.length / 2)));
  const rows = Math.ceil(cavs.length / cols);
  const w = 36 + cols * 40;
  const h = 48 + rows * 46;
  return (
    <SvgPlate
      caption={`${cavs.length}-way sealed · mating end`}
      find="Sealed housing as printed — tap a cavity."
      box={`0 0 ${Math.max(280, w + 24)} ${Math.max(180, h + 20)}`}
      maxW={Math.max(280, w + 24)}
    >
      <rect x="20" y="28" width={w} height={h} fill={paper} stroke={ink} strokeWidth="2.2" />
      {cavs.map((c, i) => {
        const ci = i % cols;
        const ri = Math.floor(i / cols);
        return (
          <Terminal
            key={c}
            x={36 + ci * 40}
            y={44 + ri * 46}
            w={30}
            h={30}
            cavity={c}
            pin={pinAt(pins, c)}
            active={active === c}
            family={family}
            onPick={onPick}
            label={c}
            inHole
          />
        );
      })}
    </SvgPlate>
  );
}

/** FUSE BLOCK — printed page 77, cable insertion end. */
export function FuseBlockArt({ pins, active, family, onPick }: ArtProps) {
  const pairs: { id: string; x: number; y: number }[] = [
    { id: "A2", x: 168, y: 36 },
    { id: "A1", x: 248, y: 36 },
    { id: "B2", x: 168, y: 78 },
    { id: "B1", x: 248, y: 78 },
    { id: "C3", x: 72, y: 122 },
    { id: "C2", x: 152, y: 122 },
    { id: "C1", x: 268, y: 122 },
    { id: "D3", x: 72, y: 164 },
    { id: "D2", x: 168, y: 164 },
    { id: "D1", x: 268, y: 164 },
    { id: "E4", x: 48, y: 206 },
    { id: "E3", x: 128, y: 206 },
    { id: "E2", x: 208, y: 206 },
    { id: "E1", x: 288, y: 206 },
    { id: "F3", x: 96, y: 248 },
    { id: "F2", x: 176, y: 248 },
    { id: "F1", x: 256, y: 248 },
    { id: "G1", x: 256, y: 290 },
    { id: "H1", x: 300, y: 328 },
  ];
  const js: { id: string; x: number; y: number }[] = [
    { id: "J2", x: 228, y: 128 },
    { id: "J1", x: 348, y: 128 },
    { id: "J4", x: 128, y: 170 },
    { id: "J3", x: 348, y: 170 },
    { id: "J6", x: 48, y: 254 },
    { id: "J5", x: 336, y: 254 },
    { id: "J9", x: 120, y: 300 },
    { id: "J8", x: 152, y: 300 },
    { id: "J7", x: 184, y: 300 },
    { id: "J11", x: 228, y: 334 },
    { id: "J10", x: 360, y: 328 },
  ];
  const r2 = { x: 348, y: 40 };
  return (
    <SvgPlate
      caption="FUSE BLOCK · cable insertion end · p.77"
      find="Behind the fuse cover. Each fuse is a B (load) / A (feed) pair. Flasher is the round can at the bottom left. Same layout as the book."
      box="0 0 440 400"
      maxW={480}
    >
      <rect x="28" y="16" width="384" height="368" rx="4" fill={paper} stroke={ink} strokeWidth="2.3" />
      <circle cx="48" cy="48" r="16" fill="none" stroke={ink} strokeWidth="1.6" />
      <circle cx="392" cy="330" r="16" fill="none" stroke={ink} strokeWidth="1.6" />
      {pairs.map((f) => {
        const b = pinAt(pins, `${f.id}-B`);
        const a = pinAt(pins, `${f.id}-A`);
        const onB = active === `${f.id}-B`;
        const onA = active === `${f.id}-A`;
        return (
          <g key={f.id}>
            <Terminal x={f.x} y={f.y} w={22} h={22} cavity={`${f.id}-B`} pin={b} active={onB} family={family} onPick={onPick} />
            <text x={f.x + 11} y={f.y - 3} textAnchor="middle" fill={ink} style={{ fontSize: 8, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
              B
            </text>
            <text x={f.x + 34} y={f.y + 16} textAnchor="middle" fill={ink} style={{ fontSize: 9, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
              {f.id}
            </text>
            <Terminal x={f.x + 46} y={f.y} w={22} h={22} cavity={`${f.id}-A`} pin={a} active={onA} family={family} onPick={onPick} />
            <text x={f.x + 57} y={f.y - 3} textAnchor="middle" fill={ink} style={{ fontSize: 8, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
              A
            </text>
          </g>
        );
      })}
      {js.map((j) => (
        <g key={j.id}>
          <Terminal x={j.x} y={j.y} w={16} h={16} cavity={j.id} pin={pinAt(pins, j.id)} active={active === j.id} family={family} onPick={onPick} />
          <text x={j.x + 8} y={j.y + 28} textAnchor="middle" fill={ink} style={{ fontSize: 8, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
            {j.id}
          </text>
        </g>
      ))}
      <g>
        <text x={r2.x + 34} y={r2.y - 4} textAnchor="middle" fill={ink} style={{ fontSize: 9, fontFamily: "ui-monospace, monospace", fontWeight: 700 }}>
          R2
        </text>
        <Terminal x={r2.x} y={r2.y} w={22} h={22} cavity="R2-A" pin={pinAt(pins, "R2-A")} active={active === "R2-A"} family={family} onPick={onPick} />
        <Terminal x={r2.x + 28} y={r2.y} w={22} h={22} cavity="R2-B" pin={pinAt(pins, "R2-B")} active={active === "R2-B"} family={family} onPick={onPick} />
      </g>
      <circle cx="78" cy="348" r="36" fill={paper} stroke={ink} strokeWidth="2" />
      <text x="78" y="344" textAnchor="middle" fill={ink} style={{ ...lab, fontSize: 10 }}>
        R1
      </text>
      <text x="78" y="358" textAnchor="middle" fill={ink} style={{ fontSize: 8, fontFamily: "ui-monospace, monospace" }}>
        FLASHER
      </text>
      <Terminal x={58} y={332} w={18} h={18} cavity="R1-A" pin={pinAt(pins, "R1-A")} active={active === "R1-A"} family={family} onPick={onPick} />
      <Terminal x={80} y={332} w={18} h={18} cavity="R1-B" pin={pinAt(pins, "R1-B")} active={active === "R1-B"} family={family} onPick={onPick} />
    </SvgPlate>
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
  if (tag === "FUSE") return <FuseBlockArt {...p} />;
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
  if (tag === "401") return <Filter3Art {...p} />;
  if (tag === "379") return <Cec60Art {...p} />;
  if (tag === "384") return <Diag6Art {...p} />;
  if (tag === "49") return <Monitor49Art {...p} />;
  if (tag === "60") return <Headlamp60Art {...p} />;
  if (tag === "194") return <Body194Art {...p} />;
  if (tag === "459") return <Turn6Art {...p} />;
  if (["61", "387", "396", "431", "300", "615", "100", "101", "423", "639", "661", "662", "995", "996"].includes(tag)) {
    return <Iso4Art {...p} />;
  }
  if (["50", "51", "303", "304", "398", "345", "373", "374", "540"].includes(tag)) return <Weather2Art {...p} />;
  if (["47/48", "406", "382", "301", "763", "605"].includes(tag)) return <Weather3Art {...p} />;
  if (["502", "504", "503", "470", "284", "286"].includes(tag)) return <Weather4Art {...p} />;
  return <SealedRowArt {...p} />;
}
