/**
 * 妊娠サプライズWebアプリ 設定
 * 写真や日付をここで一元管理し、差し替えを容易にしています。
 */

export const SURPRISE_CONFIG = {
  // 写真の参照先（3枚構成：上部横長1枚 + 下部縦長2枚）
  photos: [
    '/images/reveal-photo.jpg',    // 写真①（横長：両親の手元とエコー写真）
    '/images/reveal-photo-2.jpg',  // 写真②（縦長：エコー写真）
    '/images/reveal-photo-3.jpg',  // 写真③（縦長：エコー写真）
  ],

  // 従来の単一指定との互換用
  photoUrl: '/images/reveal-photo.jpg',

  // 2枚目のスクラッチ結果・最終画面の予定日
  dueDate: '2027.5.14',

  // 発表メッセージ（区切り方：新しい命を、授かることが / できました。）
  revealMessageLines: [
    '新しい命を、授かることが',
    'できました。',
  ],

  // 動作確認用設定：最終画面に「最初に戻る」ボタンを表示（本番リリース時は false にするだけで非表示になります）
  showRestartButton: true,

  // オーディオファイルのパス（配置されていれば優先再生、なければ高品位Web Audio APIで自動合成）
  audio: {
    bgm: '/audio/bgm.mp3',
    envelopeTear: '/audio/envelope-tear.mp3',
  },
};
