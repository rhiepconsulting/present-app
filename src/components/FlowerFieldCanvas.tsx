import React, { useRef, useEffect } from 'react';

interface FlowerFieldCanvasProps {
  active: boolean;
  bloomSpeed?: number; // 0 to 1 progress
}

interface Petal {
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  rotSpeed: number;
  opacity: number;
  color: string;
  type: 'petal' | 'sparkle' | 'bud' | 'leaf';
  swayFreq: number;
  swayAmp: number;
}

interface FlowerAnchor {
  x: number; // 0 to 1 relative to width
  y: number; // 0 to 1 relative to height
  radius: number;
  petals: number;
  color: string;
  innerColor: string;
  rotation: number;
  bloomProgress: number;
  scale: number;
}

export const FlowerFieldCanvas: React.FC<FlowerFieldCanvasProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 高級感のある花束・花畑を構成する固定アンカー（写真の周り・四隅・画面下部から咲き広がる）
    const flowers: FlowerAnchor[] = [];
    const flowerColors = [
      { outer: 'rgba(255, 246, 232, 0.96)', inner: 'rgba(232, 192, 125, 0.95)' }, // シャンパンピオニー
      { outer: 'rgba(255, 238, 230, 0.96)', inner: 'rgba(228, 172, 145, 0.95)' }, // ブラッシュローズ
      { outer: 'rgba(248, 235, 210, 0.95)', inner: 'rgba(205, 160, 70, 0.95)' },  // ゴールデンラナンキュラス
      { outer: 'rgba(255, 255, 255, 0.98)', inner: 'rgba(225, 195, 130, 0.95)' }, // ホワイトリリィ
      { outer: 'rgba(235, 245, 235, 0.92)', inner: 'rgba(180, 205, 180, 0.95)' }, // ユーカリボタニカル
    ];

    // 周囲を包み込む花々の配置
    const count = 38;
    for (let i = 0; i < count; i++) {
      // 画面下部、左右、写真の周囲（中央付近の縁）に自然に咲かせる
      let fx = Math.random();
      let fy = Math.random();

      // 中央の写真直撃を避け、写真のフレーム周囲（マージン）に集中
      if (fx > 0.25 && fx < 0.75 && fy > 0.32 && fy < 0.68) {
        // 写真のフチ側へ押し出す
        if (Math.random() > 0.5) {
          fy = fy > 0.5 ? 0.72 + Math.random() * 0.26 : 0.26 - Math.random() * 0.22;
        } else {
          fx = fx > 0.5 ? 0.78 + Math.random() * 0.2 : 0.22 - Math.random() * 0.2;
        }
      }

      const col = flowerColors[i % flowerColors.length];
      flowers.push({
        x: fx,
        y: fy,
        radius: 18 + Math.random() * 26,
        petals: 5 + Math.floor(Math.random() * 4) * 2,
        color: col.outer,
        innerColor: col.inner,
        rotation: Math.random() * Math.PI * 2,
        bloomProgress: 0,
        scale: 0.6 + Math.random() * 0.7,
      });
    }

    // 舞い散る花びら・光の粒子
    const petals: Petal[] = [];
    const petalColors = ['#fff7e6', '#fdeddb', '#f5ebd2', '#ffd700', '#f4ecd8'];

    for (let i = 0; i < 45; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 5 + Math.random() * 9,
        angle: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
        rotSpeed: (Math.random() * 2 - 1) * 0.02,
        opacity: 0.3 + Math.random() * 0.6,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        type: Math.random() > 0.25 ? 'petal' : 'sparkle',
        swayFreq: 0.01 + Math.random() * 0.02,
        swayAmp: 1.2 + Math.random() * 2,
      });
    }

    let animationFrame: number;
    let startTime = performance.now();

    const drawSingleFlower = (f: FlowerAnchor, currentScale: number) => {
      const cx = f.x * width;
      const cy = f.y * height;
      const r = f.radius * currentScale * f.scale;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(f.rotation);

      // 外側の花びらを描画
      for (let p = 0; p < f.petals; p++) {
        const pAngle = (p * Math.PI * 2) / f.petals;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-r * 0.4, -r * 0.7, -r * 0.5, -r * 1.1, 0, -r * 1.2);
        ctx.bezierCurveTo(r * 0.5, -r * 1.1, r * 0.4, -r * 0.7, 0, 0);
        ctx.fillStyle = f.color;
        ctx.shadowColor = 'rgba(180, 140, 50, 0.2)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }

      // 内側の重なる花びら
      for (let p = 0; p < f.petals; p++) {
        const pAngle = (p * Math.PI * 2) / f.petals + Math.PI / f.petals;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-r * 0.25, -r * 0.5, -r * 0.3, -r * 0.8, 0, -r * 0.85);
        ctx.bezierCurveTo(r * 0.3, -r * 0.8, r * 0.25, -r * 0.5, 0, 0);
        ctx.fillStyle = f.innerColor;
        ctx.fill();
        ctx.restore();
      }

      // 花芯のゴールドスタンプ
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#d4af37';
      ctx.fill();

      ctx.restore();
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // 3〜5秒で一気に開花する進行度 (0 -> 1)
      const elapsed = (time - startTime) / 1000;
      const bloomRate = Math.min(1, elapsed / 3.8); // 約3.8秒で満開

      // 花弁の描画
      flowers.forEach((f, idx) => {
        // 各花にわずかな咲き始めのズレを持たせる
        const delay = (idx / count) * 0.7;
        const localProgress = Math.max(0, Math.min(1, (bloomRate - delay) / (1 - delay)));
        // イージング（一気にふわっと開く）
        const easedScale = Math.sin((localProgress * Math.PI) / 2);

        if (easedScale > 0.02) {
          drawSingleFlower(f, easedScale);
        }
      });

      // 舞い散る花びらと光の粒子のレンダリング
      petals.forEach((p) => {
        p.y += p.speed;
        p.x += Math.sin(time * p.swayFreq) * p.swayAmp;
        p.angle += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = 'rgba(255, 235, 175, 0.4)';
          ctx.shadowBlur = 4;
          ctx.fill();
        } else {
          // キラめく星粒子
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = '#ffeaa7';
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      id="flower-field-canvas"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
};
