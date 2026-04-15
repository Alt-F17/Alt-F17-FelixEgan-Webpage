import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useToolsStore } from "@/store/toolsStore";

export interface JumbleWord {
  word: string;
  hint: string;
}

interface WordJumbleProps {
  data: JumbleWord[];
}

const WordJumble: React.FC<WordJumbleProps> = ({ data }) => {
  const { wordJumbleState, updateWordJumbleState, initWordJumble } = useToolsStore();
  const { deckOrder, currentIndex, mistakes } = wordJumbleState;
  
  const words: JumbleWord[] = data;

  const [guess, setGuess] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // Updated shuffleArray to be generic
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const scrambleWord = useCallback((word: string): string => {
    const arr = word.split("");
    let scrambled;
    do {
      // Fixed: Create an array of indices first, shuffle them, then map to characters
      const indices = Array.from({ length: arr.length }, (_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      scrambled = shuffledIndices.map(i => arr[i]).join("");
    } while (scrambled === word);
    return scrambled;
  }, [shuffleArray]);

  useEffect(() => {
    // Initialize or re-initialize if deckOrder empty or mismatched length
    if (deckOrder.length === 0 || deckOrder.length !== words.length) {
      initWordJumble(words.length);
    }
  }, [deckOrder.length, initWordJumble, words.length]);

  useEffect(() => {
    if (deckOrder.length > 0 && currentIndex < deckOrder.length) {
      const wordObj = words[deckOrder[currentIndex]];
      setScrambledWord(scrambleWord(wordObj.word));
      setIsCompleted(false);
    } else if (deckOrder.length > 0) {
      setIsCompleted(true);
    }
  }, [currentIndex, deckOrder, words, scrambleWord]);

  const handleGuessSubmit = () => {
    if (currentIndex >= deckOrder.length) return;
    
    const wordObj = words[deckOrder[currentIndex]];
    if (guess.trim().toLowerCase() === wordObj.word.toLowerCase()) {
      toast.success("Correct!");
      updateWordJumbleState({ currentIndex: currentIndex + 1 });
      setGuess("");
    } else {
      toast.error("Try again!");
      updateWordJumbleState({ mistakes: mistakes + 1 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuessSubmit();
    }
  };

  const progress = deckOrder.length > 0
    ? Math.round((currentIndex / deckOrder.length) * 100)
    : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Word Jumble</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Unscramble the programming keyword or concept ( _ = <i>space</i>):</p>
        {/* Numeric progress indicator */}
        <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
          <span>{currentIndex} / {deckOrder.length}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="mb-4" />

        {isCompleted ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">🎉 Completed!</h3>
            <p className="mb-4">You made {mistakes} mistakes.</p>
            <Button onClick={() => initWordJumble(words.length)}>Play Again</Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-3xl font-bold mb-2">{scrambledWord}</p>
              {deckOrder.length > 0 && currentIndex < deckOrder.length && (
                <p className="text-gray-500 italic">{words[deckOrder[currentIndex]]?.hint}</p>
              )}
            </div>
            
            <div className="flex space-x-2 mb-4">
              <Input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your guess"
                disabled={isCompleted}
              />
              <Button onClick={handleGuessSubmit} disabled={isCompleted}>Submit</Button>
            </div>
            
            <p className="text-gray-600">Mistakes: {mistakes}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WordJumble;
