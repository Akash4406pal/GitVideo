"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SignOutConfirmModal } from "./SignOutConfirmModal";

interface UserNavProps {
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
}

interface QuotaState {
  freshRemaining: number;
  freshTotal: number;
  cachedRemaining: number;
  cachedTotal: number;
  remaining?: number;
  total?: number;
}

export function UserNav({ onOpenAuth, onOpenProfile }: UserNavProps) {
  const { data: session, status } = useSession();
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as { id?: string }).id || session.user.email || "dev_user";
      fetch("/api/user/quota", {
        headers: {
          "x-user-id": userId,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setQuota({
              freshRemaining: data.freshRemaining ?? data.remaining ?? 3,
              freshTotal: data.freshTotal ?? data.total ?? 3,
              cachedRemaining: data.cachedRemaining ?? 10,
              cachedTotal: data.cachedTotal ?? 10,
            });
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
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Instant Views Badge */}
        <button
          onClick={onOpenProfile}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border cursor-pointer hover:scale-105 transition-all ${
            (quota?.cachedRemaining ?? 10) > 0
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-gray-500/10 text-gray-400 border-gray-500/30"
          }`}
          title="Instant Verified Walkthroughs (Zero wait time)"
        >
          <span className="material-symbols-outlined text-sm text-emerald-400">bolt</span>
          <span>{quota ? `${quota.cachedRemaining}/${quota.cachedTotal}` : "10/10"} Instant</span>
        </button>

        {/* Fresh Studio Credits Badge */}
        <button
          onClick={onOpenProfile}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border cursor-pointer hover:scale-105 transition-all ${
            (quota?.freshRemaining ?? 3) > 0
              ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
          }`}
          title="Fresh Studio Generations (Full AI pipeline render)"
        >
          <span className="material-symbols-outlined text-sm text-purple-400">rocket_launch</span>
          <span>{quota ? `${quota.freshRemaining}/${quota.freshTotal}` : "3/3"} Fresh</span>
        </button>

        {/* User Info & Avatar */}
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

          <span className="hidden md:inline text-xs font-medium text-gray-300 max-w-[120px] truncate">
            {user.name?.split(" ")[0] || "User"}
          </span>
        </button>

        {/* Sign Out Trigger Button */}
        <button
          onClick={() => setIsSignOutModalOpen(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Sign out of account"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-base">logout</span>
        </button>
      </div>

      {/* Confirmation Sign Out Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
        isSigningOut={isSigningOut}
        user={user}
      />
    </>
  );
}
