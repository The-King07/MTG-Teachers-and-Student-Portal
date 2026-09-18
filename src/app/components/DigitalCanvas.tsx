import { useState, useRef, useEffect } from "react";
import { Paintbrush, Eraser, RotateCcw, Trash2, Check, Sparkles, Download, Layers } from "lucide-react";
import { motion } from "motion/react";

interface DigitalCanvasProps {
  onExportImage: (dataUrl: string) => void;
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#A855F7",
  "#EC4899",
  "#3B82F6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#0F172A",
];

const PRESET_BACKGROUNDS = [
  { name: "Deep Space", color: "#0F172A" },
  { name: "Midnight Black", color: "#05070B" },
  { name: "Cosmic Purple", color: "#1E1035" },
  { name: "Pure White", color: "#FFFFFF" },
];

export function DigitalCanvas({ onExportImage }: DigitalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#A855F7");
  const [brushSize, setBrushSize] = useState(6);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [bgColor, setBgColor] = useState("#0F172A");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [exported, setExported] = useState(false);

  // Initialize Canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  }, [bgColor]);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-10), data]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? bgColor : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 2 : brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = history.slice(0, history.length - 1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onExportImage(dataUrl);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-purple-500/20 bg-[#1E293B]/80 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Paintbrush size={16} />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold">Digital Canvas Studio</h3>
            <p className="text-gray-400 text-xs">Sketch or paint directly to create your post image</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:opacity-90 shadow-lg shadow-purple-500/25 transition-all"
        >
          {exported ? <Check size={14} /> : <Sparkles size={14} />}
          {exported ? "Attached to Post!" : "Use Drawing as Post Image"}
        </button>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-black/40 touch-none flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full max-w-full aspect-[16/10] object-contain cursor-crosshair"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setTool("brush")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === "brush" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Paintbrush size={14} /> Brush
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tool === "eraser" ? "bg-purple-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Eraser size={14} /> Eraser
          </button>
        </div>

        {/* Color presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("brush"); }}
              className={`w-6 h-6 rounded-full border border-white/20 transition-transform ${
                color === c && tool === "brush" ? "scale-125 border-white ring-2 ring-purple-400" : "hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => { setColor(e.target.value); setTool("brush"); }}
            className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 p-0"
          />
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Size:</span>
          <input
            type="range"
            min={2}
            max={40}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-24 accent-purple-500"
          />
          <span className="text-white font-mono w-4">{brushSize}</span>
        </div>

        {/* Canvas Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-red-400 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
