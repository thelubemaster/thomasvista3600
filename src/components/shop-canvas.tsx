import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import {
  AllisonTrans,
  Alternator,
  CabDash,
  CecModule,
  DualBatteries,
  EngineT444E,
  FuelFilterCan,
  FuseBlock,
  Headlamp,
  HydBooster,
  IsoRelay,
  PedalAps,
  StarterMotor,
  SteeringColumn,
  ChassisDress,
} from "@/components/shop-models";
import { Cable, WIRE_HEX } from "@/components/shop-harness";
import { partLit, worldParts, wiresFor, type WorldPart } from "@/data/world";
import { wireIsLive, type KeyPos } from "@/data/follow";
import { circuitFamily } from "@/data/circuits";

const COL = {
  accent: "#c4783a",
  ok: "#7d9a78",
  warn: "#c4a15a",
  dim: "#2a2622",
  steel: "#8fa3b8",
};

const RELAY_LEADS: Record<string, { iso: string; hex: string }[]> = {
  r387: [
    { iso: "30", hex: WIRE_HEX.hot },
    { iso: "87", hex: WIRE_HEX.hot },
    { iso: "85", hex: WIRE_HEX.key },
    { iso: "86", hex: WIRE_HEX.gnd },
  ],
  r396: [
    { iso: "30", hex: WIRE_HEX.hot },
    { iso: "87", hex: WIRE_HEX.hot },
    { iso: "85", hex: WIRE_HEX.key },
    { iso: "86", hex: WIRE_HEX.sig },
  ],
  r431: [
    { iso: "30", hex: WIRE_HEX.hot },
    { iso: "87", hex: WIRE_HEX.hot },
    { iso: "85", hex: WIRE_HEX.sig },
    { iso: "86", hex: WIRE_HEX.gnd },
  ],
  r615: [
    { iso: "30", hex: WIRE_HEX.key },
    { iso: "87", hex: WIRE_HEX.sig },
    { iso: "85", hex: WIRE_HEX.sig },
    { iso: "86", hex: WIRE_HEX.sig },
  ],
  r300: [
    { iso: "30", hex: WIRE_HEX.key },
    { iso: "87", hex: WIRE_HEX.hot },
    { iso: "85", hex: WIRE_HEX.sig },
    { iso: "86", hex: WIRE_HEX.gnd },
  ],
  r61: [
    { iso: "30", hex: WIRE_HEX.hot },
    { iso: "87", hex: WIRE_HEX.hot },
    { iso: "85", hex: WIRE_HEX.hot },
    { iso: "86", hex: WIRE_HEX.gnd },
  ],
  glowR: [
    { iso: "30", hex: WIRE_HEX.hot },
    { iso: "87", hex: WIRE_HEX.hot },
    { iso: "85", hex: WIRE_HEX.sig },
    { iso: "86", hex: WIRE_HEX.gnd },
  ],
};

function lead(id: string) {
  return RELAY_LEADS[id] ?? [];
}

const CUSTOM = new Set([
  "engine",
  "trans",
  "fuse",
  "key",
  "cl26",
  "cl27",
  "cl28",
  "cec",
  "aps",
  "bats",
  "starter",
  "alt",
  "filter",
  "hydPump",
  "r387",
  "r396",
  "r431",
  "r615",
  "r300",
  "r61",
  "glowR",
  "dash2",
  "eng3",
  "front2b",
  "lh",
  "rh",
]);

function Structure() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.4]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#141210" />
      </mesh>
      <gridHelper args={[8, 16, "#3a342e", "#241f1b"]} position={[0, 0.01, -0.4]} />
      <mesh position={[-0.95, 0.12, -0.6]}>
        <boxGeometry args={[0.12, 0.16, 6.2]} />
        <meshStandardMaterial color="#1c1916" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0.95, 0.12, -0.6]}>
        <boxGeometry args={[0.12, 0.16, 6.2]} />
        <meshStandardMaterial color="#1c1916" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[2.6, 1.9, 0.06]} />
        <meshStandardMaterial color="#2a241f" metalness={0.15} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.08, 1.35]}>
        <boxGeometry args={[2.5, 0.08, 2.4]} />
        <meshStandardMaterial color="#1a1714" />
      </mesh>
      <mesh position={[-0.95, 0.7, 1.55]}>
        <boxGeometry args={[0.12, 1.2, 0.7]} />
        <meshStandardMaterial color="#1c1916" />
      </mesh>
      <mesh position={[0, 1.18, -2.5]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[2.2, 0.03, 2.6]} />
        <meshStandardMaterial color="#2c2620" transparent opacity={0.12} />
      </mesh>
      <ChassisDress />
    </group>
  );
}

