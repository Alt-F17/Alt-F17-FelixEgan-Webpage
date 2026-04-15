import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToolsStore } from "@/store/toolsStore";

interface Question {
  id: number;
  scenario: string;
  correctCode: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    scenario: "You successfully requested a webpage and the server sent it back.",
    correctCode: 200,
    explanation: "200 OK is the standard response for successful HTTP requests."
  },
  {
    id: 2,
    scenario: "You tried to access a page that doesn't exist on the server.",
    correctCode: 404,
    explanation: "404 Not Found indicates that the server can't find the requested resource."
  },
  {
    id: 3,
    scenario: "You tried to access a protected admin panel without logging in.",
    correctCode: 401,
    explanation: "401 Unauthorized means authentication is required and has failed or has not been provided."
  },
  {
    id: 4,
    scenario: "You are logged in, but you don't have permission to view this specific file.",
    correctCode: 403,
    explanation: "403 Forbidden means the server understands the request but refuses to authorize it."
  },
  {
    id: 5,
    scenario: "The server crashed while trying to process your request.",
    correctCode: 500,
    explanation: "500 Internal Server Error is a generic error message when the server encounters an unexpected condition."
  },
  {
    id: 6,
    scenario: "The page has permanently moved to a new URL.",
    correctCode: 301,
    explanation: "301 Moved Permanently means the URL of the requested resource has been changed permanently."
  },
  {
    id: 7,
    scenario: "You sent a request with invalid JSON data in the body.",
    correctCode: 400,
    explanation: "400 Bad Request means the server cannot or will not process the request due to an apparent client error."
  },
  {
    id: 8,
    scenario: "The server is temporarily down for maintenance.",
    correctCode: 503,
    explanation: "503 Service Unavailable is often used for temporary overloading or maintenance of the server."
  }
];

const OPTIONS = [200, 201, 301, 302, 400, 401, 403, 404, 500, 503];

const HTTPStatusQuiz = () => {
  const { httpStatusQuizState, updateHttpStatusQuizState, initHttpStatusQuiz } = useToolsStore();
  const { deckOrder, currentIndex, correctCount, wrongCount, answered } = httpStatusQuizState;
  
  // Local state to track the specific wrong answer selected for the current question (not persisted)
  const [selectedWrongOption, setSelectedWrongOption] = useState<number | null>(null);

  // Initialize
  useEffect(() => {
    if (questions.length > 0 && (deckOrder.length === 0 || deckOrder.length !== questions.length)) {
      initHttpStatusQuiz(questions.length);
    }
  }, [deckOrder.length, initHttpStatusQuiz]);

  // Reset selected wrong option when index changes
  useEffect(() => {
    setSelectedWrongOption(null);
  }, [currentIndex]);

  const currentQuestion = deckOrder.length > 0 && currentIndex < deckOrder.length 
    ? questions[deckOrder[currentIndex]] 
    : null;

  const handleAnswer = (code: number) => {
    if (answered[currentIndex] || !currentQuestion) return;

    const isCorrect = code === currentQuestion.correctCode;
    const newAnswered = { ...answered, [currentIndex]: true };
    
    if (isCorrect) {
      updateHttpStatusQuizState({ 
        answered: newAnswered,
        correctCount: correctCount + 1 
      });
    } else {
      updateHttpStatusQuizState({ 
        answered: newAnswered,
        wrongCount: wrongCount + 1 
      });
      setSelectedWrongOption(code);
    }
  };

  const handlePrevious = () => {
    if (deckOrder.length === 0) return;
    const prev = currentIndex > 0 ? currentIndex - 1 : deckOrder.length - 1;
    updateHttpStatusQuizState({ currentIndex: prev });
  };

  const handleNext = () => {
    if (deckOrder.length === 0) return;
    const next = currentIndex < deckOrder.length - 1 ? currentIndex + 1 : 0;
    updateHttpStatusQuizState({ currentIndex: next });
  };

  const resetQuiz = () => {
    initHttpStatusQuiz(questions.length);
    setSelectedWrongOption(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, deckOrder.length]);

  const progress = questions.length > 0 ? Math.round((Object.keys(answered).length / questions.length) * 100) : 0;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>HTTP Status Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Master the HTTP status codes!</p>
        
        {currentQuestion && deckOrder.length > 0 ? (
          <>
            <div className="mb-2 text-sm font-medium text-gray-500">
              Question {currentIndex + 1} / {questions.length}
            </div>
            
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 mb-6 min-h-[100px] flex items-center justify-center text-center">
              <span className="text-lg font-medium">{currentQuestion.scenario}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {OPTIONS.map((code) => {
                const isCorrectAnswer = code === currentQuestion.correctCode;
                const isSelectedWrong = code === selectedWrongOption;
                const hasAnswered = answered[currentIndex];
                
                let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
                let className = "h-14 text-lg font-bold";

                if (hasAnswered) {
                  if (isCorrectAnswer) {
                    className += " bg-green-100 border-green-500 text-green-800 hover:bg-green-200 hover:text-green-900";
                  } else if (isSelectedWrong) {
                    className += " bg-red-100 border-red-500 text-red-800 hover:bg-red-200 hover:text-red-900";
                  } else {
                    className += " opacity-50";
                  }
                }

                return (
                  <Button
                    key={code}
                    onClick={() => handleAnswer(code)}
                    disabled={hasAnswered}
                    variant={variant}
                    className={className}
                  >
                    {code}
                  </Button>
                );
              })}
            </div>

            {answered[currentIndex] && (
              <div className={cn(
                "p-4 mb-6 rounded-md text-center",
                selectedWrongOption === null ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                <p className="font-bold mb-1">
                  {selectedWrongOption === null ? "Correct!" : `Incorrect. The correct code is ${currentQuestion.correctCode}.`}
                </p>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
            
            <Progress value={progress} className="mb-4" />           
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <div>
                <span>Completed: {Object.keys(answered).length} / {questions.length}</span>
              </div>
              <div>
                <span>Correct: {correctCount}</span>
                <span className="mx-2">|</span>
                <span>Wrong: {wrongCount}</span>
              </div>
            </div>
          </>
        ) : (
          <p>Loading quiz...</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handlePrevious} 
          variant="outline"
        >
          &lt; Previous
        </Button>
        <Button onClick={resetQuiz} variant="destructive">
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

export default HTTPStatusQuiz;
