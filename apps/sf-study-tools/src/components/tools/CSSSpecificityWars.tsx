import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, AlertCircle } from "lucide-react";

interface Specificity {
  a: number; // IDs
  b: number; // Classes, attributes, pseudo-classes
  c: number; // Elements, pseudo-elements
  score: number;
}

const calculateSpecificity = (selector: string): Specificity => {
  if (!selector.trim()) return { a: 0, b: 0, c: 0, score: 0 };

  // Very simplified regex-based parser for educational purposes
  // NOTE: This is not a full CSS parser and has limitations
  
  const ids = (selector.match(/#[a-zA-Z0-9_-]+/g) || []).length;
  const classes = (selector.match(/\.[a-zA-Z0-9_-]+/g) || []).length;
  const attributes = (selector.match(/\[.*?\]/g) || []).length;
  // Pseudo-classes (excluding pseudo-elements ::)
  const pseudoClasses = (selector.match(/:[a-zA-Z0-9_-]+(?![^:]*:)/g) || []).filter(s => !s.startsWith('::')).length;
  
  // Elements (approximate: words that aren't IDs or classes)
  // We remove IDs, classes, attributes, and pseudo-classes first to find tags
  const remaining = selector
    .replace(/#[a-zA-Z0-9_-]+/g, '')
    .replace(/\.[a-zA-Z0-9_-]+/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/:{1,2}[a-zA-Z0-9_-]+/g, '') // Remove pseudos
    .replace(/[>+~]/g, ' '); // Remove combinators

  const elements = (remaining.match(/\b[a-zA-Z][a-zA-Z0-9_-]*\b/g) || []).length;
  const pseudoElements = (selector.match(/::[a-zA-Z0-9_-]+/g) || []).length;

  const a = ids;
  const b = classes + attributes + pseudoClasses;
  const c = elements + pseudoElements;

  // Score calculation (base 100 for simplicity in comparison, though CSS is technically base-infinity)
  const score = a * 10000 + b * 100 + c;

  return { a, b, c, score };
};

const SpecificityCard = ({ label, selector, onChange, result, isWinner }: { 
  label: string, 
  selector: string, 
  onChange: (v: string) => void, 
  result: Specificity,
  isWinner: boolean
}) => (
  <Card className={`flex-1 border-2 ${isWinner ? 'border-green-500 bg-green-50/50' : 'border-transparent'}`}>
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        {label}
        {isWinner && <Badge className="bg-green-500"><Trophy className="w-3 h-3 mr-1" /> Winner</Badge>}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Input 
        placeholder="e.g., div.container > p" 
        value={selector} 
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-lg"
      />
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-100 p-2 rounded">
          <div className="text-2xl font-bold text-blue-700">{result.a}</div>
          <div className="text-xs text-blue-600 font-semibold">IDs</div>
        </div>
        <div className="bg-purple-100 p-2 rounded">
          <div className="text-2xl font-bold text-purple-700">{result.b}</div>
          <div className="text-xs text-purple-600 font-semibold">Classes</div>
        </div>
        <div className="bg-orange-100 p-2 rounded">
          <div className="text-2xl font-bold text-orange-700">{result.c}</div>
          <div className="text-xs text-orange-600 font-semibold">Tags</div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Total Specificity: <span className="font-mono font-bold">({result.a}, {result.b}, {result.c})</span>
      </div>
    </CardContent>
  </Card>
);

const CSSSpecificityWars = () => {
  const [selectorA, setSelectorA] = useState("div#main .content");
  const [selectorB, setSelectorB] = useState("body div p.text");
  const [resultA, setResultA] = useState<Specificity>({ a: 0, b: 0, c: 0, score: 0 });
  const [resultB, setResultB] = useState<Specificity>({ a: 0, b: 0, c: 0, score: 0 });

  useEffect(() => {
    setResultA(calculateSpecificity(selectorA));
  }, [selectorA]);

  useEffect(() => {
    setResultB(calculateSpecificity(selectorB));
  }, [selectorB]);

  const winner = resultA.score > resultB.score ? 'A' : resultB.score > resultA.score ? 'B' : 'Tie';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Specificity Wars</h2>
        <p className="text-muted-foreground">Enter two CSS selectors to see which one wins!</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <SpecificityCard 
          label="Selector A" 
          selector={selectorA} 
          onChange={setSelectorA} 
          result={resultA} 
          isWinner={winner === 'A'}
        />
        
        <div className="flex items-center justify-center">
          <div className="bg-muted rounded-full p-4 font-bold text-xl text-muted-foreground">VS</div>
        </div>

        <SpecificityCard 
          label="Selector B" 
          selector={selectorB} 
          onChange={setSelectorB} 
          result={resultB} 
          isWinner={winner === 'B'}
        />
      </div>

      <Card className="bg-slate-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-slate-700">
            <strong>How it works:</strong> Specificity is calculated as a tuple (IDs, Classes, Tags). 
            An ID is worth more than any number of classes. A class is worth more than any number of tags.
            Inline styles (not shown here) always win against selectors.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSSSpecificityWars;
