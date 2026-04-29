"use client";

import React, { useState } from "react";

interface PostcardEditorProps {
  stamp: { img: string; time: string; memo: string } | null;
  onClose: () => void;
  onSend: (data: {
    to: string;
    from: string;
    message: string;
    stamp_url: string;
  }) => void;
  isSending?: boolean;
}

export default function PostcardEditor({
  stamp,
  onClose,
  onSend,
  isSending,
}: PostcardEditorProps) {
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!to || !from || !message || !stamp) {
      alert("엽서의 모든 칸을 채워주세요! ✉️");
      return;
    }
    onSend({
      to,
      from,
      message,
      stamp_url: stamp.img,
    });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* 엽서 본체 */}
      <div className="w-full max-w-[350px] bg-[#fdfcf0] shadow-2xl rounded-sm p-7 flex flex-col gap-6 relative overflow-hidden">
        {/* 빈티지 종이 질감 효과 (선택 사항) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>

        {/* 상단 섹션: SEND TO */}
        <div className="relative border-b border-gray-300 pb-2">
          <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-1">
            SEND TO
          </label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="받는 사람의 이름"
            className="w-full bg-transparent border-none outline-none font-anemone text-xl placeholder:text-gray-200"
          />
        </div>

        {/* 중앙 섹션: 우표 이미지 (디자인의 큰 이미지 박스) */}
        <div className="w-full aspect-[3/4] bg-white shadow-sm overflow-hidden relative group border-[8px] border-white">
          {stamp ? (
            <img
              src={stamp.img}
              alt="selected stamp"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-xs italic font-anemone">
              선택된 우표가 없습니다.
            </div>
          )}
        </div>

        {/* 하단 섹션: Message & From */}
        <div className="flex flex-col gap-4 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="이곳에 따뜻한 마음을 적어주세요..."
            className="w-full h-32 bg-transparent border-none outline-none font-anemone text-base resize-none leading-relaxed placeholder:text-gray-200"
          />

          <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-end">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 font-bold tracking-widest block mb-1">
                From.
              </label>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="보내는 이"
                className="w-full bg-transparent border-none outline-none font-anemone text-lg placeholder:text-gray-200"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={isSending}
              className="px-5 py-2.5 bg-black text-white text-[11px] font-black tracking-tighter rounded-full hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSending ? "배송 중..." : "우체통에 넣기"}
            </button>
          </div>
        </div>

        {/* 상단 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:scale-110 transition-transform"
        >
          ✕
        </button>
      </div>

      {/* 배경 클릭 시 닫기 (오버레이) */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
