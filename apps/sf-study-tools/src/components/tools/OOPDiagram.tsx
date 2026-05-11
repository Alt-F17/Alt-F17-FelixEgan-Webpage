import React, { useState, useEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-github_light_default';
import 'ace-builds/src-noconflict/mode-python';
import mermaid from 'mermaid';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Parse classes, attributes, inheritance, methods (with return expressions), and init evolution
function parseClasses(code: string) {
  const lines = code.split(/\r?\n/);
  interface Info { attributes: string[]; methods: string[]; bases: string[]; returns: Record<string,string>; }
  const classInfo: Record<string, Info> = {};
  const classRegex = /^\s*class\s+(\w+)\s*(?:\(([^)]*)\))?:/;
  lines.forEach((line, idx) => {
    const m = line.match(classRegex);
    if (!m) return;
    const cls = m[1];
    const bases = m[2] ? m[2].split(',').map(b => b.trim()) : [];
    classInfo[cls] = { attributes: [], methods: [], bases, returns: {} };
    const indentClass = (line.match(/^(\s*)/) || ['',''])[1].length;
    // scan class body
    for (let j = idx + 1; j < lines.length; j++) {
      const next = lines[j];
      const indent = (next.match(/^(\s*)/) || ['',''])[1].length;
      if (next.trim() === '' || indent <= indentClass) break;
      const trimmed = next.trim();
      // attribute assignment (capture with value)
      const attrMatch = trimmed.match(/^self\.(\w+)\s*=\s*(.+)/);
      if (attrMatch) {
        const [_, attrName, attrVal] = attrMatch;
        const entry = `${attrName} = ${attrVal.trim()}`;
        if (!classInfo[cls].attributes.includes(entry)) classInfo[cls].attributes.push(entry);
      }
      // method definition
      const defMatch = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)/);
      if (defMatch) {
        const name = defMatch[1];
        const paramsList = defMatch[2].split(',').map(p => p.trim()).filter(p => p && p !== 'self');
        let signature = `${name}(${paramsList.join(', ')})`;
        // special handling for __init__: capture super init + assignments
        const indentDef = indent;
        const bodyLines: string[] = [];
        for (let k = j + 1; k < lines.length; k++) {
          const bodyLineRaw = lines[k];
          const indentBody = (bodyLineRaw.match(/^(\s*)/) || ['',''])[1].length;
          if (bodyLineRaw.trim() === '' || indentBody <= indentDef) break;
          const bodyTrim = bodyLineRaw.trim();
          if (name === '__init__') {
            // super init call or attr assignment
            if (bodyTrim.startsWith('super().__init__')) {
              bodyLines.push('super().__init__');
            } else if (bodyTrim.startsWith('self.')) {
              bodyLines.push(bodyTrim.replace('self.', ''));
            }
            continue;
          }
        }
        if (name === '__init__') {
          if (bodyLines.length) signature += ' : ' + bodyLines.join(' | ');
          classInfo[cls].methods.push(signature);
          continue;
        }
        // scan other methods for return expressions and print statements
        let returnExpr = '';
        const prints: string[] = [];
        for (let k = j + 1; k < lines.length; k++) {
          const bodyLine = lines[k];
          const indentBody = (bodyLine.match(/^(\s*)/) || ['',''])[1].length;
          if (bodyLine.trim() === '' || indentBody <= indentDef) break;
          const trimmedLine = bodyLine.trim();
          const retMatch = trimmedLine.match(/^return\s+(.+)/);
          const printMatch = trimmedLine.match(/^print\((.+)\)/);
          if (retMatch) { returnExpr = retMatch[1].trim(); }
          if (printMatch) { prints.push(printMatch[1].trim()); }
        }
        // combine return and prints
        let finalReturn = returnExpr;
        // detect super().anyMethod() override
        const superMatch = returnExpr.match(/^super\(\)\.(\w+)\(\)(.*)$/);
        if (superMatch) {
          const baseMethod = superMatch[1];
          const suffix = superMatch[2] || '';
          const baseClass = classInfo[cls].bases[0];
          const baseRet = classInfo[baseClass]?.returns[baseMethod] || '';
          finalReturn = baseRet + suffix.trim();
        }
        const parts = [] as string[];
        if (finalReturn) parts.push(finalReturn);
        if (prints.length) parts.push(...prints);
        if (parts.length) signature += ` : ${parts.join(' | ')}`;
        classInfo[cls].returns[name] = finalReturn;
        classInfo[cls].methods.push(signature);
      }
    }
  });
  // build diagram lines
  const diagramLines: string[] = ['classDiagram'];
  for (const [cls, info] of Object.entries(classInfo)) {
    diagramLines.push(`class ${cls} {`);
    // attributes
    info.attributes.forEach(a => diagramLines.push(`  + ${a}`));
    // methods
    info.methods.forEach(m => diagramLines.push(`  ${m}`));
    diagramLines.push('}');
  }
  // inheritance
  for (const [cls, info] of Object.entries(classInfo)) {
    info.bases.forEach(base => diagramLines.push(`${base} <|-- ${cls}`));
  }
  return diagramLines.join('\n');
}

