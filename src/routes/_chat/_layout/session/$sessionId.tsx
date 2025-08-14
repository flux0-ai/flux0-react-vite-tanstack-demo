import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import Chat from "@/Chat";
import { fetchClientWithThrow } from "@/lib/api/api";

export const Route = createFileRoute("/_chat/_layout/session/$sessionId")({
  // shouldReload: false,
  loader: async ({ params: { sessionId } }) => {
    const session = await fetchClientWithThrow.GET(
      "/api/sessions/{session_id}",
      {
        params: { path: { session_id: sessionId } },
      },
    );

    const events = await fetchClientWithThrow.GET(
      "/api/sessions/{session_id}/events",
      {
        params: {
          path: { session_id: sessionId },
        },
      },
    );

    return {
      session,
      events,
    };
  },
  component: RouteComponent,
  errorComponent: ErrorComponent,
});

function RouteComponent() {
  const { session, events } = Route.useLoaderData();
  const { sessionId } = Route.useParams();
  if (!session || !session.data) return null;

  return (
    <Chat
      agentId={session.data.agent_id}
      sessionId={sessionId}
      initialEvents={events.data?.data || []}
    />
  );
}
