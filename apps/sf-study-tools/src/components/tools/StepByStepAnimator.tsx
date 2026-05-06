import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-github_light_default";
import "ace-builds/src-noconflict/mode-python";
import { Code } from "lucide-react";

const presets = [
  {
    label: "Selection Sort",
    code: `# Selection Sort
lst = [64, 25, 12, 22]
for i in range(len(lst)):
    min_idx = i
    for j in range(i+1, len(lst)):
        if lst[j] < lst[min_idx]:
            min_idx = j
    lst[i], lst[min_idx] = lst[min_idx], lst[i]
print(lst)`,
  },
  {
    label: "Insertion Sort",
    code: `# Insertion Sort
lst = [12, 11, 13, 5]
for i in range(1, len(lst)):
    key = lst[i]
    j = i-1
    while j >= 0 and lst[j] > key:
        lst[j+1] = lst[j]
        j -= 1
    lst[j+1] = key
print(lst)`,
  },
  {
    label: "Merge Sort",
    code: `# Merge Sort
def merge_sort(lst):
    if len(lst) > 1:
        mid = len(lst)//2
        left = lst[:mid]
        right = lst[mid:]
        merge_sort(left)
        merge_sort(right)
        i = j = k = 0
        while i < len(left) and j < len(right):
            if left[i] < right[j]:
                lst[k] = left[i]
                i += 1
            else:
                lst[k] = right[j]
                j += 1
            k += 1
        while i < len(left): lst[k] = left[i]; i += 1; k += 1
        while j < len(right): lst[k] = right[j]; j += 1; k += 1
    return lst

print(merge_sort([12,11,13,5]))`,
  },
  {
    label: "Quick Sort",
    code: `# Quick Sort
def quick_sort(lst):
    if len(lst) <= 1: return lst
    pivot = lst[len(lst)//2]
    left = [x for x in lst if x < pivot]
    middle = [x for x in lst if x == pivot]
    right = [x for x in lst if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

print(quick_sort([3,6,8,10,10]))`,
  },
  {
    label: "Factorial",
    code: `# Factorial
def fact(n):
    return 1 if n==0 else n*fact(n-1)

print(fact(5))`,
  },
  {
    label: "Binary Search",
    code: `# Binary Search
def binary_search(arr, target):
    low, high = 0, len(arr)-1
    while low <= high:
        mid = (low+high)//2
        if arr[mid] == target: return mid
        elif arr[mid] < target: low = mid+1
        else: high = mid-1
    return -1

print(binary_search([1,2,3,4,5,6,7],4))`,
  },
];

const StepByStepAnimator: React.FC = () => {
  const [code, setCode] = useState<string>(
    `# Type or paste your Python code here

tup = ([1, 2, 3], "hello", 3.14)
lst = tup[0]
lst[0] = 4
print(tup)`
  );
  const [pythonTutorUrl, setPythonTutorUrl] = useState<string>("");

  const generatePythonTutorUrl = () => {
    const encodedCode = encodeURIComponent(code);
    const pythonTutorLink = `https://pythontutor.com/iframe-embed.html#code=${encodedCode}&cumulative=false&py=3&curInstr=0`;
    setPythonTutorUrl(pythonTutorLink);
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Python Code Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {presets.map((p, idx) => (
              <Button key={idx} variant="outline" size="sm" onClick={() => setCode(p.code)}>
                {p.label}
              </Button>
            ))}
          </div>

          <div className="bg-gray-50 text-white p-1 rounded-md">
            <div className="flex items-center justify-between p-2 border-b border-gray-300 mb-2">
              <div className="text-sm font-mono text-gray-700">main.py</div>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={generatePythonTutorUrl}
              >
                Generate Visualizer Link
              </Button>
            </div>
            <AceEditor
              mode="python"
              theme="github_light_default"
              name="step-by-step-editor"
              onChange={setCode}
              value={code}
              fontSize={14}
              width="100%"
              showPrintMargin={false}
              setOptions={{ useWorker: false, maxLines: Infinity }}
            />
          </div>

          {pythonTutorUrl && (
            <div className="mt-4 rounded-md border p-4 space-y-3">
              <div className="text-xl font-semibold">Visualization</div>
              <p className="text-sm text-muted-foreground">
                Python Tutor opens in a new tab to keep this page responsive.
              </p>
              <Button asChild>
                <a href={pythonTutorUrl} target="_blank" rel="noopener noreferrer">
                  Open Python Tutor
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepByStepAnimator;
