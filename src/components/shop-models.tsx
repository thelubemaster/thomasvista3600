"use client";

import { Html } from "@react-three/drei";

const C = {
  iron: "#3a3530",
  iron2: "#26221e",
  alum: "#a8a49c",
  alum2: "#7a756e",
  black: "#141210",
  rubber: "#1a1816",
  paint: "#2a241e",
  cream: "#f4f0e6",
  accent: "#c4783a",
  steel: "#8fa3b8",
  rust: "#6a4030",
  gauge: "#12100e",
  lens: "#d4c4a0",
  cover: "#4a4238",
  turbo: "#5a5248",
};

function M({
  color,
  metal = 0.4,
  rough = 0.5,
  opacity = 1,
}: {
  color: string;
  metal?: number;
  rough?: number;
  opacity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metal}
      roughness={rough}
      transparent={opacity < 1}
      opacity={opacity}
    />
  );
}

function Tag({ text, sub }: { text: string; sub?: string }) {
  return (
    <Html center distanceFactor={7} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
      <div className="rounded-sm border border-accent bg-raised/95 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-fg shadow-lg">
        {text}
        {sub ? <span className="ml-2 text-muted">{sub}</span> : null}
      </div>
    </Html>
  );
}

export function EngineT444E({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  const iron = selected ? C.accent : C.iron;
  const cover = selected ? C.accent : C.cover;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      {/* skirted block */}
      <mesh castShadow position={[0, 0.0, 0.02]}>
        <boxGeometry args={[0.56, 0.36, 0.72]} />
        <M color={iron} metal={0.45} rough={0.48} opacity={op} />
      </mesh>
      <mesh castShadow position={[0, -0.16, 0.02]}>
        <boxGeometry args={[0.5, 0.12, 0.68]} />
        <M color={C.iron2} metal={0.4} opacity={op} />
      </mesh>
      {/* oil pan — tapered */}
      <mesh castShadow position={[0, -0.3, 0.04]}>
        <boxGeometry args={[0.38, 0.14, 0.52]} />
        <M color={C.iron2} metal={0.5} rough={0.4} opacity={op} />
      </mesh>
      {/* rear bell face */}
      <mesh position={[0, 0.02, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.06, 20]} />
        <M color={iron} metal={0.45} opacity={op} />
      </mesh>
      {/* left bank + cover */}
      <mesh castShadow position={[-0.22, 0.24, 0.01]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.18, 0.16, 0.66]} />
        <M color={iron} opacity={op} />
      </mesh>
      <mesh castShadow position={[-0.26, 0.34, 0.01]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.16, 0.06, 0.64]} />
        <M color={cover} metal={0.2} rough={0.65} opacity={op} />
      </mesh>
      {/* right bank + cover */}
      <mesh castShadow position={[0.22, 0.24, 0.01]} rotation={[0, 0, -0.38]}>
        <boxGeometry args={[0.18, 0.16, 0.66]} />
        <M color={iron} opacity={op} />
      </mesh>
      <mesh castShadow position={[0.26, 0.34, 0.01]} rotation={[0, 0, -0.38]}>
        <boxGeometry args={[0.16, 0.06, 0.64]} />
        <M color={cover} metal={0.2} rough={0.65} opacity={op} />
      </mesh>
      {/* cover bolts */}
      {[-0.24, -0.08, 0.08, 0.24].map((z) =>
        [-0.26, 0.26].map((x) => (
          <mesh key={`${x}${z}`} position={[x, 0.38, z]}>
            <cylinderGeometry args={[0.01, 0.01, 0.02, 8]} />
            <M color={C.alum} metal={0.8} opacity={op} />
          </mesh>
        )),
      )}
      {/* intake plenum */}
      <mesh castShadow position={[0, 0.36, 0.04]}>
        <boxGeometry args={[0.2, 0.1, 0.5]} />
        <M color={C.alum2} metal={0.55} rough={0.4} opacity={op} />
      </mesh>
      <mesh position={[0, 0.44, 0.12]}>
        <boxGeometry args={[0.12, 0.06, 0.16]} />
        <M color={C.alum} metal={0.6} opacity={op} />
      </mesh>
      {/* 8 glow plugs — one per 7.3 cylinder */}
      {[-0.22, 0.22].map((x) =>
        [-0.22, -0.07, 0.08, 0.23].map((z) => (
          <mesh key={`g${x}${z}`} position={[x * 1.18, 0.26, z]} rotation={[0, 0, x > 0 ? -0.45 : 0.45]}>
            <cylinderGeometry args={[0.008, 0.01, 0.055, 8]} />
            <M color="#d8d4cc" metal={0.35} rough={0.45} opacity={op} />
          </mesh>
        )),
      )}
      {[-0.22, 0.22].map((x) =>
        [-0.22, -0.07, 0.08, 0.23].map((z) => (
          <mesh key={`i${x}${z}`} position={[x * 1.05, 0.3, z]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
            <cylinderGeometry args={[0.012, 0.014, 0.07, 8]} />
            <M color="#c4a15a" metal={0.85} rough={0.25} opacity={op} />
          </mesh>
        )),
      )}
      {/* front dress */}
      <mesh castShadow position={[0, 0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
        <M color={C.alum} metal={0.75} rough={0.28} opacity={op} />
      </mesh>
      <mesh position={[0, 0.02, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.012, 8, 20]} />
        <M color={C.rubber} rough={0.9} opacity={op} />
      </mesh>
      <mesh position={[0, 0.02, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
        <M color={C.iron2} metal={0.6} opacity={op} />
      </mesh>
      {/* water pump */}
      <mesh position={[0.16, 0.16, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
        <M color={C.alum2} metal={0.55} opacity={op} />
      </mesh>
      {/* turbo — passenger / right rear */}
      <mesh castShadow position={[0.32, 0.18, -0.22]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 0.09, 14]} />
        <M color={C.turbo} metal={0.5} opacity={op} />
      </mesh>
      <mesh position={[0.32, 0.18, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.05, 12]} />
        <M color={C.turbo} metal={0.45} opacity={op} />
      </mesh>
      {/* exhaust manifolds */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={`ex${x}`} position={[x, 0.08, 0.02]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
          <boxGeometry args={[0.05, 0.06, 0.58]} />
          <M color="#3a322c" metal={0.35} rough={0.7} opacity={op} />
        </mesh>
      ))}
      {/* oil filter */}
      <mesh position={[-0.28, -0.12, 0.28]} rotation={[0.4, 0, 0.3]}>
        <cylinderGeometry args={[0.035, 0.035, 0.1, 12]} />
        <M color={C.alum2} metal={0.55} opacity={op} />
      </mesh>
      {selected ? <Tag text="T444E 7.3 POWER STROKE" sub="V8 · 8 glow plugs" /> : null}
    </group>
  );
}

export function AllisonTrans({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  const body = selected ? C.accent : C.alum;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow position={[0, 0.06, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.29, 0.31, 0.13, 22]} />
        <M color={selected ? C.accent : C.alum2} metal={0.58} opacity={op} />
      </mesh>
      {/* bolt ring */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.27, 0.06 + Math.sin(a) * 0.27, -0.34]}>
            <cylinderGeometry args={[0.012, 0.012, 0.02, 8]} />
            <M color={C.iron} metal={0.7} opacity={op} />
          </mesh>
        );
      })}
      <mesh castShadow position={[0, 0.04, 0.02]}>
        <boxGeometry args={[0.34, 0.26, 0.4]} />
        <M color={body} metal={0.62} rough={0.38} opacity={op} />
      </mesh>
      {/* side ribs */}
      {[-0.1, 0, 0.1].map((z) => (
        <mesh key={z} position={[0.175, 0.04, z]}>
          <boxGeometry args={[0.02, 0.2, 0.04]} />
          <M color={C.alum2} metal={0.55} opacity={op} />
        </mesh>
      ))}
      <mesh castShadow position={[0, -0.14, 0.02]}>
        <boxGeometry args={[0.32, 0.08, 0.34]} />
        <M color={C.alum2} metal={0.5} opacity={op} />
      </mesh>
      <mesh castShadow position={[0, 0.02, 0.3]}>
        <boxGeometry args={[0.2, 0.16, 0.16]} />
        <M color={body} metal={0.6} opacity={op} />
      </mesh>
      <mesh position={[0, 0.02, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.1, 10]} />
        <M color={C.iron} metal={0.7} opacity={op} />
      </mesh>
      {/* cooler lines */}
      <mesh position={[0.2, 0.16, -0.05]} rotation={[0.2, 0, 0.4]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
        <M color="#6a4030" metal={0.3} opacity={op} />
      </mesh>
      {selected ? <Tag text="AUTOMATIC TRANSMISSION-ALLISON ELECTRONIC" sub="Behind engine" /> : null}
    </group>
  );
}

