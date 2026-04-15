import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";

const SF1Tools: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFullscreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen?.();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>SF1 Study Tools</CardTitle>
          <Button size="sm" variant="outline" onClick={handleFullscreen}>
            <Maximize className="mr-1 h-4 w-4" />Fullscreen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <iframe
          ref={iframeRef}
          src={`${import.meta.env.BASE_URL}sf1/sf1-study-tools.html`}
          title="SF1 Study Tools"
          className="w-full h-[calc(100vh-6rem)] border-none"
        />
      </CardContent>
    </Card>
  );
};

export default SF1Tools;
