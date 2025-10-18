import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DigitalSignature = ({ onSave }: { onSave: (signature: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { toast } = useToast();

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL();
    onSave(signatureData);
    
    toast({
      title: "Signature Saved",
      description: "Your digital signature has been saved successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Digital Signature
        </CardTitle>
        <CardDescription>
          Add your legally binding e-signature
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full bg-white cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvasRef.current?.dispatchEvent(mouseEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvasRef.current?.dispatchEvent(mouseEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearSignature} className="flex-1">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button onClick={saveSignature} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Save Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};