import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage,
  beforeLoad: async (context) => {
    // You can perform any data fetching or setup here before the route loads
    return context;
  },
});

function IndexPage() {
  return <>Dashboard component goes here</>;
}
