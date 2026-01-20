"use client";

import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { updateEmail, requestEmailChangeCode, getUserProfile } from "@/services/profile";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertProvider";
import { Mail, User, FileText, Pencil, AtSign, Shield } from "lucide-react";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, refreshSession } = useAuth();
  const { showAlert } = useAlert();

  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Flow state
  const [step, setStep] = useState<"request" | "verify">("request");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Fetch 2FA status
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

  // Reset form when modal closes
  const handleClose = () => {
    setStep("request");
    setNewEmail("");
    setPassword("");
    setTwoFactorCode("");
    closeModal();
  };

  // Step 1: Request verification code
  const handleRequestCode = async () => {
    if (!newEmail || newEmail === user?.email) {
      showAlert("error", "Invalid Email", "Please enter a different email address.");
      return;
    }

    setIsSaving(true);
    try {
      await requestEmailChangeCode();
      showAlert("info", "Code Sent", "A verification code has been sent to your current email.");
      setStep("verify");
    } catch (err: any) {
      showAlert("error", "Request Failed", err.message || "Failed to send verification code.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step 2: Confirm email change with password
  const handleConfirmChange = async () => {
    if (!password) {
      showAlert("error", "Password Required", "Please enter your current password.");
      return;
    }

    if (is2FAEnabled && !twoFactorCode) {
      showAlert("error", "2FA Code Required", "Please enter your two-factor authentication code.");
      return;
    }

    setIsSaving(true);
    try {
      await updateEmail({
        password,
        newEmail,
        ...(is2FAEnabled && twoFactorCode ? { twoFactorCode } : {}),
      });
      await refreshSession();
      showAlert("success", "Email Updated", "Your email has been updated successfully.");
      handleClose();
    } catch (err: any) {
      showAlert("error", "Update Failed", err.message || "Failed to update email.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#FF4B1E] overflow-hidden">
        <div className="w-full bg-[#FF4B1E]" style={{ height: "8px" }} />
        <div className="p-6 flex items-center justify-center">
          <div className="animate-pulse space-y-3 w-full">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const infoItems = [
    {
      icon: <AtSign className="h-4 w-4 text-[#56CCA9]" />,
      label: "Username",
      value: user.username,
    },
    {
      icon: <Mail className="h-4 w-4 text-[#FF4B1E]" />,
      label: "Email Address",
      value: user.email,
    },
    {
      icon: <User className="h-4 w-4 text-[#FFBD12]" />,
      label: "Full Name",
      value: user.name,
    },
    {
      icon: <FileText className="h-4 w-4 text-[#18191F] dark:text-gray-400" />,
      label: "Bio",
      value: user.bio || "No bio added yet",
    },
  ];

  return (
    <>
      <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#FF4B1E] overflow-hidden">
        <div className="w-full bg-[#FF4B1E]" style={{ height: "8px" }} />
        <div className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-[#18191F] dark:text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4B1E]" />
                Account Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border-2 border-[#18191F] bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {item.icon}
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {item.label}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#18191F] dark:text-white truncate">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={openModal}
              variant="outline"
              startIcon={<Pencil className="h-4 w-4" />}
            >
              Edit Email
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Email Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[500px] m-4">
        <div className="w-full max-w-[500px] rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] overflow-hidden">
          <div className="w-full bg-[#FF4B1E]" style={{ height: "8px" }} />
          <div className="p-6 lg:p-8">
            <h4 className="text-2xl font-bold text-[#18191F] dark:text-white mb-2">
              {step === "request" ? "Change Email Address" : "Verify Email Change"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {step === "request"
                ? "Enter your new email address. A verification code will be sent to your current email."
                : "Enter your password to confirm the email change."}
            </p>

            <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
              {step === "request" ? (
                <div className="space-y-4">
                  <div>
                    <Label>Current Email</Label>
                    <Input
                      type="email"
                      value={user.email}
                      disabled
                    />
                  </div>

                  <div>
                    <Label>New Email Address</Label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border-2 border-[#18191F] bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      New Email
                    </p>
                    <p className="text-sm font-semibold text-[#18191F] dark:text-white">
                      {newEmail}
                    </p>
                  </div>

                  <div>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>

                  {is2FAEnabled && (
                    <div>
                      <Label>
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[#FFBD12]" />
                          Two-Factor Code
                        </span>
                      </Label>
                      <Input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        placeholder="Enter 6-digit 2FA code"
                        maxLength={6}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        2FA is enabled on your account. Enter the code from your authenticator.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 mt-6 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700 lg:justify-end">
                {step === "verify" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStep("request")}
                    disabled={isSaving}
                  >
                    Back
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={step === "request" ? handleRequestCode : handleConfirmChange}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Processing..."
                    : step === "request"
                      ? "Send Code"
                      : "Confirm Change"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
