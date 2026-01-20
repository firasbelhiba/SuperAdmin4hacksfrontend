"use client";

import { Suspense } from "react";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}
