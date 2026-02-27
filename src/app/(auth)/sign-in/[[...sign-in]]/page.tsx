import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/solaris.jpg"
            alt="Solaris Logo"
            width={64}
            height={64}
            className="w-16 h-16 rounded-xl object-cover mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your Solaris account</p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
