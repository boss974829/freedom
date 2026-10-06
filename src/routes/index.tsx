import { createFileRoute } from "@tanstack/react-router";
import { CourseApp } from "@/components/course-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CourseApp />;
}
