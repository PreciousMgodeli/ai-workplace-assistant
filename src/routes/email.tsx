import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { runGenerate } from "@/lib/generate";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — WorkAI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("Professional");
  const [intent, setIntent] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!intent.trim()) return toast.error("Describe what the email should say");
    setLoading(true);
    try {
      const text = await runGenerate(
        "You are an expert email writer. Produce a complete, ready-to-send email. Use clear subject line, greeting, body, and sign-off. Return only the email text.",
        `Recipient: ${recipient || "Unspecified"}
Subject hint: ${subject || "Infer from intent"}
Tone: ${tone}
Goal/Message: ${intent}`
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
      title="Smart Email Generator"
      description="Describe what you need to say. Get a polished draft you can edit."
      icon={<Mail className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-card p-5">
          <div className="grid gap-2">
            <Label>Recipient</Label>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, my manager" />
          </div>
          <div className="grid gap-2">
            <Label>Subject (optional)</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Project update" />
          </div>
          <div className="grid gap-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Professional", "Friendly", "Concise", "Formal", "Persuasive", "Apologetic"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>What should the email say?</Label>
            <Textarea
              rows={6}
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Let them know the deck is ready, ask for feedback by Friday, mention the offsite next week…"
            />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate email"}
          </Button>
        </div>
        <AiOutput value={out} onChange={setOut} loading={loading} placeholder="Your draft email will appear here." />
      </div>
    </ToolShell>
  );
}