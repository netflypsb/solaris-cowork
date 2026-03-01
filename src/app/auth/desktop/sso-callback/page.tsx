import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function DesktopSSOCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/auth/desktop"
      signUpForceRedirectUrl="/auth/desktop"
    />
  );
}
