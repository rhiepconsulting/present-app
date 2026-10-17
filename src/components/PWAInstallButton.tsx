import React, { useState } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'minimal' | 'banner' | 'pill' }> = ({
  variant = 'pill',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running as standalone app, hide button
  if (isInstalled) {
    return null;
  }

  // Trigger install prompt for Chromium / Android / Edge / Chrome
  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General fallback guide
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'pill' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif font-medium bg-[#2c2722]/85 text-[#f7f5ef] border border-[#d4af37]/40 shadow-sm hover:bg-[#1f1a17] hover:border-[#d4af37] transition-all backdrop-blur-sm"
          title="ホーム画面に追加してアプリとして起動"
        >
          {isInstallable ? (
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
          )}
          <span>アプリ化・保存</span>
        </button>
      )}

      {/* iOS & Browser Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#fffdfa] border border-[#d4af37]/40 p-6 shadow-2xl text-[#2c2722]">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-700 transition"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2c2722] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2c2722]">
                  ホーム画面に追加（アプリ化）
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  アプリのように全画面で起動できます
                </p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs font-sans text-stone-700 bg-[#f7f5ef] p-4 rounded-xl border border-stone-200">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <div className="flex-1">
                      Safari画面下部（iPadは上部）の
                      <span className="inline-flex items-center gap-0.5 mx-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        <Share2 className="w-3 h-3 text-blue-600 inline" /> 共有
                      </span>
                      アイコンをタップ
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <div className="flex-1">
                      メニューを下にスクロールして
                      <span className="inline-flex items-center gap-0.5 mx-1 font-semibold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        <PlusSquare className="w-3 h-3 text-stone-700 inline" /> ホーム画面に追加
                      </span>
                      を選択
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <div className="flex-1">
                      右上の「追加」をタップすると、ホーム画面に専用アイコンが配置されます。
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <div className="flex-1">
                      ブラウザのメニュー（右上の「︙」またはアドレスバーのインストールアイコン）を開きます。
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <div className="flex-1">
                      「アプリをインストール」または「ホーム画面に追加」をタップします。
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#2c2722] hover:bg-[#1a1614] text-[#f7f5ef] font-serif text-sm font-semibold tracking-wider transition border border-[#d4af37]/40"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
};
