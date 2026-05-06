import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Plus, Save, GitCommit, FileCode } from "lucide-react";

type FileStatus = 'working' | 'staged' | 'committed';

interface GitFile {
  id: number;
  name: string;
  status: FileStatus;
  content: string; // Just for flavor
}

const GitStateVisualizer = () => {
  const [files, setFiles] = useState<GitFile[]>([]);
  const [newFileName, setNewFileName] = useState("");

  const addFile = () => {
    if (!newFileName.trim()) return;
    const newFile: GitFile = {
      id: Date.now(),
      name: newFileName,
      status: 'working',
      content: 'print("Hello World")'
    };
    setFiles([...files, newFile]);
    setNewFileName("");
  };

  const gitAdd = (id: number) => {
    setFiles(files.map(f => f.id === id ? { ...f, status: 'staged' } : f));
  };

  const gitCommit = () => {
    setFiles(files.map(f => f.status === 'staged' ? { ...f, status: 'committed' } : f));
  };

  const modifyFile = (id: number) => {
    // Simulates editing a committed file -> moves back to working
    // Or editing a staged file -> moves back to working (technically it keeps a staged version, but let's simplify)
    setFiles(files.map(f => f.id === id ? { ...f, status: 'working' } : f));
  };

  const renderFileCard = (file: GitFile, column: FileStatus) => (
    <div key={file.id} className="bg-white p-3 rounded shadow-sm border flex flex-col gap-2 mb-2">
      <div className="flex items-center gap-2 font-mono text-sm font-semibold">
        <FileCode className="w-4 h-4 text-blue-500" />
        {file.name}
      </div>
      
      <div className="flex justify-end gap-2">
        {column === 'working' && (
          <Button size="sm" variant="default" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => gitAdd(file.id)}>
            git add
          </Button>
        )}
        {column === 'staged' && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => modifyFile(file.id)}>
            Edit
          </Button>
        )}
        {column === 'committed' && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => modifyFile(file.id)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[600px] gap-4">
      <div className="flex gap-4 items-end p-4 bg-slate-50 rounded-lg border">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Create / Edit File</label>
          <div className="flex gap-2">
            <Input 
              placeholder="filename.py" 
              value={newFileName} 
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFile()}
            />
            <Button onClick={addFile}><Plus className="w-4 h-4 mr-2" /> Create</Button>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
           <Button 
             onClick={gitCommit} 
             disabled={!files.some(f => f.status === 'staged')}
             className="bg-purple-600 hover:bg-purple-700"
           >
             <GitCommit className="w-4 h-4 mr-2" /> git commit -m "Update"
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Working Directory */}
        <Card className="flex flex-col bg-red-50/50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-700 uppercase tracking-wider">Working Directory</CardTitle>
            <p className="text-xs text-red-600">Modified / Untracked</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto bg-red-50/30 p-2">
            {files.filter(f => f.status === 'working').map(f => renderFileCard(f, 'working'))}
            {files.filter(f => f.status === 'working').length === 0 && (
              <div className="text-center text-red-300 text-sm mt-10 italic">Clean</div>
            )}
          </CardContent>
        </Card>

        {/* Staging Area */}
        <Card className="flex flex-col bg-green-50/50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-700 uppercase tracking-wider">Staging Area</CardTitle>
            <p className="text-xs text-green-600">Index / Ready to Commit</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto bg-green-50/30 p-2">
            {files.filter(f => f.status === 'staged').map(f => renderFileCard(f, 'staged'))}
            {files.filter(f => f.status === 'staged').length === 0 && (
              <div className="text-center text-green-300 text-sm mt-10 italic">Empty</div>
            )}
          </CardContent>
          <div className="absolute top-1/2 -left-3 z-10">
             <ArrowRight className="text-slate-300" />
          </div>
        </Card>

        {/* Repository */}
        <Card className="flex flex-col bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-700 uppercase tracking-wider">Repository</CardTitle>
            <p className="text-xs text-blue-600">Committed History</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto bg-blue-50/30 p-2">
            {files.filter(f => f.status === 'committed').map(f => renderFileCard(f, 'committed'))}
            {files.filter(f => f.status === 'committed').length === 0 && (
              <div className="text-center text-blue-300 text-sm mt-10 italic">No commits yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GitStateVisualizer;
