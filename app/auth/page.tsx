"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

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

  // 입력 유효성 오류 상태
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (value: string) => {
    if (mode === "login") return "";
    if (!value) return "이메일을 입력해 주세요.";
    if (!emailRegex.test(value)) return "올바른 이메일 주소가 아닙니다";
    return "";
  };

  const validatePassword = (value: string) => {
    if (mode === "login") return "";
    if (!value) return "비밀번호를 입력해 주세요";
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value) || value.length < 8)
      return "비밀번호는 영문, 숫자 조합 8자 이상 입력해 주세요";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "비밀번호 확인을 입력해 주세요";
    if (password !== value) return "비밀번호가 일치하지 않습니다";
    return "";
  };

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
    setErrors({});
    setTouched({});
  };

  // 4. 폼 제출 핸들러 (Supabase 연동)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = mode === "signup" ? validateEmail(email) : "";
    const passwordError = validatePassword(password);
    const confirmPasswordError =
      mode === "signup" ? validateConfirmPassword(confirmPassword) : "";

    setTouched({
      email: true,
      password: true,
      confirmPassword: mode === "signup",
    });

    if (emailError || passwordError || confirmPasswordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
        confirmPassword: confirmPasswordError || undefined,
      });
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

        showToast("로그인에 성공했습니다! 이름을 정해주세요. 📬", "success");
        setTimeout(() => {
          router.push("/name");
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
          "회원가입이 완료되었습니다! 이름을 정해주세요. 💌",
          "success",
        );
        resetForm();
        router.push("/name");
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
    <div className="min-h-screen flex items-center justify-center selection:bg-pink-100 px-4 font-sans relative overflow-hidden">
      {/* 백그라운드 아날로그 감성 격자 눈금 패턴 (선택 사항) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* 메인 인증 카드 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10 transition-all duration-300">
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
              onChange={(e) => {
                const nextValue = e.target.value;
                setEmail(nextValue);
                if (mode === "signup" && touched.email) {
                  const nextError = validateEmail(nextValue);
                  setErrors((prev) => ({
                    ...prev,
                    email: nextError || undefined,
                  }));
                }
              }}
              onBlur={() => {
                if (mode === "signup") {
                  setTouched((prev) => ({ ...prev, email: true }));
                  const nextError = validateEmail(email);
                  setErrors((prev) => ({
                    ...prev,
                    email: nextError || undefined,
                  }));
                }
              }}
              placeholder="example@stamp.it"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] focus:bg-white transition-all text-sm ${
                errors.email
                  ? "border-rose-500 bg-rose-50/40"
                  : "border-gray-200"
              }`}
              required
            />
            {errors.email ? (
              <p className="mt-2 text-xs text-rose-600">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                const nextValue = e.target.value;
                setPassword(nextValue);
                if (mode === "signup" && touched.password) {
                  const nextError = validatePassword(nextValue);
                  setErrors((prev) => ({
                    ...prev,
                    password: nextError || undefined,
                  }));
                }
                if (mode === "signup" && touched.confirmPassword) {
                  const nextConfirmError =
                    validateConfirmPassword(confirmPassword);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: nextConfirmError || undefined,
                  }));
                }
              }}
              onBlur={() => {
                if (mode === "signup") {
                  setTouched((prev) => ({ ...prev, password: true }));
                  const nextError = validatePassword(password);
                  setErrors((prev) => ({
                    ...prev,
                    password: nextError || undefined,
                  }));
                }
              }}
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] focus:bg-white transition-all text-sm ${
                errors.password
                  ? "border-rose-500 bg-rose-50/40"
                  : "border-gray-200"
              }`}
              required={mode === "signup"}
            />
            {errors.password ? (
              <p className="mt-2 text-xs text-rose-600">{errors.password}</p>
            ) : null}
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
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setConfirmPassword(nextValue);
                  if (touched.confirmPassword) {
                    const nextError = validateConfirmPassword(nextValue);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: nextError || undefined,
                    }));
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  const nextError = validateConfirmPassword(confirmPassword);
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: nextError || undefined,
                  }));
                }}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#171717] focus:bg-white transition-all text-sm ${
                  errors.confirmPassword
                    ? "border-rose-500 bg-rose-50/40"
                    : "border-gray-200"
                }`}
                required={mode === "signup"}
              />
              {errors.confirmPassword ? (
                <p className="mt-2 text-xs text-rose-600">
                  {errors.confirmPassword}
                </p>
              ) : null}
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
              "로그인하기"
            ) : (
              "가입하기"
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
