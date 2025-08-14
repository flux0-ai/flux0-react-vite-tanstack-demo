import { createFileRoute } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import Chat from "@/Chat";

export const Route = createFileRoute("/_chat/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Chat
      initialEvents={[]}
      sessionId={nanoid(10)}
      newSession
      agentId={import.meta.env.VITE_AGENT_ID as string}
    />
  );
}
