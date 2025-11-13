import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface MermaidPreviewProps {
  mermaidCode: string;
}

export const MermaidPreview = ({ mermaidCode }: MermaidPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [editableCode, setEditableCode] = useState<string>(mermaidCode);
  const { toast } = useToast();

  // Update editable code when the generated code changes
  useEffect(() => {
    console.log("Received mermaidCode:", mermaidCode);
    setEditableCode(mermaidCode);
  }, [mermaidCode]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!editableCode) {
        setSvg("");
        return;
      }

      try {
        console.log("Attempting to render Mermaid code:", editableCode);
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${Date.now()}`, editableCode);
        console.log("Successfully rendered SVG");
        setSvg(renderedSvg);
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setSvg("");
      }
    };

    renderDiagram();
  }, [editableCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editableCode);
    toast({
      title: "Copied!",
      description: "Mermaid code copied to clipboard",
    });
  };

  const downloadSvg = () => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
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

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <Button variant="outline" size="sm" onClick={downloadSvg} disabled={!svg}>
            <Download className="h-4 w-4 mr-1" />
            SVG
          </Button>
        </div>
        <div className="flex-1 bg-card border border-muted rounded-lg overflow-hidden">
          {svg ? (
            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={4}
              centerOnInit
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border">
                    <Button variant="ghost" size="icon" onClick={() => zoomIn()}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => zoomOut()}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => resetTransform()}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                  >
                    <div
                      ref={containerRef}
                      dangerouslySetInnerHTML={{ __html: svg }}
                      className="flex items-center justify-center min-h-full p-6"
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {editableCode ? "Rendering diagram..." : "Enter CSV rules and logs to generate diagram"}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col overflow-hidden h-48">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Mermaid Code</h3>
          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!editableCode}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
        <Textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          className="flex-1 font-mono text-xs resize-none"
          placeholder="Enter CSV rules and logs to generate Mermaid code..."
        />
      </div>
    </div>
  );
};
