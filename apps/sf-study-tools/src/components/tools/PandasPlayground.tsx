import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-github_light_default';
import 'ace-builds/src-noconflict/mode-python';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const initialCode = `
# Import necessary libraries

# Read the CSV file

# Print the DataFrame

# Print a summary and/or description of the DataFrame

# Challenge 1: swap keys and values

# Challenge 2: plot grades

# Challenge 3: plot line graph attendance by class 

# Challenge 4: plot attendance by class with different colors
`;

const PandasPlayground: React.FC = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [code, setCode] = useState<string>(initialCode);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [plotSrc, setPlotSrc] = useState<string>('');

  useEffect(() => {
    const initPy = async () => {
      // Load Pyodide and required packages
      let py;
      if (!(window as any).loadPyodide) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }
      py = await (window as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
      await py.loadPackage(['pandas','matplotlib']);
      // Write grades.csv into Pyodide FS
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}grades.csv`);
        const csvText = await res.text();
        py.FS.writeFile('grades.csv', csvText);
      } catch {
        /* ignore fetch errors */
      }
      setPyodide(py);
    };
    initPy();
  }, []);

  const runCode = async () => {
    if (!pyodide) return;
    setRunning(true);
    setOutput('');
    setPlotSrc('');
    const harnessStart = [
      'import sys, json',
      'from io import StringIO, BytesIO',
      'import pandas as pd',
      'import matplotlib',
      'matplotlib.use("AGG")',
      'import matplotlib.pyplot as plt',
      'buf = StringIO()',
      'sys.stdout = buf',
    ];
    const codeLines = code.split(/\r?\n/);
    const harnessEnd = [
      'sys.stdout = sys.__stdout__',
      'text = buf.getvalue()',
      'buf2 = BytesIO()',
      'plt.tight_layout()',
      'plt.savefig(buf2, format="png")',
      'buf2.seek(0)',
      'import base64',
      'img = base64.b64encode(buf2.read()).decode("ascii")',
      'json.dumps({"output": text, "plot": img})',
    ];
    const wrapped = [...harnessStart, ...codeLines, ...harnessEnd].join('\n');
    try {
      const result = await pyodide.runPythonAsync(wrapped);
      const { output: out, plot: img } = JSON.parse(result as string);
      setOutput(out);
      if (img) setPlotSrc('data:image/png;base64,' + img);
    } catch (err: any) {
      setOutput(err.message || String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <Card>
        <CardHeader><CardTitle>Pandas & Matplotlib Playground</CardTitle></CardHeader>
        <CardContent>
          {/* Preview of CSV file */}
          <div className="mb-4">
            <div className="text-sm font-semibold mb-1">grades.csv (oh, and Oliver's grade got increased cuz he asked me very nicely)</div>
            <pre className="bg-gray-50 p-2 rounded text-sm whitespace-pre-wrap">
            {`   `}<u>{`Student`}</u>{`      `}<u>{`Grade`}</u>{`   `}<u>{`Age`}</u>{`   `}<u>{`Class`}</u>{`          `}<u>{`Credits`}</u>{`   `}<u>{`Attendance%`}</u>{`
0  Alex           85     20   Physics             45     92
1  Bob            92     21   Mathematics         60     98
2  Charlie        78     19   Computer Science    30     88
3  Diana          88     22   Biology             75     95
4  Ethan          91     20   Economics           50     90
5  Fiona          74     23   Physics             40     85
6  George         95     21   Mathematics         68     99
7  Henry          82     20   Computer Science    55     93
8  Ian            89     22   Biology             62     96
9  Julia          76     19   Economics           28     84
10 Kevin          94     23   Physics             70     97
11 Laura          81     20   Mathematics         58     91
12 Michael        87     21   Computer Science    65     94
13 Noah           90     22   Biology             72     98
14 Oliver         99     19   Economics           33     89
15 Paul           93     23   Physics             66     97
16 Quandale       84     20   Mathematics         53     92
17 Rachel         77     21   Computer Science    47     87
18 Steve          88     22   Biology             61     95
19 Tina           80     19   Economics           35     90
20 Ulysses        86     21   Physics             50     92
21 Victor         93     23   Mathematics         64     97
22 William        79     24   Computer Science    45     88
23 Xavier         85     22   Biology             54     93
24 Ysaak          77     20   Economics           38     89
25 Zach           90     25   Physics             60     95`}
            </pre>
          </div>
          <AceEditor
            mode="python"
            theme="github_light_default"
            name="pandas-playground-editor"
            onChange={setCode}
            value={code}
            fontSize={14}
            width="100%"
            height="250px"
            setOptions={{ useWorker: false, maxLines: Infinity }}
          />
          <Button className="mt-2" onClick={runCode} disabled={!pyodide || running}>
            {running ? 'Running...' : 'Run Code'}
          </Button>
          <div className="mt-4">
            <div className="text-sm font-semibold mb-1">Output:</div>
            <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">{output}</pre>
          </div>
          {plotSrc && (
            <div className="mt-4">
              <div className="text-sm font-semibold mb-1">Plot:</div>
              <img src={plotSrc} alt="Matplotlib plot" className="w-full border rounded" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PandasPlayground;
