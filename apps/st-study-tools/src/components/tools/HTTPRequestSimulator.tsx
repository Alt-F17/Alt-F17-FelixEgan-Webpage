import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Send } from "lucide-react";

interface Param {
  id: number;
  key: string;
  value: string;
}

const HTTPRequestSimulator = () => {
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [url, setUrl] = useState("https://api.example.com/users");
  const [params, setParams] = useState<Param[]>([
    { id: 1, key: "search", value: "javascript" },
    { id: 2, key: "limit", value: "10" }
  ]);
  const [response, setResponse] = useState<string | null>(null);
  const [requestPreview, setRequestPreview] = useState<string>("");

  const addParam = () => {
    setParams([...params, { id: Date.now(), key: "", value: "" }]);
  };

  const removeParam = (id: number) => {
    setParams(params.filter(p => p.id !== id));
  };

  const updateParam = (id: number, field: 'key' | 'value', newValue: string) => {
    setParams(params.map(p => p.id === id ? { ...p, [field]: newValue } : p));
  };

  const handleSend = () => {
    // Simulate request construction
    let fullUrl = url;
    let body = null;

    if (method === "GET") {
      const queryString = params
        .filter(p => p.key)
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join("&");
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
      setRequestPreview(`GET ${fullUrl} HTTP/1.1\nHost: api.example.com\nAccept: application/json`);
    } else {
      const bodyObj = params.reduce((acc, p) => {
        if (p.key) acc[p.key] = p.value;
        return acc;
      }, {} as Record<string, string>);
      body = JSON.stringify(bodyObj, null, 2);
      setRequestPreview(`POST ${fullUrl} HTTP/1.1\nHost: api.example.com\nContent-Type: application/json\n\n${body}`);
    }

    setResponse("Sending...");
    setTimeout(() => {
      setResponse(`HTTP/1.1 200 OK\nContent-Type: application/json\nDate: ${new Date().toUTCString()}\n\n{\n  "status": "success",\n  "message": "Data received via ${method}",\n  "received_data": ${method === "GET" ? JSON.stringify(Object.fromEntries(params.map(p=>[p.key, p.value]))) : JSON.stringify(params.reduce((acc, p) => ({...acc, [p.key]: p.value}), {}))} \n}`);
    }, 800);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Request Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Method</Label>
            <RadioGroup defaultValue="GET" value={method} onValueChange={(v) => setMethod(v as "GET" | "POST")} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="GET" id="get" />
                <Label htmlFor="get" className="font-bold text-blue-600">GET</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POST" id="post" />
                <Label htmlFor="post" className="font-bold text-green-600">POST</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/resource" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{method === "GET" ? "Query Parameters" : "Body Data (JSON)"}</Label>
              <Button variant="ghost" size="sm" onClick={addParam}><Plus className="w-4 h-4 mr-1"/> Add</Button>
            </div>
            <div className="space-y-2">
              {params.map(param => (
                <div key={param.id} className="flex gap-2">
                  <Input 
                    placeholder="Key" 
                    value={param.key} 
                    onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    placeholder="Value" 
                    value={param.value} 
                    onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeParam(param.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleSend}>
            <Send className="w-4 h-4 mr-2" /> Send Request
          </Button>
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Request Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm min-h-[150px]">
              {requestPreview || "// Construct a request to see it here..."}
            </pre>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm min-h-[150px] border">
              {response || "// Waiting for response..."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HTTPRequestSimulator;
