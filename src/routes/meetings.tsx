import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runGenerate } from "@/lib/generate";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — WorkAI" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!notes.trim()) return toast.error("Paste your meeting notes or transcript");
    setLoading(true);
    try {
      const text = await runGenerate(
        "You summarize meetings. Output markdown with sections: ## Summary (3-5 bullets), ## Key Decisions, ## Action Items (with owner and due date if mentioned), ## Open Questions. Be concise and factual.",
        notes
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
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Get a clean summary with action items."
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 glass rounded-xl p-5">
          <div className="grid gap-2">
            <Label>Meeting notes or transcript</Label>
            <Textarea
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste raw notes, bullet points, or full transcript…"
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Summarize"}
          </Button>
        </div>
        <AiOutput value={out} onChange={setOut} loading={loading} minRows={18} />
      </div>
    </ToolShell>
  );
}