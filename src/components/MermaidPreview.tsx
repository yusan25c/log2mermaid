import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      if (!editableCode || !containerRef.current) {
        setSvg("");
        return;
      }

      try {
        const { svg: renderedSvg } = await mermaid.render(
          `mermaid-${Date.now()}`,
          editableCode
        );
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
          <h3 className="text-sm font-medium">Mermaid Code</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!editableCode}
          >
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Preview</h3>
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
        <div className="flex-1 bg-card border border-muted rounded-lg overflow-auto p-6">
          {svg ? (
            <div
              ref={containerRef}
              dangerouslySetInnerHTML={{ __html: svg }}
              className="flex items-center justify-center min-h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              {editableCode ? "Rendering diagram..." : "Enter CSV rules and logs to generate diagram"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
