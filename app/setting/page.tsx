"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function SettingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [currentNickname, setCurrentNickname] = useState("");
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    nickname?: string;
    confirmPassword?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("세션 로드 실패:", error);
        setLoading(false);
        return;
      }

      const user = data.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");
      setUserId(user.id);
      const metadata = user.user_metadata as Record<string, any> | undefined;
      const nicknameValue = metadata?.nickname || metadata?.name || "";
      setCurrentNickname(nicknameValue);
      setNickname("");
      setLoading(false);
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  const validateNickname = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      if (!currentNickname) return "닉네임을 입력해 주세요.";
      return "";
    }
    if (trimmed.length < 2) return "닉네임은 2자 이상이어야 합니다.";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!newPassword) return "";
    if (!value) return "비밀번호 확인을 입력해 주세요.";
    if (newPassword !== value) return "비밀번호가 일치하지 않습니다.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nicknameError = validateNickname(nickname);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    setErrors({
      nickname: nicknameError || undefined,
      confirmPassword: confirmPasswordError || undefined,
    });

    if (nicknameError || confirmPasswordError) return;

    setIsSaving(true);

    try {
      const trimmedNickname = nickname.trim() || currentNickname;

      if (!trimmedNickname) {
        setErrors((prev) => ({
          ...prev,
          nickname: "닉네임을 입력해 주세요.",
        }));
        setIsSaving(false);
        return;
      }

      if (trimmedNickname !== currentNickname && userId) {
        const { data: existingProfile, error: existingError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("nickname", trimmedNickname)
          .maybeSingle();

        if (existingError) throw existingError;
        if (existingProfile && existingProfile.user_id !== userId) {
          setErrors((prev) => ({
            ...prev,
            nickname: "이미 사용 중인 닉네임입니다.",
          }));
          setIsSaving(false);
          return;
        }
      }

      const updatePayload: Record<string, any> = {
        data: { nickname: trimmedNickname },
      };

      if (newPassword) {
        updatePayload.password = newPassword;
      }

      const { error } = await supabase.auth.updateUser(updatePayload);
      if (error) throw error;

      if (userId) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert([{ user_id: userId, nickname: trimmedNickname }], {
            onConflict: "user_id",
          });
        if (profileError) throw profileError;
      }

      setCurrentNickname(nickname.trim());
      showToast("내 정보가 정상적으로 저장되었습니다.", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err.message || "저장 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#333] flex justify-center">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="w-full max-w-md p-6">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 mb-4"
        >
          ← back
        </button>

        <h1 className="text-4xl font-black tracking-tighter mb-2">설정</h1>
        <p className="text-sm text-gray-500 mb-8">
          닉네임, 비밀번호를 수정하고 로그아웃할 수 있어요.
        </p>

        {loading ? (
          <div className="rounded-3xl bg-white p-6 shadow-md text-center text-gray-400">
            로딩 중입니다...
          </div>
        ) : !email ? (
          <div className="rounded-3xl bg-white p-6 shadow-md text-center text-gray-700">
            로그인 정보가 없습니다.
            <button
              onClick={() => router.push("/auth")}
              className="mt-4 inline-flex items-center rounded-full border border-black px-4 py-2 text-sm font-semibold"
            >
              로그인 하러가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-3xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600"
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                  현재 닉네임
                </div>
                <div className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {currentNickname || "설정된 닉네임 없음"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                  변경할 닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="새 닉네임을 입력해 주세요"
                  className={`w-full rounded-3xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#171717] ${
                    errors.nickname
                      ? "border-rose-500 bg-rose-50/40"
                      : "border-gray-200 bg-white"
                  }`}
                />
                {errors.nickname && (
                  <p className="mt-2 text-xs text-rose-600">
                    {errors.nickname}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                새 비밀번호
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="변경할 비밀번호를 입력하세요"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#171717]"
              />
              <p className="mt-2 text-xs text-gray-400">
                비밀번호를 변경하지 않으려면 빈칸으로 두세요.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 한 번 더 입력하세요"
                className={`w-full rounded-3xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#171717] ${
                  errors.confirmPassword
                    ? "border-rose-500 bg-rose-50/40"
                    : "border-gray-200 bg-white"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-rose-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-full border border-black bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
            >
              {isSaving ? "저장 중..." : "닉네임과 비밀번호 변경하기"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-full border border-gray-500 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              로그아웃
            </button>
          </form>
        )}

        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-6">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`mb-3 rounded-3xl border px-4 py-3 text-sm shadow-md ${
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : toast.type === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-900"
                    : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
