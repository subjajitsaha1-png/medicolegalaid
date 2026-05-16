import { createFileRoute } from "@tanstack/react-router";
import StaffDashboard from "@/components/StaffDashboard";

export const Route = createFileRoute("/staff")({
  component: StaffDashboard,
});
