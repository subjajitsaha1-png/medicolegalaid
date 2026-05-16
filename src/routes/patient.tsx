import { createFileRoute } from "@tanstack/react-router";
import PatientDashboard from "@/components/PatientDashboard";

export const Route = createFileRoute("/patient")({
  component: PatientDashboard,
});
