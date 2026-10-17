import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Maximize2, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SURPRISE_CONFIG } from '../config';
import { FlowerFieldCanvas } from './FlowerFieldCanvas';

interface RevealExperienceProps {
  onRestart?: () => void;
}

export const RevealExperience: React.FC<RevealExperienceProps> = ({ onRestart }) => {
  // 原本写真3枚を恒久固定（1034横長・0952縦長・0860縦長）
  const photos = SURPRISE_CONFIG.photos;

  // 進行段階
  // 1: SILENCE (一瞬の静寂)
  // 2: LIGHT_EXPAND (光が広がる)
  // 3: HAPPY_NEWS (HAPPY NEWS登場 + 祝福シャワー)
  // 4: MESSAGE & PHOTOS (「新しい命を、授かることができました。」と写真が同時に登場)
  // 5: DATE (写真の下から光が広がり、日付が浮かび上がる)
  // 6: FLOWERS (写真の周囲から花畑が一気に広がる)
  // 7: FINAL (最終レイアウトで静止、音楽は流し続ける)
  const [phase, setPhase] = useState<number>(1);
  const [flowerActive, setFlowerActive] = useState<boolean>(false);

  // 原本写真のフルスクリーン拡大モーダル（ライトボックス）
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    // 過去のlocalStorageキャッシュが残っていた場合にクリーンアップ
    try {
      localStorage.removeItem('custom_reveal_photo_v3_1');
      localStorage.removeItem('custom_reveal_photo_v3_2');
      localStorage.removeItem('custom_reveal_photo_v3_3');
      localStorage.removeItem('custom_reveal_photo');
    } catch {
      // ignore
    }

    // タイムライン制御
    const t1 = setTimeout(() => setPhase(2), 1200);
    const t2 = setTimeout(() => {
      setPhase(3);
      fireLuxuryStreamers();
    }, 2300);
    const t3 = setTimeout(() => setPhase(4), 5000);
    const t4 = setTimeout(() => setPhase(5), 8500);
    const t5 = setTimeout(() => {
      setPhase(6);
      setFlowerActive(true);
    }, 11500);
    const t6 = setTimeout(() => setPhase(7), 15500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // 華やかなゴールド祝福テープクラッカー
  const fireLuxuryStreamers = () => {
    try {
      const colors = ['#f7e6b5', '#ffffff', '#e8c977', '#ecd9b5', '#ffe894'];
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.6 },
        colors,
        ticks: 240,
        gravity: 0.7,
        scalar: 0.9,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.6 },
        colors,
        ticks: 240,
        gravity: 0.7,
        scalar: 0.9,
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-y-auto px-4 py-2 sm:py-3.5 select-none">
      {/* 背景：咲き乱れる花畑キャンバスアニメーション */}
      <FlowerFieldCanvas active={flowerActive} />

      {/* ─── フェーズ2: 光が画面いっぱいに広がるエフェクト ─── */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div
            key="light-expand"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 0.9, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <div className="h-96 w-96 rounded-full bg-gradient-to-r from-amber-100/60 via-yellow-200/80 to-amber-200/50 blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 上部エリア：タイトル & メッセージ ─── */}
      <div className="relative z-30 flex flex-col items-center pt-1 sm:pt-2 text-center">
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{
                opacity: 1,
                scale: phase >= 4 ? 0.9 : 1,
                y: phase >= 4 ? -2 : 0,
              }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              <h1 className="font-cinzel text-2xl font-extrabold tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-[#aa771c] via-[#d4af37] to-[#8c6710] drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] sm:text-3xl my-0.5">
                HAPPY NEWS
              </h1>
              <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 妊娠発表メッセージ: 「新しい命を、授かることができました。」 */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{
                opacity: 1,
                y: 0,
                filter: phase === 4 ? 'drop-shadow(0 0 15px rgba(255,225,140,0.9))' : 'none',
              }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="mt-1 text-center"
            >
              <div className="font-mincho text-base font-normal leading-relaxed tracking-[0.2em] text-[#2c241c] sm:text-lg space-y-0.5 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">
                <p>新しい命を、授かることが</p>
                <p>できました。</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 中央エリア：写真 3枚構成（上：①横長1枚 + 下：②③縦長2枚並び） ─── */}
      <div className="relative z-30 my-auto flex w-full max-w-[280px] sm:max-w-[320px] mx-auto flex-col items-center justify-center gap-2 px-1 py-1">
        <AnimatePresence>
          {phase >= 4 && (
            <>
              {/* ① 上部：横長写真（1034横写真：エコー写真） */}
              <motion.div
                initial={{ opacity: 0, scale: 1.06, y: -8, filter: 'brightness(1.8) blur(4px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'brightness(1) blur(0px)' }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setLightboxImage({ src: photos[0], title: '写真①（横写真・エコー写真）' })}
                className="group relative w-full aspect-[16/9] rounded-xl p-1 shadow-[0_10px_28px_rgba(180,150,80,0.22)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#000000] border border-[#e5d5b3]">
                  <img
                    id="reveal-photo-image-1"
                    src={photos[0]}
                    alt="写真①（横写真・エコー写真）"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  {/* 微細な光彩オーバーレイ */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                  {/* タップで拡大ヒント */}
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-2 w-2 text-[#d4af37]" />
                    <span>拡大</span>
                  </div>
                </div>

                {/* 四隅のゴールドコーナー */}
                <div className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-[#d4af37]" />
                <div className="pointer-events-none absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-[#d4af37]" />
                <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-[#d4af37]" />
                <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-[#d4af37]" />
              </motion.div>

              {/* ② 下部：縦長写真 2枚並び */}
              <div className="grid w-full grid-cols-2 gap-2">
                {/* 写真② (縦長・左・0952：母子健康手帳) */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.06, x: -8, filter: 'brightness(1.8) blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 1.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setLightboxImage({ src: photos[1], title: '写真②（縦写真・母子健康手帳）' })}
                  className="group relative w-full aspect-[3/4] rounded-xl p-1 shadow-[0_10px_28px_rgba(180,150,80,0.2)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#000000] border border-[#e5d5b3]">
                    <img
                      id="reveal-photo-image-2"
                      src={photos[1]}
                      alt="写真②（縦写真・母子健康手帳）"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                    <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/55 px-1 py-0.5 text-[8px] text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-2 w-2 text-[#d4af37]" />
                      <span>拡大</span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-[#d4af37]" />
                </motion.div>

                {/* 写真③ (縦長・右・0860：厳島神社の鳥居とママ) */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.06, x: 8, filter: 'brightness(1.8) blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 1.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setLightboxImage({ src: photos[2], title: '写真③（縦写真・記念写真）' })}
                  className="group relative w-full aspect-[3/4] rounded-xl p-1 shadow-[0_10px_28px_rgba(180,150,80,0.2)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#000000] border border-[#e5d5b3]">
                    <img
                      id="reveal-photo-image-3"
                      src={photos[2]}
                      alt="写真③（縦写真・記念写真）"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                    <div className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-black/55 px-1 py-0.5 text-[8px] text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-2 w-2 text-[#d4af37]" />
                      <span>拡大</span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-[#d4af37]" />
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 下部エリア：予定日 ─── */}
      <div className="relative z-30 flex min-h-[42px] w-full flex-col items-center justify-center text-center">
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <span className="font-cinzel text-xl font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#8c6710] via-[#b5871f] to-[#71520a] drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)] sm:text-2xl">
                {SURPRISE_CONFIG.dueDate}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 操作バー：最初に戻る */}
      {SURPRISE_CONFIG.showRestartButton && phase >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-40 mt-1 pb-1 flex flex-col items-center gap-1"
        >
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#d4af37]/60 bg-white/95 px-4 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 text-[#aa771c]" />
            <span className="font-mincho text-xs font-semibold tracking-wider text-[#2c241c]">
              最初に戻る
            </span>
          </button>
        </motion.div>
      )}

      {/* ─── 原本写真フルスクリーン拡大ライトボックス ─── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative max-h-[85vh] max-w-[92vw] overflow-hidden rounded-2xl border-2 border-[#d4af37]/70 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[80vh] w-auto max-w-[90vw] object-contain"
              />
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="rounded-full bg-black/60 p-2 text-white/90 backdrop-blur-md hover:bg-black/80 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center text-xs text-white/90 font-mincho">
                {lightboxImage.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
