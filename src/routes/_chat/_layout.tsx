import { StreamProvider } from "@flux0-ai/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { fetchClientWithThrow } from "@/lib/api/api";
import type { components } from "@/lib/api/v1";

// this renders the layout of the entire chat application
export const Route = createFileRoute("/_chat/_layout")({
  loader: async () => {
    const sessions = await fetchClientWithThrow.GET("/api/sessions");

    return {
      sessions,
    };
  },
  component: RouteComponent,
});

type SessionsPaneProps = {
  sessions: Array<components["schemas"]["SessionDTO"]>;
  activeSessionId?: string;
  header?: React.ReactNode; // optional custom header content
};

export function SessionsPane({
  sessions,
  activeSessionId,
  header = "Sessions",
}: SessionsPaneProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-r-zinc-800 bg-zinc-950">
      <div className="p-3 flex items-center justify-between">
        {typeof header === "string" ? (
          <h2 className="text-sm font-semibold">{header}</h2>
        ) : (
          header
        )}
        <Link
          to="/"
          className="ml-2 px-3 py-1 rounded bg-zinc-800 text-white text-xs font-medium hover:bg-zinc-700"
        >
          New
        </Link>
      </div>

      <nav className="p-2 overflow-y-auto h-[calc(100%-44px)]">
        {sessions.length === 0 ? (
          <div className="text-xs text-gray-500 px-3 py-2">
            No sessions yet.
          </div>
        ) : (
          <ul className="space-y-1 text-sm">
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <li key={s.id}>
                  <Link
                    to="/session/$sessionId"
                    params={{ sessionId: s.id }}
                    className={[
                      "w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 block",
                      isActive ? "bg-zinc-900" : "",
                    ].join(" ")}
                  >
                    {s.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}

function RouteComponent() {
  const { sessions: sessionsResult } = Route.useLoaderData();
  const sessions = sessionsResult.data?.data || [];

  const { sessionId: activeSessionId } = useParams({ strict: false });

  return (
    <div className="h-[100dvh] bg-black text-white">
      <div className="mx-auto h-full shadow-sm overflow-hidden">
        <div className="flex h-full">
          <SessionsPane sessions={sessions} activeSessionId={activeSessionId} />
          <main className="flex-1 flex flex-col">
            <StreamProvider>
              <Outlet />
            </StreamProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
