import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import { User } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile | 4Hacks Admin",
  description: "Manage your profile information and social links",
};

export default function Profile() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#56CCA9] rounded-xl border-2 border-[#18191F]">
            <User className="h-6 w-6 text-[#18191F]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#18191F] dark:text-white">My Profile</h1>
            <p className="text-gray-500 text-sm">View and manage your profile information</p>
          </div>
        </div>

        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
        </div>
      </div>
    </div>
  );
}
