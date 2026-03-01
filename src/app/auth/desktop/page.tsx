import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createDesktopToken } from "@/lib/auth/desktop-token";
import DesktopAuthClient from "./client";

export default async function DesktopAuthPage() {
  const { userId } = await auth();

  // If user is already signed in, generate token and redirect to desktop app
  if (userId) {
    const user = await currentUser();
    if (user) {
      let token: string | null = null;
      try {
        token = await createDesktopToken(userId);
      } catch (error) {
        console.error("[Desktop Auth] Error creating token:", error);
      }

      if (token) {
        redirect(`solaris://auth/callback?token=${token}`);
      }
    }
  }

  // Not signed in or token creation failed → show client component
  return <DesktopAuthClient />;
}
