/**
 * 妊娠サプライズWebアプリ 設定
 * 写真や日付をここで一元管理し、差し替えを容易にしています。
 */

import photo1 from './assets/photos/photo-1.jpg';
import photo2 from './assets/photos/photo-2.jpg';
import photo3 from './assets/photos/photo-3.jpg';

export const SURPRISE_CONFIG = {
  // 原本写真3枚を恒久固定（Viteによるハッシュ付きバンドル＆キャッシュ事故防止）
  photos: [
    photo1, // 写真①（横長：IMG_1034 エコー写真）
    photo2, // 写真②（縦長：IMG_0952 母子健康手帳）
    photo3, // 写真③（縦長：IMG_0860 厳島神社鳥居とママ）
  ],

  // 互換用
  photoUrl: photo1,

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
