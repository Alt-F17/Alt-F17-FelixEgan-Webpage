import React, { useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PythonMindMap: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Card className="w-full max-w-5xl mx-auto border border-gray-200 rounded-lg shadow-md">
      <CardHeader>
        <CardTitle>Python Concept Map</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Open the concept map in a new tab for better performance.</p>
        <Button asChild>
          <a
            href="https://atlas.mindmup.com/bharanikumar/python_programming/index.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Python Concept Map
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PythonMindMap;