export function CabDash({
  selectedId,
  onPick,
}: {
  selectedId: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <group>
      {/* main dash */}
      <mesh position={[0, 1.1, 1.1]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.1, 0.7]} />
        <M color="#2c2620" rough={0.72} />
      </mesh>
      <mesh position={[0, 0.88, 1.32]} rotation={[-0.65, 0, 0]}>
        <boxGeometry args={[2.15, 0.07, 0.32]} />
        <M color="#221c18" rough={0.78} />
      </mesh>
      {/* kick panels */}
      <mesh position={[-1.05, 0.55, 1.25]}>
        <boxGeometry args={[0.14, 0.85, 0.55]} />
        <M color="#1e1a16" rough={0.8} />
      </mesh>
      {/* cluster hood — three book connectors */}
      {(
        [
          { id: "cl26", x: -0.22, name: "YELLOW (26)" },
          { id: "cl27", x: 0, name: "GREEN (27)" },
          { id: "cl28", x: 0.22, name: "NATURAL (28)" },
        ] as const
      ).map((g) => (
        <group
          key={g.id}
          position={[g.x, 1.3, 0.98]}
          onClick={(e) => {
            e.stopPropagation();
            onPick(g.id);
          }}
        >
          <mesh>
            <boxGeometry args={[0.22, 0.18, 0.16]} />
            <M color={selectedId === g.id ? C.accent : C.black} />
          </mesh>
          <group position={[0, 0.02, 0.08]} rotation={[-0.35, 0, 0]}>
            <mesh>
              <circleGeometry args={[0.085, 22]} />
              <meshBasicMaterial color="#0e0c0a" />
            </mesh>
            <mesh position={[0, 0, 0.002]}>
              <ringGeometry args={[0.07, 0.085, 22]} />
              <meshBasicMaterial color={g.id === "cl26" ? "#c4a15a" : g.id === "cl27" ? "#7d9a78" : "#d8d4cc"} />
            </mesh>
          </group>
        </group>
      ))}
      {/* windshield + frame */}
      <mesh position={[0, 1.78, 0.62]} rotation={[-0.42, 0, 0]}>
        <planeGeometry args={[2.15, 0.95]} />
        <meshStandardMaterial color="#7a8a96" transparent opacity={0.16} metalness={0.5} roughness={0.08} />
      </mesh>
      <mesh position={[0, 2.22, 0.38]}>
        <boxGeometry args={[2.3, 0.06, 0.08]} />
        <M color={C.paint} />
      </mesh>
      <mesh position={[-1.14, 1.55, 0.88]}>
        <boxGeometry args={[0.07, 1.2, 0.1]} />
        <M color={C.paint} />
      </mesh>
      <mesh position={[1.14, 1.55, 0.88]}>
        <boxGeometry args={[0.07, 1.2, 0.1]} />
        <M color={C.paint} />
      </mesh>
      {/* driver seat */}
      <mesh position={[0.15, 0.42, 2.05]} castShadow>
        <boxGeometry args={[0.42, 0.12, 0.42]} />
        <M color="#3a3028" rough={0.85} />
      </mesh>
      <mesh position={[0.15, 0.78, 2.22]}>
        <boxGeometry args={[0.42, 0.55, 0.1]} />
        <M color="#3a3028" rough={0.85} />
      </mesh>
    </group>
  );
}

