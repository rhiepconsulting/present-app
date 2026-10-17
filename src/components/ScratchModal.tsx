import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LotteryCardData } from '../types';
import { audioManager } from '../utils/audio';

interface ScratchModalProps {
  card: LotteryCardData;
  isFirstCard: boolean;
  resultValue: string; // '①' or '2027.05.28'
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const ScratchModal: React.FC<ScratchModalProps> = ({
  card,
  isFirstCard,
  resultValue,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [showResultZoom, setShowResultZoom] = useState<boolean>(false);
  const [autoClearing, setAutoClearing] = useState<boolean>(false);
  const [guideText, setGuideText] = useState<string>('ここを削ってみよう');

  // 銀箔と「ここを削ってみよう」をCanvasに描画
  const initScratchFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // メタリック銀色のグラデーション
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f0f0f0');
    grad.addColorStop(0.2, '#cfcfcf');
    grad.addColorStop(0.45, '#e8e8e8');
    grad.addColorStop(0.7, '#b8b8b8');
    grad.addColorStop(1, '#d8d8d8');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // リアルな銀粉・テクスチャ（微小ノイズ粒子）
    for (let i = 0; i < 900; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rSize = Math.random() * 1.8;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(120,120,120,0.25)';
      ctx.fillRect(rx, ry, rSize, rSize);
    }

    // 繊細な装飾フレーム
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // 「ここを削ってみよう」文字をスクラッチ領域に直接印刷
    ctx.fillStyle = '#444444';
    ctx.font = 'bold 15px "Shippori Mincho", "Noto Serif JP", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ここを削ってみよう', width / 2, height / 2 - 2);

    // 英語サブテキスト
    ctx.fillStyle = '#777777';
    ctx.font = '9px "Cinzel", serif';
    ctx.fillText('SCRATCH WITH YOUR FINGER', width / 2, height / 2 + 18);
  }, []);

  // 削りカスのパーティクル描画ループ
  useEffect(() => {
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    if (!pCtx) return;

    let running = true;
    const renderParticles = () => {
      if (!running) return;
      pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // わずかな重力
        p.alpha -= 0.035;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        pCtx.save();
        pCtx.globalAlpha = Math.max(0, p.alpha);
        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
      }

      animFrameRef.current = requestAnimationFrame(renderParticles);
    };

    renderParticles();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Canvas初期化
  useEffect(() => {
    initScratchFoil();
  }, [initScratchFoil]);

  // 削られた割合をチェック（50%超で自動クリア）
  const checkScratchPercentage = () => {
    if (isCleared || autoClearing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let transparentCount = 0;
    const step = 8; // パフォーマンスのため8ピクセル毎にサンプリング
    let totalSamples = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];
        if (alpha < 128) {
          transparentCount++;
        }
        totalSamples++;
      }
    }

    const ratio = transparentCount / totalSamples;

    // 約50%以上削られたら自動クリアを発動
    if (ratio >= 0.48) {
      triggerAutoClear();
    }
  };

  const triggerAutoClear = () => {
    setAutoClearing(true);
    // 削りカスをふっと消す
    particlesRef.current = [];

    // 残りの銀箔をクリア
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    setIsCleared(true);
    // キラキラチャイム音
    audioManager.playChime(isFirstCard ? 1300 : 1600);

    // 当選番号のズーム＆浮き上がり演出
    setTimeout(() => {
      setShowResultZoom(true);
    }, 250);

    // 結果表示後、指定の間を置いて完了通知
    setTimeout(() => {
      onComplete();
    }, isFirstCard ? 2400 : 2800);
  };

  // スクラッチ描画
  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isCleared || autoClearing) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
    } else {
      ctx.arc(x, y, 16, 0, Math.PI * 2);
    }
    ctx.stroke();

    lastPosRef.current = { x, y };

    // 削りカスパーティクルを生成（銀粉・削りカス・キラッとした粒子）
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: (Math.random() * 2 - 1) * 2.5,
        vy: (Math.random() * -1.8 - 0.5),
        size: Math.random() * 2.5 + 1.2,
        alpha: 0.9,
        color: Math.random() > 0.3 ? '#dcdcdc' : '#ffe894',
      });
    }

    // 音声効果
    if (Math.random() > 0.6) {
      audioManager.playScratchTick();
    }
  };

  // タッチ/マウスイベント
  const getCanvasCoords = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.TouchEvent | React.MouseEvent) => {
    if (isCleared || autoClearing) return;
    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    lastPosRef.current = { x, y };
    scratchAt(x, y);
  };

  const handlePointerMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current || isCleared || autoClearing) return;
    const { x, y } = getCanvasCoords(e);
    scratchAt(x, y);
    checkScratchPercentage();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
    checkScratchPercentage();
  };

  return (
    <motion.div
      id="scratch-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#faf8f4]/95 px-6 backdrop-blur-sm"
    >
      {/* スポットライト光線エフェクト */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(247,230,181,0.5)_0%,transparent_65%)]" />

      {/* トップ案内 */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-6 text-center"
      >
        <span className="font-cinzel text-[10px] tracking-[0.3em] text-[#9e791b]">
          {card.cardNumber} • SCRATCH TICKET
        </span>
      </motion.div>

      {/* 拡大されたカード本体 */}
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[350px] aspect-[1.8/1] rounded-2xl border border-[#d4af37]/80 bg-gradient-to-br from-[#ffffff] via-[#fbf8f0] to-[#f4ebda] p-4 shadow-[0_20px_50px_rgba(180,150,80,0.18)]"
      >
        {/* 金箔細工ライン */}
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-[#d4af37]/40" />
        <div className="pointer-events-none absolute inset-3 rounded-lg border border-[#c59b27]/20" />

        {/* カード情報 */}
        <div className="flex items-center justify-between border-b border-[#ddceb3] pb-1.5 text-[9px] tracking-wider text-[#6d604e]">
          <span className="font-mono">{card.ticketSerial}</span>
          <span className="font-cinzel font-semibold text-[#a88220]">{card.edition}</span>
        </div>

        {/* スクラッチ窓（中央に配置） */}
        <div className="relative mt-3 flex h-[calc(100%-34px)] w-full items-center justify-center rounded-xl border-2 border-[#bfa87a] bg-[#f2ecde] shadow-inner overflow-hidden">
          {/* 下地：結果表示レイヤー */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#fffaea] via-[#f7ecd1] to-[#eeddbb] px-4 text-center select-none">
            <span className="font-cinzel text-[9px] tracking-[0.25em] text-[#9b7e31] font-semibold">
              SPECIAL PRIZE
            </span>

            {/* 結果ナンバー（一瞬光ってズーム＆浮き上がる） */}
            <motion.div
              animate={
                showResultZoom
                  ? {
                      scale: [1, 1.25, 1.15],
                      filter: [
                        'drop-shadow(0 0 0px #ffd700)',
                        'drop-shadow(0 0 25px #ffd700)',
                        'drop-shadow(0 0 8px rgba(212,175,55,0.6))',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="mt-1"
            >
              <span
                className={`font-bold tracking-wider text-[#2d251a] ${
                  resultValue === '①'
                    ? 'font-serif text-5xl text-[#aa771c] font-black'
                    : 'font-cinzel text-3xl font-extrabold text-[#3a2f1c]'
                }`}
              >
                {resultValue}
              </span>
            </motion.div>

            {/* 宝くじ当選刻印 */}
            <div className="mt-1.5 flex items-center gap-2 text-[8px] tracking-widest text-[#8c774a]">
              <span>★</span>
              <span className="font-cinzel">CONFIRMED</span>
              <span>★</span>
            </div>
          </div>

          {/* スクラッチCanvasレイヤー（銀箔 ＋ 「ここを削ってみよう」） */}
          <canvas
            ref={canvasRef}
            width={320}
            height={130}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className={`absolute inset-0 h-full w-full touch-none select-none ${
              isCleared ? 'pointer-events-none opacity-0 transition-opacity duration-700' : 'cursor-crosshair'
            }`}
          />

          {/* 削りカスパーティクルCanvas */}
          <canvas
            ref={particleCanvasRef}
            width={320}
            height={130}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {/* 自動クリア時の光のフラッシュ */}
          {autoClearing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#fff5d0] to-transparent"
            />
          )}
        </div>
      </motion.div>

      {/* スクラッチ進行中・完了後のメッセージ */}
      <div className="mt-8 text-center min-h-[36px]">
        {showResultZoom ? (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mincho text-sm tracking-[0.2em] text-[#aa771c] font-medium"
          >
            {isFirstCard ? '結果が出ました' : 'すべての結果が揃いました'}
          </motion.p>
        ) : (
          <p className="font-mincho text-xs tracking-[0.2em] text-[#6d6254]">
            指でこすって銀色の部分を削ってください
          </p>
        )}
      </div>
    </motion.div>
  );
};
