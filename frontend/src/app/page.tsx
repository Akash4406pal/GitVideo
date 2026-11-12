import { getServerSession } from "next-auth";
import { authOptions } from "@/5_shared/auth/authOptions";
import { StudioClientApp } from "./StudioClientApp";

export default async function PipelinePage() {
  // Query server session instantly from request cookies (0ms HTTP roundtrip)
  const session = await getServerSession(authOptions);

  return <StudioClientApp initialSession={session} />;
}
