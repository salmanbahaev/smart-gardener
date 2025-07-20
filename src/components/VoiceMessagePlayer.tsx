import React, { useRef, useState } from 'react';

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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <div className="flex items-center gap-2 w-full bg-green-100 rounded-xl px-3 py-2 shadow relative">
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
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={progress}
        step={0.01}
        onChange={handleSeek}
        className="flex-1 accent-green-700 h-1"
      />
      <span className="text-xs text-green-900 w-12 text-right font-mono">
        {safeFormatTime(duration)}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        hidden
      />
    </div>
  );
};

export default VoiceMessagePlayer; 