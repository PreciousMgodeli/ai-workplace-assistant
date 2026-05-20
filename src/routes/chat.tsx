import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Trash2, Loader2 } from "lucide-react";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "workai_chat_messages_v1";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — WorkAI" }] }),
  component: ChatPage,
});

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function ChatPage() {
  const [initial] = useState<UIMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "workai-main",
    messages: initial,
    transport,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  };

  const clear = () => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <ToolShell
      title="AI Chatbot"
      description="Ask anything about your work. Conversation is saved in this browser."
      icon={<MessageSquare className="h-5 w-5" />}
    >
      <div className="flex h-[calc(100vh-14rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </span>
          <Button size="sm" variant="ghost" onClick={clear} disabled={messages.length === 0}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="ml-1">Clear</span>
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="mx-auto mt-12 max-w-md text-center text-sm text-muted-foreground">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
              Start a conversation. Try: <em>"Draft an agenda for a 30-min product sync."</em>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                        {text}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{text || "…"}</ReactMarkdown>
                  </div>
                );
              })}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              )}
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error.message}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t bg-background p-3">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Message the assistant…"
              rows={2}
              className="min-h-[44px] resize-none"
              autoFocus
            />
            <Button onClick={submit} disabled={busy || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted-foreground">
            AI responses may be inaccurate. Verify important information.
          </p>
        </div>
      </div>
    </ToolShell>
  );
}