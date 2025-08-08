import React, { useEffect, useRef, useState } from 'react';

interface VoiceMessagePlayerProps {
  src: string;
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const safeFormatTime = (sec: number) => {
  if (!isFinite(sec) || isNaN(sec) || sec < 0) return "0:00";
  return formatTime(sec);
};

const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bars, setBars] = useState<number[]>([]);
  const [liveMode, setLiveMode] = useState(false);
  const rafRef = useRef<number | null>(null);
  const progressRafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const [barsCount, setBarsCount] = useState(48);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    const el = audioRef.current;
    if (!el) return;
    // duration у webm может быть Infinity/NaN. Хак: прыгнуть в конец, затем вернуться
    if (!isFinite(el.duration) || el.duration === Infinity) {
      const onFakeSeek = () => {
        // После прыжка браузер рассчитает duration как currentTime
        setDuration(el.currentTime || 0);
        el.currentTime = 0;
        el.removeEventListener('timeupdate', onFakeSeek);
      };
      el.addEventListener('timeupdate', onFakeSeek);
      try {
        el.currentTime = 1e10; // достаточно большое значение
      } catch {
        // если не удалось, оставим 0
      }
    } else {
      setDuration(el.duration || 0);
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setCurrentTime(0);
    if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
    progressRafRef.current = null;
  };

  // Клик по волнам для перемотки
  const waveformRef = useRef<HTMLDivElement>(null);
  const handleSeekWave = (clientX: number) => {
    if (!audioRef.current || !waveformRef.current || duration === 0) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const time = ratio * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  useEffect(() => {
    // Подгружаем и считаем простую волну (RMS по чанкам)
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(src);
        const buf = await resp.arrayBuffer();
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuf = await ctx.decodeAudioData(buf);
        const channel = audioBuf.getChannelData(0);
        const chunkSize = Math.max(1, Math.floor(channel.length / barsCount));
        const values: number[] = [];
        for (let i = 0; i < barsCount; i++) {
          const start = i * chunkSize;
          let sum = 0;
          let count = 0;
          for (let j = 0; j < chunkSize && start + j < channel.length; j++) {
            const v = channel[start + j];
            sum += Math.abs(v);
            count++;
          }
          const avg = count ? sum / count : 0;
          values.push(avg);
        }
        // Нормализация
        const max = Math.max(...values, 0.0001);
        const normalized = values.map(v => v / max);
        if (!cancelled) setBars(normalized);
        ctx.close();
      } catch {
        // Фоллбэк: анализ в реальном времени через AnalyserNode (подойдёт для blob:webm)
        try {
          const el = audioRef.current;
          if (!el) return;
          const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
          const ctx = new AudioCtx();
          const srcNode = ctx.createMediaElementSource(el);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128; // 64 столбика
          srcNode.connect(analyser);
          analyser.connect(ctx.destination);
          setLiveMode(true);
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteFrequencyData(data);
            // Сводим в barsCount столбиков
            const step = Math.max(1, Math.floor(data.length / barsCount));
            const values: number[] = [];
            for (let i = 0; i < barsCount; i++) {
              const start = i * step;
              let sum = 0;
              let cnt = 0;
              for (let j = 0; j < step && start + j < data.length; j++) {
                sum += data[start + j];
                cnt++;
              }
              const avg = cnt ? sum / (cnt * 255) : 0; // 0..1
              values.push(avg);
            }
            setBars(values);
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        } catch {
          // игнор
        }
      }
    })();
    return () => { cancelled = true; };
  }, [src, barsCount]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
    };
  }, []);

  // Адаптивное число столбиков по ширине контейнера
  useEffect(() => {
    const el = waveformRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const unit = 5; // 3px bar + ~2px gap
        const count = Math.max(24, Math.min(96, Math.floor(w / unit) - 8));
        setBarsCount(count || 48);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Drag/seek по волновой дорожке (мышь + тач)
  const draggingRef = useRef(false);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      handleSeekWave(e.clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      handleSeekWave(e.touches[0].clientX);
    };
    const onTouchEnd = () => { draggingRef.current = false; };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  // Очень плавное обновление прогресса: читаем currentTime на каждом кадре
  const startProgressTicker = () => {
    if (!audioRef.current) return;
    if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current);
    const tick = () => {
      const el = audioRef.current!;
      const t = el.currentTime || 0;
      // Избегаем лишних ререндеров: обновляем при заметном изменении
      if (Math.abs(t - lastTimeRef.current) > 0.01) {
        lastTimeRef.current = t;
        setCurrentTime(t);
      }
      progressRafRef.current = requestAnimationFrame(tick);
    };
    progressRafRef.current = requestAnimationFrame(tick);
  };

  return (
    <div className="flex items-center gap-3 w-full bg-green-100 rounded-xl px-3 py-2 shadow relative">
      <div className="flex-none">
        <button
          type="button"
          onClick={handlePlayPause}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 transition flex-shrink-0"
          aria-label={playing ? 'Пауза' : 'Воспроизвести'}
        >
          {playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="5" width="4" height="14" rx="2" fill="white"/>
              <rect x="13" y="5" width="4" height="14" rx="2" fill="white"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polygon points="9,6 19,12 9,18" fill="white"/>
            </svg>
          )}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div
          ref={waveformRef}
          className="relative w-full h-8 bg-green-50 rounded-lg border border-green-200 cursor-pointer overflow-hidden flex items-end gap-[2px] px-2"
          onClick={(e) => handleSeekWave(e.clientX)}
          onMouseDown={(e) => { draggingRef.current = true; handleSeekWave(e.clientX); }}
          onTouchStart={(e) => { draggingRef.current = true; handleSeekWave(e.touches[0].clientX); }}
        >
          {/* Базовые колонки */}
          {bars.length > 0 ? (
            bars.map((v, i) => {
              const barH = 4 + Math.round(v * 20); // 4..24px
              const played = duration > 0 && (i / barsCount) <= (currentTime / duration);
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-sm ${played ? 'bg-emerald-600' : 'bg-emerald-300'}`}
                  style={{ height: `${barH}px`, transition: 'height 120ms linear, background-color 120ms linear' }}
                />
              );
            })
          ) : (
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-[2px] bg-emerald-300 rounded" />
            </div>
          )}
          {/* Ползунок-точка */}
          {duration > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-700 rounded-full shadow"
              style={{ left: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%`, transform: 'translate(-50%, -50%)', transition: 'left 60ms linear' }}
            />
          )}
        </div>
      </div>
      <span className="text-xs text-green-900 w-16 text-right font-mono">
        {safeFormatTime(currentTime)} / {safeFormatTime(duration)}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => { setPlaying(true); startProgressTicker(); }}
        onPause={() => { setPlaying(false); if (progressRafRef.current) cancelAnimationFrame(progressRafRef.current); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        hidden
      />
    </div>
  );
};

export default VoiceMessagePlayer; 