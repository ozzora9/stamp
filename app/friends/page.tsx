"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<string[]>([]);
  const [newFriend, setNewFriend] = useState("");
  const [message, setMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const getFriendStorageKey = (id: string | null) =>
    id ? `stampit_friends_${id}` : "";

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      const metadata = user?.user_metadata as Record<string, any> | undefined;
      const id = user?.id ?? null;
      setMyNickname(metadata?.nickname || metadata?.name || null);
      setUserId(id);

      if (!id) {
        setFriends([]);
        return;
      }

      const saved = localStorage.getItem(getFriendStorageKey(id));
      if (saved) {
        try {
          setFriends(JSON.parse(saved));
        } catch {
          setFriends([]);
        }
      }
    };

    loadSession();
  }, []);

  const saveFriends = (nextFriends: string[]) => {
    setFriends(nextFriends);
    if (!userId) return;
    localStorage.setItem(
      getFriendStorageKey(userId),
      JSON.stringify(nextFriends),
    );
  };

  const verifyFriend = async (nickname: string) => {
    const response = await fetch("/api/verify-friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "사용자 확인에 실패했습니다.");
    }
    return data.exists as boolean;
  };

  const addFriend = async () => {
    const trimmed = newFriend.trim();
    if (!trimmed) {
      setMessage("친구 이름을 입력해 주세요.");
      return;
    }
    if (myNickname && trimmed === myNickname) {
      setMessage("자기 자신은 친구로 추가할 수 없어요.");
      return;
    }
    if (friends.includes(trimmed)) {
      setMessage("이미 추가된 친구입니다.");
      return;
    }

    setIsValidating(true);
    setMessage("");
    try {
      const exists = await verifyFriend(trimmed);
      if (!exists) {
        setMessage("등록된 사용자가 아닙니다.");
        return;
      }
      saveFriends([trimmed, ...friends]);
      setNewFriend("");
      setMessage("친구가 추가되었습니다!");
    } catch (error: any) {
      setMessage(error.message || "사용자 확인에 실패했습니다.");
    } finally {
      setIsValidating(false);
    }
  };

  const removeFriend = (name: string) => {
    const nextFriends = friends.filter((friend) => friend !== name);
    saveFriends(nextFriends);
    setMessage("친구가 목록에서 삭제되었습니다.");
  };

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#333] font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative w-full max-w-md mx-auto px-6 pt-10 pb-24">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 mb-4"
        >
          ← home
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">FRIENDS</h1>
            <p className="text-sm text-gray-500 mt-2">
              자주 보내는 친구들을 등록해두면 편하게 선택할 수 있어요.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="친구 닉네임 추가"
                value={newFriend}
                onChange={(e) => setNewFriend(e.target.value)}
                className="flex-1 rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black focus:bg-white"
              />
              <button
                type="button"
                onClick={addFriend}
                disabled={isValidating}
                className="rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-50"
              >
                {isValidating ? "확인 중..." : "추가"}
              </button>
            </div>
            {message ? (
              <div className="text-xs text-gray-500">{message}</div>
            ) : null}
          </div>

          {friends.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              아직 친구가 없어요.
              <div className="mt-3 text-xs text-gray-400">
                친구 닉네임을 추가해보세요.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div
                  key={friend}
                  className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
                >
                  <div>
                    <div className="text-sm font-semibold">{friend}</div>
                    <div className="text-[11px] text-gray-400">
                      우체통 닉네임
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFriend(friend)}
                    className="text-[12px] text-gray-500 hover:text-black"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
