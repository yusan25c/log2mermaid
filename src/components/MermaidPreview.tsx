import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MermaidPreviewProps {
  mermaidCode: string;
}

export const MermaidPreview = ({ mermaidCode }: MermaidPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!mermaidCode || !containerRef.current) {
        setSvg("");
        return;
      }

      try {
        const { svg: renderedSvg } = await mermaid.render(
          `mermaid-${Date.now()}`,
          mermaidCode
        );
        setSvg(renderedSvg);
      } catch (error) {
        console.error("Mermaid rendering error:", error);
        setSvg("");
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode);
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Sequence Diagram Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!mermaidCode}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSvg}
            disabled={!svg}
          >
            <Download className="h-4 w-4 mr-1" />
            SVG
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-card border border-muted rounded-lg overflow-auto p-6">
        {svg ? (
          <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: svg }}
            className="flex items-center justify-center min-h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            {mermaidCode ? "Rendering diagram..." : "Enter CSV rules and logs to generate diagram"}
          </div>
        )}
      </div>
    </div>
  );
};
