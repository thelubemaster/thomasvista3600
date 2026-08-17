export function HydSchematic() {
  return (
    <section className="space-y-4">
      <header>
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Option 004040</p>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          3600 hydraulic brake path
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          Fuse E3 (10A) is the hyd-brake feed. The pump motor, booster relay, monitor module, and
          flow / pressure switches all ride Circuit 90. CEC pins 43 / 44 see 97N / 97M.
        </p>
      </header>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface p-5">
        <pre className="font-mono text-sm leading-6 text-fg">
{`KEY ──13── Fuse E3 10A ──90B──┬── Dash 2-A6 ── Engine 2A-A6
                              │
                              ├── Booster relay 300-30
                              │         87 ──90H── Dash 2-A7 ── Pump motor
                              │
                              └──90C── Hyd switch 50-A
                                         50-B ──97M── Monitor 49-H ── CEC 44
                                                      Monitor 49-K ──90C

Dash 2-A4  90M ── Monitor 49-E
Dash 2-A5  90P ── Diff press 301 ── Monitor 49-G
Flow 763   90R ── Monitor 49-D
Stop D3-B  70  ── Switch 51-A ──70C── Monitor 49-J / stop lamps
Cluster 26-3  90T ── Monitor 49-A (hyd lamp)
Cluster 28-17 44   ── brake warning
Alarm 20      90S / 90U ── Monitor / diode 47-48`}
        </pre>
      </div>
    </section>
  );
}
