"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { Pencil, Github, Linkedin, Globe, MapPin } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/context/AuthContext";

import {
  getUserProfile,
  UserProfileResponse,
  updateUsername,
  updateUserProfile,
} from "@/services/profile";
import { useAlert } from "@/context/AlertProvider";
import InitialAvatar from "./InitialAvatar";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(200).optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().optional(), // Username, not URL
  linkedin: z.string().optional(), // Username, not URL
  twitter: z.string().optional(), // Username, not URL
  telegram: z.string().optional(), // Username, not URL
  email: z.string().email().optional(),
  image: z.string().optional(),
});

type ProfileForm = z.infer<typeof ProfileSchema>;

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  const usernameKey = user?.username || "";

  const [userProfile, setProfileUser] = useState<UserProfileResponse | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!usernameKey) return;

    async function loadProfile() {
      try {
        const data = await getUserProfile(usernameKey);
        setProfileUser(data);

        reset({
          name: data.name,
          username: data.username,
          bio: data.bio ?? "",
          profession: data.profession ?? "",
          location: data.location ?? "",
          website: data.website ?? "",
          github: data.github ?? "",
          linkedin: data.linkedin ?? "",
          twitter: data.twitter ?? "",
          telegram: data.telegram ?? "",
          email: data.email,
          image: data.image ?? "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    loadProfile();
  }, [usernameKey, reset]);

  if (!userProfile) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#56CCA9] overflow-hidden">
        <div className="w-full bg-[#56CCA9]" style={{ height: "8px" }} />
        <div className="p-6 flex items-center justify-center">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true);

    try {
      await updateUserProfile({
        ...data,
      }, imageFile);

      if (data.username !== user?.username) {
        await updateUsername({ username: data.username });
      }

      const refreshed = await getUserProfile(data.username);
      setProfileUser(refreshed);
      showAlert("success", "Saved!", "Your profile was updated successfully");
      closeModal();
    } catch (err) {
      console.error("Failed to update profile:", err);
      showAlert("error", "Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const socialLinkClass = "flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#18191F] bg-white text-[#18191F] shadow-[2px_2px_0_0_#18191F] hover:shadow-[1px_1px_0_0_#18191F] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 dark:bg-gray-800 dark:text-white";

  return (
    <>
      {/* Profile Card */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] shadow-[4px_4px_0_0_#56CCA9] overflow-hidden">
        <div className="w-full bg-[#56CCA9]" style={{ height: "8px" }} />
        <div className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Profile Info */}
            <div className="flex flex-col items-center gap-6 lg:flex-row">
              {/* Avatar */}
              <div className="w-24 h-24 overflow-hidden rounded-xl border-2 border-[#18191F] shadow-[3px_3px_0_0_#18191F]">
                {userProfile.image ? (
                  <Image
                    width={96}
                    height={96}
                    src={userProfile.image}
                    alt={userProfile.username}
                    loading="eager"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <InitialAvatar size={96} name={userProfile.name} />
                )}
              </div>

              {/* Name & Details */}
              <div className="text-center lg:text-left">
                <h4 className="text-xl font-bold text-[#18191F] dark:text-white mb-1">
                  {userProfile.name}
                </h4>
                <p className="text-sm font-medium text-[#56CCA9] mb-1">
                  @{userProfile.username}
                </p>
                {userProfile.profession && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {userProfile.profession}
                  </p>
                )}
                {userProfile.location && (
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                {userProfile.bio && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    {userProfile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links & Edit Button */}
            <div className="flex flex-col items-center gap-4 lg:items-end">
              {/* Social Links */}
              <div className="flex items-center gap-2">
                {userProfile.github && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://github.com/${userProfile.github}`}
                    className={socialLinkClass}
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}

                {userProfile.twitter && (
                  <a
                    href={`https://x.com/${userProfile.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className={socialLinkClass}
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                      <path d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z" />
                    </svg>
                  </a>
                )}

                {userProfile.linkedin && (
                  <a
                    href={`https://www.linkedin.com/in/${userProfile.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className={socialLinkClass}
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}

                {userProfile.telegram && (
                  <a
                    href={`https://t.me/${userProfile.telegram}`}
                    target="_blank"
                    rel="noreferrer"
                    className={socialLinkClass}
                  >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9.04 15.03l-.39 5.48c.56 0 .8-.24 1.09-.53l2.62-2.5 5.44 3.98c1 .55 1.71.26 1.97-.92l3.58-16.84.01-.01c.32-1.49-.54-2.07-1.5-1.71L1.64 9.37c-1.46.57-1.44 1.38-.26 1.75l5.55 1.73 12.88-8.14c.61-.36 1.17-.16.71.29" />
                    </svg>
                  </a>
                )}

                {userProfile.website && (
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className={socialLinkClass}
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>

              {/* Edit Button */}
              <Button
                onClick={openModal}
                variant="outline"
                startIcon={<Pencil className="h-4 w-4" />}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="w-full max-w-[700px] rounded-xl bg-white dark:bg-gray-900 border-2 border-[#18191F] overflow-hidden">
          <div className="w-full bg-[#56CCA9]" style={{ height: "8px" }} />
          <div className="p-6 lg:p-8">
            <h4 className="text-2xl font-bold text-[#18191F] dark:text-white mb-2">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your personal information and social links.
            </p>

            <form className="flex flex-col">
              <div className="custom-scrollbar max-h-[450px] overflow-y-auto pr-2 pb-3">
                {/* Profile Image */}
                <div className="mb-6">
                  <Label>Profile Image</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-20 h-20 rounded-xl border-2 border-[#18191F] overflow-hidden">
                      {preview ? (
                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                      ) : userProfile.image ? (
                        <Image
                          width={80}
                          height={80}
                          src={userProfile.image}
                          alt={userProfile.username}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <InitialAvatar size={80} name={userProfile.name} />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file);
                          if (file) setPreview(URL.createObjectURL(file));
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mb-6">
                  <h5 className="text-lg font-bold text-[#18191F] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#56CCA9]" />
                    Personal Information
                  </h5>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <Label>Name</Label>
                      <Input type="text" {...register("name")} />
                      {errors.name && (
                        <p className="text-[#F95A2C] text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Username</Label>
                      <Input type="text" {...register("username")} />
                      {errors.username && (
                        <p className="text-[#F95A2C] text-sm mt-1">{errors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input type="text" disabled {...register("email")} />
                    </div>

                    <div>
                      <Label>Profession</Label>
                      <Input type="text" {...register("profession")} placeholder="e.g. Software Engineer" />
                    </div>

                    <div>
                      <Label>Location</Label>
                      <Input type="text" {...register("location")} placeholder="e.g. San Francisco, CA" />
                    </div>

                    <div>
                      <Label>Bio</Label>
                      <Input type="text" {...register("bio")} placeholder="Tell us about yourself..." />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h5 className="text-lg font-bold text-[#18191F] dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF4B1E]" />
                    Social Links
                  </h5>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                      <Label>Website</Label>
                      <Input type="text" {...register("website")} placeholder="https://yoursite.com" />
                      {errors.website && (
                        <p className="text-[#F95A2C] text-sm mt-1">{errors.website.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>GitHub Username</Label>
                      <Input type="text" {...register("github")} placeholder="username" />
                    </div>

                    <div>
                      <Label>LinkedIn Username</Label>
                      <Input type="text" {...register("linkedin")} placeholder="username" />
                    </div>

                    <div>
                      <Label>Twitter/X Username</Label>
                      <Input type="text" {...register("twitter")} placeholder="username" />
                    </div>

                    <div>
                      <Label>Telegram Username</Label>
                      <Input type="text" {...register("telegram")} placeholder="username" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700 lg:justify-end">
                <Button size="sm" variant="outline" disabled={isSaving} onClick={closeModal}>
                  Cancel
                </Button>
                <Button disabled={isSaving} size="sm" onClick={handleSubmit(onSubmit)}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
