import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListTodo, Loader2 } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runGenerate } from "@/lib/generate";
import { toast } from "sonner";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — WorkAI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [context, setContext] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!goal.trim()) return toast.error("Describe your goal");
    setLoading(true);
    try {
      const text = await runGenerate(
        "You are an expert project planner. Break the goal into a prioritized task plan. Output markdown with: ## Overview, ## Milestones (with target dates if a deadline is given), ## Tasks (table-style list grouped by milestone, each with priority High/Med/Low and estimated effort), ## Risks & Mitigations.",
        `Goal: ${goal}
Deadline: ${deadline || "Not specified"}
Context: ${context || "None"}`
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
      title="AI Task Planner"
      description="Turn a goal into a structured, prioritized plan with milestones."
      icon={<ListTodo className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 glass rounded-xl p-5">
          <div className="grid gap-2">
            <Label>Goal</Label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Launch Q3 marketing campaign" />
          </div>
          <div className="grid gap-2">
            <Label>Deadline (optional)</Label>
            <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Sept 15, 2026" />
          </div>
          <div className="grid gap-2">
            <Label>Context (optional)</Label>
            <Textarea
              rows={6}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Team size, constraints, dependencies, prior work…"
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full gradient-primary shadow-glow hover:opacity-90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate plan"}
          </Button>
        </div>
        <AiOutput value={out} onChange={setOut} loading={loading} minRows={18} />
      </div>
    </ToolShell>
  );
}