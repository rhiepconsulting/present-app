export type AppStep =
  | 'INTRO'                 // 導入画面
  | 'ENVELOPE'              // 封筒登場
  | 'CARDS_CHOICE'          // 2枚のカード選択
  | 'SCRATCH_CARD'          // スクラッチ中
  | 'FIRST_RESULT_DONE'     // 1枚目完了、2枚目へ
  | 'RESULTS_GATHER'        // 2つの結果が中央に集まる
  | 'RIDDLE'                // 謎解き画面
  | 'GIFT_BOX'              // プレゼントボックス・ボール投入画面
  | 'REVEAL_SILENCE'        // 一瞬の静寂
  | 'REVEAL_HAPPY_NEWS'     // HAPPY NEWS + 祝福シャワー
  | 'REVEAL_MESSAGE'        // 新しい命を、授かることができました。
  | 'REVEAL_PHOTO'          // 写真表示
  | 'REVEAL_DATE'           // 予定日表示
  | 'REVEAL_FLOWERS'        // 花畑が一気に広がる
  | 'FINAL_STATIC';         // 最終画面静止

export interface LotteryCardData {
  id: '01' | '02';
  cardNumber: string;       // "HAPPY CARD 01" or "02"
  ticketSerial: string;     // e.g. "№ 8492-7103-0528"
  edition: string;          // "SPECIAL EDITION"
  badge: string;            // "FOR YOU"
}