function Cavity({ pos, size }: { pos: [number, number, number]; size: [number, number] }) {
  return (
    <mesh position={pos}>
      <planeGeometry args={size} />
      <meshBasicMaterial color="#f4f0e6" />
    </mesh>
  );
}

function Dash2Face({ selected, onPick }: { selected: boolean; onPick: () => void }) {
  const s = 0.028;
  const g = 0.006;
  return (
    <group position={[-0.32, 0.82, 0.045]} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh>
        <boxGeometry args={[0.42, 0.38, 0.04]} />
        <meshStandardMaterial color={selected ? COL.accent : "#1a1814"} metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0.021]}>
        <circleGeometry args={[0.018, 16]} />
        <meshBasicMaterial color="#f4f0e6" />
      </mesh>
      <mesh position={[0, -0.2, 0.021]}>
        <circleGeometry args={[0.018, 16]} />
        <meshBasicMaterial color="#f4f0e6" />
      </mesh>
      <mesh position={[0.01, 0, 0.022]}>
        <circleGeometry args={[0.016, 12]} />
        <meshBasicMaterial color={COL.steel} />
      </mesh>
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => (
          <Cavity key={`L${r}${c}`} pos={[-0.09 + c * (s + g), 0.11 - r * (s + g), 0.023]} size={[s, s]} />
        )),
      )}
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => (
          <Cavity key={`R${r}${c}`} pos={[0.06 + c * (s + g), 0.11 - r * (s + g), 0.023]} size={[s, s]} />
        )),
      )}
      {selected ? (
        <Html center distanceFactor={8} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
          <div className="rounded-sm border border-accent bg-raised/95 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-fg">
            DASH CONNECTOR (2)
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function Front2BFace({ selected, onPick }: { selected: boolean; onPick: () => void }) {
  const s = 0.026;
  const g = 0.006;
  return (
    <group position={[0.58, 0.62, 0.04]} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh>
        <boxGeometry args={[0.18, 0.34, 0.04]} />
        <meshStandardMaterial color={selected ? COL.accent : "#1a1814"} metalness={0.2} roughness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 3 }, (_, c) => (
          <Cavity key={`${r}${c}`} pos={[-0.04 + c * (s + g), 0.11 - r * (s + g), 0.023]} size={[s, s]} />
        )),
      )}
      {selected ? (
        <Html center distanceFactor={8} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
          <div className="rounded-sm border border-accent bg-raised/95 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-fg">
            FRONT END CONNECTOR (2B)
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function Engine3Card({ cab }: { cab: { c: string; x: number; y: number }[] }) {
  const wide = useThree((s) => s.size.width > 520);
  if (!wide) {
    return (
      <Html center distanceFactor={7} position={[0, 0.22, 0]} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
        <div className="rounded-sm border border-accent bg-raised/95 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-fg">
          ENGINE DASH (3)
        </div>
      </Html>
    );
  }
  return (
    <Html center distanceFactor={5} position={[0, 0.22, 0.08]} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
      <div className="w-56 rounded-sm border border-[#c9c2b4] bg-[#f4f0e6] px-2 py-2 text-[#1a1814] shadow-sm">
        <p className="text-center font-mono text-[9px] font-semibold tracking-widest uppercase">
          ELECTRONIC ENGINE DASH CONNECTOR (3)
        </p>
        <p className="mt-0.5 text-center font-mono text-[9px] uppercase">Cab harness · mating end · green seal</p>
        <div className="relative mx-auto mt-1 h-36 w-36">
          {cab.map((p) => (
            <span
              key={p.c}
              className="absolute font-mono text-[9px] font-bold"
              style={{
                left: `${50 + p.x * 520}%`,
                top: `${50 - p.y * 520}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {p.c}
            </span>
          ))}
        </div>
      </div>
    </Html>
  );
}

function Engine3Face({ selected, onPick }: { selected: boolean; onPick: () => void }) {
  const cab: { c: string; x: number; y: number }[] = [
    { c: "P", x: -0.028, y: 0.072 },
    { c: "S", x: 0, y: 0.082 },
    { c: "T", x: 0.028, y: 0.072 },
    { c: "O", x: -0.055, y: 0.042 },
    { c: "N", x: -0.022, y: 0.05 },
    { c: "M", x: 0.022, y: 0.05 },
    { c: "L", x: 0.055, y: 0.042 },
    { c: "Q", x: -0.072, y: 0.008 },
    { c: "R", x: -0.032, y: 0.0 },
    { c: "K", x: 0.072, y: 0.012 },
    { c: "A", x: -0.072, y: -0.032 },
    { c: "B", x: -0.038, y: -0.018 },
    { c: "H", x: 0.04, y: -0.016 },
    { c: "J", x: 0.076, y: -0.026 },
    { c: "C", x: -0.052, y: -0.058 },
    { c: "V", x: -0.022, y: -0.048 },
    { c: "U", x: 0, y: -0.046 },
    { c: "G", x: 0.028, y: -0.05 },
    { c: "I", x: 0.058, y: -0.06 },
    { c: "D", x: -0.03, y: -0.082 },
    { c: "E", x: 0, y: -0.09 },
    { c: "F", x: 0.03, y: -0.082 },
  ];
  return (
    <group position={[0.22, 0.95, 0.05]} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.055, 28]} />
        <meshStandardMaterial color={selected ? COL.accent : "#1a1814"} metalness={0.18} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.118, 0.13, 0.04, 24]} />
        <meshStandardMaterial color="#2f6b3a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.132, 0]}>
        <boxGeometry args={[0.038, 0.018, 0.03]} />
        <meshStandardMaterial color={selected ? COL.accent : "#1a1814"} />
      </mesh>
      <mesh position={[0, -0.132, 0]}>
        <boxGeometry args={[0.038, 0.018, 0.03]} />
        <meshStandardMaterial color={selected ? COL.accent : "#1a1814"} />
      </mesh>
      <mesh position={[0, 0, 0.029]}>
        <circleGeometry args={[0.014, 16]} />
        <meshBasicMaterial color="#0d0c0b" />
      </mesh>
      {cab.map((p) => (
        <group key={p.c} position={[p.x, p.y, 0.029]}>
          <mesh>
            <circleGeometry args={[0.0085, 12]} />
            <meshBasicMaterial color="#f4f0e6" />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[0.003, 10]} />
            <meshBasicMaterial color="#1a1814" />
          </mesh>
        </group>
      ))}
      {selected ? (
        <Engine3Card cab={cab} />
      ) : null}
    </group>
  );
}

function PartMesh({
  part,
  lit,
  selected,
  onPick,
}: {
  part: WorldPart;
  lit: boolean;
  selected: boolean;
  onPick: (id: string) => void;
}) {
  if (CUSTOM.has(part.id)) return null;
  const color = selected ? COL.accent : !lit ? COL.dim : part.zone === "cab" ? COL.warn : part.zone === "wall" ? COL.steel : COL.ok;
  const [sx, sy, sz] = part.size;
  const opacity = lit || selected ? 1 : 0.22;
  return (
    <group position={part.pos} onClick={(e) => { e.stopPropagation(); onPick(part.id); }}>
      {part.kind === "cyl" || part.kind === "filter" ? (
        <mesh castShadow>
          <cylinderGeometry args={[sx, sx, sy, 16]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.45} transparent opacity={opacity} />
        </mesh>
      ) : (
        <mesh castShadow>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} transparent opacity={opacity} />
        </mesh>
      )}
      {selected ? (
        <Html center distanceFactor={8} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
          <div className="rounded-sm border border-accent bg-raised/95 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-fg">
            {part.label}
            <span className="ml-2 text-muted">{part.sub}</span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

function ZoneTag({ pos, text }: { pos: [number, number, number]; text: string }) {
  return (
    <Html position={pos} center distanceFactor={14} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
      <p className="font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{text}</p>
    </Html>
  );
}

function FitShop() {
  const { camera, size, controls } = useThree();
  const mode = size.height / Math.max(size.width, 1) > 1.08 ? "tall" : "wide";
  const applied = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (applied.current === mode) return;
    applied.current = mode;
    const persp = camera as typeof camera & { fov?: number; updateProjectionMatrix: () => void };
    const ctrl = controls as { target?: { set: (x: number, y: number, z: number) => void }; update?: () => void } | undefined;
    if (mode === "tall") {
      camera.position.set(2.05, 1.28, 0.72);
      if (typeof persp.fov === "number") persp.fov = 36;
      ctrl?.target?.set(0, 0.74, -0.72);
    } else {
      camera.position.set(3.4, 2.2, 1.6);
      if (typeof persp.fov === "number") persp.fov = 40;
      ctrl?.target?.set(0, 0.7, -0.8);
    }
    persp.updateProjectionMatrix();
    ctrl?.update?.();
  }, [camera, controls, mode]);
  return null;
}

export function ShopScene({
  on,
  selected,
  onSelect,
  keyPos,
  followCircuit,
  hopWireId,
}: {
  on: Set<string>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  keyPos: KeyPos;
  followCircuit: string | null;
  hopWireId: string | null;
}) {
  return (
    <group onClick={() => onSelect(null)}>
      <Structure />
      <ShopParts
        on={on}
        selected={selected}
        onSelect={onSelect}
        keyPos={keyPos}
        followCircuit={followCircuit}
        hopWireId={hopWireId}
      />
    </group>
  );
}

function ShopParts({
  on,
  selected,
  onSelect,
  keyPos,
  followCircuit,
  hopWireId,
}: {
  on: Set<string>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  keyPos: KeyPos;
  followCircuit: string | null;
  hopWireId: string | null;
}) {
  const wires = wiresFor(on);
  const lit = (id: string) => {
    const p = worldParts.find((x) => x.id === id);
    return p ? partLit(p, on) : false;
  };

  return (
    <group>
      <CabDash selectedId={selected} onPick={onSelect} />
      <ZoneTag pos={[0, 2.15, 1.3]} text="Cab" />
      <ZoneTag pos={[0, 2.15, 0]} text="Firewall" />
      <ZoneTag pos={[0, 2.15, -2.1]} text="Engine" />

      <EngineT444E position={[0, 0.55, -2.05]} selected={selected === "engine"} lit={lit("engine")} onPick={() => onSelect("engine")} />
      <AllisonTrans position={[0, 0.42, -1.48]} selected={selected === "trans"} lit={lit("trans")} onPick={() => onSelect("trans")} />
      <SteeringColumn selected={selected === "key"} onPick={() => onSelect("key")} />
      <FuseBlock position={[-1.15, 0.98, 1.2]} selected={selected === "fuse"} lit={lit("fuse")} onPick={() => onSelect("fuse")} />
      <CecModule position={[-0.52, 0.78, -1.88]} selected={selected === "cec"} lit={lit("cec")} onPick={() => onSelect("cec")} />
      <PedalAps position={[-0.22, 0.22, 1.48]} selected={selected === "aps"} lit={lit("aps")} onPick={() => onSelect("aps")} />
      <DualBatteries position={[-1.35, 0.32, -1.55]} selected={selected === "bats"} lit={lit("bats")} onPick={() => onSelect("bats")} />
      <StarterMotor position={[-0.42, 0.32, -1.78]} selected={selected === "starter"} lit={lit("starter")} onPick={() => onSelect("starter")} />
      <Alternator position={[0.42, 0.82, -2.38]} selected={selected === "alt"} lit={lit("alt")} onPick={() => onSelect("alt")} />
      <FuelFilterCan position={[0.88, 0.48, -1.25]} selected={selected === "filter"} lit={lit("filter")} onPick={() => onSelect("filter")} />
      <HydBooster position={[-0.72, 0.38, -1.15]} selected={selected === "hydPump"} lit={lit("hydPump")} onPick={() => onSelect("hydPump")} />
      <Headlamp position={[-0.72, 0.72, -3.45]} selected={selected === "lh"} lit={lit("lh")} onPick={() => onSelect("lh")} label="LEFT HEADLIGHT" />
      <Headlamp position={[0.72, 0.72, -3.45]} selected={selected === "rh"} lit={lit("rh")} onPick={() => onSelect("rh")} label="RIGHT HEADLIGHT" />

      <IsoRelay position={[-1.18, 0.68, 0.72]} selected={selected === "r387"} lit={lit("r387")} label="START RELAY W/ T444E & I6-HEUI (387)" onPick={() => onSelect("r387")} leads={lead("r387")} />
      <IsoRelay position={[-1.32, 0.68, 0.72]} selected={selected === "r661"} lit={lit("r661")} label="CRANK RELAY (661)" onPick={() => onSelect("r661")} leads={lead("r661")} />
      <IsoRelay position={[-0.92, 0.68, 0.72]} selected={selected === "r431"} lit={lit("r431")} label="FUEL FILTER HEATER RELAY (431)" onPick={() => onSelect("r431")} leads={lead("r431")} />
      <IsoRelay position={[-1.18, 0.56, 0.72]} selected={selected === "r615"} lit={lit("r615")} label="TRANSMISSION NEUTRAL RELAY W/MD TRANSMISSION (615)" onPick={() => onSelect("r615")} leads={lead("r615")} />
      <IsoRelay position={[-1.05, 0.56, 0.72]} selected={selected === "r300"} lit={lit("r300")} label="HYDRAULIC BRAKE BOOSTER RELAY (300)" onPick={() => onSelect("r300")} leads={lead("r300")} />
      <IsoRelay position={[-0.92, 0.56, 0.72]} selected={selected === "r61"} lit={lit("r61")} label="HORN RELAY (61)" onPick={() => onSelect("r61")} leads={lead("r61")} />
      <IsoRelay position={[-0.78, 0.78, -1.52]} selected={selected === "r396"} lit={lit("r396")} label="CEC MODULE RELAY (396)" onPick={() => onSelect("r396")} leads={lead("r396")} />
      <IsoRelay position={[-0.66, 0.78, -1.52]} selected={selected === "r662"} lit={lit("r662")} label="CEC MODULE PWR RELAY W/T444E (662)" onPick={() => onSelect("r662")} leads={lead("r662")} />
      <IsoRelay position={[-1.02, 0.72, -0.72]} selected={selected === "glowR"} lit={lit("glowR")} label="GLOW PLUGS/PRE-HEATER RELAY" onPick={() => onSelect("glowR")} fat leads={lead("glowR")} />

      <Dash2Face selected={selected === "dash2"} onPick={() => onSelect("dash2")} />
      <Front2BFace selected={selected === "front2b"} onPick={() => onSelect("front2b")} />
      <Engine3Face selected={selected === "eng3"} onPick={() => onSelect("eng3")} />

      {worldParts.map((p) => (
        <PartMesh key={p.id} part={p} lit={partLit(p, on)} selected={selected === p.id} onPick={onSelect} />
      ))}

      {wires.map((w) => {
        const from = worldParts.find((p) => p.id === w.from);
        const to = worldParts.find((p) => p.id === w.to);
        if (!from || !to) return null;
        const inFollow = !followCircuit || circuitFamily(w.circuit) === circuitFamily(followCircuit);
        const onHop = hopWireId === w.id;
        const dim =
          !inFollow ||
          (!!selected && from.id !== selected && to.id !== selected && !onHop && !followCircuit);
        return (
          <Cable
            key={w.id}
            from={from}
            to={to}
            wire={w}
            dim={dim}
            focus={onHop || (!!followCircuit && inFollow && !selected)}
            live={wireIsLive(w, keyPos)}
            tag={onHop ? w.circuit : undefined}
          />
        );
      })}
    </group>
  );
}

export default function ShopCanvas({
  on,
  selected,
  onSelect,
  keyPos,
  followCircuit,
  hopWireId,
}: {
  on: Set<string>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  keyPos: KeyPos;
  followCircuit: string | null;
  hopWireId: string | null;
}) {
  return (
    <Canvas
      camera={{ position: [3.4, 2.2, 1.6], fov: 40, near: 0.1, far: 40 }}
      dpr={[1, 1.75]}
      shadows
      gl={{ antialias: true, alpha: false }}
      resize={{ debounce: 0 }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
    >
      <color attach="background" args={["#0d0c0b"]} />
      <hemisphereLight args={["#c4b8a8", "#1a1612", 0.35]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 6, 3]} intensity={1.25} castShadow />
      <directionalLight position={[-2.5, 3.2, -2.5]} intensity={0.45} />
      <spotLight position={[1.2, 3.4, -1.6]} angle={0.55} penumbra={0.5} intensity={1.1} />
      <FitShop />
      <ShopScene on={on} selected={selected} onSelect={onSelect} keyPos={keyPos} followCircuit={followCircuit} hopWireId={hopWireId} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.4}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.7, -0.8]}
      />
      <FitShop />
    </Canvas>
  );
}
