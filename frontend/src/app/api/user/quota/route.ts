import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/5_shared/auth/authOptions";
import { QuotaAndSecurityService } from "@/5_shared/security/quotaService";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { authenticated: false, remaining: 0, total: 3 },
      { status: 200 }
    );
  }

  const userId = (session.user as any).id || session.user.email || "dev_user";
  const quota = QuotaAndSecurityService.getQuota(userId);

  return NextResponse.json({
    authenticated: true,
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    ...quota,
  });
}

