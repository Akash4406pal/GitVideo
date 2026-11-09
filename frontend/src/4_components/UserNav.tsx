"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SignOutConfirmModal } from "./SignOutConfirmModal";

interface UserNavProps {
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
}

export function UserNav({ onOpenAuth, onOpenProfile }: UserNavProps) {
  const { data: session, status } = useSession();
  const [quota, setQuota] = useState<{ remaining: number; total: number } | null>(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/quota")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setQuota({ remaining: data.remaining, total: data.total });
          }
        })
        .catch(() => {});
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="h-9 w-28 bg-[#21262d] animate-pulse rounded-lg border border-[#30363d]" />
    );
  }

  if (!session || !session.user) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-sm transition-all hover:scale-[1.02]"
      >
        <span className="material-symbols-outlined text-sm">login</span>
        <span>Sign In</span>
      </button>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleConfirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Sign out error:", err);
      setIsSigningOut(false);
      setIsSignOutModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Quota Badge (Clickable to open Account & Usage Profile) */}
        <button
          onClick={onOpenProfile}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border cursor-pointer hover:scale-105 transition-all ${
            (quota?.remaining ?? 3) > 0
              ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
          }`}
          title="Click to view daily generation quota and account settings"
        >
          <span className="material-symbols-outlined text-sm">bolt</span>
          <span>
            {quota ? `${quota.remaining}/${quota.total}` : "3/3"} Videos Left
          </span>
        </button>

        {/* User Info & Avatar (Clickable to open Account Profile) */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-90 transition-opacity"
          title="Account Profile & Settings"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User Avatar"}
              className="w-7 h-7 rounded-full border border-purple-500/40 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
              {initials}
            </div>
          )}

          <span className="hidden sm:inline text-xs font-medium text-gray-300 max-w-[120px] truncate">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </button>

        {/* Sign Out Button (Opens Confirmation Modal) */}
        <button
          onClick={() => setIsSignOutModalOpen(true)}
          className="text-gray-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <span className="material-symbols-outlined text-base">logout</span>
        </button>
      </div>

      {/* Confirmation Modal to prevent accidental logouts */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => {
          if (!isSigningOut) setIsSignOutModalOpen(false);
        }}
        onConfirm={handleConfirmSignOut}
        user={user}
        userName={user.name}
        isSigningOut={isSigningOut}
      />
    </>
  );
}

