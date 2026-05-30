"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

// 1. 토스트 메시지 타입 정의
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function AuthPage() {
  const router = useRouter();

  // 모드 상태: 'login' 또는 'signup'
  const [mode, setMode] = useState<"login" | "signup">("login");

  // 폼 입력 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 토스트 리스트 상태
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 2. 토스트 추가 함수
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // 3. 토스트 자동 삭제 효과
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3000); // 3초 뒤 순차적 삭제
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // 입력 폼 초기화
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // 4. 폼 제출 핸들러 (Supabase 연동)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("이메일과 비밀번호를 모두 입력해주세요.", "error");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        // --- 로그인 로직 ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showToast(
          "로그인에 성공했습니다! 우표첩으로 이동합니다. 📬",
          "success",
        );
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        // --- 회원가입 로직 ---
        if (password !== confirmPassword) {
          showToast("비밀번호가 서로 일치하지 않습니다.", "error");
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        showToast(
          "회원가입이 완료되었습니다! 인증 메일을 확인해주세요. 💌",
          "success",
        );
        setMode("login");
        resetForm();
      }
    } catch (err: any) {
      // Supabase 에러 메시지 한국어 친화적 가공
      let errorMsg = err.message;
      if (errorMsg === "Invalid login credentials") {
        errorMsg = "이메일 또는 비밀번호가 잘못되었습니다.";
      } else if (errorMsg === "User already registered") {
        errorMsg = "이미 가입된 이메일 주소입니다.";
      }
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea] px-4 font-sans relative overflow-hidden">
      {/* 백그라운드 아날로그 감성 격자 눈금 패턴 (선택 사항) */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#171717 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* 메인 인증 카드 */}
      <div className="w-full max-w-md bg-white border border-[#d1cbd1] rounded-2xl shadow-xl p-8 relative z-10 transition-all duration-300">
        {/* 상단 타이틀 부 (Stamp-it 아이덴티티 계승) */}
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 mb-2"
        >
          ← back
        </button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#171717]">
            {mode === "login" ? "로그인" : "회원가입"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "login"
              ? "나만의 우꾸하러 가기"
              : "나만의 우표 수집 시작하기"}
          </p>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@stamp.it"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] focus:bg-white transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] focus:bg-white transition-all text-sm"
              required
            />
          </div>

          {/* 회원가입 모드일 때만 비밀번호 확인 칸 렌더링 */}
          {mode === "signup" && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] focus:bg-white transition-all text-sm"
                required={mode === "signup"}
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#171717] text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.99] transition-all flex items-center justify-center shadow-lg disabled:bg-gray-400"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : mode === "login" ? (
              "로그인"
            ) : (
              "회원가입 완료"
            )}
          </button>
        </form>

        {/* 하단 모드 전환 영역 */}
        <div className="mt-6 pt-5 border-t border-dashed border-gray-200 text-center text-sm">
          {mode === "login" ? (
            <p className="text-gray-600">
              아직 우표첩이 없으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  resetForm();
                }}
                className="text-[#171717] font-bold underline underline-offset-4 hover:text-gray-600 transition-colors ml-1"
              >
                회원가입하기
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className="text-[#171717] font-semibold underline underline-offset-4 hover:text-gray-600 transition-colors ml-1"
              >
                로그인하기
              </button>
            </p>
          )}
        </div>
      </div>

      {/* 5. 토스 스타일 토스트 알림 컨테이너 (우측 상단 혹은 중앙 상단 배치 가능, 여기선 중앙 하단 배치로 가독성 확보) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-bounceShort pointer-events-auto flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                : toast.type === "error"
                  ? "bg-rose-50/90 border-rose-200 text-rose-900"
                  : "bg-white/90 border-gray-200 text-gray-900"
            }`}
          >
            {/* 아이콘 간이 구현 */}
            <span className="text-lg">
              {toast.type === "success"
                ? "✅"
                : toast.type === "error"
                  ? "🚨"
                  : "ℹ️"}
            </span>
            <p className="text-xs font-semibold leading-relaxed break-keep">
              {toast.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
