export const dynamic = "force-dynamic";

// GET /api/autogram/health — Public health check (no auth required)
export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL_ENV || "unknown",
  });
}
