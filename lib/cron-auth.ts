import { unauthorizedResponse } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET?.trim();

/**
 * Protects cron/job API routes.
 *
 * Expected header:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * @returns null when authorized; otherwise a 401/503 NextResponse to return immediately
 */
export function authorizeCronRequest(request: Request): NextResponse | null {
  // Misconfigured deploy — fail closed so the job is not runnable without a secret
  if (!CRON_SECRET) {
    return NextResponse.json(
      { error: "Cron jobs are not configured (missing CRON_SECRET)" },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || header !== `Bearer ${CRON_SECRET}`) {
    return unauthorizedResponse();
  }

  return null;
}
