import React from 'react';

interface LoadingWordsSpinnerProps {
  prefix?: string;
  words?: string[];
  color?: string; // e.g. '#f59e0b' (amber) or '#22D3EE' (cyan)
  bgColor?: string; // e.g. '#090e1d' or '#000000'
  className?: string;
}

export const LoadingWordsSpinner: React.FC<LoadingWordsSpinnerProps> = ({
  prefix = 'đang',
  words = ['tải rom', 'kết nối máy chủ', 'khởi động core', 'đồng bộ netplay', 'chuẩn bị game'],
  color = '#f59e0b',
  bgColor = '#090e1d',
  className = '',
}) => {
  // Ensure we have at least 5 words to match the 5-step keyframe animation
  const displayWords = React.useMemo(() => {
    if (!words || words.length === 0) {
      return ['tải rom', 'kết nối máy chủ', 'khởi động core', 'đồng bộ netplay', 'chuẩn bị game'];
    }
    const result = [...words];
    while (result.length < 5) {
      result.push(...words);
    }
    return result.slice(0, 5);
  }, [words]);

  return (
    <div
      className={`relative inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl border border-amber-500/30 shadow-2xl backdrop-blur-xl ${className}`}
      style={{
        backgroundColor: bgColor,
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.6), 0 0 25px ${color}25`,
      }}
    >
      <div className="flex items-center text-slate-400 font-display font-bold text-lg sm:text-2xl h-10 px-2 select-none">
        <p className="font-semibold text-slate-400 lowercase tracking-wide shrink-0">
          {prefix}
        </p>

        <div className="relative overflow-hidden h-10 ml-2">
          {/* Gradient fade overlay top & bottom */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background: `linear-gradient(${bgColor} 5%, transparent 35%, transparent 65%, ${bgColor} 95%)`,
            }}
          />

          <div className="flex flex-col">
            {displayWords.map((word, idx) => (
              <span
                key={idx}
                className="animate-spin-words block h-10 leading-10 pl-2 font-black uppercase tracking-wider whitespace-nowrap"
                style={{
                  color: color,
                  textShadow: `0 0 12px ${color}80`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
