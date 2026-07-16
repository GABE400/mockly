"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProfileSettingsModal } from "./profile-settings-modal";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  image?: string | null;
  figmaToken?: string | null;
}

interface UserProfileBadgeProps {
  user: UserProfile;
}

export function UserProfileBadge({ user }: UserProfileBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const avatarSrc = user.avatarUrl || user.image || null;
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      {/* Clickable Profile Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none active:scale-[0.97] transition-all"
        title="Account Settings"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden relative bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-border-medium select-none group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10 transition-all">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={user.name || "Profile"}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name + Email (hidden on small screens) */}
        <div className="hidden md:flex flex-col min-w-0">
          <span className="text-xs font-bold text-foreground-pure leading-none truncate group-hover:text-indigo-400 transition-colors">
            {user.name}
          </span>
          <span className="text-[11px] text-text-muted leading-none mt-1 truncate">
            {user.email}
          </span>
        </div>
      </button>

      {/* Settings Modal */}
      <ProfileSettingsModal
        user={user}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
