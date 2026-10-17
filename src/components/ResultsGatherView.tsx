import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '../utils/audio';
import { SURPRISE_CONFIG } from '../config';

interface ResultsGatherViewProps {
  onNext: () => void;
}

export const ResultsGatherView: React.FC<ResultsGatherViewProps> = ({ onNext }) => {
  const [showNext, setShowNext] = useState<boolean>(false);

  useEffect(() => {
    // 2つの結果が一瞬光る
    audioManager.playChime(1400);

    // 中央に揃ったあと、少し間を置いて「NEXT」をふわっと表示
    const timer = setTimeout(() => {
      setShowNext(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="results-gather-view"
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-ivory-paper px-6 py-14 text-center text-[#2d251a]"
    >
      {/* 繊細な中央スポットライト */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,230,181,0.45)_0%,transparent_65%)]" />

      {/* 装飾ゴールドフレーム */}
      <div className="pointer-events-none absolute inset-4 rounded-xl border border-[#d4af37]/30" />
      <div className="pointer-events-none absolute inset-6 rounded-lg border border-[#d4af37]/15" />

      {/* 上部ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-4"
      >
        <span className="font-cinzel text-[10px] tracking-[0.35em] text-[#8e7e63]">
          RESULTS CONFIRMED
        </span>
      </motion.div>

      {/* 中央：2つの結果がゆっくり中央へ寄って並ぶ */}
      <div className="my-auto flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 rounded-2xl border border-[#d4af37]/60 bg-[#ffffff]/95 px-7 py-6 shadow-[0_15px_40px_rgba(200,165,70,0.18)]"
        >
          {/* 1枚目の結果: ① */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <span className="font-serif text-4xl font-bold text-[#aa771c] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)] sm:text-5xl">
              ①
            </span>
          </motion.div>

          {/* 掛け合わせ記号 × */}
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-cinzel text-xl text-[#8e7e63] sm:text-2xl"
          >
            ×
          </motion.span>

          {/* 2枚目の結果: 予定日 */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <span className="font-cinzel text-2xl font-bold tracking-wider text-[#2e261e] sm:text-3xl">
              {SURPRISE_CONFIG.dueDate}
            </span>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-mincho mt-6 text-xs tracking-[0.25em] text-[#786c5c]"
        >
          2つの数字が揃いました
        </motion.p>
      </div>

      {/* NEXT ボタン */}
      <div className="w-full max-w-xs pb-4">
        {showNext && (
          <motion.button
            id="next-button"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="animate-sheen relative flex h-14 w-full items-center justify-center rounded-full border border-[#c59b27] bg-[#fbf9f4] px-8 shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:border-[#b08819] hover:shadow-md"
          >
            <span className="font-cinzel text-sm font-semibold tracking-[0.35em] text-[#2d251a]">
              NEXT
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
};
