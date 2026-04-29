"use client";
import React, { useState, useRef } from "react";

/**
 * [cite: 95, 215] 우표 톱니 마스크 스타일 수정
 * SVG 내부의 특수문자를 인코딩하여 브라우저 인식률을 높였습니다.
 * 투명한 배경에 흰색(불투명) 도형이 그려진 이 SVG는
 * 사진에서 해당 흰색 영역만 남기고 나머지를 투명하게 깎아냅니다.
 */
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

export default function StampIt() {
  const [activeTab, setActiveTab] = useState("home"); // [cite: 352]

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#333] font-sans selection:bg-pink-100 flex justify-center overflow-x-hidden">
      {/* [cite: 176, 220, 451, 454] 빈티지 그리드 배경 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="w-[375px] relative pt-12 pb-24 flex flex-col min-h-screen z-10">
        <header className="flex justify-between items-end mb-8">
          <h1 className="text-4xl font-black tracking-tighter">APR</h1>
          <button onClick={() => setActiveTab("inbox")} className="relative">
            <span className="text-2xl">✉️</span>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </button>
        </header>

        <main className="flex-1">
          {activeTab === "home" && <HomeView />}
          {activeTab === "inbox" && <InboxView />}
          {activeTab === "friends" && <FriendsView />}
        </main>

        <nav className="fixed bottom-0 w-[375px] bg-[#fdfcf0]/90 backdrop-blur-sm border-t border-dashed border-gray-300 py-4 px-8 flex justify-between items-center z-20">
          <button
            onClick={() => setActiveTab("home")}
            className={`text-xl ${activeTab === "home" ? "opacity-100" : "opacity-30"}`}
          >
            🏠
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`text-xl ${activeTab === "inbox" ? "opacity-100" : "opacity-30"}`}
          >
            📮
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`text-xl ${activeTab === "friends" ? "opacity-100" : "opacity-30"}`}
          >
            👥
          </button>
          <button className="opacity-30 text-xl grayscale cursor-not-allowed">
            ⚙️
          </button>
        </nav>
      </div>
    </div>
  );
}

function HomeView() {
  const [stamps, setStamps] = useState<
    Record<number, { img: string; memo: string; time: string }>
  >({});
  const [currentDay, setCurrentDay] = useState<number>(29);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDayClick = (day: number) => {
    setCurrentDay(day);
    if (!stamps[day]) fileInputRef.current?.click();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const timeStr = `26.04.${currentDay < 10 ? "0" + currentDay : currentDay}(Wed) 17:29`;
        setStamps((prev) => ({
          ...prev,
          [currentDay]: {
            img: result,
            memo: "우표 내용 우표우표우표",
            time: timeStr,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /** [cite: 260, 267, 300, 389] 마스킹 스타일 공통 함수 */
  const stampMaskStyle = (imgSrc: string) => ({
    backgroundImage: `url(${imgSrc})`,
    /* 아이폰/사파리 호환성을 위해 -webkit- 필수 [cite: 260] */
    WebkitMaskImage: STAMP_MASK,
    WebkitMaskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    /* 표준 속성 [cite: 215] */
    maskImage: STAMP_MASK,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
  });

  return (
    <div className="animate-in fade-in duration-700">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />

      {/* 캘린더 그리드: 좌우 패딩을 제거하여 가로 폭을 꽉 채움  */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-0 mb-12 text-center text-[13px] font-medium text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="pb-2">
            {d}
          </div>
        ))}
        {Array.from({ length: 30 }).map((_, i) => {
          const day = i + 1;
          const stamp = stamps[day];
          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="relative flex flex-col items-center justify-start cursor-pointer h-16"
            >
              {stamp ? (
                <div className="w-full h-full flex justify-center items-center relative group px-0.5">
                  <div
                    className="w-full h-full bg-cover bg-center shadow-sm"
                    style={stampMaskStyle(stamp.img)}
                  ></div>
                  <span className="absolute z-10 text-[10px] bg-black text-white rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold top-[-8px] border border-white">
                    {day}
                  </span>
                </div>
              ) : (
                <span
                  className={`pt-2 text-sm transition-all duration-300 ${currentDay === day ? "font-black text-black underline underline-offset-4" : "opacity-40 hover:opacity-100"}`}
                >
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-dashed border-gray-300 my-8"></div>

      {/* [cite: 231, 248, 442, 446] 상세 정보 섹션 */}
      <div className="space-y-6 px-4">
        <h2 className="text-[17px] font-bold underline underline-offset-[6px] decoration-gray-300 italic">
          오늘의 우표
        </h2>

        <div className="flex gap-6 items-start">
          {/* [cite: 188, 209, 230, 299] 메인 우표 마스킹 적용 */}
          <div
            className="w-[120px] aspect-[3/4] bg-gray-200/50 shadow-sm bg-cover bg-center"
            style={
              stamps[currentDay] ? stampMaskStyle(stamps[currentDay].img) : {}
            }
          >
            {!stamps[currentDay] && (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 italic">
                Select a date
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between min-h-[160px] py-1">
            <div className="space-y-3">
              <p className="text-[13px] font-bold text-gray-500">
                {stamps[currentDay]?.time || "26.04.29(Wed) 17:29"}
              </p>
              <p className="text-[14px] text-gray-700 italic">
                {stamps[currentDay]?.memo || "우표 내용 우표우표우표 (0/30)"}
              </p>
            </div>

            {/* [cite: 234, 447] 액션 링크 */}
            <div className="flex gap-5 mt-auto">
              <button className="text-[13px] font-bold underline underline-offset-4 decoration-gray-300">
                친구에게 보내기
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[13px] font-bold underline underline-offset-4 decoration-gray-300"
              >
                재발행하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InboxView() {
  return (
    <div className="py-20 text-center text-gray-400 italic text-sm">
      우편함 비어있음 📮
    </div>
  );
}
function FriendsView() {
  return (
    <div className="py-20 text-center text-gray-400 italic text-sm">
      친구 목록... 👥
    </div>
  );
}
