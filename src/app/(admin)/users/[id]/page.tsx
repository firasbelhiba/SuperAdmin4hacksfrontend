"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Ban, CheckCircle2, Mail, Calendar, User as UserIcon } from "lucide-react";
import useAuthGuard from "@/hooks/useAuthGuard";
import { createDynamicModal } from "@/hooks/useDynamicComponent";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button/Button";
import { User, banUser, unbanUser } from "@/services/users";
import { useSelectedUser } from "@/context/SelectedUserContext";
import { useAlert } from "@/context/AlertProvider";

// Import dynamique du modal pour éviter de charger Portal/animations avant l'interaction
const ConfirmModal = createDynamicModal(() => import("@/components/ui/ConfirmModal"));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { isLoading: authLoading } = useAuthGuard();
  const { selectedUser, setSelectedUser } = useSelectedUser();

  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [unbanReason, setUnbanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Initialisation : récupérer params et charger utilisateur depuis contexte
  useEffect(() => {
    // Récupérer l'ID depuis params
    params.then((p) => {
      setUserId(p.id);
      
      // Si on a l'utilisateur dans le contexte, l'utiliser
      if (selectedUser) {
        setUser(selectedUser);
        setLoading(false);
      } else {
        // Pas de contexte = accès direct à l'URL
        setError("User not found. Please select a user from the list.");
        setLoading(false);
      }
    });

    // Nettoyer le contexte quand on quitte la page
    return () => setSelectedUser(null);
  }, []); // Supprimer 'user' des dépendances

  // Action: Ban user
  const handleBanUser = async () => {
    if (!user || !banReason.trim()) {
      showAlert("error", "Validation Error", "Please provide a reason for banning");
      return;
    }

    try {
      setActionLoading(true);
      await banUser(user.id, banReason);
      
      // Mettre à jour manuellement l'utilisateur (l'API ne retourne pas l'objet complet)
      setUser({
        ...user,
        isBanned: true,
        bannedAt: new Date().toISOString(),
        bannedReason: banReason
      });
      
      setShowBanModal(false);
      setBanReason("");
      showAlert("success", "Success", "User banned successfully");
    } catch (err: any) {
      showAlert("error", "Error", err.response?.data?.message || "Failed to ban user");
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Unban user
  const handleUnbanUser = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await unbanUser(user.id, unbanReason || undefined);
      
      // Mettre à jour manuellement l'utilisateur (l'API ne retourne pas l'objet complet)
      setUser({
        ...user,
        isBanned: false,
        bannedAt: null,
        bannedReason: null
      });
      
      setShowUnbanModal(false);
      setUnbanReason("");
      showAlert("success", "Success", "User unbanned successfully");
    } catch (err: any) {
      showAlert("error", "Error", err.response?.data?.message || "Failed to unban user");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading user details..." />;
  }

  if (error || !user || !user.name) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/users")}
          className="neo-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <div className="rounded-xl border-2 border-[#FF4B1E] dark:border-error-500 bg-[#FFE8E8] dark:bg-error-950 p-12 text-center">
          <p className="text-[#FF4B1E] dark:text-error-400 font-medium text-lg">
            {error || "User not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/users")}
          className="neo-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>

        {/* Actions */}
        <div className="flex gap-3">
          {user.isBanned ? (
            <Button
              variant="success"
              onClick={() => setShowUnbanModal(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Unban User
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowBanModal(true)}
              className="flex items-center gap-2 bg-[#FFE8E8]! border-[#FF4B1E]! text-[#FF4B1E]! hover:bg-[#FF4B1E]! hover:text-white!"
            >
              <Ban className="h-4 w-4" />
              Ban User
            </Button>
          )}
        </div>
      </div>

      {/* User Card */}
      <div className="rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-white dark:bg-gray-900 shadow-[4px_4px_0_0_#18191F] dark:shadow-[4px_4px_0_0_var(--color-brand-700)] p-8">
        {/* Profile Section */}
        <div className="flex items-start gap-6 mb-8">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-24 h-24 rounded-xl border-2 border-[#18191F] object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl border-2 border-[#18191F] dark:border-brand-700 bg-[#FFFBEA] dark:bg-gray-800 flex items-center justify-center">
              <span className="text-4xl font-bold text-[#18191F] dark:text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[#18191F] dark:text-white">{user.name}</h1>
              {user.role === "ADMIN" && (
                <div className="px-3 py-1 rounded-lg border-2 border-[#18191F] bg-[#FFBD12] text-[#18191F] text-sm font-bold flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  ADMIN
                </div>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
              {user.isEmailVerified && (
                <span className="text-[#56CCA9] text-sm font-medium">(Verified)</span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {user.isBanned ? (
            <div className="px-4 py-2 bg-[#FFE8E8] border-2 border-[#FF4B1E] rounded-lg flex items-center gap-2">
              <Ban className="h-5 w-5 text-[#FF4B1E]" />
              <span className="font-bold text-[#FF4B1E]">BANNED</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-[#E8F8F3] border-2 border-[#56CCA9] rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#56CCA9]" />
              <span className="font-bold text-[#56CCA9]">ACTIVE</span>
            </div>
          )}
        </div>

        {/* Ban Information */}
        {user.isBanned && user.bannedReason && (
          <div className="mb-8 p-4 bg-[#FFE8E8] dark:bg-error-950 border-2 border-[#FF4B1E] dark:border-error-500 rounded-xl">
            <h3 className="font-bold text-[#FF4B1E] dark:text-error-400 mb-2">Ban Reason</h3>
            <p className="text-[#18191F] dark:text-white">{user.bannedReason}</p>
            {user.bannedAt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Banned on: {new Date(user.bannedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#18191F] dark:text-white text-lg mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Account Information
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                <p className="font-medium text-[#18191F] dark:text-white font-mono text-sm">{user.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="font-medium text-[#18191F] dark:text-white">{user.role}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Status</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {user.isEmailVerified ? (
                    <span className="text-[#56CCA9]">✓ Verified</span>
                  ) : (
                    <span className="text-[#FF4B1E]">✗ Not Verified</span>
                  )}
                </p>
              </div>

              {user.emailVerifiedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email Verified At</p>
                  <p className="font-medium text-[#18191F] dark:text-white">
                    {new Date(user.emailVerifiedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#18191F] dark:text-white text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="font-medium text-[#18191F] dark:text-white">
                  {new Date(user.updatedAt).toLocaleString()}
                </p>
              </div>

              {user.lastLoginAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="font-medium text-[#18191F] dark:text-white">
                    {new Date(user.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      <ConfirmModal
        open={showBanModal}
        onCancel={() => {
          setShowBanModal(false);
          setBanReason("");
        }}
        onConfirm={handleBanUser}
        title="Ban User"
        message={`Are you sure you want to ban ${user.name}? This will prevent them from accessing the platform.`}
        confirmLabel="Ban User"
        loading={actionLoading}
      >
        <div>
          <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
            Reason <span className="text-[#FF4B1E] dark:text-error-400">*</span>
          </label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Violation of community guidelines, spam, harassment, etc."
            className="w-full px-4 py-3 rounded-lg border-2 border-[#18191F] dark:border-brand-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFBD12] min-h-[120px] resize-none"
            required
            autoFocus
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This reason will be visible to the user and stored in their profile.
          </p>
        </div>
      </ConfirmModal>

      {/* Unban Modal */}
      <ConfirmModal
        open={showUnbanModal}
        onCancel={() => {
          setShowUnbanModal(false);
          setUnbanReason("");
        }}
        onConfirm={handleUnbanUser}
        title="Unban User"
        message={`Are you sure you want to unban ${user.name}? This will restore their access to the platform.`}
        confirmLabel="Unban User"
        loading={actionLoading}
      >
        <div>
          <label className="block text-sm font-bold text-[#18191F] dark:text-white mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={unbanReason}
            onChange={(e) => setUnbanReason(e.target.value)}
            placeholder="Appeal accepted, mistake corrected, etc."
            className="w-full px-4 py-3 rounded-lg border-2 border-[#18191F] dark:border-brand-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#56CCA9] min-h-[100px] resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Optional: Provide a reason for the records.
          </p>
        </div>
      </ConfirmModal>
    </div>
  );
}
