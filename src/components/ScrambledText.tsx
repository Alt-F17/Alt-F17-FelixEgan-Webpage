/// <reference types="react" />
/// <reference types="react/jsx-runtime" />
import { useEffect, useMemo, useState } from 'react';

interface ScrambledTextProps {
  initialText: string;
  targetText: string;
  scrambleChars?: string[];
  duration?: number;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const defaultScrambleChars = ['#', '%', '&', '?', '+', '*', '/'];
const blankChar = '\u2800';

const toChars = (text: string) => Array.from(text);

const padChars = (text: string, length: number) => {
  const chars = toChars(text);
  while (chars.length < length) {
    chars.push(blankChar);
  }
  return chars;
};

const getWordRanges = (text: string, paddedLength: number) => {
  const chars = toChars(text);
  const ranges: Array<{ type: 'word' | 'space'; start: number; end: number }> = [];
  let index = 0;

  while (index < chars.length) {
    const start = index;
    const isSpace = /\s/.test(chars[index]);

    while (index < chars.length && /\s/.test(chars[index]) === isSpace) {
      index++;
    }

    ranges.push({ type: isSpace ? 'space' : 'word', start, end: index });
  }

  if (paddedLength > chars.length) {
    ranges.push({ type: 'word', start: chars.length, end: paddedLength });
  }

  return ranges;
};

const ScrambledText = ({
  initialText,
  targetText,
  scrambleChars = defaultScrambleChars,
  speed = 100,
  className,
  onComplete,
}: ScrambledTextProps) => {
  const initialChars = useMemo(() => toChars(initialText), [initialText]);
  const targetChars = useMemo(() => toChars(targetText), [targetText]);
  const maxLen = Math.max(initialChars.length, targetChars.length);
  const start = useMemo(() => padChars(initialText, maxLen), [initialText, maxLen]);
  const end = useMemo(() => padChars(targetText, maxLen), [targetText, maxLen]);
  const frames = useMemo(
    () => scrambleChars.map((char) => toChars(char)[0] ?? ''),
    [scrambleChars],
  );
  const wordRanges = useMemo(() => getWordRanges(targetText, maxLen), [targetText, maxLen]);
  const [displayChars, setDisplayChars] = useState<string[]>(start);

  useEffect(() => {
    const current = [...start];
    const state = Array.from({ length: maxLen }, () => ({ idx: 0, done: false }));
    let tick = 0;
    let intervalId: number | undefined;

    setDisplayChars([...current]);

    const timerId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        for (let i = 0; i < maxLen; i++) {
          const charState = state[i];
          if (!charState.done && tick >= i) {
            if (charState.idx < frames.length) {
              current[i] = frames[charState.idx];
              charState.idx++;
            } else {
              current[i] = end[i];
              charState.done = true;
            }
          }
        }

        setDisplayChars([...current]);
        tick++;

        if (state.every((charState) => charState.done) && intervalId) {
          clearInterval(intervalId);
          window.setTimeout(() => {
            onComplete?.();
          }, 300);
        }
      }, speed);
    }, 30);

    return () => {
      clearTimeout(timerId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [end, frames, maxLen, onComplete, speed, start]);

  return (
    <span
      className={className}
      style={{ whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'normal' }}
    >
      {wordRanges.map((range, rangeIndex) => {
        if (range.type === 'space') {
          return <span key={rangeIndex}> </span>;
        }

        return (
          <span key={rangeIndex} className="inline-block whitespace-nowrap align-baseline">
            {displayChars.slice(range.start, range.end).map((char, charIndex) => (
              <span key={charIndex} className="inline-block min-w-[0.55ch] text-center">
                {char === blankChar ? '\u00a0' : char}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
};

export default ScrambledText;
