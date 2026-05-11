import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-github_light_default";
import "ace-builds/src-noconflict/mode-python";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TestResult {
  test: string;
  pass: boolean;
  input?: any;
  expected?: any;
  got?: any;
  error?: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  defaultCode: string;
  testScript: (userCode: string) => string;
}

interface SuperHardProblemsProps {
  data: Problem[];
}

const SuperHardProblems: React.FC<SuperHardProblemsProps> = ({ data }) => {
  const problems = data;
  
  // Persist user-written code for each problem, initialize from localStorage if present
  const [codes, setCodes] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem("superHardProblemsCodes");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore parse errors
    }
    return problems.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultCode }), {});
  });

  // Whenever codes change, write them back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("superHardProblemsCodes", JSON.stringify(codes));
    } catch {
      // storage might be unavailable
    }
  }, [codes]);

  const [pyodide, setPyodide] = useState<any>(null);
  const editors = useRef<Record<number, any>>({});
  const [results, setResults] = useState<Record<number, TestResult[]>>({});

  useEffect(() => {
    const initPy = async () => {
      if (!(window as any).loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        script.onload = async () => {
          const py = await (window as any).loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/" });
          setPyodide(py);
          await py.loadPackage(["micropip", "numpy"]);
        };
        document.body.appendChild(script);
      } else {
        const py = await (window as any).loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/" });
        setPyodide(py);
        await py.loadPackage(["micropip", "numpy"]);
      }
    };
    initPy();
  }, []);

  // Helper to parse raw JSON results into TestResult array
  const parseResults = (raw: string): TestResult[] => {
    try {
      const parsed = JSON.parse(raw);
      const cases = Array.isArray(parsed) ? parsed : parsed.cases || [];
      return cases.map((tc: any) => ({
        test: tc.test || tc.description || "test",
        pass: !!tc.pass,
        input: tc.input,
        expected: tc.expected,
        got: tc.got ?? tc.actual,
        error: tc.error
      }));
    } catch (e: any) {
      return [{ test: "parse_error", pass: false, error: e.message || String(e) }];
    }
  };

  const renderValue = (val: any) => {
    if (val === null || val === undefined) return "N/A";
    else if (typeof val === "object") {
      return JSON.stringify(val);
    } else {
      return String(val);
    }
  };

  const runTest = async (prob: Problem) => {
    if (!pyodide) return;
    const userCode = codes[prob.id];
    setResults(s => ({ ...s, [prob.id]: [] }));
    let raw = "";
    try {
        // Try to fetch CSVs if they exist, otherwise ignore
        try {
            let response1 = await fetch(`${import.meta.env.BASE_URL}election_results.csv`);
            if (response1.ok) {
                let text1 = await response1.text();
                pyodide.FS.writeFile("election_results.csv", text1);
            }
            let response2 = await fetch(`${import.meta.env.BASE_URL}empty.csv`);
            if (response2.ok) {
                let text2 = await response2.text();
                pyodide.FS.writeFile("empty.csv", text2);
            }
            let response3 = await fetch(`${import.meta.env.BASE_URL}malformed.csv`);
            if (response3.ok) {
                let text3 = await response3.text();
                pyodide.FS.writeFile("malformed.csv", text3);
            }
            let response4 = await fetch(`${import.meta.env.BASE_URL}missing_votes.csv`);
            if (response4.ok) {
                let text4 = await response4.text();
                pyodide.FS.writeFile("missing_votes.csv", text4);
            }
        } catch (e) {
            console.log("CSV fetch error", e);
        }

      const script = prob.testScript(userCode);
      const result = await pyodide.runPythonAsync(script);
      // Handle cases where Python returns undefined or null
      raw = result != null ? result.toString() : "";
    } catch (e: any) {
      const full = e.stack || e.message || String(e);
      const start = full.indexOf('File "<exec>"');
      const end = full.indexOf('at new_error', start);
      const snippet = start >= 0 && end > start ? full.slice(start, end) : full;
      const errLine = snippet.trim();
      setResults(s => ({
        ...s,
        [prob.id]: [{ test: "execution_error", pass: false, error: errLine }]
      }));
      return;
    }
    const resultsArr = parseResults(raw);
    setResults(s => ({ ...s, [prob.id]: resultsArr }));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Final Boss Problems (Tests won't work without actually trying to solve :/ )</CardTitle>
      </CardHeader>
      <CardContent>
        {problems.map(p => (
          <div key={p.id} className="mb-8">
            <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
            <p
              className="mb-4 text-gray-900"
              dangerouslySetInnerHTML={{ __html: p.description.replace(/\n/g, "<br />") }}
            />
            <AceEditor
              mode="python"
              theme="github_light_default"
              name={`boss-${p.id}`}
              onLoad={ed => (editors.current[p.id] = ed)}
              value={codes[p.id]}
              onChange={val => setCodes(s => ({ ...s, [p.id]: val }))}
              fontSize={14}
              width="100%"
              setOptions={{ useWorker: false, maxLines: Infinity }}
            />
            {/* Run / Reset Buttons */}
            <div className="flex space-x-2 mt-2">
              <Button onClick={() => runTest(p)}>Run Tests</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCodes(s => ({ ...s, [p.id]: p.defaultCode }));
                }}
              >
                Reset Editor
              </Button>
            </div>
            {/* Results Table */}
            {results[p.id] && (
              <div className="mt-4 w-full overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-sm font-semibold">Test</th>
                      <th className="border border-gray-300 p-2 text-sm font-semibold">Input</th>
                      <th className="border border-gray-300 p-2 text-sm font-semibold">Expected</th>
                      <th className="border border-gray-300 p-2 text-sm font-semibold">Output</th>
                      <th className="border border-gray-300 p-2 text-sm font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results[p.id].map((r, i) => (
                      <tr key={i} className={r.pass ? "bg-green-50" : "bg-red-50"}>
                        <td className="border border-gray-300 p-2 text-sm">{r.test}</td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {renderValue(r.input)}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {renderValue(r.expected)}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {renderValue(r.error ?? r.got)}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm text-center font-semibold">
                          {r.pass ? "✅" : "❌"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuperHardProblems;

