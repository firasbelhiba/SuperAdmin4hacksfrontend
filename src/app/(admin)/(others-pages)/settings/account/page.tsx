"use client";

import React, { useEffect, useState } from "react";
import { User, Lock, Shield, Link2, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertProvider";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import {
  updatePassword,
  enable2FA,
  verifyEnable2FA,
  disable2FA,
  verifyDisable2FA,
  updateUserProfile,
  updateUsername,
  getUserProfile,
} from "@/services/profile";

export default function AccountSettingsPage() {
  const { user, isLoading: loading, refreshSession } = useAuth();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [codeSent, setCodeSent] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(false);

  // Pre-fill the form with user data once available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Fetch 2FA status from profile API
  useEffect(() => {
    async function fetch2FAStatus() {
      if (!user?.username) return;
      try {
        const profile = await getUserProfile(user.username);
        setIs2FAEnabled(profile.twoFactorEnabled || false);
      } catch (err) {
        console.error("Failed to fetch 2FA status:", err);
      }
    }
    fetch2FAStatus();
  }, [user?.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      // Update profile data
      await updateUserProfile({
        name: formData.name,
      }, null);

      // If username changed, update separately
      if (formData.username !== user.username) {
        await updateUsername({ username: formData.username });
      }

      await refreshSession();
      showAlert("success", "Profile Updated", "Your profile has been updated successfully.");
    } catch (err: any) {
      showAlert("error", "Update Failed", err.message || "Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showAlert("error", "Password Mismatch", "New password and confirm password do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(passwords);
      showAlert("success", "Password Updated", "Your password has been updated successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showAlert("error", "Update Failed", err.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSend2FACode = async () => {
    setIs2FALoading(true);
    try {
      if (is2FAEnabled) {
        await disable2FA();
        showAlert("info", "Code Sent", "A code to disable 2FA has been sent to your email.");
      } else {
        await enable2FA();
        showAlert("info", "Code Sent", "A code to enable 2FA has been sent to your email.");
      }
      setCodeSent(true);
    } catch (err: any) {
      showAlert("error", "Error", err.message || "Something went wrong while sending the code.");
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setIs2FALoading(true);
    try {
      if (is2FAEnabled) {
        await verifyDisable2FA(twoFACode);
        showAlert("success", "2FA Disabled", "Two-factor authentication has been disabled.");
        setIs2FAEnabled(false);
      } else {
        await verifyEnable2FA(twoFACode);
        showAlert("success", "2FA Enabled", "Two-factor authentication has been enabled.");
        setIs2FAEnabled(true);
      }
      setCodeSent(false);
      setTwoFACode("");
      await refreshSession();
    } catch (err: any) {
      showAlert("error", "Verification Failed", err.message || "Failed to verify code.");
    } finally {
      setIs2FALoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading account settings..." />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#FFBD12] rounded-xl border-2 border-[#18191F]">
            <Settings className="h-6 w-6 text-[#18191F]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#18191F] dark:text-white">Account Settings</h1>
            <p className="text-gray-500 text-sm">Manage your account preferences and security</p>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#18191F] mb-6 overflow-hidden">
          <div className="w-full bg-[#56CCA9]" style={{ height: "8px" }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-[#56CCA9]" />
              <h2 className="text-xl font-bold text-[#18191F] dark:text-white">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label>Username</Label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  hint="Email cannot be changed from this page"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Password Update Card */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#FF4B1E] mb-6 overflow-hidden">
          <div className="w-full bg-[#FF4B1E]" style={{ height: "8px" }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-[#FF4B1E]" />
              <h2 className="text-xl font-bold text-[#18191F] dark:text-white">Update Password</h2>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter your current password"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>

        {/* 2FA Card */}
        <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#FFBD12] mb-6 overflow-hidden">
          <div className="w-full bg-[#FFBD12]" style={{ height: "8px" }} />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#FFBD12]" />
                <h2 className="text-xl font-bold text-[#18191F] dark:text-white">Two-Factor Authentication</h2>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-2 border-[#18191F] ${
                  is2FAEnabled
                    ? "bg-[#56CCA9] text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {is2FAEnabled
                ? "Two-factor authentication is currently enabled on your account. This adds an extra layer of security."
                : "Enable two-factor authentication for an extra layer of security. You'll receive a verification code via email when signing in."}
            </p>

            {!codeSent ? (
              <Button
                onClick={handleSend2FACode}
                disabled={is2FALoading}
                variant={is2FAEnabled ? "outline" : "primary"}
                className={is2FAEnabled ? "border-[#F95A2C] text-[#F95A2C] hover:bg-[#F95A2C]/10" : ""}
              >
                {is2FALoading
                  ? "Sending..."
                  : is2FAEnabled
                  ? "Disable 2FA"
                  : "Enable 2FA"}
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[#18191F] dark:text-gray-300 font-medium">
                  A verification code has been sent to your email. Enter it below:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCodeSent(false);
                        setTwoFACode("");
                      }}
                      disabled={is2FALoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerify2FA}
                      disabled={is2FALoading || twoFACode.length < 6}
                    >
                      {is2FALoading ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connected Accounts Card */}
        {/* <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#18191F] overflow-hidden">
          <div className="w-full bg-[#18191F]" style={{ height: "8px" }} />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Link2 className="h-5 w-5 text-[#18191F] dark:text-white" />
              <h2 className="text-xl font-bold text-[#18191F] dark:text-white">Connected Accounts</h2>
            </div>

            <div className="space-y-4">
           
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#18191F] bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#18191F] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#18191F] dark:text-white">Google</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign in with Google</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>

         
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#18191F] bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#18191F] border-2 border-[#18191F] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.8-1.5-3.8-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.6-.7 1.8-1 .1-.7.4-1.1.7-1.3-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.4 1.3 1-.3 2-.4 3-.4s2 .1 3 .4c2.4-1.6 3.4-1.3 3.4-1.3.7 1.7.2 3 .1 3.3.8.9 1.3 2.1 1.3 3.4 0 4.5-2.8 5.5-5.4 5.8.4.3.7.9.7 1.8v2.6c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.65 18.35.5 12 .5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#18191F] dark:text-white">GitHub</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign in with GitHub</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>

         
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#18191F] bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A66C2] border-2 border-[#18191F] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#18191F] dark:text-white">LinkedIn</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sign in with LinkedIn</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
