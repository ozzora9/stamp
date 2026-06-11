"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function NamePage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("세션 로드 실패:", error);
        return;
      }

      const user = data.session?.user;
      if (!user) return;

      setUserId(user.id);
      const metadata = user.user_metadata as Record<string, any> | undefined;
      const nickname = metadata?.nickname || metadata?.name || "";
      setName(nickname);
    };

    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    if (name.trim().length < 2) {
      setError("닉네임은 2자 이상 입력해 주세요.");
      return;
    }

    if (!userId) {
      setError("사용자 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { nickname: name.trim() },
      });
      if (error) throw error;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([{ user_id: userId, nickname: name.trim() }], {
          onConflict: "user_id",
        });
      if (profileError) throw profileError;

      router.push("/");
    } catch (err: any) {
      setError(err.message || "닉네임 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="w-full max-w-md text-center">
        <div className="mb-10">
          <h1 className="mb-10 text-3xl font-anemone text-[#111111]">
            오늘의 우표를 찾아보세요
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            하루에 하나,
            <br />
            조용히 쌓이는 기록
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="text-left">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="닉네임을 입력해 주세요"
              className="w-full border-0 border-b border-gray-300 bg-transparent py-3 text-lg text-center text-gray-900 outline-none transition focus:border-black"
            />
            {error ? (
              <p className="mt-2 text-xs text-rose-600">{error}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="group relative inline-flex w-full justify-center rounded-full bg-transparent py-3 text-sm font-anemone text-[#111111] transition"
            disabled={loading}
          >
            <span className="relative">
              {loading ? "저장 중..." : "시작하기"}
              <span className="absolute left-1/2 top-full h-[2px] w-0 -translate-x-1/2 bg-[#111111] transition-all duration-300 group-hover:w-full" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
