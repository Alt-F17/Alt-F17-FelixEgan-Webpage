import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github_light_default";

interface LineAnalysis {
  line: string;
  time: string;
  space: string;
}

const ComplexityCalc: React.FC = () => {
  const defaultCode = `# Type or paste your Python code here

n = int(input())
for num in range(n):
    print(num)`;

  const [code, setCode] = useState<string>(defaultCode);
  const [analysis, setAnalysis] = useState<LineAnalysis[]>([]);
  const [timeComplexity, setTimeComplexity] = useState<string>("");
  const [spaceComplexity, setSpaceComplexity] = useState<string>("");
  const [error, setError] = useState<React.ReactNode>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showBigOcalc, setShowBigOcalc] = useState<boolean>(false);

  const handleAnalyze = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://api.example.com/complexity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTimeComplexity(data.timeComplexity);
      setSpaceComplexity(data.spaceComplexity);
      setAnalysis(data.analysis);
    } catch (err: unknown) {
      console.error("ComplexityCalc API error:", err);
      setError(
        <>
          Fun Fact: This is actually impossible to implement! Calculating big-O complexity is undecidable and infeasible.
          Some tools can provide estimates, but due to the Halting Problem, it is impossible to determine the complexity
          of an arbitrary program. You can read more about it{" "}
          <a
            href="https://en.wikipedia.org/wiki/Halting_problem"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            here
          </a>
          .
        </>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Complexity Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        {showBigOcalc ? (
          <div className="rounded-lg border p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              BigOCalc opens in a new tab to avoid iframe performance overhead.
            </p>
            <Button asChild>
              <a href="https://www.bigocalc.com" target="_blank" rel="noopener noreferrer">
                Open BigOCalc
              </a>
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 text-white p-1 rounded-md">
            <div className="flex items-center justify-between p-2 border-b border-gray-300 mb-2">
              <div className="text-sm font-mono text-gray-700">analysis.py</div>
              <Button onClick={handleAnalyze} disabled={loading || !code.trim()}>
                {loading ? "Analyzing..." : "Calculate Complexity"}
              </Button>
            </div>
            <AceEditor
              mode="python"
              theme="github_light_default"
              name="complexity-editor"
              onChange={setCode}
              value={code}
              fontSize={14}
              width="100%"
              height="200px"
              showPrintMargin={false}
              setOptions={{ useWorker: false, maxLines: Infinity }}
            />
          </div>
        )}

        {error && <p className="mt-2 text-red-600">{error}</p>}

        {!showBigOcalc && !error && analysis.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Overall Complexity</h3>
            <p>
              Time: <strong>{timeComplexity}</strong>
            </p>
            <p>
              Space: <strong>{spaceComplexity}</strong>
            </p>
            <h4 className="mt-4 font-medium">Line by Line Analysis</h4>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.map((a, idx) => (
                <li key={idx}>
                  <code className="block whitespace-pre-wrap">{a.line}</code>
                  <span className="text-sm text-gray-700">
                    Time: {a.time}, Space: {a.space}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button variant="outline" onClick={() => setShowBigOcalc(!showBigOcalc)}>
          {showBigOcalc ? "Back to Editor" : "Use BigOCalc"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComplexityCalc;
