"use client";

import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

export default function EmailVerified() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <FaCheckCircle className="text-green-500" size={64} />
        </div>

        <h1 className="text-3xl text-black font-semibold mb-3">
          Email Verified!
        </h1>

        <p className="text-gray-600 text-sm mb-8">
          Congratulations! Your email address has been successfully verified.
          You can now access all features of your account.
        </p>

        {/* Continue button */}
        <Link
          href="/signin"
          className="block w-full py-3 bg-brand-500 hover:bg-brand-600 text-black font-medium rounded-lg transition"
        >
          Continue to Sign In
        </Link>
      </div>
    </div>
  );
}
