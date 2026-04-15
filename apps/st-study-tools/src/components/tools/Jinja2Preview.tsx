import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DEFAULT_TEMPLATE = `<h1>Hello, {{ name }}!</h1>

<ul>
{% for item in items %}
  <li>{{ item }}</li>
{% endfor %}
</ul>

<p>Status: {{ status }}</p>`;

const DEFAULT_DATA = `{
  "name": "Student",
  "items": ["Python", "Flask", "Jinja2"],
  "status": "Learning"
}`;

const Jinja2Preview = () => {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [jsonData, setJsonData] = useState(DEFAULT_DATA);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderTemplate = () => {
      try {
        const data = JSON.parse(jsonData);
        let result = template;

        // 1. Handle Loops: {% for item in list %} ... {% endfor %}
        // Limitation: Only supports simple "for x in y" loops
        const loopRegex = /{% for\s+(\w+)\s+in\s+(\w+)\s+%}([\s\S]*?){%\s+endfor\s+%}/g;
        
        result = result.replace(loopRegex, (match, itemVar, listVar, content) => {
          const list = data[listVar];
          if (!Array.isArray(list)) return `[Error: ${listVar} is not a list]`;
          
          return list.map((val: unknown) => {
            // Replace {{ item }} inside the loop
            // We create a temporary context for the loop item
            let itemContent = content;
            // Replace {{ item }}
            itemContent = itemContent.replace(new RegExp(`{{\\s*${itemVar}\\s*}}`, 'g'), String(val));
            // Replace {{ item.prop }} if val is object (simple support)
            if (typeof val === 'object' && val !== null) {
               Object.keys(val).forEach(key => {
                  itemContent = itemContent.replace(new RegExp(`{{\\s*${itemVar}\\.${key}\\s*}}`, 'g'), (val as Record<string, unknown>)[key] as string);
               });
            }
            return itemContent;
          }).join('');
        });

        // 2. Handle Variables: {{ variable }}
        // We do this after loops to handle global variables
        Object.keys(data).forEach(key => {
          const val = data[key];
          if (typeof val === 'string' || typeof val === 'number') {
             result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(val));
          }
        });

        setOutput(result);
        setError(null);
      } catch (e) {
        setError("Invalid JSON Data");
      }
    };

    renderTemplate();
  }, [template, jsonData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
      <div className="flex flex-col gap-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Template (Jinja2-ish)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Textarea 
              className="h-full resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
            />
          </CardContent>
        </Card>
        
        <Card className="h-1/3 flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Context Data (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            <Textarea 
              className={`h-full resize-none border-0 rounded-none focus-visible:ring-0 font-mono text-sm p-4 ${error ? 'bg-red-50' : ''}`}
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
            />
            {error && (
              <div className="absolute bottom-2 right-2 text-red-500 text-xs bg-white px-2 py-1 rounded border border-red-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col h-full">
        <CardHeader className="py-3 bg-muted/30">
          <CardTitle className="text-sm">Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-auto bg-white">
          <div className="prose max-w-none">
             {/* We render raw HTML to simulate the browser output */}
             <div dangerouslySetInnerHTML={{ __html: output }} />
          </div>
          
          <div className="mt-8 pt-4 border-t">
            <Label className="text-xs text-muted-foreground mb-2 block">Raw Output Source:</Label>
            <pre className="text-xs bg-slate-900 text-slate-50 p-4 rounded overflow-x-auto">
              {output}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jinja2Preview;
