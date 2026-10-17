import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { audioManager } from '../utils/audio';

interface EnvelopeViewProps {
  onOpened: () => void;
}

export const EnvelopeView: React.FC<EnvelopeViewProps> = ({ onOpened }) => {
  // ステータス:
  // 'FLASH': 画面全体のゴールド光の広がり
  // 'APPEAR': 封筒が登場、1秒静止
  // 'GUIDE': 封がほんのり光り、軽く揺れてタップ誘導
  // 'TEARING': 封が破れる、効果音、大きく開く
  // 'SLIDE_CARDS': 光が漏れ、2枚のカードが飛び出す
  const [phase, setPhase] = useState<'FLASH' | 'APPEAR' | 'GUIDE' | 'TEARING' | 'SLIDE_CARDS'>('FLASH');

  useEffect(() => {
    // 1. ゴールドの光が広がる (0.6s)
    const timer1 = setTimeout(() => {
      setPhase('APPEAR');
    }, 600);

    // 2. 封筒登場後、約1秒静止してからタップ誘導を開始
    const timer2 = setTimeout(() => {
      setPhase('GUIDE');
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSealTap = () => {
    if (phase !== 'GUIDE' && phase !== 'APPEAR') return;
    setPhase('TEARING');

    // 封を破る効果音
    audioManager.playPaperTear();

    // 破れて開くアニメーション後、カードが飛び出す
    setTimeout(() => {
      setPhase('SLIDE_CARDS');
    }, 700);

    // 次のカード選択画面へ遷移
    setTimeout(() => {
      onOpened();
    }, 1900);
  };

  return (
    <div
      id="envelope-view-container"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-ivory-paper px-6"
    >
      {/* 画面全体のゴールド光の広がり (開始時) */}
      {phase === 'FLASH' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0.3], scale: [0.5, 2, 2.5] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-30 bg-gradient-radial from-[#fff4cb] via-[#f7e6b5] to-transparent"
        />
      )}

      {/* 控えめなゴールドの背景グリッドライン */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d4af37_0.6px,transparent_0.6px)] [background-size:24px_24px] opacity-25" />

      {/* 封筒本体 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{
          opacity: phase !== 'FLASH' ? 1 : 0,
          scale: 1,
          y: phase === 'SLIDE_CARDS' ? 40 : 0,
        }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-[#faf7f0] shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#e2d5bc]"
      >
        {/* 封筒の高級装飾：細いゴールド幾何学フレーム */}
        <div className="absolute inset-3 rounded-xl border border-[#d4af37]/30 pointer-events-none" />
        <div className="absolute inset-4 rounded-lg border border-[#d4af37]/15 pointer-events-none" />

        {/* 四隅の装飾金具風 */}
        <div className="absolute top-4 left-4 h-3 w-3 border-t border-l border-[#c59b27]/60 pointer-events-none" />
        <div className="absolute top-4 right-4 h-3 w-3 border-t border-r border-[#c59b27]/60 pointer-events-none" />
        <div className="absolute bottom-4 left-4 h-3 w-3 border-b border-l border-[#c59b27]/60 pointer-events-none" />
        <div className="absolute bottom-4 right-4 h-3 w-3 border-b border-r border-[#c59b27]/60 pointer-events-none" />

        {/* 封筒の折り目ライン */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <line x1="0" y1="100%" x2="50%" y2="50%" stroke="#d8cbba" strokeWidth="1" />
          <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="#d8cbba" strokeWidth="1" />
        </svg>

        {/* 内部から飛び出す2枚のカード */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: phase === 'SLIDE_CARDS' ? -90 : 10,
            opacity: phase === 'SLIDE_CARDS' ? 1 : 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute left-4 right-4 top-2 z-10 flex flex-col items-center pointer-events-none"
        >
          {/* カード上部が少し重なって飛び出す演出 */}
          <div className="w-full h-24 rounded-lg bg-gradient-to-r from-[#fbf8f0] to-[#f5eedc] border border-[#d4af37]/60 shadow-lg -mb-12 transform -rotate-1" />
          <div className="w-full h-24 rounded-lg bg-gradient-to-r from-[#fefcf8] to-[#f8f2e2] border border-[#d4af37] shadow-xl transform rotate-1" />
          {/* 漏れる光 */}
          <div className="absolute -inset-4 bg-gradient-to-t from-[#ffd978]/40 to-transparent blur-md pointer-events-none" />
        </motion.div>

        {/* 封筒のフラップ（封の部分） */}
        <div className="absolute inset-x-0 top-0 h-[52%] z-20 overflow-visible">
          <svg className="w-full h-full filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.06)]" viewBox="0 0 340 130" preserveAspectRatio="none">
            <motion.path
              d="M 0 0 L 340 0 L 170 120 Z"
              fill="#f8f4eb"
              stroke="#decfa8"
              strokeWidth="1"
              animate={
                phase === 'TEARING' || phase === 'SLIDE_CARDS'
                  ? {
                      d: "M 0 0 L 340 0 L 170 -60 Z",
                      opacity: 0.3,
                    }
                  : {}
              }
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>

          {/* 破れるエフェクトライン（リアルな繊維・裂け目） */}
          {phase === 'TEARING' && (
            <motion.div
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: 1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute left-1/4 top-[48%] h-[3px] w-1/2 bg-gradient-to-r from-transparent via-[#ffd56b] to-transparent shadow-[0_0_12px_#ffd56b]"
            />
          )}

          {/* 封の中央シール（タップ可能） */}
          <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 z-30">
            <motion.button
              id="envelope-seal-button"
              onClick={handleSealTap}
              whileTap={{ scale: 0.92 }}
              animate={
                phase === 'GUIDE'
                  ? {
                      scale: [1, 1.05, 1],
                      rotate: [0, -1.5, 1.5, 0],
                      boxShadow: [
                        '0 0 10px rgba(212,175,55,0.3)',
                        '0 0 22px rgba(212,175,55,0.8)',
                        '0 0 10px rgba(212,175,55,0.3)',
                      ],
                    }
                  : phase === 'TEARING' || phase === 'SLIDE_CARDS'
                  ? {
                      scale: 1.4,
                      opacity: 0,
                      y: -20,
                    }
                  : {}
              }
              transition={
                phase === 'GUIDE'
                  ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                  : { duration: 0.4 }
              }
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border border-[#c59b27] bg-gradient-to-br from-[#f8ecc2] via-[#e2c163] to-[#aa8323] shadow-md cursor-pointer ${
                phase === 'GUIDE' ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* シール内部の金箔紋章風装飾 */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#fff2cb]/70">
                <div className="h-4 w-4 rotate-45 border border-[#6d510f]/60" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* 光の漏れ */}
        {(phase === 'TEARING' || phase === 'SLIDE_CARDS') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4] }}
            transition={{ duration: 1 }}
            className="pointer-events-none absolute inset-0 z-15 rounded-2xl bg-gradient-radial from-[#ffe48f]/50 via-transparent to-transparent"
          />
        )}
      </motion.div>

      {/* 画面下の控えめなガイドテキスト */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'GUIDE' ? 0.7 : 0 }}
        transition={{ duration: 0.6 }}
        className="font-mincho mt-8 text-xs tracking-[0.25em] text-[#8e816d]"
      >
        封をタップして開けてください
      </motion.p>
    </div>
  );
};
