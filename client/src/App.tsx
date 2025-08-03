import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CreateContent from "@/pages/create-content";
import Analytics from "@/pages/analytics";
import MediaLibrary from "@/pages/media-library";
import ScheduledPosts from "@/pages/scheduled-posts";
import PostHistory from "@/pages/post-history";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/create" component={CreateContent} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/media" component={MediaLibrary} />
          <Route path="/scheduled" component={ScheduledPosts} />
          <Route path="/history" component={PostHistory} />
          <Route path="/users" component={UserManagement} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
