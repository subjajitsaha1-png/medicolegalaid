import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";
import type { UserRole } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const handleLogin = (role: UserRole) => {
    if (role === "patient") navigate({ to: "/patient" });
    else navigate({ to: "/staff" });
  };
  return <LandingPage onLogin={handleLogin} />;
}