// Extract raw class info for summary
interface Info { attributes: string[]; methods: string[]; bases: string[]; returns: Record<string,string>; }
function extractClassInfo(code: string): Record<string, Info> {
  // copy parse logic up to classInfo construction
  const lines = code.split(/\r?\n/);
  const classInfo: Record<string, Info> = {};
  const classRegex = /^\s*class\s+(\w+)\s*(?:\(([^)]*)\))?:/;
  lines.forEach((line, idx) => {
    const m = line.match(classRegex);
    if (!m) return;
    const cls = m[1];
    const bases = m[2] ? m[2].split(',').map(b => b.trim()) : [];
    classInfo[cls] = { attributes: [], methods: [], bases, returns: {} };
    const indentClass = (line.match(/^(\s*)/) || ['',''])[1].length;
    for (let j = idx+1; j < lines.length; j++) {
      const next = lines[j];
      const indent = (next.match(/^(\s*)/) || ['',''])[1].length;
      if (!next.trim() || indent <= indentClass) break;
      const tr = next.trim();
      // attributes
      const am = tr.match(/^self\.(\w+)\s*=\s*(.+)/);
      if (am) classInfo[cls].attributes.push(`${am[1]} = ${am[2]}`);
      // methods
      const dm = tr.match(/^def\s+(\w+)\s*\(([^)]*)\)/);
      if (dm) classInfo[cls].methods.push(tr);
      // returns
      const rm = tr.match(/^return\s+(.+)/);
      if (rm && dm) classInfo[cls].returns[dm[1]] = rm[1];
    }
  });
  return classInfo;
}

// Build textual summary
function buildSummary(info: Record<string, Info>): string {
  let out = '';
  for (const [cls, data] of Object.entries(info)) {
    out += `${cls}\n`;
    data.attributes.forEach(a => out += `+ ${a}\n`);
    data.methods.forEach(m => {
      out += `${m}\n`;
      const name = m.match(/^def\s+(\w+)/)?.[1];
      const ret = name ? data.returns[name] : '';
      if (ret) out += `${ret}\n`;
    });
    out += '\n';
  }
  return out;
}

const classRegex = /^\s*class\s+(\w+)\s*(?:\(([^)]*)\))?:/m;
function extractInfo(code: string) {
  const m = code.match(classRegex);
  if (!m) return { cls: '', bases: [] as string[] };
  const cls = m[1];
  const bases = m[2] ? m[2].split(',').map(b => b.trim()) : [];
  return { cls, bases };
}

function withImports(file: { name: string; code: string; }, files: { name: string; code: string; }[]) {
  const info = extractInfo(file.code);
  const imports: string[] = [];
  info.bases.forEach(base => {
    const source = files.find(f => extractInfo(f.code).cls === base);
    if (source) {
      const mod = source.name.replace(/\.py$/i, '');
      imports.push(`from ${mod} import ${base}`);
    }
  });
  return imports.join('\n') + (imports.length ? '\n\n' : '') + file.code;
}