export function SteeringColumn({
  selected,
  onPick,
}: {
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <group position={[0.12, 0.62, 1.48]} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh rotation={[0.72, 0, 0]} position={[0, 0.18, -0.1]}>
        <cylinderGeometry args={[0.032, 0.04, 0.78, 14]} />
        <M color={selected ? C.accent : C.alum2} metal={0.55} />
      </mesh>
      <mesh position={[0, 0.52, -0.32]} rotation={[0.72, 0, 0]}>
        <torusGeometry args={[0.19, 0.016, 10, 32]} />
        <M color={C.rubber} rough={0.92} />
      </mesh>
      {[0, 2.1, -2.1].map((a) => (
        <mesh key={a} position={[0, 0.52, -0.32]} rotation={[0.72, 0, a]}>
          <boxGeometry args={[0.3, 0.016, 0.028]} />
          <M color={C.black} />
        </mesh>
      ))}
      <mesh position={[0, 0.52, -0.32]} rotation={[0.72, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 14]} />
        <M color={C.alum} metal={0.6} />
      </mesh>
      <mesh position={[0.055, 0.34, -0.14]} rotation={[0, 0, 1.15]}>
        <cylinderGeometry args={[0.016, 0.016, 0.055, 10]} />
        <M color={selected ? C.accent : C.alum} metal={0.75} />
      </mesh>
      {selected ? <Tag text="KEY SWITCH (63)" sub="Column" /> : null}
    </group>
  );
}

