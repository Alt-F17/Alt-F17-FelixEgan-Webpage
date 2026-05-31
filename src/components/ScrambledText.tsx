/// <reference types="react" />
/// <reference types="react/jsx-runtime" />
import { useEffect, useState } from 'react';

interface ScrambledTextProps {
  initialText: string;
  targetText: string;
  scrambleChars?: string[];
  duration?: number; // total animation duration in seconds (unused)
  speed?: number;     // interval in ms between scrambles
  className?: string;
  onComplete?: () => void;
}

const defaultScrambleChars = ['⣀','⣤','⣶','⣿','⠿','⠛','⠉'];

const ScrambledText = ({
  initialText,
  targetText,
  scrambleChars = defaultScrambleChars,
  duration = 0,
  speed = 100,
  className,
  onComplete,
}: ScrambledTextProps) => {
  // pad strings to equal length
  const maxLen = Math.max(initialText.length, targetText.length);
  // Use braille blank (U+2800) for padding to maintain uniform width
  const brailleBlank = '\u2800';
  const start = initialText.padEnd(maxLen, brailleBlank);
  const end = targetText.padEnd(maxLen, brailleBlank);
  const [displayText, setDisplayText] = useState<string>(start);

  useEffect(() => {
    const n = maxLen;
    const frames = scrambleChars;
    // Initialize current chars and per-letter state
    const current = start.split('');
    const state = Array.from({ length: n }, () => ({ idx: 0, done: false }));
    let tick = 0;
    let intervalId: number;

    const timerId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
         // for each letter
         for (let i = 0; i < n; i++) {
           const s = state[i];
           if (!s.done && tick >= i) {
             if (s.idx < frames.length) {
               current[i] = frames[s.idx];
               s.idx++;
             } else {
               current[i] = end[i];
               s.done = true;
             }
           }
         }
         setDisplayText(current.join(''));
         tick++;
         // if all done, stop
         if (state.every((s) => s.done)) {
           clearInterval(intervalId);
           // wait 300ms before firing onComplete
           window.setTimeout(() => {
             onComplete && onComplete();
           }, 300);
         }
       }, speed);
    }, 200);

    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [initialText, targetText, scrambleChars, speed]);

  // Render each character in a fixed-width inline-block to ensure uniform width
  return (
    <span className={className} style={{ whiteSpace: 'normal' }}>
      {displayText.split('').map((char, idx) => (
        <span key={idx} className="inline-block w-[1ch] max-w-full text-center">
          {char}
        </span>
      ))}
    </span>
  );
};

export default ScrambledText;
