"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

// 톱니 마스크 (홈과 동일하게 유지)
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

export default function PostcardWritePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDate = searchParams.get("date");

  const [allStamps, setAllStamps] = useState<any[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<any>(null);
  const [receiverName, setReceiverName] = useState("누구");
  const [message, setMessage] = useState("");

  const todayStr = new Date()
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    fetchAllStamps();
  }, []);

  const fetchAllStamps = async () => {
    const { data } = await supabase
      .from("stamps")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setAllStamps(data);
      const initial = data.find((s: any) => s.date === initialDate);
      setSelectedStamp(initial || data[0]);
    }
  };

  // 드래그 앤 드롭 로직
  const onDragStart = (e: React.DragEvent, stamp: any) => {
    e.dataTransfer.setData("stamp", JSON.stringify(stamp));
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stampData = e.dataTransfer.getData("stamp");
    if (stampData) setSelectedStamp(JSON.parse(stampData));
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#333] font-sans flex justify-center overflow-x-hidden">
      {/* 1. 홈과 동일한 빈티지 그리드 배경 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* 2. 홈과 동일한 너비 제한 (375px) */}
      <div className="w-[375px] relative pt-8 pb-24 flex flex-col min-h-screen z-10 font-anemone">
        {/* 상단 Header: SEND TO. [누구] */}
        <header className="mb-8 px-4 flex items-baseline gap-2">
          <span className="text-gray-400 text-[10px] font-bold tracking-widest">
            SEND TO.
          </span>
          <button
            onClick={() => alert("친구 목록 팝업 예정!")}
            className="text-[16px] border-b-2 border-black hover:opacity-50 transition-opacity"
          >
            {receiverName}
          </button>
        </header>

        {/* 엽서 본체 (이미지 시안 레이아웃) */}
        <div className="mx-2 aspect-[1.4/1] bg-[#fdfcf0] shadow-xl border border-gray-200 relative flex overflow-hidden rounded-sm">
          {/* 종이 질감 오버레이 */}
          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          {/* 왼쪽: 편지 작성 (Textholder) */}
          <div className="flex-[1.1] p-5 flex flex-col border-r border-gray-100 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="여기에 편지 내용 작성됨..."
              className="w-full h-full bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed placeholder:text-gray-300"
            />
          </div>

          {/* 오른쪽: 수정 불가 디자인 영역 */}
          <div className="flex-1 p-4 flex flex-col justify-between items-end relative">
            <div className="w-full flex flex-col items-end gap-4">
              <h1 className="text-[14px] font-black italic tracking-tighter text-gray-300 select-none">
                POST CARD
              </h1>

              {/* 우표 부착 슬롯 (Drop Zone) */}
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="w-16 aspect-[3/4] border border-dashed border-gray-300 flex items-center justify-center bg-white/50 relative"
              >
                {selectedStamp ? (
                  <img
                    src={selectedStamp.image_url}
                    className="w-full h-full object-cover p-[1px]"
                    alt="stamp"
                  />
                ) : (
                  <span className="text-[6px] text-gray-300 font-bold text-center leading-tight uppercase">
                    Place Stamp
                  </span>
                )}
              </div>
            </div>

            {/* 고정 텍스트 */}
            <div className="w-full space-y-2 opacity-30 select-none text-[9px] pr-1">
              <div className="border-b border-gray-300 pb-1 italic leading-none text-right">
                Happiness Network
              </div>
              <div className="text-[8px] text-right font-bold">
                DATE: {todayStr}
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 우표 컬렉션 (카드 리스트) */}
        <div className="mt-12 px-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-[1px] flex-1 bg-gray-200"></div>
            <h3 className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
              Stamp Inventory
            </h3>
            <div className="h-[1px] flex-1 bg-gray-200"></div>
          </div>

          <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
            {allStamps.map((stamp) => (
              <div
                key={stamp.id}
                draggable
                onDragStart={(e) => onDragStart(e, stamp)}
                className="flex-shrink-0 w-16 aspect-[3/4] bg-white p-1 shadow-md cursor-grab active:scale-95 transition-all border border-gray-50"
              >
                {/* 인벤토리 내 우표에도 마스크 적용 (선택 사항) */}
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${stamp.image_url})`,
                    maskImage: STAMP_MASK,
                    WebkitMaskImage: STAMP_MASK,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-center text-gray-300 text-[10px] mt-2 italic">
            원하는 우표를 엽서 오른쪽 상단에 끌어다 놓으세요
          </p>
        </div>

        {/* 전송 버튼 */}
        <div className="mt-10 px-4">
          <button className="w-full py-4 bg-black text-white font-black text-xs tracking-[0.3em] rounded-full shadow-lg active:scale-95 transition-all">
            SEND POSTCARD
          </button>
        </div>

        {/* 홈으로 돌아가기 */}
        <button
          onClick={() => router.push("/")}
          className="mt-6 text-gray-400 text-[11px] underline underline-offset-4 decoration-gray-200"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
