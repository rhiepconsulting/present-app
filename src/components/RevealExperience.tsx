import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Upload, RefreshCw, Maximize2, X, Check, Lock, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SURPRISE_CONFIG } from '../config';
import { FlowerFieldCanvas } from './FlowerFieldCanvas';

interface RevealExperienceProps {
  onRestart?: () => void;
}

// スマートフォンの大容量カメラ写真（5〜10MB）をWeb最適化JPEGに自動圧縮
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1400; // 高解像度かつ軽量に維持
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
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
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
  // 3枚構成：写真①（横長・IMG_1034）、写真②（縦長・IMG_0952）、写真③（縦長・IMG_0860）
  const [photos, setPhotos] = useState<string[]>(() => {
    let s1 = null;
    let s2 = null;
    let s3 = null;
    try {
      s1 = localStorage.getItem('custom_reveal_photo_v3_1');
      s2 = localStorage.getItem('custom_reveal_photo_v3_2');
      s3 = localStorage.getItem('custom_reveal_photo_v3_3');
    } catch {
      // localStorage restriction
    }
    const def1 = SURPRISE_CONFIG.photos?.[0] || '/images/reveal-photo-1.jpg';
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
  // 5: DATE (写真の下から光が広がり、日付が浮かび上がる)
  // 6: FLOWERS (写真の周囲から花畑が一気に広がる 3〜5秒)
  // 7: FINAL (最終レイアウトで静止、音楽は流し続ける)
  const [phase, setPhase] = useState<number>(1);
  const [flowerActive, setFlowerActive] = useState<boolean>(false);

  // 原本写真のフルスクリーン拡大モーダル（ライトボックス）
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // 原本写真固定管理モーダル
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isLockedPermanently, setIsLockedPermanently] = useState(false);

  // サーバーへ原本写真を固定保存する通信ヘルパー
  const persistPhotosToBackend = async (photoList: string[]) => {
    try {
      const res = await fetch('/api/save-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo1: photoList[0],
          photo2: photoList[1],
          photo3: photoList[2],
        }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  useEffect(() => {
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

    // 初回マウント時：もし以前ブラウザ上で差し替えられた原本写真がlocalStorageに残っていれば、
    // 自動的にサーバー本体（public/images/）に恒久保存・同期
    try {
      const s1 = localStorage.getItem('custom_reveal_photo_v3_1');
      const s2 = localStorage.getItem('custom_reveal_photo_v3_2');
      const s3 = localStorage.getItem('custom_reveal_photo_v3_3');
      if (s1 || s2 || s3) {
        persistPhotosToBackend([
          s1 || photos[0],
          s2 || photos[1],
          s3 || photos[2],
        ]).then((ok) => {
          if (ok) {
            setIsLockedPermanently(true);
          }
        });
      }
    } catch {
      // ignore
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // 写真アップロード＆即時サーバー固定保存処理
  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      if (!compressed) return;

      const nextPhotos = [...photos];
      nextPhotos[index] = compressed;
      setPhotos(nextPhotos);

      try {
        localStorage.setItem(`custom_reveal_photo_v3_${index + 1}`, compressed);
      } catch (err) {
        console.warn('localStorage warning:', err);
      }

      // サーバー側の public/images/ に即時恒久保存
      const ok = await persistPhotosToBackend(nextPhotos);
      if (ok) {
        setIsLockedPermanently(true);
        setSaveSuccessMsg('原本写真をアプリ本体（GitHub反映用）に固定保存しました！');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('写真の処理に失敗しました:', err);
    }
  };

  // 全写真をアプリ本体に固定保存
  const handleLockAllPhotos = async () => {
    setIsSaving(true);
    try {
      const ok = await persistPhotosToBackend(photos);
      if (ok) {
        setIsLockedPermanently(true);
        // 保存完了後はlocalStorageの破棄をして、アプリバンドル直参照モードに完全移行
        try {
          localStorage.removeItem('custom_reveal_photo_v3_1');
          localStorage.removeItem('custom_reveal_photo_v3_2');
          localStorage.removeItem('custom_reveal_photo_v3_3');
        } catch {
          // ignore
        }
        setSaveSuccessMsg('🎉 原本写真（1034横・0952縦・0860縦）をアプリ本体とGitHubに完全固定しました！');
        setTimeout(() => {
          setSaveSuccessMsg('');
          setIsManageModalOpen(false);
        }, 3000);
      } else {
        setSaveSuccessMsg('⚠️ 保存に失敗しました。もう一度お試しください。');
      }
    } catch {
      setSaveSuccessMsg('⚠️ 通信エラーが発生しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // 初期写真へのリセット
  const handleResetPhotos = () => {
    try {
      localStorage.removeItem('custom_reveal_photo_v3_1');
      localStorage.removeItem('custom_reveal_photo_v3_2');
      localStorage.removeItem('custom_reveal_photo_v3_3');
    } catch {
      // ignore
    }
    setPhotos([
      SURPRISE_CONFIG.photos?.[0] || '/images/reveal-photo-1.jpg',
      SURPRISE_CONFIG.photos?.[1] || '/images/reveal-photo-2.jpg',
      SURPRISE_CONFIG.photos?.[2] || '/images/reveal-photo-3.jpg',
    ]);
    setSaveSuccessMsg('初期写真状態に戻しました');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // 祝福のシャワー
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
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-[#f9f7f2] via-[#faf8f4] to-[#f4ede1] px-3.5 py-4 select-none">
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
      <div className="relative z-30 flex flex-col items-center pt-2 sm:pt-4 text-center">
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
              <div className="font-mincho text-lg font-normal leading-relaxed tracking-[0.22em] text-[#2c241c] sm:text-xl space-y-0.5 drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">
                <p>新しい命を、授かることが</p>
                <p>できました。</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 中央エリア：写真 3枚構成（上：①横長1枚 + 下：②③縦長2枚並び） ─── */}
      <div className="relative z-30 my-auto flex w-full max-w-[360px] flex-col items-center justify-center gap-2.5 sm:gap-3 px-1 py-1">
        <AnimatePresence>
          {phase >= 4 && (
            <>
              {/* ① 上部：横長写真（1034横写真） */}
              <motion.div
                initial={{ opacity: 0, scale: 1.06, y: -8, filter: 'brightness(1.8) blur(4px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'brightness(1) blur(0px)' }}
                transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setLightboxImage({ src: photos[0], title: '写真①（横写真・IMG_1034）' })}
                className="group relative w-full aspect-[16/9] rounded-xl p-1 shadow-[0_12px_32px_rgba(180,150,80,0.22)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#000000] border border-[#e5d5b3]">
                  <img
                    id="reveal-photo-image-1"
                    src={photos[0]}
                    alt="写真①（横写真・IMG_1034）"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  {/* 微細な光彩オーバーレイ */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                  {/* タップで拡大ヒント */}
                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-2.5 w-2.5 text-[#d4af37]" />
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
              <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3">
                {/* 写真② (縦長・左・IMG_0952) */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.06, x: -8, filter: 'brightness(1.8) blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 1.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setLightboxImage({ src: photos[1], title: '写真②（縦写真・IMG_0952）' })}
                  className="group relative w-full aspect-[3/4] rounded-xl p-1 shadow-[0_12px_32px_rgba(180,150,80,0.2)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#000000] border border-[#e5d5b3]">
                    <img
                      id="reveal-photo-image-2"
                      src={photos[1]}
                      alt="写真②（縦写真・IMG_0952）"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-2 w-2 text-[#d4af37]" />
                      <span>拡大</span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -top-0.5 -left-0.5 h-2.5 w-2.5 border-t-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -top-0.5 -right-0.5 h-2.5 w-2.5 border-t-2 border-r-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 border-b-2 border-l-2 border-[#d4af37]" />
                  <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 border-b-2 border-r-2 border-[#d4af37]" />
                </motion.div>

                {/* 写真③ (縦長・右・IMG_0860) */}
                <motion.div
                  initial={{ opacity: 0, scale: 1.06, x: 8, filter: 'brightness(1.8) blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: 'brightness(1) blur(0px)' }}
                  transition={{ duration: 1.3, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setLightboxImage({ src: photos[2], title: '写真③（縦写真・IMG_0860）' })}
                  className="group relative w-full aspect-[3/4] rounded-xl p-1 shadow-[0_12px_32px_rgba(180,150,80,0.2)] bg-gradient-to-br from-[#d4af37]/75 via-[#f4e8c1] to-[#b08819]/65 cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#000000] border border-[#e5d5b3]">
                    <img
                      id="reveal-photo-image-3"
                      src={photos[2]}
                      alt="写真③（縦写真・IMG_0860）"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
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
      <div className="relative z-30 flex min-h-[48px] w-full flex-col items-center justify-center text-center">
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <span className="font-cinzel text-2xl font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-[#8c6710] via-[#b5871f] to-[#71520a] drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)] sm:text-3xl">
                {SURPRISE_CONFIG.dueDate}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 成功・ステータス通知メッセージ */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-xl border border-[#d4af37] bg-white/95 px-4 py-3 text-center shadow-2xl backdrop-blur-md"
          >
            <p className="font-mincho text-xs font-semibold text-[#2c241c] leading-relaxed">
              {saveSuccessMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 操作バー：最初に戻る ＆ 原本写真固定ステータス/設定ボタン */}
      {SURPRISE_CONFIG.showRestartButton && phase >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-40 mt-2 pb-1 flex flex-col items-center gap-1.5"
        >
          {/* 非表示のファイル入力（ref制御） */}
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

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-[380px]">
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

            {/* 原本写真固定・管理モーダルを開く */}
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-[#d4af37] bg-gradient-to-r from-[#fdfbf6] to-[#f7f2e5] px-3.5 py-1.5 shadow-sm backdrop-blur-sm transition-all hover:brightness-105 active:scale-95 cursor-pointer"
            >
              <Lock className="h-3 w-3 text-[#aa771c]" />
              <span className="font-mincho text-[11px] font-semibold tracking-wider text-[#2c241c]">
                原本写真の固定設定
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          </div>

          <span className="text-[10px] text-[#8c7e6c] font-mincho tracking-wider">
            ①横(1034) / ②縦(0952) / ③縦(0860) を固定中（タップで拡大）
          </span>
        </motion.div>
      )}

      {/* ─── 原本写真固定管理モーダル ─── */}
      <AnimatePresence>
        {isManageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 12 }}
              className="relative w-full max-w-sm rounded-2xl border border-[#d4af37]/80 bg-[#fdfbf6] p-5 shadow-2xl"
            >
              {/* 閉じるボタン */}
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="absolute top-3.5 right-3.5 rounded-full p-1 text-[#8c6710] hover:bg-stone-200/50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6710] text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-mincho text-sm font-bold text-[#2c241c] tracking-wider">
                    原本写真の固定・GitHub反映
                  </h3>
                  <p className="font-mincho text-[10px] text-[#8c7e6c]">
                    アプリ本体およびGitHubリポジトリに永久保存します
                  </p>
                </div>
              </div>

              {/* 3枚の写真スロット */}
              <div className="space-y-2.5 my-4">
                {/* 写真① */}
                <div className="flex items-center justify-between rounded-xl border border-[#e5d5b3] bg-white p-2.5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={photos[0]}
                      alt="①横写真"
                      className="h-10 w-16 rounded-md object-cover border border-[#e5d5b3]"
                    />
                    <div>
                      <p className="font-mincho text-xs font-semibold text-[#2c241c]">
                        ① 横写真（IMG_1034）
                      </p>
                      <p className="font-mincho text-[10px] text-emerald-700 font-medium">
                        上部メイン・16:9比率
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInput1Ref.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-[#d4af37]/60 bg-[#faf8f4] px-2.5 py-1 text-[11px] font-mincho text-[#2c241c] hover:bg-white cursor-pointer active:scale-95"
                  >
                    <Upload className="h-3 w-3 text-[#aa771c]" />
                    <span>変更</span>
                  </button>
                </div>

                {/* 写真② */}
                <div className="flex items-center justify-between rounded-xl border border-[#e5d5b3] bg-white p-2.5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={photos[1]}
                      alt="②縦写真"
                      className="h-12 w-9 rounded-md object-cover border border-[#e5d5b3]"
                    />
                    <div>
                      <p className="font-mincho text-xs font-semibold text-[#2c241c]">
                        ② 縦写真（IMG_0952）
                      </p>
                      <p className="font-mincho text-[10px] text-emerald-700 font-medium">
                        下部左・3:4比率
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInput2Ref.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-[#d4af37]/60 bg-[#faf8f4] px-2.5 py-1 text-[11px] font-mincho text-[#2c241c] hover:bg-white cursor-pointer active:scale-95"
                  >
                    <Upload className="h-3 w-3 text-[#aa771c]" />
                    <span>変更</span>
                  </button>
                </div>

                {/* 写真③ */}
                <div className="flex items-center justify-between rounded-xl border border-[#e5d5b3] bg-white p-2.5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={photos[2]}
                      alt="③縦写真"
                      className="h-12 w-9 rounded-md object-cover border border-[#e5d5b3]"
                    />
                    <div>
                      <p className="font-mincho text-xs font-semibold text-[#2c241c]">
                        ③ 縦写真（IMG_0860）
                      </p>
                      <p className="font-mincho text-[10px] text-emerald-700 font-medium">
                        下部右・3:4比率
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInput3Ref.current?.click()}
                    className="flex items-center gap-1 rounded-lg border border-[#d4af37]/60 bg-[#faf8f4] px-2.5 py-1 text-[11px] font-mincho text-[#2c241c] hover:bg-white cursor-pointer active:scale-95"
                  >
                    <Upload className="h-3 w-3 text-[#aa771c]" />
                    <span>変更</span>
                  </button>
                </div>
              </div>

              {/* 固定保存ボタン */}
              <button
                type="button"
                disabled={isSaving}
                onClick={handleLockAllPhotos}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b08819] via-[#d4af37] to-[#aa771c] py-2.5 px-4 text-xs font-semibold font-mincho text-white shadow-md hover:brightness-105 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>
                  {isSaving ? '固定保存中...' : 'アプリ本体（GitHub用）に固定保存する'}
                </span>
              </button>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#e5d5b3]/60">
                <button
                  type="button"
                  onClick={handleResetPhotos}
                  className="flex items-center gap-1 text-[10px] font-mincho text-[#8c6710] hover:underline cursor-pointer"
                >
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>初期状態に戻す</span>
                </button>
                <span className="text-[10px] font-mincho text-emerald-700 font-medium">
                  ✓ GitHub Actionsデプロイ対応
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ライトボックス拡大表示モーダル ─── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-3 backdrop-blur-md cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-[85vh] overflow-hidden rounded-2xl border-2 border-[#d4af37] shadow-2xl bg-black flex flex-col items-center justify-center"
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[78vh] max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-2.5 right-2.5 rounded-full bg-black/70 p-2 text-white/90 hover:text-white hover:bg-black/90 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="w-full bg-gradient-to-t from-black/80 to-transparent py-2 px-4 text-center">
                <p className="font-mincho text-xs text-[#f5ebd7] tracking-wider">
                  {lightboxImage.title}
                </p>
                <span className="font-mincho text-[10px] text-stone-400">
                  タップで閉じます
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
