import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, ZoomIn, ZoomOut, Maximize2, RotateCcw, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MermaidPreviewProps {
  mermaidCode: string;
}

export const MermaidPreview = ({ mermaidCode }: MermaidPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasDiagram, setHasDiagram] = useState(false);
  const [editableCode, setEditableCode] = useState<string>(mermaidCode);
  const [theme, setTheme] = useState<string>("default");
  const { toast } = useToast();

  // Update editable code when the generated code changes
  useEffect(() => {
    console.log("Received mermaidCode:", mermaidCode);
    setEditableCode(mermaidCode);
  }, [mermaidCode]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme as any,
      securityLevel: "strict",
    });
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) {
        return;
      }

      if (!editableCode) {
        containerRef.current.innerHTML = "";
        setHasDiagram(false);
        return;
      }

      try {
        console.log("Attempting to render Mermaid code:", editableCode);
        containerRef.current.innerHTML = "";

        if (await mermaid.parse(editableCode)) {
          const { svg, bindFunctions } = await mermaid.render(`mermaid-${Date.now()}`, editableCode);
          containerRef.current.innerHTML = svg;
          bindFunctions?.(containerRef.current);
          console.log("Successfully rendered SVG");
          setHasDiagram(true);
        }

      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        setHasDiagram(false);
      }
    };

    renderDiagram();
  }, [editableCode, theme]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editableCode);
    toast({
      title: "Copied!",
      description: "Mermaid code copied to clipboard",
    });
  };

  const downloadSvg = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sequence-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "SVG file downloaded successfully",
    });
  };

  const downloadPng = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;

    // Get SVG dimensions
    const bbox = svgElement.getBBox();
    const width = bbox.width || 800;
    const height = bbox.height || 600;

    // Create canvas
    const canvas = document.createElement("canvas");
    const scale = 2; // Higher resolution
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Scale for higher quality
    ctx.scale(scale, scale);

    // Convert SVG to image
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Download PNG
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "sequence-diagram.png";
        a.click();
        URL.revokeObjectURL(pngUrl);
        toast({
          title: "Downloaded!",
          description: "PNG file downloaded successfully",
        });
      });
    };

    img.src = url;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-[7] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-base font-semibold text-foreground">Preview</h3>
          <div className="flex items-center gap-2">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="base">Base</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={downloadPng} disabled={!hasDiagram}>
              <FileImage className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 bg-background border border-border rounded-lg overflow-hidden relative">
          <TransformWrapper initialScale={1} minScale={0.1} maxScale={4} centerOnInit={true} centerZoomedOut={true}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {hasDiagram && (
                  <div className="absolute top-3 right-3 z-10 flex gap-1 bg-card border border-border rounded-lg p-1.5 shadow-medium">
                    <Button variant="ghost" size="icon" onClick={() => resetTransform()}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => zoomOut()}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div ref={containerRef} className="w-full h-full" />
                    {!hasDiagram && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                        {editableCode ? "Rendering diagram..." : "Enter CSV rules and logs to generate diagram"}
                      </div>
                    )}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      <div className="flex-[3] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Mermaid Code</h3>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyToClipboard} disabled={!editableCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          className="flex-1 font-mono text-xs resize-none bg-background border-border rounded-lg"
          placeholder="Enter CSV rules and logs to generate Mermaid code..."
        />
      </div>
    </div>
  );
};
