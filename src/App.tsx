import React, { useState, useEffect } from 'react';
import { AppStep, LotteryCardData } from './types';
import { OrientationGuard } from './components/OrientationGuard';
import { IntroView } from './components/IntroView';
import { EnvelopeView } from './components/EnvelopeView';
import { CardsSelectionView } from './components/CardsSelectionView';
import { ScratchModal } from './components/ScratchModal';
import { ResultsGatherView } from './components/ResultsGatherView';
import { RiddleView } from './components/RiddleView';
import { GiftBoxView } from './components/GiftBoxView';
import { RevealExperience } from './components/RevealExperience';
import { audioManager } from './utils/audio';
import { SURPRISE_CONFIG } from './config';

const CARDS_DATA: [LotteryCardData, LotteryCardData] = [
  {
    id: '01',
    cardNumber: 'HAPPY CARD 01',
    ticketSerial: '№ 8402-9173-0528',
    edition: 'SPECIAL EDITION',
    badge: 'FOR YOU',
  },
  {
    id: '02',
    cardNumber: 'HAPPY CARD 02',
    ticketSerial: '№ 7721-3940-0528',
    edition: 'SPECIAL EDITION',
    badge: 'FOR YOU',
  },
];

export default function App() {
  const [step, setStep] = useState<AppStep>('INTRO');

  // カード選択状態
  const [firstSelectedCardId, setFirstSelectedCardId] = useState<'01' | '02' | null>(null);
  const [currentScratchingCardId, setCurrentScratchingCardId] = useState<'01' | '02' | null>(null);

  // 各カードの結果（カード自体に固定せず、選択順序で決定）
  const [card1Result, setCard1Result] = useState<string | null>(null);
  const [card2Result, setCard2Result] = useState<string | null>(null);

  // ブラウザバック操作でアプリが途中で壊れないように保護
  useEffect(() => {
    // 戻る操作のトラップ
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // ① 導入画面から「運試しをはじめる」タップ
  const handleStart = () => {
    setStep('ENVELOPE');
  };

  // ② 封筒の封が破れ、カードが飛び出した後
  const handleEnvelopeOpened = () => {
    setStep('CARDS_CHOICE');
  };

  // ③ カード選択（どちらを選んでもよい重要仕様）
  const handleSelectCard = (cardId: '01' | '02') => {
    if (!firstSelectedCardId) {
      // 1枚目の選択
      setFirstSelectedCardId(cardId);
    }
    setCurrentScratchingCardId(cardId);
    setStep('SCRATCH_CARD');
  };

  // ④ スクラッチ完了時
  const handleScratchComplete = () => {
    if (!currentScratchingCardId) return;

    if (!firstSelectedCardId || firstSelectedCardId === currentScratchingCardId) {
      // 最初に削ったカードの結果は必ず「①」
      if (currentScratchingCardId === '01') {
        setCard1Result('①');
      } else {
        setCard2Result('①');
      }
      // 1枚目完了 -> カード選択画面へ戻り「もう一枚、削ってみよう」を表示
      setCurrentScratchingCardId(null);
      setStep('CARDS_CHOICE');
    } else {
      // 2枚目に削ったカードの結果は必ず「SURPRISE_CONFIG.dueDate」
      if (currentScratchingCardId === '01') {
        setCard1Result(SURPRISE_CONFIG.dueDate);
      } else {
        setCard2Result(SURPRISE_CONFIG.dueDate);
      }
      // 2枚目完了 -> 2つの結果が中央に集まる画面へ
      setCurrentScratchingCardId(null);
      setStep('RESULTS_GATHER');
    }
  };

  // ⑤ 結果確認後の NEXT タップ
  const handleResultsNext = () => {
    setStep('RIDDLE');
  };

  // ⑥ 謎解き画面で ANSWER タップ -> プレゼントボックス画面へ
  const handleAnswer = () => {
    setStep('GIFT_BOX');
  };

  // ⑦ プレゼントボックスで「開ける」タップ -> 妊娠報告演出へ
  const handleGiftBoxOpen = () => {
    setStep('REVEAL_HAPPY_NEWS');
  };

  // 動作確認用：最初に戻る（状態と音楽を完全リセット）
  const handleRestart = () => {
    audioManager.stopBgm();
    setStep('INTRO');
    setFirstSelectedCardId(null);
    setCurrentScratchingCardId(null);
    setCard1Result(null);
    setCard2Result(null);
  };

  // 現在スクラッチ中のカード情報と、そのカードが出るべき結果を計算
  const currentCard = CARDS_DATA.find((c) => c.id === currentScratchingCardId);
  const isScratchingFirst = firstSelectedCardId === currentScratchingCardId;
  const currentResultValue = isScratchingFirst ? '①' : SURPRISE_CONFIG.dueDate;

  return (
    <div className="relative min-h-screen w-full bg-[#eee9df] flex justify-center overflow-x-hidden font-mincho">
      {/* 画面回転ガード（スマートフォン横向き時に縦画面へ促す） */}
      <OrientationGuard />

      {/* モバイルファーストのフレーム制約（スマートフォン幅に最適化、PCでも美しくプレビュー） */}
      <main className="relative w-full max-w-md min-h-screen bg-[#faf8f5] shadow-2xl flex flex-col">
        {step === 'INTRO' && <IntroView onStart={handleStart} />}

        {step === 'ENVELOPE' && <EnvelopeView onOpened={handleEnvelopeOpened} />}

        {step === 'CARDS_CHOICE' && (
          <CardsSelectionView
            cards={CARDS_DATA}
            firstSelectedCardId={firstSelectedCardId}
            card1Result={card1Result}
            card2Result={card2Result}
            onSelectCard={handleSelectCard}
          />
        )}

        {/* スクラッチモーダル（カード拡大＆指でスクラッチ） */}
        {step === 'SCRATCH_CARD' && currentCard && (
          <ScratchModal
            card={currentCard}
            isFirstCard={isScratchingFirst}
            resultValue={currentResultValue}
            onComplete={handleScratchComplete}
          />
        )}

        {step === 'RESULTS_GATHER' && <ResultsGatherView onNext={handleResultsNext} />}

        {step === 'RIDDLE' && <RiddleView onAnswer={handleAnswer} />}

        {step === 'GIFT_BOX' && <GiftBoxView onOpen={handleGiftBoxOpen} />}

        {step === 'REVEAL_HAPPY_NEWS' && <RevealExperience onRestart={handleRestart} />}
      </main>
    </div>
  );
}
