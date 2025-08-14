import { type Message, useMessageStream } from "@flux0-ai/react";
import { useNavigate } from "@tanstack/react-router";
import { cx } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollToBottom } from "./hooks/use-scroll-to-bottom";
import { ArrowUpIcon, ChevronDownIcon, SparklesIcon, StopIcon } from "./Icons";
import { type APIError, fetchClientWithThrow } from "./lib/api/api";
import type { components } from "./lib/api/v1";

function StopButton({ stop }: { stop: () => void }) {
  return (
    <button
      type="button"
      className="rounded-full p-1.5 h-fit border border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
      }}
    >
      <StopIcon size={14} />
    </button>
  );
}

function SendButton({
  submitForm,
  input,
}: {
  submitForm: () => void;
  input: string;
}) {
  return (
    <button
      type="button"
      className="rounded-full p-1.5 h-fit border border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0}
    >
      <ArrowUpIcon size={14} />
    </button>
  );
}

function UserInput({
  agentId,
  sessionId,
  newSession,
  input,
  setInput,
  handleSubmit,
  hasMessages,
  isLoading,
  stop,
}: {
  agentId: string;
  sessionId: string;
  newSession?: boolean;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  hasMessages: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId && textareaRef.current) {
      textareaRef.current?.focus();
    }
  }, [sessionId]);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only run once after hydration
  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || "";
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const submitForm = useCallback(async () => {
    if (newSession) {
      try {
        await fetchClientWithThrow.POST("/api/sessions", {
          body: {
            id: sessionId,
            title: input.split(" ").reduce((acc, word) => {
              if (acc.length + word.length + 1 <= 15) {
                return acc + (acc ? " " : "") + word;
              }
              return acc;
            }, ""),
            agent_id: agentId,
          },
        });

        navigate({
          to: "/session/$sessionId",
          params: { sessionId },
        });
      } catch (err: unknown) {
        const error = err as APIError;
        alert(error.detail || "Failed to create new session");
        return;
      }
    }

    handleSubmit(undefined);
  }, [handleSubmit, sessionId, agentId, input, newSession, navigate]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {!isLoading && !hasMessages && <div>No messages yet</div>}

      <textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={
          "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-zinc-950 p-4 border border-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-700 focus:outline-none"
        }
        rows={2}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              alert("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {isLoading ? (
          <StopButton stop={stop} />
        ) : (
          <SendButton input={input} submitForm={submitForm} />
        )}
      </div>
    </div>
  );
}

interface MessageReasoningProps {
  processing: string | undefined;
  reasoning: string[] | string | Record<string, unknown>;
}

export function MessageReasoning({
  processing,
  reasoning,
}: MessageReasoningProps) {
  return (
    <div className="flex flex-col">
      {processing ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            {/* <LoaderIcon /> */}
            Loader...
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Reasoned for a few seconds</div>
          <div className="cursor-pointer">
            <ChevronDownIcon />
          </div>
        </div>
      )}

      <div
        style={{ overflow: "hidden" }}
        className="pl-4 text-zinc-400 border-l flex flex-col gap-4"
      >
        {JSON.stringify(reasoning)}
      </div>
    </div>
  );
}

interface MessagesProps {
  sessionId: string;
  processing: string | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
}

const PreviewMessage = ({
  message,
  processing,
}: {
  message: Message;
  processing: string | undefined;
}) => {
  return (
    <div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      data-role={message.source}
    >
      <div className="flex gap-4 w-full ml-auto group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:w-fit">
        {message.source === "ai_agent" && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 bg-zinc-900 ring-zinc-700">
            <div className="translate-y-px">
              <SparklesIcon size={14} />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4 w-full">
          {message.reasoning && (
            <MessageReasoning
              processing={processing}
              reasoning={message.reasoning}
            />
          )}

          <div className="flex flex-row gap-2 items-start">
            <div
              className={cx("flex flex-col gap-4", {
                "bg-zinc-800 px-3 py-2 rounded-xl": message.source === "user",
              })}
            >
              {typeof message.content === "string" ||
              Array.isArray(message.content) ? (
                message.content
              ) : message.content === undefined ? null : (
                <pre>{JSON.stringify(message.content, null, 2)}</pre>
              )}
            </div>
          </div>

          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.tool_calls.map((toolInvocation) => {
                const { tool_name, tool_call_id, result } = toolInvocation;
                if (result) {
                  return (
                    <div key={tool_call_id}>
                      {tool_name === "get_weather" ? (
                        <div className="bg-zinc-800">
                          Custom Weather Widget : {JSON.stringify(result)}
                        </div>
                      ) : (
                        <span className="text-zinc-600">
                          {tool_name} : {JSON.stringify(result)}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={tool_call_id}
                    className={cx({
                      "animate-pulse": ["get_weather"].includes(tool_name),
                    })}
                  >
                    <span className="bg-zinc-800">{tool_name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Messages = ({ processing, messages }: MessagesProps) => {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          message={message}
          processing={messages.length - 1 === index ? processing : undefined}
        />
      ))}
      {processing &&
        messages.length > 0 &&
        messages[messages.length - 1].source === "user" && (
          <ThinkingMessage processing={processing} />
        )}
      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
};

export const ThinkingMessage = ({ processing }: { processing: string }) => {
  const role = "ai_agent";

  return (
    <div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-zinc-100": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-zinc-600">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-zinc-100">{processing}</div>
        </div>
      </div>
    </div>
  );
};

export default function Chat({
  agentId,
  sessionId,
  newSession,
  initialEvents,
}: {
  agentId: string;
  sessionId: string;
  newSession?: boolean;
  initialEvents: Array<components["schemas"]["EventDTO"]>;
}) {
  const [input, setInput] = useState<string>("");

  const {
    messages,
    streaming,
    processing,
    error,
    resetMessages,
    startStreaming,
    stopStreaming,
  } = useMessageStream({ events: initialEvents });

  const handleSubmit = useCallback(
    (event?: { preventDefault?: () => void }) => {
      if (event) {
        event.preventDefault?.();
      }
      startStreaming(sessionId, input);
      setInput("");
    },
    [startStreaming, input, sessionId],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to reset when sessionId changes
  useEffect(() => {
    resetMessages();
    return () => {};
  }, [resetMessages, sessionId]);

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-zinc-900">
      <Messages
        sessionId={sessionId}
        processing={processing}
        messages={Array.from(messages.values())}
        setMessages={() => {}}
      />
      <form className="flex mx-auto px-4 pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <UserInput
          agentId={agentId}
          newSession={newSession}
          sessionId={sessionId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={streaming}
          stop={stopStreaming}
          hasMessages={!!messages.length}
        />
      </form>
    </div>
  );
}
