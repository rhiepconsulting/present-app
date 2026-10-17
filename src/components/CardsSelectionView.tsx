import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LotteryCardData } from '../types';
import { LotteryCardGraphic } from './LotteryCardGraphic';

interface CardsSelectionViewProps {
  cards: [LotteryCardData, LotteryCardData];
  firstSelectedCardId: '01' | '02' | null;
  card1Result: string | null;
  card2Result: string | null;
  onSelectCard: (cardId: '01' | '02') => void;
}

export const CardsSelectionView: React.FC<CardsSelectionViewProps> = ({
  cards,
  firstSelectedCardId,
  card1Result,
  card2Result,
  onSelectCard,
}) => {
  // 交互に光るインデックス (0 or 1)
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(0);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  const hasFirstResult = Boolean(card1Result || card2Result);

  useEffect(() => {
    // 並んだ後に少し静止してからメッセージを表示
    const promptTimer = setTimeout(() => {
      setShowPrompt(true);
    }, 900);

    // 2枚が交互に光るエフェクト
    const interval = setInterval(() => {
      setActiveHighlightIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1800);

    return () => {
      clearTimeout(promptTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      id="cards-selection-view"
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-ivory-paper px-6 py-12"
    >
      {/* 背景の装飾幾何学枠 */}
      <div className="pointer-events-none absolute inset-4 rounded-xl border border-[#d4af37]/25" />
      <div className="pointer-events-none absolute inset-6 rounded-lg border border-[#d4af37]/10" />

      {/* 上部ヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center pt-4"
      >
        <div className="h-[1px] w-10 bg-[#c59b27]" />
        <span className="font-cinzel mt-1.5 text-[9px] tracking-[0.3em] text-[#8e7e61]">
          OFFICIAL SPECIAL LOTTERY
        </span>
      </motion.div>

      {/* ガイドメッセージ */}
      <div className="my-3 min-h-[32px] flex items-center justify-center text-center">
        {showPrompt && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-mincho text-base font-medium tracking-[0.18em] text-[#342e27] sm:text-lg"
          >
            {hasFirstResult
              ? 'もう一枚、削ってみよう'
              : 'まずは、好きなカードを選んでね'}
          </motion.p>
        )}
      </div>

      {/* 2枚のカードを上下に縦配置 */}
      <div className="flex w-full flex-col items-center gap-6 my-auto max-w-sm">
        {cards.map((card, idx) => {
          const isCompleted = card.id === '01' ? Boolean(card1Result) : Boolean(card2Result);
          const resultVal = card.id === '01' ? card1Result : card2Result;
          const isHighlighted = !hasFirstResult && activeHighlightIndex === idx;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.25 }}
              className="w-full flex justify-center"
            >
              <LotteryCardGraphic
                card={card}
                isCompleted={isCompleted}
                resultValue={resultVal}
                isActive={isHighlighted}
                disabled={isCompleted}
                onClick={() => {
                  if (!isCompleted) {
                    onSelectCard(card.id);
                  }
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* フッター補足（控えめな注記） */}
      <div className="pt-4 text-center">
        <span className="text-[10px] tracking-widest text-[#9d9282]">
          TOUCH TO SELECT A CARD
        </span>
      </div>
    </div>
  );
};
