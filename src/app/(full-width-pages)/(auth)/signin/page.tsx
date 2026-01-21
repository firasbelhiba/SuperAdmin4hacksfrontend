import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In | 4Hacks - Hackathon Management Platform",
  description: "Sign in to your 4Hacks account to manage hackathons, organizations, and participants.",
};

export default function SignIn() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
