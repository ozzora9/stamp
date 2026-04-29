"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function PostcardWritePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateKey = searchParams.get("date");

  const [stamp, setStamp] = useState<any>(null);
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!dateKey) return;
    const fetchTargetStamp = async () => {
      const { data } = await supabase
        .from("stamps")
        .select("*")
        .eq("date", dateKey)
        .single();
      if (data) setStamp({ img: data.image_url });
    };
    fetchTargetStamp();
  }, [dateKey]);

  const handleSend = async () => {
    if (!to || !from || !message) {
      alert("모든 내용을 적어주세요! ✉️");
      return;
    }
    setIsSending(true);
    try {
      const { error } = await supabase.from("postcards").insert([
        {
          sender_name: from,
          receiver_name: to,
          message: message,
          stamp_url: stamp?.img,
        },
      ]);
      if (!error) {
        alert("엽서가 전송되었습니다! 🚚");
        router.push("/");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf0] flex flex-col items-center pt-10 pb-20 px-6 font-anemone">
      {/* 엽서 본체 - 사진 디자인 그대로 구현 */}
      <div className="w-full max-w-[375px] flex flex-col gap-8">
        {/* 뒤로가기 버튼 (살짝 추가) */}
        <button
          onClick={() => router.back()}
          className="self-start text-gray-400 text-sm mb-4"
        >
          ← 뒤로가기
        </button>

        {/* 1. SEND TO 섹션 */}
        <div className="w-full">
          <label className="text-[11px] text-gray-400 font-bold tracking-[0.2em] block mb-2">
            SEND TO
          </label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="받는 사람"
            className="w-full bg-transparent border-b border-gray-200 py-2 outline-none text-xl placeholder:text-gray-200"
          />
        </div>

        {/* 2. 중앙 이미지 섹션 (디자인의 핵심) */}
        <div className="w-full aspect-[3/4] bg-white shadow-sm overflow-hidden border-[1px] border-gray-100 p-0">
          {stamp ? (
            <img
              src={stamp.img}
              alt="selected"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 animate-pulse" />
          )}
        </div>

        {/* 3. Message 섹션 */}
        <div className="w-full">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="여기에 편지를 써주세요..."
            className="w-full h-40 bg-transparent border-none outline-none text-base resize-none leading-relaxed placeholder:text-gray-200"
          />
        </div>

        {/* 4. From. 및 전송 섹션 */}
        <div className="w-full mt-4 flex flex-col gap-8">
          <div className="w-full">
            <label className="text-[11px] text-gray-400 font-bold tracking-[0.2em] block mb-2">
              From.
            </label>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="보내는 사람"
              className="w-full bg-transparent border-b border-gray-200 py-2 outline-none text-lg placeholder:text-gray-200"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-full py-5 bg-black text-white font-black text-sm tracking-widest rounded-full hover:bg-neutral-800 transition-all disabled:opacity-30"
          >
            {isSending ? "보내는 중..." : "엽서 보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
