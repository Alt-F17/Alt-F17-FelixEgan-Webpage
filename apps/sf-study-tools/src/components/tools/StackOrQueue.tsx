
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Define the data structures
interface DataItem {
  value: string;
  id: number;
}

const StackOrQueue: React.FC = () => {
  const [stackData, setStackData] = useState<DataItem[]>([]);
  const [queueData, setQueueData] = useState<DataItem[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [nextId, setNextId] = useState<number>(1);

  // Stack operations
  const pushToStack = () => {
    if (!inputValue.trim()) return;
    
    const newItem = { value: inputValue, id: nextId };
    setStackData([...stackData, newItem]);
    setNextId(nextId + 1);
    // Input value is now persistent
  };

  const popFromStack = () => {
    if (stackData.length === 0) return;
    
    const newStack = [...stackData];
    newStack.pop();
    setStackData(newStack);
  };

  // Queue operations
  const enqueue = () => {
    if (!inputValue.trim()) return;
    
    const newItem = { value: inputValue, id: nextId };
    setQueueData([...queueData, newItem]);
    setNextId(nextId + 1);
    // Input value is now persistent
  };

  const dequeue = () => {
    if (queueData.length === 0) return;
    
    const newQueue = [...queueData];
    newQueue.shift();
    setQueueData(newQueue);
  };

  // Reset both structures
  const resetAll = () => {
    setStackData([]);
    setQueueData([]);
    setInputValue('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-3xl font-bold mb-2">Stack or Queue?</h1>
          <p className="text-gray-600 mb-4 text-center">
            Understand the difference between stacks (LIFO) and queues (FIFO) by manipulating both data structures.
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a value"
              className="w-48"
              maxLength={10}
            />
            <Button onClick={resetAll} variant="outline">Reset All</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stack Side */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Stack (LIFO)</CardTitle>
              <CardDescription>Last In, First Out</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4 h-64 overflow-y-auto">
                <div className="flex flex-col-reverse">
                  {stackData.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-blue-100 border border-blue-300 mb-2 p-2 rounded text-center"
                    >
                      {item.value}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="font-mono bg-gray-900 text-gray-50 p-4 rounded text-sm mb-4">
                <p><span className="text-green-600"># Stack Operations</span></p>
                <p><span className="text-blue-400">stack</span>.<span className="text-yellow-400">append</span>(<span className="text-blue-200">element</span>); <span className="text-green-600"># Add to top</span></p>
                <p><span className="text-blue-200">element</span> = <span className="text-blue-400">stack</span>.<span className="text-yellow-400">pop</span>(); <span className="text-green-600"># Remove from top</span></p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50">
              <Button onClick={pushToStack} className="bg-blue-600 hover:bg-blue-700">
                Push
              </Button>
              <Button onClick={popFromStack} variant="outline">
                Pop
              </Button>
            </CardFooter>
          </Card>

          {/* Queue Side */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle>Queue (FIFO)</CardTitle>
              <CardDescription>First In, First Out</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gray-50 p-4 rounded-md mb-4 h-64 overflow-y-auto">
                <div className="flex flex-col">
                  {queueData.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="bg-green-100 border border-green-300 mb-2 p-2 rounded text-center flex justify-between items-center"
                    >
                      <span className="text-xs text-gray-500">{index === 0 ? 'front' : ''}</span>
                      <span>{item.value}</span>
                      <span className="text-xs text-gray-500">{index === queueData.length - 1 ? 'back' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="font-mono bg-gray-900 text-gray-50 p-4 rounded text-sm mb-4">
                <p><span className="text-green-600"># Queue operations</span></p>
                <p><span className="text-blue-400">queue</span>.<span className="text-yellow-400">append</span>(<span className="text-blue-200">element</span>); <span className="text-green-600"># Add to back</span></p>
                <p><span className="text-blue-200">element</span> = <span className="text-blue-400">queue</span>.<span className="text-yellow-400">popleft</span>(); <span className="text-green-600"># Remove from front</span></p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50">
              <Button onClick={enqueue} className="bg-green-600 hover:bg-green-700">
                Enqueue 
              </Button>
              <Button onClick={dequeue} variant="outline">
                Dequeue
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-6 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Key Differences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-blue-700">Stack</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Last In, First Out (LIFO) principle</li>
                <li>Elements are added and removed from the same end</li>
                <li>Used for function calls, undo operations, and parsing expressions</li>
                <li>Think of a stack of plates - you add and remove from the top</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-green-700">Queue</h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>First In, First Out (FIFO) principle</li>
                <li>Elements are added at the back and removed from the front</li>
                <li>Used for job scheduling, print queue, and breadth-first search</li>
                <li>Think of people standing in line - the first person in is the first to leave</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackOrQueue;