export function FuseBlock({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.28;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.07, 0.22]} />
        <M color={selected ? C.accent : "#1c1814"} opacity={op} />
      </mesh>
      {[-0.09, -0.03, 0.03, 0.09].map((x, i) =>
        [-0.06, 0, 0.06].map((z, j) => (
          <mesh key={`${i}${j}`} position={[x, 0.048, z]}>
            <boxGeometry args={[0.038, 0.028, 0.02]} />
            <M color={["#c4a15a", "#7d9a78", "#c4783a"][j]} metal={0.15} opacity={op} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.1, -0.04]} rotation={[-0.85, 0, 0]}>
        <boxGeometry args={[0.28, 0.012, 0.22]} />
        <M color="#2a2420" opacity={op} />
      </mesh>
      {selected ? <Tag text="FUSE BLOCK" sub="Cable insertion end" /> : null}
    </group>
  );
}

export function IsoRelay({
  position,
  selected,
  lit,
  label,
  onPick,
  fat,
  leads,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  label: string;
  onPick: () => void;
  fat?: boolean;
  leads: { iso: string; hex: string }[];
}) {
  const op = lit || selected ? 1 : 0.2;
  const w = fat ? 0.075 : 0.05;
  const h = fat ? 0.085 : 0.062;
  const d = fat ? 0.075 : 0.05;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow>
        <boxGeometry args={[w, h * 0.75, d]} />
        <M color={selected ? C.accent : "#181614"} metal={0.12} rough={0.72} opacity={op} />
      </mesh>
      <mesh position={[0, h * 0.42, 0]}>
        <boxGeometry args={[w * 0.92, h * 0.2, d * 0.92]} />
        <M color={selected ? C.accent : "#2a2622"} opacity={op} />
      </mesh>
      <mesh position={[0, h / 2 + 0.008, 0]}>
        <boxGeometry args={[w * 0.45, 0.012, d * 0.22]} />
        <M color="#4a443c" opacity={op} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x * w * 0.22, -h / 2 - 0.014, z * d * 0.22]}>
            <boxGeometry args={[0.007, 0.026, 0.007]} />
            <M color={C.alum} metal={0.85} rough={0.2} opacity={op} />
          </mesh>
        )),
      )}
      {leads.map((p) => {
        const off = { "30": [-0.02, 0.02] as const, "87": [0.02, 0.02] as const, "86": [-0.02, -0.02] as const, "85": [0.02, -0.02] as const, "87a": [0, 0.03] as const }[p.iso] ?? [0, 0];
        return (
          <group key={p.iso} position={[off[0], -h / 2 - 0.04, off[1]]}>
            <mesh>
              <cylinderGeometry args={[0.004, 0.004, 0.055, 6]} />
              <meshBasicMaterial color={p.hex} transparent opacity={op} />
            </mesh>
            {selected ? (
              <Html center distanceFactor={5} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
                <span className="font-mono text-[9px] text-fg">{p.iso}</span>
              </Html>
            ) : null}
          </group>
        );
      })}
      {selected ? <Tag text={label} sub="ISO relay" /> : null}
    </group>
  );
}

