"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/");
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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해 주세요"
              className="w-full border-0 border-b border-gray-300 bg-transparent py-3 text-lg text-center text-gray-900 outline-none transition focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="group relative inline-flex w-full justify-center rounded-full bg-transparent py-3 text-sm font-anemone text-[#111111] transition"
          >
            <span className="relative">
              시작하기
              <span className="absolute left-1/2 top-full h-[2px] w-0 -translate-x-1/2 bg-[#111111] transition-all duration-300 group-hover:w-full" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
