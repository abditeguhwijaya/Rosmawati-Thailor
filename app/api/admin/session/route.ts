import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: noStoreHeaders },
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      admin: {
        email: admin.email,
        name: admin.name,
      },
    },
    { headers: noStoreHeaders },
  );
}
