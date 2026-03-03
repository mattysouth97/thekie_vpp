import type { Ref } from "vue";

export interface Facility {
  id: string;
  name: string;
  type: string;      // "farm" | "rooftop" | "battery" | "consumer" | "inverter" | "grid"
  subtype?: string;  // "factory" | "datacenter"
  status: string;    // "online" | "offline" | "standby"
  output: number;
  eff: number;
  panels: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  capacity?: number; // rated MW capacity
  soc?: number;      // battery state of charge 0–100
  region?: string;   // 시/도 (e.g. "경기도", "서울특별시")
  city?: string;     // 시/군/구 (e.g. "용인시", "서초구")
}

// ─── Color palette ───────────────────────────────────────────────────────────
const P = {
  // Ground / terrain
  groundBare:    "#c8a040",   // vivid golden sand
  groundGrass:   "#3a8e20",   // saturated grass green
  farmBorder:    "#1e6810",   // dark green fence
  // PV panels
  panelCell:     "#081428",   // very deep navy
  panelCellOff:  "#3a4a58",
  panelFrame:    "#8aaac0",   // bright silver-blue
  // Rooftop building
  roofConcrete:  "#e0dac8",   // warm cream roof
  roofEdge:      "#a09880",
  hvacUnit:      "#808e90",   // more contrast HVAC
  skylight:      "#48b0e8",   // vivid sky blue
  // Factory
  factoryRoof:   "#687870",   // dark industrial metal
  factoryStripe: "#90a8a0",   // bright corrugation highlight
  loadingDock:   "#384848",   // dark dock bay
  parkingAsph:   "#505858",
  // Data center
  dcRoof:        "#90a8c0",   // blue-grey roof
  dcCooling:     "#2088c0",   // strong cooling tower blue
  dcRaisedFloor: "#b8d0e0",   // cool blue raised floor
  // ESS container
  essContainer:  "#d8e8f0",   // cool white container
  essStripe:     "#9ab8c8",
  essDoor:       "#3c5870",   // dark end door
  // Grid substation
  gridYard:      "#80c870",   // vivid yard green
  gridTransf:    "#181e28",   // near-black transformer
  gridBusbar:    "#40c880",   // vivid green busbar
  // Connections
  connActive:    "#2ecc71",
  connPower:     "rgba(46,204,113,0.95)",
};

// ─── Facility data ────────────────────────────────────────────────────────────
export const FACILITIES_DATA: Facility[] = [
  // 태양광 발전소 — 상단 (y ≈ 60–180), 용량에 따라 크기 결정
  {
    id: "SF-001", name: "태양광 발전소 1호",  type: "farm",    status: "online",
    output: 8.4, capacity: 10.0, eff: 91, panels: 480,
    x: 50,  y: 60,  w: 160, h: 120, color: "#4a9fd4",
    region: "경기도", city: "용인시",
  },
  {
    id: "SF-002", name: "태양광 발전소 2호",  type: "farm",    status: "online",
    output: 6.2, capacity: 8.0,  eff: 87, panels: 360,
    x: 260, y: 70,  w: 136, h: 104, color: "#4a9fd4",
    region: "충청북도", city: "음성군",
  },
  {
    id: "SF-003", name: "옥상 태양광 A동",   type: "rooftop", status: "online",
    output: 1.8, capacity: 2.5,  eff: 84, panels: 120,
    x: 450, y: 70,  w: 76,  h: 56,  color: "#5ba8dc",
    region: "서울특별시", city: "서초구",
  },
  {
    id: "SF-004", name: "옥상 태양광 B동",   type: "rooftop", status: "standby",
    output: 0.4, capacity: 1.0,  eff: 62, panels: 80,
    x: 575, y: 78,  w: 56,  h: 44,  color: "#5ba8dc",
    region: "서울특별시", city: "서초구",
  },

  // 인버터 허브 — 중간 (y ≈ 230)
  {
    id: "IN-001", name: "인버터 허브",       type: "inverter", status: "online",
    output: 0, capacity: 20, eff: 98, panels: 0,
    x: 320, y: 230, w: 68,  h: 54,  color: "#9b7fd4",
    region: "경기도", city: "안양시",
  },

  // 에너지 저장장치 — 우측 중앙
  {
    id: "BS-001", name: "ESS 1호기",         type: "battery", status: "online",
    output: -2.1, capacity: 4.0, eff: 96, panels: 0,
    x: 500, y: 220, w: 112, h: 68, soc: 72, color: "#f5c842",
    region: "경기도", city: "화성시",
  },
  {
    id: "BS-002", name: "ESS 2호기",         type: "battery", status: "offline",
    output: 0, capacity: 4.0, eff: 0, panels: 0,
    x: 500, y: 320, w: 112, h: 68, soc: 10, color: "#e08030",
    region: "경기도", city: "화성시",
  },

  // 계통 변전소 — 우측
  {
    id: "GS-001", name: "북부 계통 변전소",  type: "grid",    status: "online",
    output: 0, capacity: 0, eff: 100, panels: 0,
    x: 700, y: 240, w: 90,  h: 72,  color: "#7ec8a0",
    region: "서울특별시", city: "도봉구",
  },

  // 수요처 — 하단 (y ≈ 370)
  {
    id: "FC-001", name: "산업단지 공장",     type: "consumer", subtype: "factory",
    status: "online", output: -9.2, capacity: 0, eff: 0, panels: 0,
    x: 70,  y: 375, w: 148, h: 104, color: "#8a9fa0",
    region: "경기도", city: "안산시",
  },
  {
    id: "DC-001", name: "데이터 센터",       type: "consumer", subtype: "datacenter",
    status: "online", output: -5.8, capacity: 0, eff: 0, panels: 0,
    x: 280, y: 380, w: 128, h: 96,  color: "#8a9fa0",
    region: "경기도", city: "성남시",
  },
];