const OOPDiagram: React.FC = () => {
  const initialFiles = [
    { name: 'Animal.py', code: `class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "Some sound:"
` },
    { name: 'Dog.py', code: `class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
    def speak(self):
        return super().speak() + " Bark"
` }
  ];
  const [files, setFiles] = useState<{name: string; code: string;}[]>(initialFiles);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [diagramText, setDiagramText] = useState<string>('classDiagram');
  const [classInfoState, setClassInfoState] = useState<Record<string,Info>>({});
  const diagramRef = useRef<HTMLDivElement>(null);

  // initialize mermaid
  useEffect(() => {
    mermaid.mermaidAPI.initialize({ startOnLoad: false, theme: 'neutral' });
  }, []);
  // update diagram text and class info
  useEffect(() => {
    const combined = files.map(f => f.code).join('\n\n');
    setClassInfoState(extractClassInfo(combined));
    setDiagramText(parseClasses(combined));
  }, [files]);
  // render mermaid diagram
  useEffect(() => {
    if (diagramRef.current) {
      (mermaid as any).render('oop-diagram', diagramText)
        .then((result: { svg: string; bindFunctions?: Function }) => {
          diagramRef.current!.innerHTML = result.svg;
          result.bindFunctions?.(diagramRef.current);
        })
        .catch(err => console.error('Mermaid render error:', err));
    }
  }, [diagramText]);

  const handleRefresh = () => {
    if (diagramRef.current) {
      (mermaid as any).render('oop-diagram', diagramText)
        .then((result: { svg: string; bindFunctions?: Function }) => {
          diagramRef.current!.innerHTML = result.svg;
          result.bindFunctions?.(diagramRef.current);
        })
        .catch(err => console.error('Mermaid render error:', err));
    }
  };

  const addClass = () => {
    const name = window.prompt('New class name (without .py):');
    if (name) {
      const fileName = `${name}.py`;
      if (!files.some(f => f.name === fileName)) {
        setFiles([...files, { name: fileName, code: `class ${name}():\n    pass\n` }]);
        setActiveIndex(files.length);
      }
    }
  };

  const deleteClass = (idx: number) => {
    if (files.length <= 1) return;
    if (window.confirm(`Delete ${files[idx].name}?`)) {
      const newFiles = files.filter((_, i) => i !== idx);
      setFiles(newFiles);
      setActiveIndex(Math.max(0, activeIndex - (idx<=activeIndex?1:0)));
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 mb-4">
        <button onClick={addClass} className="px-4 py-2 bg-green-500 text-white rounded">New Class</button>
        <div className="flex space-x-2 overflow-x-auto">
          {files.map((f, idx) => (
            <div key={f.name} className="flex items-center">
              <button
                className={`px-4 py-2 rounded ${idx===activeIndex?'bg-blue-500 text-white':'bg-gray-200'}`}
                onClick={() => setActiveIndex(idx)}
              >{f.name}</button>
              <button onClick={() => deleteClass(idx)} className="text-red-500 ml-1">×</button>
            </div>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>OOP Inheritance Diagram (One class per file, sorry formating is... weird...)</CardTitle></CardHeader>
        <CardContent>
          <AceEditor
            mode="python"
            theme="github_light_default"
            value={files[activeIndex].code}
            onChange={(val) => {
              const newFiles = [...files]; newFiles[activeIndex].code = val; setFiles(newFiles);
            }}
            width="100%"
            height="240px"
            setOptions={{ useWorker: false, maxLines: Infinity }}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefresh}>Refresh Diagram</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader><CardTitle>Diagram Preview</CardTitle></CardHeader>
        <CardContent>
          <div ref={diagramRef} className="mermaid overflow-auto" />
        </CardContent>
      </Card>
    </div>
  );
};

export default OOPDiagram;