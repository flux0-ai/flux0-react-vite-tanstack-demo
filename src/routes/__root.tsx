import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  ErrorComponent,
  Outlet,
} from "@tanstack/react-router";
import { fetchClientWithThrow } from "@/lib/api/api";

const queryClient = new QueryClient();

// This is the root route for the application
// It serves as the entry point for the React Router
// It does not render any specific UI rather it provides the context for the application
export const Route = createRootRoute({
  loader: async () => {
    const sessions = await fetchClientWithThrow.GET("/api/sessions");

    return {
      sessions,
    };
  },
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