export function DualBatteries({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.52]} />
        <M color={C.iron2} metal={0.4} opacity={op} />
      </mesh>
      {[-0.125, 0.125].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.22, 0.2]} />
            <M color={selected ? C.accent : "#5c3828"} metal={0.22} rough={0.62} opacity={op} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.26, 0.02, 0.16]} />
            <M color="#2a2018" opacity={op} />
          </mesh>
          <mesh position={[-0.08, 0.14, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
            <M color="#d0d0d0" metal={0.92} opacity={op} />
          </mesh>
          <mesh position={[0.08, 0.14, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
            <M color="#8a5a18" metal={0.82} opacity={op} />
          </mesh>
        </group>
      ))}
      {selected ? <Tag text="DUAL MOUNTED BATTERIES" sub="Page 8" /> : null}
    </group>
  );
}

export function StarterMotor({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.18, 18]} />
        <M color={selected ? C.accent : C.iron} metal={0.48} opacity={op} />
      </mesh>
      <mesh position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.06, 0.05, 14]} />
        <M color={C.alum2} metal={0.5} opacity={op} />
      </mesh>
      <mesh position={[0.12, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.042, 0.042, 0.07, 12]} />
        <M color={C.alum2} metal={0.55} opacity={op} />
      </mesh>
      <mesh position={[0.02, 0.08, 0]}>
        <boxGeometry args={[0.05, 0.035, 0.045]} />
        <M color="#2a2622" opacity={op} />
      </mesh>
      {selected ? <Tag text="CRANKING MOTOR SOLENOID (J31)" sub="Bellhousing" /> : null}
    </group>
  );
}

export function Alternator({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.068, 0.068, 0.11, 18]} />
        <M color={selected ? C.accent : C.alum} metal={0.68} rough={0.32} opacity={op} />
      </mesh>
      <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.042, 0.042, 0.03, 16]} />
        <M color={C.iron} metal={0.5} opacity={op} />
      </mesh>
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.038, 0.008, 8, 16]} />
        <M color={C.rubber} opacity={op} />
      </mesh>
      {selected ? <Tag text="GENERATOR" sub="Charge · circuit 2" /> : null}
    </group>
  );
}

export function FuelFilterCan({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow>
        <cylinderGeometry args={[0.068, 0.068, 0.15, 18]} />
        <M color={selected ? C.accent : "#3a342e"} metal={0.28} opacity={op} />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <cylinderGeometry args={[0.078, 0.078, 0.04, 18]} />
        <M color={C.alum2} metal={0.55} opacity={op} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.052, 0.06, 0.09, 16]} />
        <meshStandardMaterial color="#6a7a88" transparent opacity={0.32 * op} metalness={0.15} roughness={0.15} />
      </mesh>
      <mesh position={[0.07, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
        <M color="#2a2622" opacity={op} />
      </mesh>
      {selected ? <Tag text="FUEL FILTER (399)" sub="Heater + probe + vacuum" /> : null}
    </group>
  );
}

export function HydBooster({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.12, 0.2]} />
        <M color={selected ? C.accent : C.alum2} metal={0.52} opacity={op} />
      </mesh>
      <mesh position={[0.12, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.048, 0.048, 0.1, 14]} />
        <M color={C.iron} metal={0.42} opacity={op} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.06, 10]} />
        <M color={C.alum} metal={0.55} opacity={op} />
      </mesh>
      {selected ? <Tag text="HYD BRAKE PUMP MOTOR" sub="Circuit 90" /> : null}
    </group>
  );
}

