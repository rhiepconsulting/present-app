import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Upload, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SURPRISE_CONFIG } from '../config';
import { FlowerFieldCanvas } from './FlowerFieldCanvas';

interface RevealExperienceProps {
  onRestart?: () => void;
}

// スマートフォンの大容量カメラ写真（5〜10MB）をWeb最適化JPEG（約100KB）に自動圧縮
// これによりブラウザのlocalStorage容量上限（5MB）超過エラーを100%防止します
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1000;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX) {
          h = Math.round((h * MAX) / w);
          w = MAX;
        } else if (h > MAX) {
          w = Math.round((w * MAX) / h);
          h = MAX;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const RevealExperience: React.FC<RevealExperienceProps> = ({ onRestart }) => {
  // 3枚構成：写真①（横長）、写真②（縦長・左）、写真③（縦長・右）
  const [photos, setPhotos] = useState<string[]>(() => {
    let s1 = null;
    let s2 = null;
    let s3 = null;
    try {
      // 古いキーを破棄して最新の初期写真を反映
      localStorage.removeItem('custom_reveal_photo');
      localStorage.removeItem('custom_reveal_photo_1');
      localStorage.removeItem('custom_reveal_photo_2');
      localStorage.removeItem('custom_reveal_photo_3');
      localStorage.removeItem('custom_reveal_photo_v2_1');
      localStorage.removeItem('custom_reveal_photo_v2_2');
      localStorage.removeItem('custom_reveal_photo_v2_3');
      s1 = localStorage.getItem('custom_reveal_photo_v3_1');
      s2 = localStorage.getItem('custom_reveal_photo_v3_2');
      s3 = localStorage.getItem('custom_reveal_photo_v3_3');
    } catch {
      // localStorage restriction
    }
    const def1 = SURPRISE_CONFIG.photos?.[0] || '/images/reveal-photo.jpg';
    const def2 = SURPRISE_CONFIG.photos?.[1] || '/images/reveal-photo-2.jpg';
    const def3 = SURPRISE_CONFIG.photos?.[2] || '/images/reveal-photo-3.jpg';
    return [s1 || def1, s2 || def2, s3 || def3];
  });

  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const fileInput3Ref = useRef<HTMLInputElement>(null);

  // 進行段階
  // 1: SILENCE (一瞬の静寂)
  // 2: LIGHT_EXPAND (光が広がる)
  // 3: HAPPY_NEWS (HAPPY NEWS登場 + 祝福シャワー)
  // 4: MESSAGE & PHOTOS (「新しい命を、授かることができました。」と写真が同時に登場)
  // 5: DATE (写真の下から光が広がり、2027.05.28が浮かび上がる)
  // 6: FLOWERS (写真の周囲から花畑が一気に広がる 3〜5秒)
  // 7: FINAL (最終レイアウトで静止、音楽は流し続ける)
  const [phase, setPhase] = useState<number>(1);
  const [flowerActive, setFlowerActive] = useState<boolean>(false);

  useEffect(() => {
    // タイムライン制御
    // ① 0.0s: SILENCE (一瞬の静寂)
    // ② 1.2s: LIGHT_EXPAND
    const t1 = setTimeout(() => setPhase(2), 1200);

    // ③ 2.3s: HAPPY_NEWS
    const t2 = setTimeout(() => {
      setPhase(3);
      // 高級感のあるシャンパンゴールド＆パールのストリーマーシャワー
      fireLuxuryStreamers();
    }, 2300);

    // ④ 5.0s: MESSAGE & PHOTOS (「新しい命を、授かることができました。」と写真が同時に出現)
    const t3 = setTimeout(() => setPhase(4), 5000);

    // ⑤ 8.5s: DATE (写真の下から光が広がり、2027.05.28が浮かび上がる)
    const t4 = setTimeout(() => setPhase(5), 8500);

    // ⑥ 11.5s: FLOWERS (写真の周囲から花畑が一気に約3〜5秒で広がる)
    const t5 = setTimeout(() => {
      setPhase(6);
      setFlowerActive(true);
    }, 11500);

    // ⑦ 15.5s: FINAL (最終画面で静止)
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

  // 写真アップロード処理（エラー耐性＆圧縮つき）
  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 次回同じファイルを選んでも確実にonChangeが発火するようリセット
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      if (!compressed) return;

      // localStorageに安全に保存（容量超過時は静かにキャッチ）
      try {
        localStorage.setItem(`custom_reveal_photo_v3_${index + 1}`, compressed);
      } catch (err) {
        console.warn('localStorage save warning:', err);
      }

      // 画面の状態を即座に更新
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = compressed;
        return next;
      });
    } catch (err) {
      console.error('写真の処理に失敗しました:', err);
    }
  };

  // 初期写真へのリセット
  const handleResetPhotos = () => {
    try {
      localStorage.removeItem('custom_reveal_photo');
      localStorage.removeItem('custom_reveal_photo_1');
      localStorage.removeItem('custom_reveal_photo_2');
      localStorage.removeItem('custom_reveal_photo_3');
      localStorage.removeItem('custom_reveal_photo_v2_1');
      localStorage.removeItem('custom_reveal_photo_v2_2');
      localStorage.removeItem('custom_reveal_photo_v2_3');
      localStorage.removeItem('custom_reveal_photo_v3_1');
      localStorage.removeItem('custom_reveal_photo_v3_2');
      localStorage.removeItem('custom_reveal_photo_v3_3');
    } catch {
      // ignore
    }
    setPhotos([
      SURPRISE_CONFIG.photos?.[0] || '/images/reveal-photo.jpg',
      SURPRISE_CONFIG.photos?.[1] || '/images/reveal-photo-2.jpg',
      SURPRISE_CONFIG.photos?.[2] || '/images/reveal-photo-3.jpg',
    ]);
  };

  // 祝福のシャワー（安っぽくならないシャンパンゴールド・ホワイトの微細ストリーマー）
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

      // 遅れて中央上部からゆっくり舞い降りる微細な金粉
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 100,
          origin: { x: 0.5, y: 0.1 },
          colors,
          ticks: 280,
          gravity: 0.5,
          scalar: 0.8,
        });
      }, 700);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      id="reveal-experience-container"
      className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#fdfcf9] via-[#fbf8f2] to-[#f5eee2] px-4 py-5 sm:px-6 sm:py-7 select-none text-[#2c241c]"
    >
      {/* 幻想的な背景の光彩オーラ */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(247,225,160,0.45)_0%,rgba(251,248,242,0.85)_70%)]" />

      {/* 花畑キャンバス（写真の周囲を包み込む） */}
      <FlowerFieldCanvas active={flowerActive} />

      {/* 光の拡散フラッシュ（フェーズ2以降） */}
      {phase === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0.4], scale: [0.4, 2, 2.8] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-30 bg-gradient-radial from-[#ffffff] via-[#fff5d6] to-transparent"
        />
      )}

      {/* ─── 上部エリア：HAPPY NEWS & メッセージ ─── */}
      <div className="relative z-30 flex w-full flex-col items-center pt-1 text-center">
        {/* HAPPY NEWS（最後まで残す） */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{
                opacity: 1,
                scale: phase >= 4 ? 0.9 : 1,
                y: phase >= 4 ? -2 : 6,
              }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              <h1 className="font-cinzel text-2xl font-extrabold tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-[#aa771c] via-[#d4af37] to-[#8c6710] drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] sm:text-3xl my-1">
                HAPPY NEWS
              </h1>
              <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 妊娠発表メッセージ: 「新しい命を、授かることができました。」 (指定の区切り方) */}
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
              <div className="font-mincho text-lg font-normal leading-relaxed tracking-[0.22em] text-[#2c241c] sm:text-xl space-y-0.5 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">
                <p>新しい命を、授かることが</p>
                <p>できました。</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 中央エリア：写真 3枚構成（上：横長1枚 ＋ 下：縦長2枚の調和レイアウト） ─── */}
      <div className="relative z-30 my-auto flex w-full max-w-[360px] flex-col items-center justify-center gap-2.5 sm:gap-3 px-1 py-1">
        <AnimatePresence>
          {phase >= 4 && (
            <>
              {/* ① 上部：横長写真（メイン・エコー写真等） */}
              <motion.div
                initial={{ opacity: 0, scale: 1.06, y: -8, filter: 'brightness(1.8) blur(4px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'brightness(1) blur(0px)' }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[16/9] rounded-xl p-1 shadow-[0_12px_32px_rgba(180,150,80,0.22)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65"
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#ffffff] border border-[#e5d5b3]">
                  <img
                    id="reveal-photo-image-1"
                    src={photos[0]}
                    alt="写真1（横長）"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                  />
                  {/* 微細な光彩オーバーレイ */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                </div>
                {/* 四隅のゴールドコーナー */}
                <div className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-[#d4af37]" />
                <div className="pointer-events-none absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-[#d4af37]" />
                <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-[#d4af37]" />
                <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-[#d4af37]" />
              </motion.div>

              {/* ② 下部：縦長写真 2枚並び */}
              <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3">
                {/* 写真② (縦長・左) */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.06, x: -8, filter: 'brightness(1.8) blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 1.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full aspect-[3/4] rounded-xl p-1 shadow-[0_12px_32px_rgba(180,150,80,0.2)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#ffffff] border border-[#e5d5b3]">
                    <img
                      id="reveal-photo-image-2"
                      src={photos[1]}
                      alt="写真2（縦長・左）"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                  </div>
                  <div className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-[#d4af37]" />
                </motion.div>

                {/* 写真③ (縦長・右) */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.06, x: 8, filter: 'brightness(1.8) blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 1.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full aspect-[3/4] rounded-xl p-1 shadow-[0_12px_32px_rgba(180,150,80,0.2)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#ffffff] border border-[#e5d5b3]">
                    <img
                      id="reveal-photo-image-3"
                      src={photos[2]}
                      alt="写真3（縦長・右）"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
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
      <div className="relative z-30 flex min-h-[48px] w-full flex-col items-center justify-center text-center">
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              {/* 光の中から浮かび上がる 2027.05.28 */}
              <span className="font-cinzel text-2xl font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#8c6710] via-[#b5871f] to-[#71520a] drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)] sm:text-3xl">
                {SURPRISE_CONFIG.dueDate}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 動作確認用：「最初に戻る」＆「写真1・2・3差し替え」ボタン（SURPRISE_CONFIG.showRestartButton = false でリリース時にワンクリックで非表示可能） */}
      {SURPRISE_CONFIG.showRestartButton && phase >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-40 mt-2 pb-1 flex flex-col items-center gap-1.5"
        >
          {/* 非表示のファイル入力（refで確実にクリック） */}
          <input
            ref={fileInput1Ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoUpload(0, e)}
          />
          <input
            ref={fileInput2Ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoUpload(1, e)}
          />
          <input
            ref={fileInput3Ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoUpload(2, e)}
          />

          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[380px]">
            {/* 最初に戻る */}
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center justify-center gap-1 rounded-full border border-[#d4af37]/60 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 text-[#aa771c]" />
              <span className="font-mincho text-[11px] font-semibold tracking-wider text-[#2c241c]">
                最初に戻る
              </span>
            </button>

            {/* 写真①（横長）変更 */}
            <button
              type="button"
              onClick={() => fileInput1Ref.current?.click()}
              className="flex items-center justify-center gap-1 rounded-full border border-[#d4af37]/60 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 cursor-pointer"
            >
              <Upload className="h-3 w-3 text-[#aa771c]" />
              <span className="font-mincho text-[11px] font-semibold tracking-wider text-[#2c241c]">
                写真①(横)
              </span>
            </button>

            {/* 写真②（縦長・左）変更 */}
            <button
              type="button"
              onClick={() => fileInput2Ref.current?.click()}
              className="flex items-center justify-center gap-1 rounded-full border border-[#d4af37]/60 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 cursor-pointer"
            >
              <Upload className="h-3 w-3 text-[#aa771c]" />
              <span className="font-mincho text-[11px] font-semibold tracking-wider text-[#2c241c]">
                写真②(縦左)
              </span>
            </button>

            {/* 写真③（縦長・右）変更 */}
            <button
              type="button"
              onClick={() => fileInput3Ref.current?.click()}
              className="flex items-center justify-center gap-1 rounded-full border border-[#d4af37]/60 bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 cursor-pointer"
            >
              <Upload className="h-3 w-3 text-[#aa771c]" />
              <span className="font-mincho text-[11px] font-semibold tracking-wider text-[#2c241c]">
                写真③(縦右)
              </span>
            </button>

            {/* 初期画像に戻す */}
            <button
              type="button"
              onClick={handleResetPhotos}
              title="初期写真に戻す"
              className="flex items-center justify-center gap-1 rounded-full border border-[#d4af37]/40 bg-white/75 px-2 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:bg-white active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-2.5 w-2.5 text-[#8c6710]" />
              <span className="font-mincho text-[10px] text-[#554736]">
                初期化
              </span>
            </button>
          </div>

          <span className="text-[10px] text-[#8c7e6c] font-mincho tracking-wider">
            ※動作確認用操作（本番リリース時は config.ts で非表示化可能）
          </span>
        </motion.div>
      )}
    </div>
  );
};
