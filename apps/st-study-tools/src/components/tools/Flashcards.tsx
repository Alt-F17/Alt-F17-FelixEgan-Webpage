import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToolsStore } from "@/store/toolsStore";

export interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardsProps {
  data: Flashcard[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ data }) => {
  const { flashcardsState, updateFlashcardsState, initFlashcards } = useToolsStore();
  const { deckOrder, currentIndex, knownIndices, isFlipped } = flashcardsState;

  // Remove inline state declaration for flashcards
  const flashcards: Flashcard[] = data;

  // Initialize flashcards if needed
  useEffect(() => {
    // Initialize or re-initialize if deckOrder is empty or outdated length
    if (deckOrder.length === 0 || deckOrder.length !== flashcards.length) {
      initFlashcards(flashcards.length);
    }
  }, [deckOrder.length, flashcards.length, initFlashcards]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      updateFlashcardsState({ currentIndex: currentIndex - 1, isFlipped: false });
    }
  };

  const handleNext = () => {
    if (currentIndex < deckOrder.length - 1) {
      updateFlashcardsState({ currentIndex: currentIndex + 1, isFlipped: false });
    }
  };

  const handleMarkKnown = () => {
    const currentCardIndex = deckOrder[currentIndex];
    if (!knownIndices.includes(currentCardIndex)) {
      updateFlashcardsState({ knownIndices: [...knownIndices, currentCardIndex] });
    }
  };

  const handleMarkUnknown = () => {
    const currentCardIndex = deckOrder[currentIndex];
    const updatedKnownIndices = knownIndices.filter(idx => idx !== currentCardIndex);
    updateFlashcardsState({ knownIndices: updatedKnownIndices });
  };

  const toggleFlip = () => {
    updateFlashcardsState({ isFlipped: !isFlipped });
  };

  const resetDeck = () => {
    initFlashcards(flashcards.length);
  };

  // Determine if the current card is marked as known
  const isCurrentCardKnown = deckOrder.length > 0 && 
    knownIndices.includes(deckOrder[currentIndex]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>SF Flashcards</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center">Click the card to flip it. Use buttons to mark as known or unknown.</p>
        
        {deckOrder.length > 0 && (
          <div 
            className={cn(
              "w-full max-w-sm mx-auto aspect-[5/3] perspective-1000 cursor-pointer mb-6",
              "transition-all duration-500"
            )}
            onClick={toggleFlip}
          >
            <div 
              className={cn(
                "relative w-full h-full transition-transform duration-500",
                "transform-style-preserve-3d",
                isFlipped && "rotate-y-180"
              )}
            >
              <div 
                className={cn(
                  "absolute w-full h-full flex items-center justify-center p-6",
                  "rounded-lg shadow backface-hidden bg-gray-100",
                  "border-2",
                  isCurrentCardKnown ? "border-green-500" : "border-gray-200"
                )}
              >
                <p className="text-xl">{flashcards[deckOrder[currentIndex]]?.front}</p>
              </div>
              <div 
                className={cn(
                  "absolute w-full h-full flex items-center justify-center p-6",
                  "rounded-lg shadow backface-hidden bg-white rotate-y-180",
                  "border-2",
                  isCurrentCardKnown ? "border-green-500" : "border-gray-200"
                )}
              >
                <p className="text-xl">{flashcards[deckOrder[currentIndex]]?.back}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-2 mb-4">
          <Button 
            onClick={handlePrevious} 
            disabled={currentIndex === 0}
            variant="outline"
          >
            &lt; Previous
          </Button>
          <Button 
            onClick={handleMarkKnown}
            disabled={isCurrentCardKnown}
            variant="outline"
            className="border-green-500 hover:bg-green-50"
          >
            Mark Known
          </Button>
          <Button 
            onClick={handleMarkUnknown}
            disabled={!isCurrentCardKnown}
            variant="outline"
            className="border-red-500 hover:bg-red-50"
          >
            Mark Unknown
          </Button>
          <Button 
            onClick={handleNext}
            disabled={currentIndex === deckOrder.length - 1}
            variant="outline"
          >
            Next &gt;
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>Card {currentIndex + 1} of {flashcards.length}</p>
          <p>Known: {knownIndices.length} | Remaining: {flashcards.length - knownIndices.length}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={resetDeck} variant="destructive">Reset Deck Progress</Button>
      </CardFooter>
    </Card>
  );
};

export default Flashcards;
