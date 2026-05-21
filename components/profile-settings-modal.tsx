"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
}

interface ProfileSettingsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ user: initialUser, isOpen, onClose }: ProfileSettingsModalProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [name, setName] = useState(initialUser.name);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.avatarUrl || initialUser.image || null);
  const [uploading, setUploading] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [closing, setClosing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync state if initialUser prop changes
  useEffect(() => {
    setUser(initialUser);
    setName(initialUser.name);
    setAvatarPreview(initialUser.avatarUrl || initialUser.image || null);
  }, [initialUser]);

  // Handle toast timers
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Animated close handler
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setDeleteConfirmation("");
      onClose();
    }, 200);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // 1. Handle Avatar File Selection and Conversion to Base64
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setToast({ type: "error", message: "Image must be under 3MB." });
      return;
    }

    setUploading(true);
    setToast(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await uploadAvatar(base64String, file.name);
    };
    reader.onerror = () => {
      setToast({ type: "error", message: "Failed to read file." });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // 2. Upload Avatar to ImageKit and Update DB Profile
  const uploadAvatar = async (base64File: string, fileName: string) => {
    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64File, fileName }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload avatar");

      const imageUrl = uploadData.url;

      const updateRes = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: imageUrl }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || "Failed to update profile");

      setAvatarPreview(imageUrl);
      setUser((prev) => ({ ...prev, avatarUrl: imageUrl, image: imageUrl }));
      setToast({ type: "success", message: "Profile photo updated!" });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Updating Profile Details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ type: "error", message: "Name cannot be empty." });
      return;
    }

    setUpdatingProfile(true);
    setToast(null);

    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update name");

      setUser((prev) => ({ ...prev, name: name.trim() }));
      setToast({ type: "success", message: "Name updated!" });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 4. Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setToast({ type: "error", message: "Type DELETE to confirm." });
      return;
    }

    setDeletingAccount(true);
    setToast(null);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account.");

      setToast({ type: "success", message: "Account deleted. Redirecting..." });

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err.message || "Deletion failed." });
      setDeletingAccount(false);
    }
  };

  // 5. Trigger checkout
  const handleUpgradeCheckout = async () => {
    try {
      setToast(null);
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Checkout failed." });
    }
  };

  const isPro = user.plan === "pro";
  const avatarSrc = avatarPreview || null;
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4 sm:p-6 transition-all duration-200 ${closing ? "opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(12px)" }}
      onClick={handleClose}
    >
      {/* Modal Panel */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-background border border-border-medium rounded-2xl shadow-2xl relative flex flex-col max-h-[88vh] my-auto transition-all duration-200 ${closing ? "scale-95 opacity-0 translate-y-4" : "scale-100 opacity-100 translate-y-0"}`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground-pure">Settings</h2>
            <p className="text-xs text-text-muted mt-0.5">Manage your account and subscription.</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg border border-border-medium flex items-center justify-center text-text-muted hover:text-foreground-pure hover:bg-bg-card-hover transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Toast */}
          {toast && (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              toast.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              {toast.type === "success" ? (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              <span className="text-xs">{toast.message}</span>
            </div>
          )}

          {/* Section: Profile */}
          <div className="rounded-xl border border-border-subtle p-5">
            <div className="flex items-center gap-4 mb-5">
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full group overflow-hidden border-2 border-border-medium bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white select-none shrink-0">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt="Profile"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg"
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground-pure truncate">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isPro
                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                      : "bg-bg-card-active text-text-muted border border-border-medium"
                  }`}>
                    {isPro ? "Pro" : "Free"}
                  </span>
                  {user.role === "admin" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Name Edit */}
            <form onSubmit={handleUpdateProfile}>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                Display Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-border-medium bg-bg-input text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  placeholder="Your name"
                />
                <button
                  type="submit"
                  disabled={updatingProfile || name === user.name}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-foreground text-background hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] transition-all cursor-pointer select-none"
                >
                  {updatingProfile ? "Saving…" : "Save"}
                </button>
              </div>
            </form>

            {/* Email (read-only) */}
            <div className="mt-3.5">
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2 rounded-lg border border-border-subtle bg-bg-card text-sm text-text-dim cursor-not-allowed"
              />
            </div>
          </div>

          {/* Section: Subscription */}
          <div className="rounded-xl border border-border-subtle p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground-pure">Subscription</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                isPro
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-bg-card-active text-text-muted"
              }`}>
                {isPro ? "$9/mo" : "Free"}
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed mb-4">
              {isPro
                ? "You're on the Pro plan with unlimited exports. Manage your payment method or cancel anytime."
                : "You're on the Free plan with 5 exports per month. Upgrade to Pro for unlimited exports."}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              {!isPro ? (
                <button
                  type="button"
                  onClick={handleUpgradeCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg px-4 py-2.5 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-[0.97] transition-all select-none hover:shadow-indigo-500/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Pro
                </button>
              ) : (
                <>
                  <a
                    href="https://customer.dodopayments.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-foreground text-background rounded-lg px-4 py-2.5 hover:opacity-90 cursor-pointer active:scale-[0.97] transition-all select-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                    Manage Card
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      router.push("/settings/billing");
                    }}
                    className="flex-1 inline-flex items-center justify-center text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2.5 hover:bg-rose-500/15 cursor-pointer active:scale-[0.97] transition-all select-none"
                  >
                    Cancel Plan
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] text-text-dim mt-3 flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Payments processed securely by Dodo Payments.
            </p>
          </div>

          {/* Section: Danger Zone */}
          <div className="rounded-xl border border-rose-500/15 p-5">
            <h3 className="text-sm font-bold text-rose-400 mb-1">Delete Account</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Permanently delete your profile, subscription, and all mockups. This cannot be undone.
            </p>

            <label className="text-[11px] font-semibold text-text-muted mb-1.5 block">
              Type <span className="text-rose-400 font-mono font-bold">DELETE</span> to confirm
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="flex-1 px-3.5 py-2 rounded-lg border border-rose-500/20 bg-bg-input text-sm text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition-all placeholder:text-text-dim"
              />
              <button
                type="button"
                disabled={deleteConfirmation !== "DELETE" || deletingAccount}
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-25 disabled:cursor-not-allowed active:scale-[0.97] transition-all cursor-pointer select-none"
              >
                {deletingAccount ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border-subtle text-center">
          <p className="text-[11px] text-text-dim flex items-center gap-1.5 justify-center flex-wrap">
            <span>Muckly &copy; {new Date().getFullYear()}</span>
            <span className="opacity-40">&middot;</span>
            <span>All connections are encrypted.</span>
            <span className="opacity-40">&middot;</span>
            <span>Powered by</span>
            <a 
              href="https://www.techadotech.com/" 
              className="text-text-muted hover:text-indigo-400 font-medium hover:underline transition-colors duration-150"
              target="_blank"
              rel="noopener noreferrer"
            >
              Techado Tech
            </a>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
