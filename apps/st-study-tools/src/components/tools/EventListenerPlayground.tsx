import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventLog {
  id: number;
  type: string;
  target: string;
  timestamp: string;
  details: string;
}

const EventListenerPlayground = () => {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [activeListeners, setActiveListeners] = useState<Record<string, boolean>>({
    click: true,
    mouseover: false,
    mouseout: false,
    mousedown: false,
    mouseup: false,
    keydown: false,
    keyup: false,
    dblclick: false,
  });

  const targetRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (e: Event) => {
    const target = e.target as HTMLElement;
    let details = "";
    
    if (e instanceof MouseEvent) {
      details = `x: ${e.clientX}, y: ${e.clientY}`;
    } else if (e instanceof KeyboardEvent) {
      details = `key: ${e.key}, code: ${e.code}`;
    }

    const newLog: EventLog = {
      id: Date.now() + Math.random(),
      type: e.type,
      target: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : "") + (target.className ? `.${target.className.split(' ')[0]}` : ""),
      timestamp: new Date().toLocaleTimeString(),
      details
    };

    setLogs(prev => [...prev.slice(-19), newLog]); // Keep last 20 logs
  };

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const handleEvent = (e: Event) => {
      // Prevent default for some events to avoid scrolling etc.
      if (e.type === 'keydown' && (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
      }
      addLog(e);
    };

    // Add listeners based on state
    Object.entries(activeListeners).forEach(([event, isActive]) => {
      if (isActive) {
        if (event.startsWith('key')) {
          // Key events need to be on window or a focusable element. 
          // We'll put them on the element but it needs tabIndex.
          element.addEventListener(event, handleEvent);
        } else {
          element.addEventListener(event, handleEvent);
        }
      }
    });

    return () => {
      Object.keys(activeListeners).forEach((event) => {
        element.removeEventListener(event, handleEvent);
      });
    };
  }, [activeListeners]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleListener = (event: string) => {
    setActiveListeners(prev => ({ ...prev, [event]: !prev[event] }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 h-[600px]">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(activeListeners).map(event => (
              <div key={event} className="flex items-center space-x-2">
                <Checkbox 
                  id={event} 
                  checked={activeListeners[event]} 
                  onCheckedChange={() => toggleListener(event)} 
                />
                <Label htmlFor={event} className="capitalize cursor-pointer">{event}</Label>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">
              Instructions:
              <br/>1. Check the events you want to listen for.
              <br/>2. Interact with the blue box on the right.
              <br/>3. For keyboard events, click the box first to focus it.
            </p>
            <Button variant="outline" onClick={() => setLogs([])} className="w-full">Clear Logs</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex-[2] flex flex-col gap-4">
        <div 
          ref={targetRef}
          tabIndex={0}
          className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl flex items-center justify-center text-2xl font-bold cursor-pointer transition-colors outline-none focus:ring-4 ring-blue-300 select-none"
        >
          INTERACT WITH ME
        </div>

        <Card className="h-1/2 flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Event Log</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-2 font-mono text-sm">
                {logs.length === 0 && <div className="text-gray-400 text-center italic">No events captured yet...</div>}
                {logs.map(log => (
                  <div key={log.id} className="border-b pb-1 last:border-0">
                    <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                    <span className="text-blue-600 font-bold">{log.type}</span>{' '}
                    <span className="text-green-600">@{log.target}</span>
                    {log.details && <div className="text-xs text-gray-500 pl-4">{log.details}</div>}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventListenerPlayground;
