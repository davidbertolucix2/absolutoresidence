import { useEffect, useRef, type PointerEvent } from 'react';
import { secondaryBtn } from './chrome';

export function SignaturePad({
  onChange,
  value,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#16120c';
    ctx.fillStyle = '#f4efe6';
    ctx.fillRect(0, 0, width, height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
      img.src = value;
    }
  }, [value]);

  const pos = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL('image/png'));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-2xl border border-[color:var(--ov-line)] bg-[color:var(--ov-cream)]"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <button
        type="button"
        className={`${secondaryBtn} mt-2`}
        onClick={() => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            onChange('');
          }
        }}
      >
        Limpar assinatura
      </button>
    </div>
  );
}
