import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioManager } from '../utils/audio';

interface GiftBoxViewProps {
  onOpen: () => void;
}

export const GiftBoxView: React.FC<GiftBoxViewProps> = ({ onOpen }) => {
  // ボールの箱入り状態
  const [blueIn, setBlueIn] = useState(false);
  const [redIn, setRedIn] = useState(false);

  // ボールが箱に入る過渡期のアニメーション用
  const [blueEntering, setBlueEntering] = useState(false);
  const [redEntering, setRedEntering] = useState(false);

  // 2つ揃った後の箱の揺れ演出
  const [isShaking, setIsShaking] = useState(false);
  const [showOpenButton, setShowOpenButton] = useState(false);

  // 開封アニメーション中
  const [isOpening, setIsOpening] = useState(false);

  // 箱のDOM参照（ドロップ判定用）
  const boxRef = useRef<HTMLDivElement>(null);

  // 箱に入ったかどうかの判定処理（モバイルで入れやすいよう、箱の周囲に少しゆとりを持たせた当たり判定）
  const isInsideBoxArea = (x: number, y: number) => {
    if (!boxRef.current) return false;
    const rect = boxRef.current.getBoundingClientRect();
    const buffer = 50;
    return (
      x >= rect.left - buffer &&
      x <= rect.right + buffer &&
      y >= rect.top - buffer &&
      y <= rect.bottom + buffer
    );
  };

  // 青いボールを入れる
  const putBlueBall = () => {
    if (blueIn || blueEntering) return;
    setBlueEntering(true);
    audioManager.playBallIn(false);

    setTimeout(() => {
      setBlueIn(true);
      setBlueEntering(false);
      checkBothEntered(true, redIn);
    }, 450);
  };

  // 赤いボールを入れる
  const putRedBall = () => {
    if (redIn || redEntering) return;
    setRedEntering(true);
    audioManager.playBallIn(true);

    setTimeout(() => {
      setRedIn(true);
      setRedEntering(false);
      checkBothEntered(blueIn, true);
    }, 450);
  };

  // 2つのボールが揃った時の演出トリガー
  const checkBothEntered = (blueDone: boolean, redDone: boolean) => {
    if (blueDone && redDone) {
      setTimeout(() => {
        setIsShaking(true);
        audioManager.playBoxShake();

        setTimeout(() => {
          setIsShaking(false);
          setShowOpenButton(true);
        }, 900);
      }, 350);
    }
  };

  // 開封ボタン押下
  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    audioManager.playChime(1320);

    setTimeout(() => {
      onOpen();
    }, 650);
  };

  const bothIn = blueIn && redIn;

  return (
    <div
      id="gift-box-view-container"
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#fdfcf9] via-[#fbf8f2] to-[#f5eee2] px-6 py-10 select-none text-[#2c241c]"
    >
      {/* 幻想的な背景の光彩オーラ */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(247,230,181,0.5)_0%,rgba(251,248,242,0.85)_70%)]" />

      {/* 装飾ゴールドフレーム */}
      <div className="pointer-events-none absolute inset-4 rounded-2xl border border-[#d4af37]/30" />
      <div className="pointer-events-none absolute inset-6 rounded-xl border border-[#d4af37]/15" />

      {/* ─── 上部テキストエリア ─── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-20 pt-4 text-center max-w-xs"
      >
        <div className="h-[1px] w-12 mx-auto mb-3 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

        {/* 指定文言①：答えは、この中に入っています。 */}
        <p className="font-mincho text-xl font-normal leading-relaxed tracking-[0.18em] text-[#2c241c] sm:text-2xl drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
          答えは、この中に
          <br />
          入っています。
        </p>

        {/* 指定文言②：青と赤のボールを、箱の中に入れてみてね。 */}
        <p className="font-mincho mt-3 text-sm font-normal tracking-[0.14em] text-[#786754] sm:text-base leading-relaxed">
          青と赤のボールを、
          <br />
          箱の中に入れてみてね。
        </p>
      </motion.div>

      {/* ─── 中央エリア：プレゼントボックス ─── */}
      <div className="relative z-20 my-auto flex w-full flex-col items-center justify-center">
        {/* 箱の後ろの柔らかい祝福光輪 */}
        <motion.div
          animate={{
            scale: bothIn ? [1, 1.15, 1.05] : [1, 1.04, 1],
            opacity: bothIn ? [0.4, 0.75, 0.5] : [0.3, 0.45, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(247,215,120,0.55)_0%,transparent_70%)] blur-lg"
        />

        {/* プレゼントボックス本体 */}
        <motion.div
          ref={boxRef}
          id="gift-present-box"
          animate={
            isOpening
              ? { scale: [1, 1.1, 1.25], opacity: [1, 1, 0] }
              : isShaking
              ? {
                  x: [0, -6, 6, -5, 5, -3, 3, 0],
                  rotate: [0, -3, 3, -2.5, 2.5, -1, 1, 0],
                  y: [0, -4, 0, -3, 0],
                }
              : {
                  y: [0, -4, 0],
                }
          }
          transition={
            isOpening
              ? { duration: 0.65, ease: 'easeInOut' }
              : isShaking
              ? { duration: 0.85, ease: 'easeInOut' }
              : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative flex h-44 w-44 sm:h-48 sm:w-48 flex-col items-center justify-center rounded-2xl border-2 border-[#d4af37]/80 bg-gradient-to-br from-[#ffffff] via-[#fdfbf6] to-[#f5ebd6] p-2 shadow-[0_20px_45px_rgba(180,140,50,0.25)]"
        >
          {/* 四隅のゴールドコーナー飾り */}
          <div className="pointer-events-none absolute top-1.5 left-1.5 h-3.5 w-3.5 border-t-2 border-l-2 border-[#d4af37]" />
          <div className="pointer-events-none absolute top-1.5 right-1.5 h-3.5 w-3.5 border-t-2 border-r-2 border-[#d4af37]" />
          <div className="pointer-events-none absolute bottom-1.5 left-1.5 h-3.5 w-3.5 border-b-2 border-l-2 border-[#d4af37]" />
          <div className="pointer-events-none absolute bottom-1.5 right-1.5 h-3.5 w-3.5 border-b-2 border-r-2 border-[#d4af37]" />

          {/* 箱の立体フタ境界線 */}
          <motion.div
            animate={
              isOpening
                ? { y: -35, rotate: -8, opacity: 0 }
                : { y: 0 }
            }
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute top-0 left-0 right-0 h-10 rounded-t-2xl border-b border-[#d4af37]/60 bg-gradient-to-b from-white/90 to-[#faeed2]/60 shadow-[0_3px_8px_rgba(180,140,50,0.12)]"
          />

          {/* リボン（縦） */}
          <div className="pointer-events-none absolute top-0 bottom-0 w-7 bg-gradient-to-r from-[#aa771c] via-[#ecd997] to-[#8c6710] shadow-[0_0_8px_rgba(212,175,55,0.4)]" />

          {/* リボン（横） */}
          <div className="pointer-events-none absolute left-0 right-0 h-7 bg-gradient-to-b from-[#aa771c] via-[#ecd997] to-[#8c6710] shadow-[0_0_8px_rgba(212,175,55,0.4)]" />

          {/* 立体的な金色のリボン結び（リボンボウ） */}
          <motion.div
            animate={
              isOpening
                ? { y: -45, scale: 1.2, opacity: 0 }
                : { scale: [1, 1.05, 1] }
            }
            transition={{ duration: 2.5, repeat: isOpening ? 0 : Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-5 z-30 flex items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              {/* 左ループ */}
              <div className="h-6 w-9 -rotate-25 rounded-full border border-[#fbf3d3] bg-gradient-to-br from-[#ffe79a] via-[#cfa031] to-[#8f6814] shadow-md" />
              {/* 右ループ */}
              <div className="h-6 w-9 rotate-25 rounded-full border border-[#fbf3d3] bg-gradient-to-bl from-[#ffe79a] via-[#cfa031] to-[#8f6814] shadow-md -ml-2" />
              {/* 中央結び目 */}
              <div className="absolute h-5 w-5 rounded-full border border-[#fff2c6] bg-gradient-to-br from-[#ffd977] to-[#996f12] shadow-inner" />
            </div>
          </motion.div>

          {/* 吸い込み口 / 開口の光芒（ボールが入る瞬間） */}
          <AnimatePresence>
            {(blueEntering || redEntering || isShaking || isOpening) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="pointer-events-none absolute inset-2 z-20 rounded-xl bg-gradient-radial from-[#ffffff] via-[#ffeab3]/80 to-transparent shadow-[0_0_30px_rgba(255,220,120,0.8)]"
              />
            )}
          </AnimatePresence>

          {/* ボール投入カウンター（控えめなインジケーター） */}
          <div className="relative z-10 flex items-center gap-3 mt-1">
            {/* 青ボールスロット */}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500 ${
                blueIn
                  ? 'border-[#4a82e8] bg-gradient-to-br from-[#70a5ff] to-[#255ec4] shadow-[0_0_10px_rgba(74,130,232,0.8)] scale-110'
                  : 'border-[#baa68c]/50 bg-white/40'
              }`}
            >
              {blueIn && <div className="h-2 w-2 rounded-full bg-white/90 shadow-sm" />}
            </div>

            {/* 赤ボールスロット */}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-500 ${
                redIn
                  ? 'border-[#e84a5f] bg-gradient-to-br from-[#ff7588] to-[#c42539] shadow-[0_0_10px_rgba(232,74,95,0.8)] scale-110'
                  : 'border-[#baa68c]/50 bg-white/40'
              }`}
            >
              {redIn && <div className="h-2 w-2 rounded-full bg-white/90 shadow-sm" />}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── 下部エリア：青・赤のボール操作 ＆ 開けるボタン ─── */}
      <div className="relative z-30 flex min-h-[170px] w-full flex-col items-center justify-end pb-2">
        <AnimatePresence mode="wait">
          {/* 2つ揃って箱の揺れが終わったら「開ける」ボタンを表示 */}
          {showOpenButton ? (
            <motion.div
              key="open-action"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex w-full max-w-xs flex-col items-center gap-2"
            >
              <button
                id="open-gift-box-button"
                type="button"
                onClick={handleOpenClick}
                className="animate-sheen relative flex h-14 w-full items-center justify-center rounded-full border-2 border-[#c59b27] bg-gradient-to-r from-[#fefbf6] via-[#faf4e6] to-[#fcf8ed] px-8 shadow-[0_6px_28px_rgba(212,175,55,0.35)] hover:border-[#b08819] hover:shadow-lg active:scale-98 cursor-pointer transition-transform"
              >
                <span className="font-mincho text-xl font-bold tracking-[0.35em] text-[#2c241c]">
                  開ける
                </span>
              </button>
            </motion.div>
          ) : (
            /* ボールスワイプ操作エリア */
            <motion.div
              key="balls-tray"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              {/* スワイプ誘導テキスト */}
              <p className="font-mincho text-xs text-[#8c7e6c] tracking-widest">
                指でボールを箱の中へスワイプ
              </p>

              {/* 2つのボールコンテナ */}
              <div className="flex items-center justify-center gap-10 sm:gap-12 py-2">
                {/* ── 青いボール ── */}
                <div className="relative flex flex-col items-center">
                  {!blueIn ? (
                    <motion.div
                      drag={!blueEntering}
                      dragSnapToOrigin={!blueEntering}
                      dragElastic={0.25}
                      whileDrag={{ scale: 1.18, zIndex: 50 }}
                      onDragEnd={(_e, info) => {
                        if (isInsideBoxArea(info.point.x, info.point.y)) {
                          putBlueBall();
                        }
                      }}
                      onClick={putBlueBall}
                      animate={
                        blueEntering
                          ? {
                              scale: [1, 0.4, 0],
                              y: [-8, -130],
                              opacity: [1, 0.8, 0],
                            }
                          : {
                              y: [0, -3, 0],
                            }
                      }
                      transition={
                        blueEntering
                          ? { duration: 0.45, ease: 'easeIn' }
                          : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                      }
                      className="touch-none relative flex h-16 w-16 cursor-grab active:cursor-grabbing items-center justify-center rounded-full shadow-[0_8px_20px_rgba(43,101,217,0.38)]"
                      style={{
                        background: 'radial-gradient(circle at 35% 32%, #b5d5ff 0%, #4686f0 45%, #1848a0 100%)',
                      }}
                    >
                      {/* 球体の光沢ハイライト */}
                      <div className="pointer-events-none absolute top-2 left-3 h-4 w-5 rounded-full bg-white/60 blur-[1px] rotate-[-20deg]" />
                      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/30" />
                    </motion.div>
                  ) : (
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#4a82e8]/30 flex items-center justify-center">
                      <span className="font-mincho text-[10px] text-[#4a82e8]/60">IN</span>
                    </div>
                  )}
                  <span className="mt-1.5 font-mincho text-[11px] tracking-wider text-[#4068a8]">
                    青いボール
                  </span>
                </div>

                {/* ── 赤いボール ── */}
                <div className="relative flex flex-col items-center">
                  {!redIn ? (
                    <motion.div
                      drag={!redEntering}
                      dragSnapToOrigin={!redEntering}
                      dragElastic={0.25}
                      whileDrag={{ scale: 1.18, zIndex: 50 }}
                      onDragEnd={(_e, info) => {
                        if (isInsideBoxArea(info.point.x, info.point.y)) {
                          putRedBall();
                        }
                      }}
                      onClick={putRedBall}
                      animate={
                        redEntering
                          ? {
                              scale: [1, 0.4, 0],
                              y: [-8, -130],
                              opacity: [1, 0.8, 0],
                            }
                          : {
                              y: [0, -3, 0],
                            }
                      }
                      transition={
                        redEntering
                          ? { duration: 0.45, ease: 'easeIn' }
                          : { duration: 2.2, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }
                      }
                      className="touch-none relative flex h-16 w-16 cursor-grab active:cursor-grabbing items-center justify-center rounded-full shadow-[0_8px_20px_rgba(217,54,79,0.38)]"
                      style={{
                        background: 'radial-gradient(circle at 35% 32%, #ffb8c3 0%, #eb465f 45%, #a6152b 100%)',
                      }}
                    >
                      {/* 球体の光沢ハイライト */}
                      <div className="pointer-events-none absolute top-2 left-3 h-4 w-5 rounded-full bg-white/60 blur-[1px] rotate-[-20deg]" />
                      <div className="pointer-events-none absolute inset-0 rounded-full border border-white/30" />
                    </motion.div>
                  ) : (
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#e84a5f]/30 flex items-center justify-center">
                      <span className="font-mincho text-[10px] text-[#e84a5f]/60">IN</span>
                    </div>
                  )}
                  <span className="mt-1.5 font-mincho text-[11px] tracking-wider text-[#b83e50]">
                    赤いボール
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
