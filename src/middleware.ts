import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/subscription(.*)",
  "/credits(.*)",
  "/api/openrouter-key(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/portal(.*)",
  "/api/user/(.*)",
  "/api/auth/generate-desktop-token(.*)",
  // NOTE: /api/autogram/* is NOT listed here.
  // Autogram routes handle their own auth in _lib/auth.ts
  // because the desktop app uses X-Solaris-User-Id + X-Solaris-Api-Key
  // headers instead of Clerk session cookies.
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|exe)).*)",
    "/(api|trpc)(.*)",
  ],
};