export function CecModule({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.07, 0.22]} />
        <M color={selected ? C.accent : C.black} opacity={op} />
      </mesh>
      <mesh position={[0, 0.04, 0.04]}>
        <boxGeometry args={[0.26, 0.012, 0.05]} />
        <M color="#2a2622" opacity={op} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-0.12 + i * 0.034, 0.04, -0.06]}>
          <boxGeometry args={[0.02, 0.01, 0.03]} />
          <M color={C.alum2} metal={0.5} opacity={op} />
        </mesh>
      ))}
      {selected ? <Tag text="CEC CONTROL MODULE (379)" sub="ECM MODULE CONN" /> : null}
    </group>
  );
}

export function PedalAps({
  position,
  selected,
  lit,
  onPick,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
}) {
  const op = lit || selected ? 1 : 0.28;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[0.09, 0.018, 0.18]} />
        <M color={selected ? C.accent : C.rubber} rough={0.92} opacity={op} />
      </mesh>
      <mesh position={[0, 0.045, 0.05]}>
        <boxGeometry args={[0.055, 0.04, 0.045]} />
        <M color={C.black} opacity={op} />
      </mesh>
      {selected ? <Tag text="ACCELERATION POSITION SWITCH (382)" sub="Pedal" /> : null}
    </group>
  );
}

export function Headlamp({
  position,
  selected,
  lit,
  onPick,
  label,
}: {
  position: [number, number, number];
  selected: boolean;
  lit: boolean;
  onPick: () => void;
  label: string;
}) {
  const op = lit || selected ? 1 : 0.22;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.088, 0.07, 20]} />
        <M color={selected ? C.accent : C.iron2} opacity={op} />
      </mesh>
      <mesh position={[0, 0, -0.036]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.068, 20]} />
        <meshStandardMaterial color={C.lens} emissive={lit ? "#d4c4a0" : "#000"} emissiveIntensity={lit ? 0.4 : 0} />
      </mesh>
      {selected ? <Tag text={label} /> : null}
    </group>
  );
}

export function ChassisDress() {
  return (
    <group>
      {/* front bumper */}
      <mesh position={[0, 0.28, -3.72]} castShadow>
        <boxGeometry args={[2.15, 0.16, 0.12]} />
        <M color="#1c1814" metal={0.35} rough={0.55} />
      </mesh>
      {/* grille */}
      <mesh position={[0, 0.72, -3.55]}>
        <boxGeometry args={[0.7, 0.45, 0.06]} />
        <M color="#1a1814" />
      </mesh>
      {[-0.18, -0.06, 0.06, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.72, -3.52]}>
          <boxGeometry args={[0.06, 0.38, 0.02]} />
          <M color="#3a342e" metal={0.4} />
        </mesh>
      ))}
      {/* fenders */}
      <mesh position={[-1.05, 0.55, -2.6]}>
        <boxGeometry args={[0.22, 0.55, 2.1]} />
        <M color={C.paint} rough={0.65} />
      </mesh>
      <mesh position={[1.05, 0.55, -2.6]}>
        <boxGeometry args={[0.22, 0.55, 2.1]} />
        <M color={C.paint} rough={0.65} />
      </mesh>
      {/* front axle + wheels */}
      <mesh position={[0, 0.22, -3.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.9, 10]} />
        <M color={C.iron} metal={0.5} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <group key={x} position={[x, 0.22, -3.15]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.14, 18]} />
            <M color={C.rubber} rough={0.95} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.15, 12]} />
            <M color={C.alum2} metal={0.55} />
          </mesh>
        </group>
      ))}
      {/* hood, propped */}
      <mesh position={[0, 1.55, -1.85]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[1.85, 0.03, 1.7]} />
        <meshStandardMaterial color="#2c2620" metalness={0.25} roughness={0.55} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
