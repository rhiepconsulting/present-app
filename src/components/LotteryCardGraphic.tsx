import React from 'react';
import { LotteryCardData } from '../types';

interface LotteryCardGraphicProps {
  card: LotteryCardData;
  isCompleted?: boolean;
  resultValue?: string | null;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export const LotteryCardGraphic: React.FC<LotteryCardGraphicProps> = ({
  card,
  isCompleted = false,
  resultValue = null,
  isActive = false,
  onClick,
  disabled = false,
}) => {
  return (
    <div
      id={`lottery-card-${card.id}`}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-full max-w-[340px] aspect-[2.1/1] select-none rounded-xl border border-[#d4af37]/60 bg-gradient-to-br from-[#fcfbf7] via-[#f7f2e7] to-[#ede4d1] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        disabled
          ? 'opacity-85'
          : 'cursor-pointer hover:border-[#c59b27] hover:shadow-[0_12px_28px_rgba(212,175,55,0.25)] active:scale-[0.98]'
      } ${isActive ? 'card-glow-pulse ring-2 ring-[#d4af37]/80' : ''}`}
    >
      {/* 繊細な二重のゴールドライン */}
      <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-[#d4af37]/40" />
      <div className="pointer-events-none absolute inset-2.5 rounded-md border border-[#c59b27]/20" />

      {/* 宝くじ特有の微細背景ギヨシェ模様（SVG幾何学） */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-10" preserveAspectRatio="none">
        <pattern id={`guilloche-${card.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#aa771c" strokeWidth="0.5" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#aa771c" strokeWidth="0.5" />
          <path d="M 0 12 Q 12 0 24 12 Q 12 24 0 12" fill="none" stroke="#aa771c" strokeWidth="0.3" />
        </pattern>
        <rect width="100%" height="100%" fill={`url(#guilloche-${card.id})`} />
      </svg>

      {/* カード上部：シリアルナンバー・エディション */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#e2d6c1] pb-1.5 text-[9px] tracking-wider text-[#7d705c]">
        <span className="font-mono tracking-widest text-[#554a39]">{card.ticketSerial}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-cinzel tracking-widest text-[#b08b26]">{card.edition}</span>
          <span className="rounded bg-[#f0e6ce] px-1 py-0.2 font-cinzel text-[8px] font-semibold text-[#8b6f24]">
            {card.badge}
          </span>
        </div>
      </div>

      {/* カードメインボディ：左側（情報）、右側（スクラッチ枠） */}
      <div className="relative z-10 mt-2 flex h-[calc(100%-28px)] items-center justify-between gap-3">
        {/* 左側：カード名と記号 */}
        <div className="flex flex-1 flex-col justify-between h-full py-0.5">
          <div>
            <div className="font-cinzel text-xs font-bold tracking-[0.2em] text-[#362f27]">
              {card.cardNumber}
            </div>
            <div className="mt-0.5 text-[8px] tracking-[0.18em] text-[#8c806f]">
              PREMIUM LUXURY TICKET
            </div>
          </div>

          <div className="flex items-center gap-2 text-[8px] tracking-wider text-[#9d9282]">
            <span className="font-mono">SEC. 0{card.id}</span>
            <span>•</span>
            <span className="font-mono">CLASS A</span>
            <span>•</span>
            <span className="font-mono">№ 0528</span>
          </div>
        </div>

        {/* 右側：スクラッチ領域プレビュー */}
        <div className="relative flex h-full w-[130px] items-center justify-center rounded-lg border border-[#c2b295] bg-[#e8e4db] shadow-inner overflow-hidden">
          {isCompleted && resultValue ? (
            // スクラッチ完了後の結果表示
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#fffdfa] to-[#fbf8f0] p-1">
              <span className="text-[7px] font-cinzel tracking-widest text-[#a89052]">WINNING RESULT</span>
              <span
                className={`font-cinzel font-bold text-[#2a241d] tracking-wider ${
                  resultValue === '①' ? 'text-2xl text-[#b8860b]' : 'text-sm font-semibold'
                }`}
              >
                {resultValue}
              </span>
            </div>
          ) : (
            // 未スクラッチ状態（銀色メタリックフォイル風）
            <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e0e0e0] via-[#c9c9c9] to-[#b3b3b3] p-1">
              {/* 微細な粒子テクスチャ */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.75px,transparent_0.75px)] [background-size:6px_6px] opacity-35" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full border border-[#999] flex items-center justify-center mb-0.5">
                  <div className="h-2 w-2 rotate-45 border border-[#888]" />
                </div>
                <span className="font-cinzel text-[7px] tracking-widest text-[#555] font-semibold">
                  SCRATCH HERE
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
