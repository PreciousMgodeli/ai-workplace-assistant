import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { runGenerate } from "@/lib/generate";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — WorkAI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("Brief");
  const [audience, setAudience] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topic.trim()) return toast.error("Enter a topic");
    setLoading(true);
    try {
      const text = await runGenerate(
        `You are a research analyst. Produce a structured ${depth.toLowerCase()} markdown brief with: ## Overview, ## Key Concepts, ## Current Landscape, ## Considerations & Tradeoffs, ## Recommended Next Steps. Note any uncertainties explicitly. Do not fabricate statistics or citations.`,
        `Topic: ${topic}
Audience: ${audience || "General professional"}`
      );
      setOut(text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="AI Research Assistant"
      description="Get a structured brief on any topic. Always verify facts before relying on them."
      icon={<Search className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-5">
          <div className="grid gap-2">
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Vector databases for SaaS search" />
          </div>
          <div className="grid gap-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Brief", "Standard", "Deep"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Audience (optional)</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Non-technical execs" />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Research"}
          </Button>
        </div>
        <AiOutput value={out} onChange={setOut} loading={loading} minRows={18} />
      </div>
    </ToolShell>
  );
}