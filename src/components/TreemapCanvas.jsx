import { useRef, useEffect, useState, useCallback } from "react";
import { squarify } from "../utils/treemap";
import { exposureCSS, exposureLabel, formatCrore } from "../utils/colors";

const GAP = 1.5;
const MARGIN = 8;

export default function TreemapCanvas({
  data,
  selectedIndustry,
  setSelectedIndustry,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [rects, setRects] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const rectsRef = useRef([]);

  // Build treemap layout
  const buildLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const catList = data.industries
      .map((industry) => ({
        ...industry,
        industry_code: industry.code,
        industry_name: industry.name,
        workers: industry.workers_millions,
        value: industry.workers_millions,
      }))
      .sort((a, b) => b.value - a.value);

    const catRects = squarify(
      catList,
      MARGIN,
      MARGIN,
      w - MARGIN * 2,
      h - MARGIN * 2,
    );
    rectsRef.current = catRects;
    setRects(catRects);
  }, [data]);

  useEffect(() => {
    buildLayout();
    const handleResize = () => buildLayout();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [buildLayout]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.fillStyle = "#0B0B0F";
    ctx.fillRect(0, 0, w, h);

    for (const r of rects) {
      const isHov = r === hovered;
      const isSelected = selectedIndustry === r.industry_code;
      const isDimmed = selectedIndustry && !isSelected;
      const g = GAP / 2;
      const rx = r.rx + g,
        ry = r.ry + g;
      const rw = r.rw - g * 2,
        rh = r.rh - g * 2;
      if (rw <= 0 || rh <= 0) continue;

      ctx.fillStyle = exposureCSS(
        r.ai_exposure,
        isSelected ? 0.88 : isDimmed ? 0.28 : isHov ? 0.85 : 0.55,
      );
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 3);
      ctx.fill();

      if (isHov || isSelected) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = isSelected ? 2.5 : 2;
        ctx.stroke();
      }

      // Labels
      if (rw > 45 && rh > 16) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx + 4, ry + 2, rw - 8, rh - 4);
        ctx.clip();

        const fontSize = Math.min(12, Math.max(8, Math.min(rw / 10, rh / 3)));
        ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = isHov ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.textBaseline = "top";

        const label = r.industry_name;
        ctx.fillText(label, rx + 5, ry + 4);

        if (rh > 30 && rw > 55) {
          const sub = `${r.ai_exposure}/10 · ${formatCrore(r.workers)}`;
          ctx.font = `400 ${Math.max(7, fontSize - 2)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = isDimmed
            ? "rgba(255,255,255,0.28)"
            : "rgba(255,255,255,0.5)";
          ctx.fillText(sub, rx + 5, ry + fontSize + 6);
        }

        if (rh > 44 && rw > 55) {
          const info = r.sector;
          ctx.font = `400 ${Math.max(7, fontSize - 3)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = isDimmed
            ? "rgba(255,255,255,0.2)"
            : "rgba(255,255,255,0.35)";
          ctx.fillText(info, rx + 5, ry + fontSize * 2 + 6);
        }

        ctx.restore();
      }
    }
  }, [rects, hovered, selectedIndustry]);

  // Mouse interaction
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = null;
    for (const r of rectsRef.current) {
      if (mx >= r.rx && mx <= r.rx + r.rw && my >= r.ry && my <= r.ry + r.rh) {
        found = r;
        break;
      }
    }

    setHovered(found);
    if (found) {
      canvas.style.cursor = "pointer";
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        cell: found,
      });
    } else {
      canvas.style.cursor = "default";
      setTooltip(null);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!hovered) return;
    setSelectedIndustry((current) =>
      current === hovered.industry_code ? null : hovered.industry_code,
    );
  }, [hovered, setSelectedIndustry]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="block"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHovered(null);
          setTooltip(null);
        }}
        onClick={handleClick}
      />
      {/* Tooltip */}
      {tooltip && <Tooltip x={tooltip.x} y={tooltip.y} cell={tooltip.cell} />}

      {selectedIndustry && (
        <button
          onClick={() => setSelectedIndustry(null)}
          className="absolute top-3 left-3 px-3 py-1.5 text-xs font-medium bg-dark-800/90 border border-white/10 rounded-lg hover:bg-dark-700 transition-all backdrop-blur-sm"
        >
          Clear Focus
        </button>
      )}
    </div>
  );
}

function Tooltip({ x, y, cell }) {
  const left = x + 16;
  const top = y - 10;

  return (
    <div
      className="treemap-tooltip glass-panel p-3 animate-fade-in"
      style={{ left, top, opacity: 1 }}
    >
      <div className="font-semibold text-white text-sm mb-1">
        {cell.industry_name}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="px-2 py-0.5 rounded text-[11px] font-semibold"
          style={{
            background: exposureCSS(cell.ai_exposure, 0.2),
            color: exposureCSS(cell.ai_exposure),
          }}
        >
          AI Exposure: {cell.ai_exposure}/10
        </div>
        <span className="text-[11px] text-gray-500">
          {exposureLabel(cell.ai_exposure)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <span className="text-gray-500">Workers</span>
        <span className="text-right text-gray-300">
          {formatCrore(cell.workers)}
        </span>
        <span className="text-gray-500">Industry</span>
        <span className="text-right text-gray-300">{cell.industry_name}</span>
        <span className="text-gray-500">Sector</span>
        <span className="text-right text-gray-300">{cell.sector}</span>
      </div>
      <div className="text-[10px] text-gray-600 mt-2 border-t border-white/5 pt-1.5">
        Click to focus or clear focus
      </div>
    </div>
  );
}
