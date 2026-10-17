import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  // JSONボディパーサー（画像Data URL用に50MBまで許容）
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 原本写真（1034横・0952縦・0860縦）をアプリ本体・GitHubリポジトリに完全固定保存するAPI
  app.post('/api/save-photos', async (req, res) => {
    try {
      const { photo1, photo2, photo3 } = req.body;
      const imagesDir = path.resolve(__dirname, 'public/images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const saveImage = (base64Data: string, filename: string) => {
        if (!base64Data || typeof base64Data !== 'string') return false;
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const data = matches ? matches[2] : base64Data;
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(path.join(imagesDir, filename), buffer);

        // distが存在する場合はdistにも即時コピーしてリロードなしで反映可能にする
        const distDir = path.resolve(__dirname, 'dist/images');
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, filename), buffer);
        }
        return true;
      };

      let savedCount = 0;
      if (photo1 && saveImage(photo1, 'reveal-photo-1.jpg')) {
        saveImage(photo1, 'reveal-photo.jpg');
        savedCount++;
      }
      if (photo2 && saveImage(photo2, 'reveal-photo-2.jpg')) {
        savedCount++;
      }
      if (photo3 && saveImage(photo3, 'reveal-photo-3.jpg')) {
        savedCount++;
      }

      console.log(`[API] Saved ${savedCount} original photos to public/images/`);

      // Gitにも自動ステージ＆コミットしてGitHubプッシュ準備を完了させる
      exec(
        'git add public/images/ && git commit -m "feat: Lock original photos (1034 landscape, 0952 portrait, 0860 portrait)" || true',
        (gitErr, stdout) => {
          if (gitErr) {
            console.warn('[Git notice]', gitErr.message);
          } else {
            console.log('[Git commit]', stdout);
          }
        }
      );

      res.json({
        success: true,
        savedCount,
        message: '原本写真（1034横・0952縦・0860縦）をアプリ本体に固定保存しました。',
      });
    } catch (err: any) {
      console.error('[API Error]', err);
      res.status(500).json({ success: false, error: err.message || '保存に失敗しました' });
    }
  });

  // Vite開発ミドルウェアをマウント（AI Studio標準フルスタック構成）
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Dev Server] Running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Dev Server Start Error]', err);
  process.exit(1);
});