export const CONNECTIONS_DATA: [string, string][] = [
  ["SF-001", "IN-001"],
  ["SF-002", "IN-001"],
  ["SF-003", "IN-001"],
  ["IN-001", "GS-001"],
  ["IN-001", "BS-001"],
  ["IN-001", "FC-001"],
  ["BS-001", "DC-001"],
  ["GS-001", "DC-001"],
  ["GS-001", "FC-001"],
];

// ─── Composable ──────────────────────────────────────────────────────────────
export function useSolarFacilityCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  wrapRef: Ref<HTMLElement | null>,
  selectedId: Ref<string | null>,
  showPowerLayer: Ref<boolean>,
  tooltip: Ref<{ show: boolean; x: number; y: number; f: Facility | null }>
) {
  let ctx: CanvasRenderingContext2D | null = null;
  let W = 0, H = 0;
  let scale = 1, offsetX = 60, offsetY = 40;
  let isDragging = false, dragStart = { x: 0, y: 0 }, dragOffset = { x: 0, y: 0 };
  let hoveredFacility: string | null = null;
  const facilities = FACILITIES_DATA;
  const connections = CONNECTIONS_DATA;
  const ids: Record<string, Facility> = {};
  facilities.forEach((f) => (ids[f.id] = f));

  // Flow animation state
  const FLOW_SPEED = 0.22;
  const DOT_SPACING = 30;
  const flowOffsets: Record<string, number> = {};
  let lastAnimTime = 0;
  const ANIM_INTERVAL_MS = 50; // 20 fps animation tick
  let rafId = 0;

  // ── Coordinate helpers ──────────────────────────────────────────────────────
  function toScreen(x: number, y: number) {
    return { x: x * scale + offsetX, y: y * scale + offsetY };
  }
  function toWorld(sx: number, sy: number) {
    return { x: (sx - offsetX) / scale, y: (sy - offsetY) / scale };
  }
  function facilityCenter(f: Facility) {
    return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
  }

  // ── Utility: rounded rect path ──────────────────────────────────────────────
  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAWING FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Ground-mounted solar farm ───────────────────────────────────────────────
  function drawGroundMountedSolarFarm(
    x: number, y: number, w: number, h: number,
    isOnline: boolean, isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    // 1. Sandy perimeter ground
    ctx.fillStyle = P.groundBare;
    roundRect(x, y, w, h, 6);
    ctx.fill();

    // 2. Access road — bottom 8% strip
    const roadH = Math.max(6, Math.round(h * 0.08));
    ctx.fillStyle = "#9a9080";
    ctx.fillRect(x + 4, y + h - roadH - 2, w - 8, roadH);
    // Road dashed centerline
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(x + 8,     y + h - roadH / 2 - 2);
    ctx.lineTo(x + w - 8, y + h - roadH / 2 - 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Panel rows
    const areaX = x + 5;
    const areaY = y + 4;
    const areaW = w - 10;
    const areaH = h - roadH - 10;

    const numRows = Math.max(3, Math.floor(areaH / 13));
    const pitch = areaH / numRows;
    const grassH = pitch * 0.55;
    const stripH = pitch * 0.45;
    const numCols = Math.max(4, Math.floor(areaW / 16));
    const colW = areaW / numCols;
    const frame = 0.8;

    for (let row = 0; row < numRows; row++) {
      const sy = areaY + row * pitch;

      // Grass gap
      ctx.fillStyle = P.groundGrass;
      ctx.fillRect(areaX, sy, areaW, grassH);

      // Panel strip frame background
      const panelY = sy + grassH;
      ctx.fillStyle = P.panelFrame;
      ctx.fillRect(areaX, panelY, areaW, stripH);

      // Individual PV cells
      for (let col = 0; col < numCols; col++) {
        const cx = areaX + col * colW + frame;
        const cy = panelY + frame;
        const cw = colW - frame * 2;
        const ch = stripH - frame * 2;

        // Cell body
        ctx.fillStyle = isOnline ? P.panelCell : P.panelCellOff;
        ctx.fillRect(cx, cy, cw, ch);

        // Horizontal bus-bar at mid-height
        if (ch > 4) {
          ctx.strokeStyle = "rgba(120,200,255,0.28)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx,      cy + ch / 2);
          ctx.lineTo(cx + cw, cy + ch / 2);
          ctx.stroke();
        }

        // Vertical bus-bar at mid-width
        if (cw > 6) {
          ctx.strokeStyle = "rgba(120,200,255,0.18)";
          ctx.beginPath();
          ctx.moveTo(cx + cw / 2, cy);
          ctx.lineTo(cx + cw / 2, cy + ch);
          ctx.stroke();
        }
      }
    }

    // 4. Specular sheen — NW→SE diagonal gradient (online only)
    if (isOnline) {
      const sheen = ctx.createLinearGradient(x, y, x + w * 0.65, y + h * 0.65);
      sheen.addColorStop(0,   "rgba(200,240,255,0.38)");
      sheen.addColorStop(0.45,"rgba(160,220,255,0.14)");
      sheen.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = sheen;
      roundRect(x, y, w, h, 6);
      ctx.fill();
    }

    // 5. Perimeter border
    ctx.strokeStyle = isSelected ? P.connActive
                    : isHovered  ? "#6ab0d0"
                    :              P.farmBorder;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 6);
    ctx.stroke();
  }

  // ── Rooftop solar (differentiated — shows building context) ─────────────────
  function drawRooftopSolar(
    x: number, y: number, w: number, h: number,
    isOnline: boolean, isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    // 1. Flat concrete roof base
    ctx.fillStyle = P.roofConcrete;
    roundRect(x, y, w, h, 4);
    ctx.fill();

    // 2. Parapet wall illusion — inset shadow band
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 3;
    roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 3);
    ctx.stroke();

    // 3. HVAC units — top-right corner cluster
    const hvac = Math.max(6, Math.min(11, w * 0.12));
    const hvacPositions = [
      { rx: w - hvac * 2.6, ry: 5 },
      { rx: w - hvac * 1.2, ry: 5 },
    ];
    for (const hp of hvacPositions) {
      ctx.fillStyle = P.hvacUnit;
      ctx.fillRect(x + hp.rx, y + hp.ry, hvac, hvac);
      // Grill lines
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 0.5;
      for (let gi = 1; gi < 3; gi++) {
        ctx.beginPath();
        ctx.moveTo(x + hp.rx,        y + hp.ry + (hvac / 3) * gi);
        ctx.lineTo(x + hp.rx + hvac, y + hp.ry + (hvac / 3) * gi);
        ctx.stroke();
      }
    }

    // 4. Skylight
    const skW = Math.max(8, w * 0.22);
    const skH = Math.max(5, h * 0.16);
    ctx.fillStyle = P.skylight;
    ctx.globalAlpha = 0.65;
    ctx.fillRect(x + w * 0.28, y + h * 0.22, skW, skH);
    ctx.globalAlpha = 1;

    // 5. Solar panel array — south 55% of roof
    const pAreaX = x + 4;
    const pAreaY = y + h * 0.38;
    const pAreaW = w - 8;
    const pAreaH = h * 0.54;
    const pRows = Math.max(2, Math.floor(pAreaH / 10));
    const pCols = Math.max(2, Math.floor(pAreaW / 12));
    const pW = pAreaW / pCols;
    const pH = pAreaH / pRows;

    for (let pr = 0; pr < pRows; pr++) {
      for (let pc = 0; pc < pCols; pc++) {
        const px = pAreaX + pc * pW + 0.5;
        const py = pAreaY + pr * pH + 0.5;

        // Tilt shadow 1px SE
        ctx.fillStyle = "rgba(0,0,0,0.14)";
        ctx.fillRect(px + 1, py + 1, pW - 1.5, pH - 1.5);

        // Panel body
        ctx.fillStyle = isOnline ? P.panelCell : "#6a7880";
        ctx.fillRect(px, py, pW - 1.5, pH - 1.5);

        // Frame
        ctx.strokeStyle = P.panelFrame;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, pW - 1.5, pH - 1.5);

        // Bus-bars
        if (pH > 6) {
          ctx.strokeStyle = "rgba(255,255,255,0.10)";
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(px,           py + (pH - 1.5) / 2);
          ctx.lineTo(px + pW - 1.5, py + (pH - 1.5) / 2);
          ctx.stroke();
        }

        // Reflection sheen
        if (isOnline) {
          const sg = ctx.createLinearGradient(px, py, px + (pW - 1.5) * 0.55, py + (pH - 1.5) * 0.55);
          sg.addColorStop(0, "rgba(180,230,255,0.42)");
          sg.addColorStop(0.5, "rgba(140,210,255,0.12)");
          sg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(px, py, pW - 1.5, pH - 1.5);
        }
      }
    }

    // 6. Border — grey tone (key differentiator from ground farm green fence)
    ctx.strokeStyle = isSelected ? P.connActive
                    : isHovered  ? "#6ab0d0"
                    :              P.roofEdge;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 4);
    ctx.stroke();
  }

  // ── Industrial factory (top-down) ────────────────────────────────────────────
  function drawFactoryTopDown(
    x: number, y: number, w: number, h: number,
    isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    // 1. Corrugated metal roof base
    ctx.fillStyle = P.factoryRoof;
    roundRect(x, y, w, h, 4);
    ctx.fill();

    // 2. Corrugation stripes — alternating lighter vertical bands
    const stripeW = Math.max(5, w / 14);
    ctx.fillStyle = P.factoryStripe;
    for (let sx = x + stripeW; sx < x + w - 2; sx += stripeW * 2) {
      ctx.fillRect(sx, y + 2, stripeW, h - 4);
    }

    // 3. Roof vents / skylights across top portion
    const ventH = Math.max(5, h * 0.10);
    const ventW = Math.max(8, w * 0.08);
    const ventPositions = [0.22, 0.50, 0.78];
    for (const vp of ventPositions) {
      ctx.fillStyle = P.skylight;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x + w * vp - ventW / 2, y + h * 0.28, ventW, ventH);
      ctx.globalAlpha = 1;
    }

    // 4. Loading dock bays — south wall
    const dockW = Math.max(14, w / 5.5);
    const dockH = Math.max(8, h * 0.14);
    const numDocks = Math.max(2, Math.floor((w - 18) / (dockW + 7)));
    const dockStartX = x + (w - numDocks * (dockW + 7) + 7) / 2;
    for (let d = 0; d < numDocks; d++) {
      const dx = dockStartX + d * (dockW + 7);
      ctx.fillStyle = P.loadingDock;
      ctx.fillRect(dx, y + h - dockH, dockW, dockH);
      // Dock door line
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx,          y + h - dockH);
      ctx.lineTo(dx + dockW,  y + h - dockH);
      ctx.stroke();
    }

    // 5. Parking area below building
    const parkH = Math.max(7, h * 0.10);
    ctx.fillStyle = P.parkingAsph;
    ctx.globalAlpha = 0.38;
    ctx.fillRect(x + 2, y + h, w - 4, parkH);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 0.5;
    const stallW = Math.max(9, w / 8);
    for (let ps = x + 6; ps < x + w - 4; ps += stallW) {
      ctx.beginPath();
      ctx.moveTo(ps, y + h);
      ctx.lineTo(ps, y + h + parkH);
      ctx.stroke();
    }

    // 6. Border
    ctx.strokeStyle = isSelected ? P.connActive
                    : isHovered  ? "#a0b4b0"
                    :              "#7a8c88";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 4);
    ctx.stroke();
  }

  // ── Data center (top-down) ────────────────────────────────────────────────────
  function drawDataCenterTopDown(
    x: number, y: number, w: number, h: number,
    isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    // 1. Smooth flat roof
    ctx.fillStyle = P.dcRoof;
    roundRect(x, y, w, h, 4);
    ctx.fill();

    // 2. Raised floor inset area
    const inset = 7;
    const innerH = h - inset * 2 - h * 0.22;
    ctx.fillStyle = P.dcRaisedFloor;
    ctx.fillRect(x + inset, y + inset, w - inset * 2, innerH);

    // 3. Server row indicator lines
    ctx.strokeStyle = "rgba(100,120,130,0.25)";
    ctx.lineWidth = 1;
    const rowCount = 5;
    const rowSpacing = innerH / (rowCount + 1);
    for (let sr = 1; sr <= rowCount; sr++) {
      ctx.beginPath();
      ctx.moveTo(x + inset + 2,       y + inset + rowSpacing * sr);
      ctx.lineTo(x + w - inset - 2,   y + inset + rowSpacing * sr);
      ctx.stroke();
    }

    // 4. Cooling tower cluster — south portion
    const ctAreaY = y + h - h * 0.20 - 4;
    const ctH = Math.max(10, h * 0.18);
    const ctW = Math.max(12, w * 0.18);
    const numCT = Math.max(2, Math.floor((w - 16) / (ctW + 6)));
    const ctStartX = x + (w - numCT * (ctW + 6) + 6) / 2;
    for (let c = 0; c < numCT; c++) {
      const cx = ctStartX + c * (ctW + 6);
      ctx.fillStyle = P.dcCooling;
      ctx.fillRect(cx, ctAreaY, ctW, ctH);
      // Fan circle inside
      ctx.strokeStyle = "rgba(255,255,255,0.40)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx + ctW / 2, ctAreaY + ctH / 2, Math.min(ctW, ctH) * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      // Fan cross
      ctx.beginPath();
      const r = Math.min(ctW, ctH) * 0.32;
      ctx.moveTo(cx + ctW / 2 - r, ctAreaY + ctH / 2);
      ctx.lineTo(cx + ctW / 2 + r, ctAreaY + ctH / 2);
      ctx.moveTo(cx + ctW / 2, ctAreaY + ctH / 2 - r);
      ctx.lineTo(cx + ctW / 2, ctAreaY + ctH / 2 + r);
      ctx.stroke();
    }

    // 5. Border
    ctx.strokeStyle = isSelected ? P.connActive
                    : isHovered  ? "#a0b8c0"
                    :              "#7a9098";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 4);
    ctx.stroke();
  }

  // ── ESS battery containers (top-down) ────────────────────────────────────────
  function drawBatteryContainerTopDown(
    x: number, y: number, w: number, h: number,
    soc: number, isOnline: boolean, isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    const numContainers = Math.max(2, Math.floor(w / 48));
    const gap = 2;
    const containerW = (w - gap) / numContainers;

    for (let c = 0; c < numContainers; c++) {
      const cx = x + c * containerW + (c > 0 ? gap : 0);
      const cw = containerW - (c > 0 ? gap : 0);
      const ch = h;

      // Container body
      ctx.fillStyle = isOnline ? P.essContainer : "#c0c8c4";
      ctx.fillRect(cx, y, cw, ch);

      // Longitudinal seam lines
      ctx.strokeStyle = P.essStripe;
      ctx.lineWidth = 0.5;
      const s1 = y + ch * 0.28;
      const s2 = y + ch * 0.72;
      ctx.beginPath();
      ctx.moveTo(cx, s1); ctx.lineTo(cx + cw, s1);
      ctx.moveTo(cx, s2); ctx.lineTo(cx + cw, s2);
      ctx.stroke();

      // End door (right side — darker strip)
      ctx.fillStyle = P.essDoor;
      ctx.fillRect(cx + cw - 6, y, 6, ch);

      // Charge level bar — bottom 5px, colour-coded
      const chargeColor = !isOnline ? "#888888"
        : soc > 60 ? "#2ecc71"
        : soc > 30 ? "#f5c842"
        :            "#e74c3c";
      ctx.fillStyle = chargeColor;
      ctx.globalAlpha = 0.78;
      ctx.fillRect(cx, y + ch - 5, (cw - 6) * (soc / 100), 4);
      ctx.globalAlpha = 1;

      // Container outline
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(cx, y, cw, ch);
    }

    // Overall border
    ctx.strokeStyle = isSelected  ? P.connActive
                    : isHovered   ? "#d0b840"
                    : isOnline    ? "#b09020"
                    :               "#b04040";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 3);
    ctx.stroke();
  }

  // ── Grid substation (top-down) ────────────────────────────────────────────────
  function drawGridSubstationTopDown(
    x: number, y: number, w: number, h: number,
    isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    // 1. Gravelled yard
    ctx.fillStyle = P.gridYard;
    roundRect(x, y, w, h, 4);
    ctx.fill();

    // 2. Dotted inner fence
    ctx.save();
    ctx.strokeStyle = "rgba(60,90,70,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    ctx.setLineDash([]);
    ctx.restore();

    // 3. Transformer housings
    const tW = Math.max(14, w * 0.22);
    const tH = Math.max(12, h * 0.32);
    const tY  = y + h * 0.24;
    const t1X = x + w * 0.16;
    const t2X = x + w * 0.60;

    for (const tx of [t1X, t2X]) {
      ctx.fillStyle = P.gridTransf;
      ctx.fillRect(tx, tY, tW, tH);
      // Cooling fins
      ctx.strokeStyle = "rgba(160,190,170,0.45)";
      ctx.lineWidth = 0.5;
      for (let fi = 1; fi < 4; fi++) {
        ctx.beginPath();
        ctx.moveTo(tx,      tY + (tH / 4) * fi);
        ctx.lineTo(tx + tW, tY + (tH / 4) * fi);
        ctx.stroke();
      }
    }

    // 4. Horizontal busbar + vertical drops
    const busY = tY - 5;
    ctx.strokeStyle = P.gridBusbar;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(t1X + tW / 2, busY);
    ctx.lineTo(t2X + tW / 2, busY);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(t1X + tW / 2, busY); ctx.lineTo(t1X + tW / 2, tY);
    ctx.moveTo(t2X + tW / 2, busY); ctx.lineTo(t2X + tW / 2, tY);
    ctx.stroke();

    // 5. Label
    ctx.fillStyle = "#2a4030";
    ctx.font = `bold ${Math.max(7, 8)}px "DM Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("GRID", x + w / 2, y + h - 5);

    // 6. Border
    ctx.strokeStyle = isSelected ? P.connActive
                    : isHovered  ? "#60b080"
                    :              "#4a9060";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 4);
    ctx.stroke();
  }

  // ── Inverter station ──────────────────────────────────────────────────────────
  function drawInverterStation(
    x: number, y: number, w: number, h: number,
    isSelected: boolean, isHovered: boolean
  ) {
    if (!ctx) return;

    // 1. Cabinet body with L→R gradient
    const bodyGrad = ctx.createLinearGradient(x, y, x + w, y);
    bodyGrad.addColorStop(0,   "#e0d8f0");
    bodyGrad.addColorStop(0.45, "#ede8f8");
    bodyGrad.addColorStop(1,   "#cec8e0");
    ctx.fillStyle = bodyGrad;
    roundRect(x, y, w, h, 6);
    ctx.fill();

    // 2. Ventilation grill — center horizontal band
    const grillX   = x + w * 0.12;
    const grillW   = w * 0.76;
    const grillTop = y + h * 0.22;
    const grillBot = y + h * 0.72;
    const lineGap  = Math.max(2, (grillBot - grillTop) / 5);
    ctx.strokeStyle = "#c8c0d8";
    ctx.lineWidth = 1;
    for (let gy = grillTop; gy < grillBot; gy += lineGap) {
      ctx.beginPath();
      ctx.moveTo(grillX,          gy);
      ctx.lineTo(grillX + grillW, gy);
      ctx.stroke();
    }

    // 3. Status LED — bottom centre with glow
    ctx.save();
    ctx.fillStyle = "#2ecc71";
    ctx.shadowColor = "rgba(46,204,113,0.65)";
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Border
    ctx.strokeStyle = isSelected ? P.connActive
                    : isHovered  ? "#a080e0"
                    :              "#8060c0";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    roundRect(x, y, w, h, 6);
    ctx.stroke();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORTHOGONAL CONNECTION ROUTER
  // ═══════════════════════════════════════════════════════════════════════════

  type EdgeDir = "top" | "bottom" | "left" | "right";

  interface EdgePoint { x: number; y: number; edge: EdgeDir }
  interface Seg       { x1: number; y1: number; x2: number; y2: number }

  function getExitPoint(from: Facility, to: Facility): EdgePoint {
    const fc = facilityCenter(from);
    const tc = facilityCenter(to);
    const dx = tc.x - fc.x;
    const dy = tc.y - fc.y;
    const margin = 10;
    if (Math.abs(dy) > Math.abs(dx) * 0.7) {
      if (dy > 0) return { x: fc.x, y: from.y + from.h + margin, edge: "bottom" };
      else         return { x: fc.x, y: from.y - margin,          edge: "top" };
    } else {
      if (dx > 0) return { x: from.x + from.w + margin, y: fc.y, edge: "right" };
      else         return { x: from.x - margin,          y: fc.y, edge: "left" };
    }
  }

  function getEntryPoint(to: Facility, exitEdge: EdgeDir): EdgePoint {
    const tc = facilityCenter(to);
    const margin = 10;
    switch (exitEdge) {
      case "bottom": return { x: tc.x, y: to.y - margin,          edge: "top" };
      case "top":    return { x: tc.x, y: to.y + to.h + margin,   edge: "bottom" };
      case "right":  return { x: to.x - margin,          y: tc.y, edge: "left" };
      case "left":   return { x: to.x + to.w + margin,   y: tc.y, edge: "right" };
    }
  }

  function buildOrthoPath(exit: EdgePoint, entry: EdgePoint): Seg[] {
    const segs: Seg[] = [];
    const ALIGNED = 3;

    if (exit.edge === "bottom" || exit.edge === "top") {
      if (Math.abs(exit.x - entry.x) < ALIGNED) {
        segs.push({ x1: exit.x,  y1: exit.y,  x2: entry.x, y2: entry.y });
      } else {
        const midY = (exit.y + entry.y) / 2;
        segs.push({ x1: exit.x,  y1: exit.y,  x2: exit.x,  y2: midY });
        segs.push({ x1: exit.x,  y1: midY,    x2: entry.x, y2: midY });
        segs.push({ x1: entry.x, y1: midY,    x2: entry.x, y2: entry.y });
      }
    } else {
      if (Math.abs(exit.y - entry.y) < ALIGNED) {
        segs.push({ x1: exit.x,  y1: exit.y,  x2: entry.x, y2: entry.y });
      } else {
        const midX = (exit.x + entry.x) / 2;
        segs.push({ x1: exit.x, y1: exit.y,  x2: midX,    y2: exit.y });
        segs.push({ x1: midX,   y1: exit.y,  x2: midX,    y2: entry.y });
        segs.push({ x1: midX,   y1: entry.y, x2: entry.x, y2: entry.y });
      }
    }
    return segs;
  }

  function toScreenSeg(s: Seg): Seg {
    const a = toScreen(s.x1, s.y1);
    const b = toScreen(s.x2, s.y2);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }

  function drawArrowhead(x: number, y: number, angle: number, color: string) {
    if (!ctx) return;
    const sz = 7 * Math.min(scale, 1.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-sz, -sz * 0.42);
    ctx.lineTo(-sz * 0.55, 0);
    ctx.lineTo(-sz, sz * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function updateFlowOffsets() {
    connections.forEach(([fromId, toId]) => {
      const from = ids[fromId], to = ids[toId];
      if (!from || !to) return;
      const isActive = from.status === "online" && to.status === "online"
                    && (from.output > 0 || to.output !== 0 || from.type === "grid" || to.type === "grid");
      if (isActive) {
        const key = `${fromId}-${toId}`;
        if (flowOffsets[key] === undefined) flowOffsets[key] = 0;
        flowOffsets[key] = (flowOffsets[key] + FLOW_SPEED) % DOT_SPACING;
      }
    });
  }

  function drawOrthoConnections() {
    if (!ctx) return;
    connections.forEach(([fromId, toId]) => {
      const from = ids[fromId], to = ids[toId];
      if (!from || !to) return;
      const isActive = from.status === "online" && to.status === "online"
                    && (from.output > 0 || to.output !== 0 || from.type === "grid" || to.type === "grid");

      const exitW  = getExitPoint(from, to);
      const entryW = getEntryPoint(to, exitW.edge);
      const segsW  = buildOrthoPath(exitW, entryW);
      const segsS  = segsW.map(toScreenSeg);

      // Base line (all segments)
      ctx.strokeStyle = isActive ? "rgba(46,204,113,0.60)" : "rgba(110,140,125,0.45)";
      ctx.lineWidth = 2.5 * Math.min(scale, 1.5);
      ctx.lineJoin = "miter";
      ctx.beginPath();
      ctx.moveTo(segsS[0].x1, segsS[0].y1);
      for (const seg of segsS) {
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();

      // Arrowhead at final endpoint
      const last = segsS[segsS.length - 1];
      const angle = Math.atan2(last.y2 - last.y1, last.x2 - last.x1);
      const arrowColor = isActive ? "rgba(46,204,113,0.98)" : "rgba(100,130,115,0.65)";
      drawArrowhead(last.x2, last.y2, angle, arrowColor);

      // Flow dot animation (power layer)
      if (isActive && showPowerLayer.value) {
        const key = `${fromId}-${toId}`;
        const offset = flowOffsets[key] ?? 0;

        // Total screen-space path length
        const totalLen = segsS.reduce((acc, s) =>
          acc + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0);

        let distAccum = offset;
        while (distAccum < totalLen) {
          let remainDist = distAccum;
          for (const seg of segsS) {
            const segLen = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
            if (remainDist <= segLen + 0.001) {
              const t = segLen > 0 ? Math.min(remainDist / segLen, 1) : 0;
              const dotX = seg.x1 + (seg.x2 - seg.x1) * t;
              const dotY = seg.y1 + (seg.y2 - seg.y1) * t;
              ctx.save();
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = "rgba(46,204,113,0.9)";
              ctx.shadowBlur = 5;
              ctx.beginPath();
              ctx.arc(dotX, dotY, 2.5 * Math.min(scale, 1.4), 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
              break;
            }
            remainDist -= segLen;
          }
          distAccum += DOT_SPACING;
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FACILITY DISPATCHER
  // ═══════════════════════════════════════════════════════════════════════════

  function drawFacility(f: Facility) {
    if (!ctx) return;
    const s = toScreen(f.x, f.y);
    const sw = f.w * scale;
    const sh = f.h * scale;
    const isHovered  = hoveredFacility === f.id;
    const isSelected = selectedId.value === f.id;

    ctx.save();
    if (isHovered || isSelected) {
      ctx.shadowColor = f.status === "online" ? "rgba(46,204,113,0.5)" : "rgba(231,76,60,0.4)";
      ctx.shadowBlur = 20;
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.14)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
    }

    switch (f.type) {
      case "farm":
        drawGroundMountedSolarFarm(s.x, s.y, sw, sh, f.status === "online", isSelected, isHovered);
        break;
      case "rooftop":
        drawRooftopSolar(s.x, s.y, sw, sh, f.status === "online", isSelected, isHovered);
        break;
      case "battery":
        drawBatteryContainerTopDown(s.x, s.y, sw, sh, f.soc ?? 50, f.status === "online", isSelected, isHovered);
        break;
      case "consumer":
        if (f.subtype === "datacenter") {
          drawDataCenterTopDown(s.x, s.y, sw, sh, isSelected, isHovered);
        } else {
          drawFactoryTopDown(s.x, s.y, sw, sh, isSelected, isHovered);
        }
        break;
      case "inverter":
        drawInverterStation(s.x, s.y, sw, sh, isSelected, isHovered);
        break;
      case "grid":
        drawGridSubstationTopDown(s.x, s.y, sw, sh, isSelected, isHovered);
        break;
    }

    ctx.restore();

    // Status dot
    const dotColor = f.status === "online"  ? "#2ecc71"
                   : f.status === "standby" ? "#f5c842"
                   :                          "#e74c3c";
    ctx.save();
    ctx.shadowColor = dotColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(s.x + sw - 8, s.y + 8, 4 * Math.min(scale, 1.4), 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    ctx.restore();

    // Labels
    if (scale > 0.7) {
      ctx.fillStyle = "#1a2420";
      ctx.font = `600 ${10 * scale}px "DM Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(f.id, s.x + sw / 2, s.y + sh + 13 * scale);
      if (scale > 0.9 && f.output !== 0) {
        ctx.fillStyle = f.output > 0 ? "#2ecc71" : "#e74c3c";
        ctx.font = `${9 * scale}px "Space Mono", monospace`;
        ctx.fillText(
          (f.output > 0 ? "+" : "") + f.output.toFixed(1) + " MW",
          s.x + sw / 2, s.y + sh + 23 * scale
        );
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUND + MAIN DRAW
  // ═══════════════════════════════════════════════════════════════════════════

  function drawBackground() {
    if (!ctx) return;
    // Terrain gradient — warm daylight aerial view
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   "#ccd8c0");   // cool sky-reflected green top
    bg.addColorStop(0.4, "#d8d8b8");   // warm sandy middle
    bg.addColorStop(1,   "#c8c8a8");   // earthy bottom
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid overlay
    ctx.strokeStyle = "rgba(80,100,60,0.18)";
    ctx.lineWidth = 0.5;
    const gridSize = 40 * scale;
    const startX = offsetX % gridSize;
    const startY = offsetY % gridSize;
    for (let x = startX; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = startY; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function draw() {
    if (!ctx || !W || !H) return;
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawOrthoConnections();
    facilities.forEach(drawFacility);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HIT TESTING + EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  function getHitFacility(sx: number, sy: number): Facility | null {
    const w = toWorld(sx, sy);
    for (let i = facilities.length - 1; i >= 0; i--) {
      const f = facilities[i];
      if (w.x >= f.x && w.x <= f.x + f.w && w.y >= f.y && w.y <= f.y + f.h) return f;
    }
    return null;
  }

  function resize() {
    const canvas = canvasRef.value;
    const wrap   = wrapRef.value;
    if (!canvas || !wrap) return;
    ctx = canvas.getContext("2d");
    if (!ctx) return;
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    canvas.width  = W;
    canvas.height = H;
    draw();
  }

  function loop(timestamp: number) {
    if (timestamp - lastAnimTime >= ANIM_INTERVAL_MS) {
      lastAnimTime = timestamp;
      updateFlowOffsets();
    }
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function setupListeners() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    canvas.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (isDragging) {
        offsetX = dragOffset.x + (mx - dragStart.x);
        offsetY = dragOffset.y + (my - dragStart.y);
        draw();
        return;
      }
      const f = getHitFacility(mx, my);
      hoveredFacility = f ? f.id : null;
      canvas.style.cursor = f ? "pointer" : "grab";
      if (f) {
        const s = toScreen(f.x, f.y);
        let tx = s.x + f.w * scale + 12, ty = s.y;
        if (tx + 200 > W) tx = s.x - 210;
        if (ty + 140 > H) ty = H - 140;
        tooltip.value = { show: true, x: tx, y: ty, f };
      } else {
        tooltip.value = { show: false, x: 0, y: 0, f: null };
      }
      draw();
    });

    canvas.addEventListener("mousedown", (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const f = getHitFacility(mx, my);
      if (f) { selectedId.value = f.id; draw(); return; }
      isDragging  = true;
      dragStart   = { x: mx, y: my };
      dragOffset  = { x: offsetX, y: offsetY };
    });

    canvas.addEventListener("mouseup",    () => { isDragging = false; });
    canvas.addEventListener("mouseleave", () => {
      isDragging = false;
      hoveredFacility = null;
      tooltip.value = { show: false, x: 0, y: 0, f: null };
      draw();
    });

    canvas.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const delta = e.deltaY < 0 ? 1.1 : 0.91;
      const wBefore = toWorld(mx, my);
      scale = Math.max(0.3, Math.min(3, scale * delta));
      const wAfter = toWorld(mx, my);
      offsetX += (wAfter.x - wBefore.x) * scale;
      offsetY += (wAfter.y - wBefore.y) * scale;
      draw();
    }, { passive: false });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  function zoom(factor: number) {
    scale = Math.max(0.3, Math.min(3, scale * factor));
    draw();
  }
  function resetView() {
    scale = 1; offsetX = 60; offsetY = 40;
    draw();
  }
  function toggleLayer() {
    showPowerLayer.value = !showPowerLayer.value;
    draw();
  }
  function panToFacility(f: Facility) {
    const sc = facilityCenter(f);
    offsetX = W / 2 - sc.x * scale;
    offsetY = H / 2 - sc.y * scale;
    draw();
  }
  function start() {
    resize();
    rafId = requestAnimationFrame(loop);
    setupListeners();
    window.addEventListener("resize", resize);
  }
  function stop() {
    window.removeEventListener("resize", resize);
    if (rafId) cancelAnimationFrame(rafId);
  }

  return { facilities, start, stop, zoom, resetView, toggleLayer, panToFacility, resize };
}
