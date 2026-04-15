import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const BoxModelInteractive = () => {
  const [margin, setMargin] = useState(20);
  const [border, setBorder] = useState(5);
  const [padding, setPadding] = useState(20);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(100);

  const totalWidth = width + (padding * 2) + (border * 2) + (margin * 2);
  const totalHeight = height + (padding * 2) + (border * 2) + (margin * 2);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Box Model Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Margin (px)</Label>
              <span className="text-sm text-gray-500">{margin}px</span>
            </div>
            <Slider value={[margin]} onValueChange={(v) => setMargin(v[0])} max={100} step={1} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Border (px)</Label>
              <span className="text-sm text-gray-500">{border}px</span>
            </div>
            <Slider value={[border]} onValueChange={(v) => setBorder(v[0])} max={50} step={1} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Padding (px)</Label>
              <span className="text-sm text-gray-500">{padding}px</span>
            </div>
            <Slider value={[padding]} onValueChange={(v) => setPadding(v[0])} max={100} step={1} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Content Width (px)</Label>
              <span className="text-sm text-gray-500">{width}px</span>
            </div>
            <Slider value={[width]} onValueChange={(v) => setWidth(v[0])} max={400} step={10} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Content Height (px)</Label>
              <span className="text-sm text-gray-500">{height}px</span>
            </div>
            <Slider value={[height]} onValueChange={(v) => setHeight(v[0])} max={300} step={10} />
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Total Element Size</h3>
            <p>Width: {width} + {padding}*2 + {border}*2 + {margin}*2 = <strong>{totalWidth}px</strong></p>
            <p>Height: {height} + {padding}*2 + {border}*2 + {margin}*2 = <strong>{totalHeight}px</strong></p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-[2] flex items-center justify-center bg-gray-50 min-h-[500px] overflow-auto">
        <CardContent className="p-0">
          {/* Margin Box */}
          <div 
            className="relative flex items-center justify-center bg-orange-200 border-dashed border-2 border-orange-400 transition-all duration-300"
            style={{ 
              width: `${totalWidth}px`, 
              height: `${totalHeight}px` 
            }}
          >
            <span className="absolute top-1 left-2 text-xs font-bold text-orange-700">MARGIN</span>
            
            {/* Border Box */}
            <div 
              className="relative flex items-center justify-center bg-yellow-200 border-solid border-yellow-500 transition-all duration-300"
              style={{ 
                width: `${width + (padding * 2) + (border * 2)}px`, 
                height: `${height + (padding * 2) + (border * 2)}px`,
                borderWidth: `${border}px`
              }}
            >
              <span className="absolute top-1 left-2 text-xs font-bold text-yellow-700">BORDER</span>

              {/* Padding Box */}
              <div 
                className="relative flex items-center justify-center bg-green-200 transition-all duration-300"
                style={{ 
                  width: `${width + (padding * 2)}px`, 
                  height: `${height + (padding * 2)}px`,
                  padding: `${padding}px`
                }}
              >
                <span className="absolute top-1 left-2 text-xs font-bold text-green-700">PADDING</span>

                {/* Content Box */}
                <div 
                  className="relative flex items-center justify-center bg-blue-300 text-blue-900 font-bold transition-all duration-300"
                  style={{ 
                    width: `${width}px`, 
                    height: `${height}px` 
                  }}
                >
                  CONTENT
                  <br/>
                  {width} x {height}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoxModelInteractive;
