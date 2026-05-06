import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToolsStore } from "@/store/toolsStore";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface BugProblem {
  code: string;
  bugLine: number; // 1-indexed
  bugDescription: string; // New field for bug description
  language?: string;
}

interface SpotBugProps {
  data: BugProblem[];
}

const SpotBug: React.FC<SpotBugProps> = ({ data }) => {
  const { spotBugState, updateSpotBugState, initSpotBug } = useToolsStore();
  const { deckOrder, currentIndex, correctCount, wrongCount, answered } = spotBugState;
  
  // Ensure deckOrder is sorted for consistent problem order
  const sortedDeckOrder = useMemo(() => {
    return [...deckOrder].sort((a, b) => a - b);
  }, [deckOrder]);

  const currentProblemIndex = sortedDeckOrder.length > 0 && currentIndex < sortedDeckOrder.length 
    ? sortedDeckOrder[currentIndex] 
    : -1;

  const currentProblem = currentProblemIndex !== -1 ? data[currentProblemIndex] : null;

  const [selectedLine, setSelectedLine] = useState<number>(1); // 1-indexed
  const [lineCount, setLineCount] = useState<number>(1);
  const [highlightedLines, setHighlightedLines] = useState<string[]>([]);
  const [isCodeHighlighted, setIsCodeHighlighted] = useState(false);
  const [submittedLines, setSubmittedLines] = useState<Record<number, number>>({}); // Track submitted line for each problem
  
  // Use ref to always have the latest selectedLine in event handlers
  const selectedLineRef = useRef(selectedLine);
  selectedLineRef.current = selectedLine;

  // Initialize if needed
  useEffect(() => {
    if ((deckOrder.length === 0 || deckOrder.length !== data.length) && data.length > 0) {
      initSpotBug(data.length);
    }
  }, [deckOrder.length, data.length, initSpotBug]);

  // Reset selected line when the problem changes
  useEffect(() => {
    if (currentProblem) {
      setSelectedLine(1);
    }
  }, [currentProblemIndex]); 

  // Process code for highlighting and line numbers
  useEffect(() => {
    if (currentProblem?.code) {
      const codeLines = currentProblem.code.split('\n');
      setLineCount(codeLines.length);
      
      if (typeof window !== "undefined" && (window as any).hljs) {
        const lang = currentProblem.language || 'python';
        try {
          const highlightedHTML = (window as any).hljs.highlight(currentProblem.code, { language: lang, ignoreIllegals: true }).value;
          setHighlightedLines(highlightedHTML.split('\n'));
          setIsCodeHighlighted(true);
        } catch (e) {
          console.warn(`Highlighting failed for language: ${lang}`, e);
          setHighlightedLines(codeLines);
          setIsCodeHighlighted(false);
        }
      } else {
        setHighlightedLines(codeLines);
        setIsCodeHighlighted(false);
      }
    } else {
      setHighlightedLines([]);
      setLineCount(1);
      setIsCodeHighlighted(false);
    }
  }, [currentProblem?.code, currentProblem?.language]); 

  const handlePrevious = useCallback(() => {
    if (sortedDeckOrder.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : sortedDeckOrder.length - 1;
    updateSpotBugState({ currentIndex: newIndex });
  }, [sortedDeckOrder.length, currentIndex, updateSpotBugState]);

  const handleNext = useCallback(() => {
    if (sortedDeckOrder.length === 0) return;
    const newIndex = currentIndex < sortedDeckOrder.length - 1 ? currentIndex + 1 : 0;
    updateSpotBugState({ currentIndex: newIndex });
  }, [sortedDeckOrder.length, currentIndex, updateSpotBugState]);

  const handleSubmit = useCallback(() => {
    if (answered[currentIndex] || !currentProblem) return;

    const lineToSubmit = selectedLineRef.current;
    
    // Store the submitted line for this problem
    setSubmittedLines(prev => ({ ...prev, [currentIndex]: lineToSubmit }));
    
    // DIRECT COMPARISON: selectedLine vs bugLine
    const isCorrect = lineToSubmit === currentProblem.bugLine;
    const newAnswered = { ...answered, [currentIndex]: true };
    
    if (isCorrect) {
      updateSpotBugState({ 
        answered: newAnswered,
        correctCount: correctCount + 1 
      });
    } else {
      updateSpotBugState({ 
        answered: newAnswered,
        wrongCount: wrongCount + 1 
      });
    }
  }, [answered, currentIndex, currentProblem, correctCount, wrongCount, updateSpotBugState]);

  // Keyboard event handler
  // We include all dependencies so the closure always has the latest state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If already answered, only allow navigation
      if (answered[currentIndex]) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevious();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedLine(prev => Math.max(1, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedLine(prev => Math.min(lineCount, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lineCount, answered, currentIndex, handlePrevious, handleNext, handleSubmit]); 

  const resetTests = () => {
    initSpotBug(data.length);
  };

  const progress = data.length > 0 ? Math.round((Object.keys(answered).length / data.length) * 100) : 0;

  const incrementLine = () => {
    if (answered[currentIndex]) return;
    setSelectedLine(prev => Math.min(lineCount, prev + 1));
  };

  const decrementLine = () => {
     if (answered[currentIndex]) return;
    setSelectedLine(prev => Math.max(1, prev - 1));
  };
  
  const lineNumberStyle: React.CSSProperties = {
    color: '#6b7280', 
    marginRight: '1em',
    userSelect: 'none',
    minWidth: '2.5em', 
    textAlign: 'right',
    display: 'inline-block',
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Spot the Bug</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Find the line containing the bug in each code sample! Use the selector buttons or your keyboard's up and down arrow keys to choose a line number.</p>
        
        {currentProblem && sortedDeckOrder.length > 0 ? (
          <>
            <div className="mb-2 text-sm font-medium text-gray-500">
              Problem {currentIndex + 1} / {data.length}
            </div>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
              <pre className="font-mono text-sm whitespace-pre-wrap">
                <code>
                  {highlightedLines.map((lineContent, idx) => {
                    const lineNum = idx + 1;
                    const isBugLine = currentProblem.bugLine === lineNum;
                    const isSelected = selectedLine === lineNum;
                    const hasBeenAnswered = answered[currentIndex];
                    const wasSubmittedLine = hasBeenAnswered && submittedLines[currentIndex] === lineNum;

                    return (
                      <div 
                        key={idx} 
                        onClick={() => !answered[currentIndex] && setSelectedLine(lineNum)}
                        className={cn(
                          "flex items-start cursor-pointer transition-colors",
                          "py-0.5 px-2 -mx-2 rounded", 
                          {
                            "bg-blue-700 text-white": isSelected && !hasBeenAnswered,
                            "bg-green-700 text-white": hasBeenAnswered && isBugLine,
                            "bg-red-700 text-white": hasBeenAnswered && wasSubmittedLine && !isBugLine,
                            "hover:bg-gray-800": !isSelected && !hasBeenAnswered
                          }
                        )}
                      >
                        <span style={{
                          ...lineNumberStyle,
                          color: (isSelected && !hasBeenAnswered) || (hasBeenAnswered && (isBugLine || (wasSubmittedLine && !isBugLine))) ? '#e5e7eb' : '#6b7280',
                        }}>
                          {lineNum}
                        </span>
                        {isCodeHighlighted ? (
                           <span className="flex-grow" dangerouslySetInnerHTML={{ __html: lineContent }} />
                        ) : (
                           <span className="flex-grow">{lineContent}</span>
                        )}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
            
            <div className="flex items-center justify-center mb-6 space-x-4">
              <Button 
                onClick={decrementLine} 
                disabled={selectedLine <= 1 || answered[currentIndex]}
                variant="outline"
                aria-label="Decrement line number"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[120px] py-2 px-4 border rounded-md bg-gray-50">
                Line: {selectedLine} / {lineCount}
              </div>
              <Button 
                onClick={incrementLine} 
                disabled={selectedLine >= lineCount || answered[currentIndex]}
                variant="outline"
                aria-label="Increment line number"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-center mb-6">
              <Button 
                onClick={handleSubmit} 
                disabled={answered[currentIndex]}
              >
                Submit Answer
              </Button>
            </div>
            
            {answered[currentIndex] && (
              <div className={cn(
                "p-4 mb-6 rounded-md text-center",
                currentProblem.bugLine === submittedLines[currentIndex] ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {currentProblem.bugLine === submittedLines[currentIndex]
                  ? `Correct! You found the bug! ${currentProblem.bugDescription}`
                  : `Incorrect. The bug is on line ${currentProblem.bugLine}. You selected line ${submittedLines[currentIndex]}. ${currentProblem.bugDescription}`}
              </div>
            )}
            
            <Progress value={progress} className="mb-4" />            
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <div>
                <span>Completed: {Object.keys(answered).length} / {data.length}</span>
              </div>
              <div>
                <span>Correct: {correctCount}</span>
                <span className="mx-2">|</span>
                <span>Wrong: {wrongCount}</span>
              </div>
            </div>
          </>
        ) : (
          <p>Loading bug problems...</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handlePrevious} 
          variant="outline"
        >
          &lt; Previous
        </Button>
        <Button onClick={resetTests} variant="destructive">
          Reset
        </Button>
        <Button 
          onClick={handleNext}
          variant="outline"
        >
          Next &gt;
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpotBug;
