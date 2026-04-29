"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

// 톱니 마스크 스타일 (홈과 동일)
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

export default function PostcardWritePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDate = searchParams.get("date");

  const [allStamps, setAllStamps] = useState<any[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<any>(null);
  const [receiverName, setReceiverName] = useState("누구");
  const [senderName, setSenderName] = useState("송은"); // [사용자이름] 대용
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
      {/* 빈티지 그리드 배경 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="w-[375px] relative pt-8 pb-12 flex flex-col min-h-screen z-10 font-anemone">
        {/* 1. Header: Month 크기의 POST + 아래 send to */}
        <header className="mb-8 px-4 flex flex-col items-start">
          <h1 className="text-4xl font-black tracking-tighter leading-none mb-2">
            POST
          </h1>
        </header>

        <div className="flex items-baseline gap-2 px-4 mb-2">
          <span className="text-gray-400 text-[10px] tracking-widest uppercase">
            send to.
          </span>
          <button
            onClick={() => alert("친구 목록 팝업 예정!")}
            className="text-[14px] border-b-2 border-black hover:opacity-50 transition-opacity"
          >
            {receiverName}
          </button>
        </div>
        {/* 2. 엽서 본체 */}
        <div className="mx-2 aspect-[1.4/1] bg-[#fdfcf0] shadow-xl border border-gray-200 relative flex overflow-hidden rounded-sm">
          {/* 종이 질감 오버레이 */}
          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

          {/* 왼쪽: 편지 작성 (수직 중앙 정렬) */}
          <div className="flex-[1.1] p-5 flex flex-col justify-center border-r border-gray-100 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="여기에 작성하세요..."
              className="w-full bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed placeholder:text-gray-300 text-left"
              rows={5}
            />
          </div>

          {/* 오른쪽: 수정 불가 디자인 영역 */}
          <div className="flex-1 p-4 flex flex-col justify-between items-end relative">
            <div className="w-full flex flex-col items-end gap-4">
              <h2 className="text-[14px] font-black italic tracking-tighter text-gray-300 select-none">
                POST CARD
              </h2>

              {/* 우표 부착 슬롯 (마스킹 적용) */}
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="w-16 aspect-[3/4] border border-dashed border-gray-300 flex items-center justify-center bg-white/50 relative"
              >
                {selectedStamp ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${selectedStamp.image_url})`,
                      maskImage: STAMP_MASK,
                      WebkitMaskImage: STAMP_MASK,
                      maskSize: "100% 100%",
                      WebkitMaskSize: "100% 100%",
                    }}
                  />
                ) : (
                  <span className="text-[6px] text-gray-300 font-bold text-center leading-tight uppercase">
                    Place Stamp
                  </span>
                )}
              </div>
            </div>

            {/* 고정 텍스트 ([사용자이름]이가) */}
            <div className="w-full space-y-2 opacity-30 select-none text-[9px] pr-1">
              <div className="border-b border-gray-300 pb-1 italic leading-none text-right">
                {senderName}이가
              </div>
              <div className="text-[8px] text-right tracking-tighter uppercase">
                지구 어딘가에서...
              </div>
              <div className="text-[8px] text-right ">DATE: {todayStr}</div>
            </div>
          </div>
        </div>

        {/* 3. 구분선 및 우표 고르기 섹션 */}
        <div className="mt-4 px-4">
          <div className="border-t border-dashed border-gray-700 my-8"></div>

          <div className="flex gap-4">
            <h2 className="text-[17px] font-anemone underline underline-offset-[6px] decoration-gray-600">
              우표 고르기
            </h2>
            {/* 발송 버튼 */}
            <button className="text-sm active:scale-95 transition-all">
              전송하기
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
            {allStamps.map((stamp) => (
              <div
                key={stamp.id}
                draggable
                onDragStart={(e) => onDragStart(e, stamp)}
                className="flex-shrink-0 w-16 aspect-[3/4] bg-white p-1 shadow-md cursor-grab active:scale-95 transition-all border border-gray-50"
              >
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
            우표를 엽서 오른쪽 상단에 끌어다 놓으세요
          </p>
        </div>

        {/* 돌아가기 */}
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
