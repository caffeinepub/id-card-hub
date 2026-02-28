import { Button } from "@/components/ui/button";
import { CropIcon, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PhotoCropperProps {
  imageSrc: string;
  onCrop: (file: File) => void;
  onCancel: () => void;
}

const ASPECT_RATIO = 3 / 4; // portrait (width / height)
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

export function PhotoCropper({
  imageSrc,
  onCrop,
  onCancel,
}: PhotoCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageLoadedRef = useRef(false);

  // State for pan & zoom
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Drag state (stored in refs to avoid re-render lag)
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);

  // Pinch state
  const lastPinchDist = useRef<number | null>(null);

  // Canvas dimensions and crop frame (computed on layout)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [cropFrame, setCropFrame] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // Compute layout
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = Math.round(w * 0.85);
      setCanvasSize({ w, h });

      // Crop frame: 80% of canvas width, centered, portrait 3:4
      const frameW = Math.round(w * 0.78);
      const frameH = Math.round(frameW / ASPECT_RATIO);
      const frameX = Math.round((w - frameW) / 2);
      const frameY = Math.round((h - frameH) / 2);
      setCropFrame({ x: frameX, y: frameY, w: frameW, h: frameH });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      imageLoadedRef.current = true;

      // Initial zoom: cover the crop frame
      if (cropFrame.w > 0 && cropFrame.h > 0) {
        const scaleX = cropFrame.w / img.naturalWidth;
        const scaleY = cropFrame.h / img.naturalHeight;
        const initZoom = Math.max(scaleX, scaleY);
        const clampedZoom = Math.min(Math.max(initZoom, MIN_ZOOM), MAX_ZOOM);
        setZoom(clampedZoom);
        zoomRef.current = clampedZoom;
        offsetRef.current = { x: 0, y: 0 };
        setOffset({ x: 0, y: 0 });
      }
    };
    img.src = imageSrc;
  }, [imageSrc, cropFrame.w, cropFrame.h]);

  // Auto-fit when crop frame is set
  useEffect(() => {
    const img = imageRef.current;
    if (!img || !imageLoadedRef.current || cropFrame.w === 0) return;
    const scaleX = cropFrame.w / img.naturalWidth;
    const scaleY = cropFrame.h / img.naturalHeight;
    const initZoom = Math.max(scaleX, scaleY);
    const clampedZoom = Math.min(Math.max(initZoom, MIN_ZOOM), MAX_ZOOM);
    setZoom(clampedZoom);
    zoomRef.current = clampedZoom;
    offsetRef.current = { x: 0, y: 0 };
    setOffset({ x: 0, y: 0 });
  }, [cropFrame]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoadedRef.current || !imageRef.current) return;
    const img = imageRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = canvasSize;
    const { x: fx, y: fy, w: fw, h: fh } = cropFrame;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const z = zoomRef.current;

    ctx.clearRect(0, 0, w, h);

    // Draw dark overlay (scrim) over entire canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, w, h);

    // Draw image clipped to crop frame
    ctx.save();
    ctx.beginPath();
    ctx.rect(fx, fy, fw, fh);
    ctx.clip();

    // Image draw position: centered in crop frame + pan offset
    const scaledW = img.naturalWidth * z;
    const scaledH = img.naturalHeight * z;
    const imgX = fx + fw / 2 - scaledW / 2 + ox;
    const imgY = fy + fh / 2 - scaledH / 2 + oy;
    ctx.drawImage(img, imgX, imgY, scaledW, scaledH);
    ctx.restore();

    // Crop frame border
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(fx, fy, fw, fh);

    // Rule-of-thirds grid lines inside crop frame
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1;
    // Vertical lines
    for (let i = 1; i <= 2; i++) {
      const gx = fx + (fw * i) / 3;
      ctx.beginPath();
      ctx.moveTo(gx, fy);
      ctx.lineTo(gx, fy + fh);
      ctx.stroke();
    }
    // Horizontal lines
    for (let i = 1; i <= 2; i++) {
      const gy = fy + (fh * i) / 3;
      ctx.beginPath();
      ctx.moveTo(fx, gy);
      ctx.lineTo(fx + fw, gy);
      ctx.stroke();
    }

    // Corner brackets
    const bracketLen = Math.min(fw, fh) * 0.08;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 3;
    const corners = [
      [fx, fy, 1, 1],
      [fx + fw, fy, -1, 1],
      [fx, fy + fh, 1, -1],
      [fx + fw, fy + fh, -1, -1],
    ] as const;
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bracketLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bracketLen);
      ctx.stroke();
    }

    // Face silhouette watermark guide (head oval + shoulder arc)
    const headCx = fx + fw / 2;
    const headW = fw * 0.45;
    const headH = fh * 0.36;
    const headTopY = fy + fh * 0.05;
    const headCy = headTopY + headH / 2;

    // Head oval fill
    ctx.beginPath();
    ctx.ellipse(headCx, headCy, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.40)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Neck / shoulder hint (trapezoid arc)
    const neckTopY = headCy + headH / 2 + fh * 0.01;
    const shoulderY = fy + fh * 0.72;
    const shoulderHalfW = fw * 0.42;

    ctx.beginPath();
    ctx.moveTo(headCx - headW * 0.22, neckTopY);
    ctx.bezierCurveTo(
      headCx - headW * 0.22,
      shoulderY - fh * 0.06,
      headCx - shoulderHalfW,
      shoulderY - fh * 0.01,
      headCx - shoulderHalfW,
      shoulderY,
    );
    ctx.lineTo(headCx + shoulderHalfW, shoulderY);
    ctx.bezierCurveTo(
      headCx + shoulderHalfW,
      shoulderY - fh * 0.01,
      headCx + headW * 0.22,
      shoulderY - fh * 0.06,
      headCx + headW * 0.22,
      neckTopY,
    );
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Guide text
    ctx.font = `bold ${Math.round(fw * 0.065)}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.textAlign = "center";
    ctx.fillText("Position face here", headCx, fy + fh * 0.88);
  }, [canvasSize, cropFrame]);

  // Redraw whenever zoom/offset change (read via refs inside draw)
  // biome-ignore lint/correctness/useExhaustiveDependencies: zoom/offset trigger redraw via refs
  useEffect(() => {
    draw();
  }, [draw, zoom, offset]);

  // ── Pointer event handlers ──────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    offsetRef.current = {
      x: offsetRef.current.x + dx,
      y: offsetRef.current.y + dy,
    };
    setOffset({ ...offsetRef.current });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Touch pinch-to-zoom
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current;
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, zoomRef.current + delta * 0.005),
        );
        zoomRef.current = newZoom;
        setZoom(newZoom);
      }
      lastPinchDist.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastPinchDist.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, zoomRef.current + delta),
    );
    zoomRef.current = newZoom;
    setZoom(newZoom);
  };

  // ── Crop output ─────────────────────────────────────────────────────────────

  const handleCropAndUse = () => {
    const img = imageRef.current;
    if (!img || !imageLoadedRef.current) return;
    if (cropFrame.w === 0) return;

    const { x: fx, y: fy, w: fw, h: fh } = cropFrame;
    const z = zoomRef.current;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;

    // Output canvas at 2x resolution for quality (fixed 300x400 portrait)
    const outW = 300;
    const outH = 400;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outW;
    outputCanvas.height = outH;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Compute image position in display canvas
    const scaledW = img.naturalWidth * z;
    const scaledH = img.naturalHeight * z;
    const imgX = fx + fw / 2 - scaledW / 2 + ox;
    const imgY = fy + fh / 2 - scaledH / 2 + oy;

    // Crop offset: image position relative to crop frame
    const srcRelX = fx - imgX; // pixels from img start to crop frame
    const srcRelY = fy - imgY;

    // Convert to source image coordinates
    const srcX = srcRelX / z;
    const srcY = srcRelY / z;
    const srcW = fw / z;
    const srcH = fh / z;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

    outputCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "cropped-photo.jpg", {
          type: "image/jpeg",
        });
        onCrop(file);
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(MAX_ZOOM, zoomRef.current + 0.15);
    zoomRef.current = newZoom;
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(MIN_ZOOM, zoomRef.current - 0.15);
    zoomRef.current = newZoom;
    setZoom(newZoom);
  };

  return (
    <div className="space-y-3">
      {/* Canvas area */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden bg-zinc-900 border border-border/60 select-none"
        style={{ touchAction: "none" }}
      >
        {canvasSize.w > 0 && (
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            style={{
              display: "block",
              width: "100%",
              cursor: isDragging.current ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          />
        )}
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-2 px-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <div className="flex-1 relative h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
            style={{
              width: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%`,
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center px-2">
        Drag to position · Scroll or pinch to zoom · Face silhouette is a guide
        only
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={onCancel}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retake / Change
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={handleCropAndUse}
        >
          <CropIcon className="h-3.5 w-3.5" />
          Crop &amp; Use Photo
        </Button>
      </div>
    </div>
  );
}
