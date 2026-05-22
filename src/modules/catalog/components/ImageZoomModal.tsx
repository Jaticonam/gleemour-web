import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";

interface ImageZoomModalProps {
  src: string | null;
  title: string;
  onClose: () => void;
}

export function ImageZoomModal({ src, title, onClose }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const panRef = useRef({ panning: false, startX: 0, startY: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
  }, [src, reset]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !src) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => {
        const next = e.deltaY < 0 ? s * 1.1 : s / 1.1;
        const clamped = Math.max(1, Math.min(next, 5));
        if (clamped === 1) setPos({ x: 0, y: 0 });
        return clamped;
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [src]);

  if (!src) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    panRef.current = { panning: true, startX: e.clientX - pos.x, startY: e.clientY - pos.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!panRef.current.panning) return;
    setPos({ x: e.clientX - panRef.current.startX, y: e.clientY - panRef.current.startY });
  };
  const handleMouseUp = () => { panRef.current.panning = false; };

  return (
    <div
      className="fixed inset-0 z-[2500] bg-foreground/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-opacity duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button className="absolute top-6 right-6 md:top-8 md:right-8 text-primary-foreground/70 hover:text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 p-3 rounded-full backdrop-blur-sm transition-all z-20" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>
      <div className="absolute top-6 left-6 md:top-8 md:left-8 text-primary-foreground/50 flex items-center gap-2 z-20 pointer-events-none">
        <ZoomIn className="w-5 h-5" />
        <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase">Pellizca para acercar</span>
      </div>
      <div ref={containerRef} className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl mt-8">
        <img
          ref={imgRef}
          src={src}
          alt={title}
          className="cursor-grab active:cursor-grabbing max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-75 origin-center"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      </div>
      <h3 className="mt-6 text-center text-primary-foreground font-black tracking-wide text-lg md:text-xl z-20">{title}</h3>
    </div>
  );
}
