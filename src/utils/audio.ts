/**
 * Web Audio API & Audio File Hybrid Manager
 * スマートフォンブラウザで確実に再生されるよう、Web Audio APIによる
 * エレガント＆壮大なプロシージャルシネマティックBGMとリアルな効果音を生成・管理します。
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isBgmPlaying: boolean = false;
  private bgmGain: GainNode | null = null;
  private bgmAudioElement: HTMLAudioElement | null = null;
  private bgmIntervalId: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * 封筒の封を破るリアルな「ビリッ」という音
   */
  public playPaperTear() {
    try {
      const ctx = this.getContext();
      const duration = 0.35;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // ホワイトノイズに紙の繊維が引き裂かれるランダムなパルスを加える
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const decay = Math.exp(-t * 6);
        const tearPulse = Math.sin(i * 0.05) * Math.random() > 0.4 ? 1.5 : 0.4;
        data[i] = ((Math.random() * 2 - 1) * decay * tearPulse);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // 紙の摩擦周波数を強調するバンドパスフィルター
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);
      filter.Q.value = 3.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Audio not permitted yet
    }
  }

  /**
   * スクラッチ時の極微小な擦れ音
   */
  public playScratchTick() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * 結果表示時・光の広がり時のキラキラ音
   */
  public playChime(freq = 1200) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch {
      // Ignore
    }
  }

  /**
   * ボールがプレゼント箱に入った時の心地よい音（ソフトなポトリ音＋優しい鈴の音）
   */
  public playBallIn(isRed: boolean = false) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // コトッという優しい音
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const baseFreq = isRed ? 440 : 523.25;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.18);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // 上品なベルのキラキラ音
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(isRed ? 880 : 1046.5, now + 0.03);
      bellGain.gain.setValueAtTime(0.001, now + 0.03);
      bellGain.gain.linearRampToValueAtTime(0.08, now + 0.06);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now + 0.03);
      bell.stop(now + 0.48);
    } catch {
      // Ignore
    }
  }

  /**
   * 2つのボールが揃って箱が揺れる時の神秘的な演出音
   */
  public playBoxShake() {
    try {
      const ctx = this.getContext();
      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.52);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * ANSWERタップ時に開始する壮大で幻想的なBGM
   * 外部MP3の読み込みを試みつつ、Web Audio APIで感動的なピアノ＆オーケストラアンビエントを合成
   */
  public startRevealMusic(bgmUrl?: string) {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    // 1. 外部ファイルがある場合は再生を試みる
    if (bgmUrl) {
      const audio = new Audio(bgmUrl);
      audio.loop = true;
      audio.volume = 0.8;
      audio.play().then(() => {
        this.bgmAudioElement = audio;
      }).catch(() => {
        // フォールバックとしてプロシージャル合成BGMを起動
        this.startProceduralCinematicScore();
      });
      return;
    }

    // 2. プロシージャル合成シネマティックBGM
    this.startProceduralCinematicScore();
  }

  /**
   * プロシージャル・シネマティック・オーケストレーション
   * 静寂から始まり、徐々に美しく壮大なアンビエント＆ピアノコードへと展開
   */
  private startProceduralCinematicScore() {
    const ctx = this.getContext();
    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
    // 徐々にフェードイン
    this.bgmGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3.0);
    this.bgmGain.connect(ctx.destination);

    // 感動的なコード進行: D - A/C# - Bm - G (温かく神秘的で祝福に満ちた和音)
    const chordProgressions = [
      // D maj (D3, A3, F#4, A4)
      [146.83, 220.00, 369.99, 440.00, 587.33],
      // A/C# (C#3, A3, E4, A4)
      [138.59, 220.00, 329.63, 440.00, 659.25],
      // Bm (B2, F#3, D4, F#4)
      [123.47, 185.00, 293.66, 369.99, 587.33],
      // G (G2, D3, B3, G4)
      [98.00, 146.83, 246.94, 392.00, 493.88],
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isBgmPlaying || !this.bgmGain || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chordProgressions[chordIndex % chordProgressions.length];
      chordIndex++;

      // 温かいパッド音とピアノノートをレイヤー生成
      chord.forEach((freq, noteIdx) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // ベース音はサイン波、中高域は温かみのある三角波
        osc.type = noteIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // 各音を少しアルペジオ風にずらして弾く
        const delay = noteIdx * 0.12;
        const noteStart = now + delay;
        const chordDuration = 3.6;

        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(noteIdx === 0 ? 0.35 : 0.15, noteStart + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + chordDuration);

        // 柔らかなフィルター
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200 + noteIdx * 300, noteStart);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(noteStart);
        osc.stop(noteStart + chordDuration + 0.1);
      });
    };

    // 最初のコードを少しタメて（静寂のあと）鳴らす
    window.setTimeout(() => {
      playNextChord();
      this.bgmIntervalId = window.setInterval(playNextChord, 3600);
    }, 800);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmAudioElement) {
      this.bgmAudioElement.pause();
      this.bgmAudioElement = null;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
    }
  }
}

export const audioManager = new AudioManager();
