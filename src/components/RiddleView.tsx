import React from 'react';
import { motion } from 'motion/react';
import { SURPRISE_CONFIG } from '../config';
import { audioManager } from '../utils/audio';

interface RiddleViewProps {
  onAnswer: () => void;
}

export const RiddleView: React.FC<RiddleViewProps> = ({ onAnswer }) => {
  const handleAnswerClick = () => {
    // ユーザー操作をトリガーとしてBGM・効果音を開始
    audioManager.startRevealMusic(SURPRISE_CONFIG.audio.bgm);
    onAnswer();
  };

  return (
    <div
      id="riddle-view-container"
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-ivory-paper px-6 py-14 text-center text-[#2d251d]"
    >
      {/* 宝くじ世界観の控えめなゴールドスポットライト（ぼかしは除去） */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(247,230,181,0.45)_0%,transparent_60%)]" />

      {/* 装飾ゴールドフレーム */}
      <div className="pointer-events-none absolute inset-4 rounded-xl border border-[#d4af37]/30" />
      <div className="pointer-events-none absolute inset-6 rounded-lg border border-[#d4af37]/15" />

      {/* 上部：問いかけのテキスト（ぼかさずクリアに表示） */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pt-6"
      >
        <div className="font-mincho text-lg font-normal leading-relaxed tracking-[0.16em] text-[#2d251d] sm:text-xl space-y-1">
          <p>さて、なぞなぞです。</p>
          <p>この2つから連想できるのはなんだ？</p>
        </div>
      </motion.div>

      {/* 中央：視線が集中する「① × 2027.05.28」 */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.0, ease: 'easeOut' }}
        className="my-auto flex flex-col items-center"
      >
        <div className="relative flex flex-wrap items-center justify-center gap-3 sm:gap-4 rounded-2xl border border-[#d4af37]/60 bg-[#ffffff]/95 px-8 py-7 shadow-[0_15px_40px_rgba(200,165,70,0.18)]">
          {/* 金のコーナー飾り */}
          <div className="pointer-events-none absolute top-2 left-2 h-3 w-3 border-t border-l border-[#d4af37]/70" />
          <div className="pointer-events-none absolute top-2 right-2 h-3 w-3 border-t border-r border-[#d4af37]/70" />
          <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#d4af37]/70" />
          <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#d4af37]/70" />

          {/* ① */}
          <span className="font-serif text-4xl font-bold text-[#aa771c] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)] sm:text-5xl">
            ①
          </span>

          {/* × */}
          <span className="font-cinzel text-xl text-[#8e7e63] sm:text-2xl">
            ×
          </span>

          {/* 2027.05.28 */}
          <span className="font-cinzel text-2xl font-bold tracking-wider text-[#2d251a] sm:text-3xl">
            {SURPRISE_CONFIG.dueDate}
          </span>
        </div>
      </motion.div>

      {/* 下部：「プレゼントは次の箱に入ってます」＆「次に進む」ボタン */}
      <div className="w-full max-w-xs pb-4 flex flex-col items-center gap-3">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-mincho text-sm font-normal tracking-[0.14em] text-[#786754]"
        >
          プレゼントは次の箱に入ってます
        </motion.p>

        <motion.button
          id="next-step-button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAnswerClick}
          className="animate-sheen relative flex h-14 w-full items-center justify-center rounded-full border border-[#c59b27] bg-[#fbf9f4] px-8 shadow-[0_4px_24px_rgba(212,175,55,0.25)] hover:border-[#b08819] hover:shadow-md cursor-pointer"
        >
          <span className="font-mincho text-base font-semibold tracking-[0.25em] text-[#2d251a]">
            次に進む
          </span>
        </motion.button>
      </div>
    </div>
  );
};
