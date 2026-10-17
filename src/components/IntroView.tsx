import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroViewProps {
  onStart: () => void;
}

export const IntroView: React.FC<IntroViewProps> = ({ onStart }) => {
  // ステップ式フェードイン制御
  // 1: 「いつもありがとう。」
  // 2: 「日頃の感謝を込めて、今日は二人にちょっとした運試しを。」
  // 3: 「2枚のカードを、順番に削ってみてください。」
  // 4: 「運試しをはじめる」ボタン
  const [step, setStep] = useState<number>(1);
  const [isTapped, setIsTapped] = useState<boolean>(false);

  useEffect(() => {
    // 時間差で順番に表示
    const timer1 = setTimeout(() => setStep(2), 1600);
    const timer2 = setTimeout(() => setStep(3), 3600);
    const timer3 = setTimeout(() => setStep(4), 5400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleButtonClick = () => {
    if (isTapped) return;
    setIsTapped(true);
    // ボタンのゴールド光が走る演出後、次へ進む
    setTimeout(() => {
      onStart();
    }, 600);
  };

  return (
    <div
      id="intro-view-container"
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-ivory-paper px-8 py-14 text-[#2b2723]"
    >
      {/* 控えめなゴールドの幾何学ライン＆フレーム */}
      <div className="pointer-events-none absolute inset-4 rounded-xl border border-[#d4af37]/35" />
      <div className="pointer-events-none absolute inset-6 rounded-lg border border-[#d4af37]/15" />
      <div className="pointer-events-none absolute top-8 left-8 h-4 w-4 border-t-2 border-l-2 border-[#c59b27]/60" />
      <div className="pointer-events-none absolute top-8 right-8 h-4 w-4 border-t-2 border-r-2 border-[#c59b27]/60" />
      <div className="pointer-events-none absolute bottom-8 left-8 h-4 w-4 border-b-2 border-l-2 border-[#c59b27]/60" />
      <div className="pointer-events-none absolute bottom-8 right-8 h-4 w-4 border-b-2 border-r-2 border-[#c59b27]/60" />

      {/* トップ装飾 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="flex flex-col items-center pt-6"
      >
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#c59b27] to-transparent" />
        <span className="font-cinzel mt-2 text-[10px] tracking-[0.35em] text-[#8e7e61]">
          SPECIAL LOTTERY EXPERIENCE
        </span>
      </motion.div>

      {/* 中央メッセージ群 */}
      <div className="my-auto flex flex-col items-center text-center">
        {/* メッセージ1 */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="font-mincho text-2xl font-light tracking-[0.2em] text-[#2c2621] sm:text-3xl"
        >
          いつもありがとう。
        </motion.p>

        {/* メッセージ2 */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="mt-8 space-y-2 font-mincho text-base font-normal leading-relaxed tracking-[0.15em] text-[#4a423a] sm:text-lg"
            >
              <p>日頃の感謝を込めて、</p>
              <p>今日は二人にちょっとした運試しを。</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* メッセージ3 */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="mt-8 font-mincho text-sm font-normal tracking-[0.18em] text-[#6b6156] sm:text-base"
            >
              2枚のカードを、順番に削ってみてください。
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ボタン */}
      <div className="w-full max-w-xs pb-4">
        <AnimatePresence>
          {step >= 4 && (
            <motion.button
              id="start-lottery-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleButtonClick}
              className={`animate-sheen relative flex h-14 w-full items-center justify-center rounded-full border border-[#c59b27] bg-[#fbf9f4] px-8 shadow-sm transition-all duration-300 hover:border-[#b08819] hover:shadow-md ${
                isTapped ? 'ring-4 ring-[#d4af37]/60' : ''
              }`}
            >
              {/* タップ時のフラッシュ光 */}
              {isTapped && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  transition={{ duration: 0.5 }}
                  className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#ffe89e] to-transparent opacity-80"
                />
              )}
              <span className="font-mincho text-base font-medium tracking-[0.25em] text-[#332b24]">
                運試しをはじめる
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
