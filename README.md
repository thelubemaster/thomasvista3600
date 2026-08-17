# Thomas Vista 3600 · Wiring Companion

Mobile-first rewiring reference for a **Thomas / International 3600** school bus with a **Navistar T444E 7.3L diesel** (HEUI), based on the **CTS-5123V** (1998–1999 International 3600 / 3800 / 4000FBC) electrical circuit diagrams.

**Repo:** [thelubemaster/thomasvista3600](https://github.com/thelubemaster/thomasvista3600)

---

## What’s in this repo

| Path | Purpose |
|------|---------|
| `companion/index.html` | **Ready to use** single-file mobile app: circuits, fuses, book jumps, hop maps, touch pan/zoom |
| `src/components/ZoomStage.tsx` | React pan/zoom with non-passive touch handlers (fixes phone drag) |
| `src/components/ShopCanvas.tsx` | Scaffold for the 3D shop (full-viewport canvas) |
| `src/App.tsx` | App shell scaffold (tabs: 3D / circuits / book / job) |
| `package.json` | Vite + React scaffold for the full app |

The official PDF wiring manual is **not** committed (copyright + size). Place it locally as `companion/public/manual.pdf` if you have CTS-5123V.

---

## Quick start — mobile companion (no build)

```bash
cd companion
python3 -m http.server 8765
# open http://localhost:8765 on your phone (same Wi‑Fi) or laptop
```

Or open `companion/index.html` directly in a browser.

**On phone**

1. **Circuits** → pick a circuit (e.g. 19 fuel filter / heater)  
2. Map opens full screen  
3. **1 finger = pan**, **2 fingers = pinch zoom**, **Fit / − / +** buttons  
4. **Book** tab → real page jumps (load PDF for full manual)  
5. **Fuses** → cover labels, battery vs key, engine-critical flag  
6. **Skills** → key live/dead, colors, relay pins, job list  

---

## Engine-critical circuits (T444E 7.3)

Keep these if the engine must run. Everything else is optional for a skoolie cut-down.

| ID | Name | Power | Notes |
|----|------|-------|-------|
| **13** | IGNITION FEED | Key | Powers IGN fuses (C1, A2, H1, B1…) |
| **14** | BATTERY FEED | Battery | Module power via C2 → relay 662 |
| **15** | KEY SWITCH FEED | Battery | 15 into key BAT — no 15 = dead bus |
| **17** | STARTER CONTROL | Mixed | Crank path; 387 / 661 / neutral 615 |
| **18** | GLOW PLUGS | Battery | Cold start — T444E uses glows, not ether |
| **19** | FUEL FILTER / HEATER / WIF | Key + Bat | D2 + A2; only 19A/B/C cross firewall |
| **11** | GROUND | Ground | CEC 11-GW/GX/GY/GZ required |
| **97** | CEC / ENGINE CONTROLS | Mixed | Module, APS, data |
| **99** | APS (accelerator) | Signal | No APS = no controlled throttle |

**Not required to run the engine** (examples): horn 85, turn/hazard, hyd brake 90 (lose assist only), Allison 92 (engine still runs), cruise, panel lamps.

### Important fuse notes (from the book)

- **B1 20A** is circuit **92D** (Allison / shutter) — **not** fuel circuit 19  
- **G1 15A** cover may say both **IGN** and **AUTO XMSN** — same fuse  
- **C2 10A DIAG** is battery → CEC module power relay **662** (T444E)  
- **H1 10A START** is key-on → neutral safety / start enable  

---

## Manual reference (CTS-5123V)

| Page | Content |
|------|---------|
| 8–10 | Battery distribution, key switch (63) |
| 20 | Cranking · start relay 387 · crank 661 |
| 44 | Hydraulic brakes (option 004040) |
| 50 | Fuel filter / heater / WIF |
| 70 | Module power & ground · 662 |
| 76–78 | Fuse chart, dash connector (2) |
| 80 | Electronic engine dash connector (3) |
| 87–89 | CEC 379, start relay 387 |
| 101–104 | Neutral 615, heater 431, 661/662 |

Wire **ground** circuits are **white** in the book.

---

## Full app scaffold (3D shop + ZoomStage)

```bash
npm install
npm run dev
```

- `ZoomStage` uses `touch-action: none` + `{ passive: false }` touch listeners so **one-finger pan works on phones**
- `ShopCanvas` uses `flex: 1; min-height: 0` and a full-size canvas so the 3D view fills the screen

---

## License / manual

Application code in this repo: use freely for your bus.  
**CTS-5123V** diagrams remain International / Navistar property — keep your own copy of the PDF locally; do not redistribute the manual from this repository.
