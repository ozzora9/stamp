"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area, Point } from "react-easy-crop";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/**
 * [cite: 95, 215] 우표 톱니 마스크 스타일 수정
 * SVG 내부의 특수문자를 인코딩하여 브라우저 인식률을 높였습니다.
 * 투명한 배경에 흰색(불투명) 도형이 그려진 이 SVG는
 * 사진에서 해당 흰색 영역만 남기고 나머지를 투명하게 깎아냅니다.
 */
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

export default function StampIt() {
  const [activeTab, setActiveTab] = useState("home");
  const [today, setToday] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [showDial, setShowDial] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // Initialize today on client side
  useEffect(() => {
    const now = new Date();
    setToday(now);
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  }, []);

  const isToday =
    today &&
    selectedYear === today.getFullYear() &&
    selectedMonth === today.getMonth();

  // Dial outside click close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialRef.current && !dialRef.current.contains(e.target as Node)) {
        setShowDial(false);
      }
    };
    if (showDial) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDial]);

  const handleYearChange = (delta: number) => {
    setSelectedYear((prev) => Math.max(2020, Math.min(2030, prev + delta)));
  };

  const handleMonthChange = (delta: number) => {
    setSelectedMonth((prev) => {
      const newMonth = (prev + delta + 12) % 12;
      return newMonth;
    });
  };

  const goToToday = () => {
    if (today) {
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth());
    }
  };

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

      <div className="w-[375px] relative pt-8 pb-24 flex flex-col min-h-screen z-10">
        <header className="flex justify-between items-end mb-8">
          <div className="relative">
            {/* APR + Year selector */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowDial(!showDial)}
                className="text-4xl font-black tracking-tighter hover:opacity-70 transition-opacity"
              >
                {MONTHS[selectedMonth]}
              </button>
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-400 font-medium mb-1">
                  {selectedYear}
                </span>
                {!isToday && (
                  <button
                    onClick={goToToday}
                    className="text-[10px] text-gray-400 hover:text-black underline"
                  >
                    today
                  </button>
                )}
              </div>
            </div>

            {/* Dial Picker */}
            {showDial && (
              <div
                ref={dialRef}
                className="absolute top-full left-0 mt-2 bg-white border-2 border-black shadow-xl z-50 p-4 rounded-lg"
              >
                {/* Year Dial */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => handleYearChange(-1)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-lg"
                  >
                    ‹
                  </button>
                  <div className="w-16 text-center font-bold text-lg">
                    {selectedYear}
                  </div>
                  <button
                    onClick={() => handleYearChange(1)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-lg"
                  >
                    ›
                  </button>
                </div>

                {/* Month Dial */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMonthChange(-1)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full font-bold"
                  >
                    ‹
                  </button>
                  <div className="w-20 text-center font-black text-xl">
                    {MONTHS[selectedMonth]}
                  </div>
                  <button
                    onClick={() => handleMonthChange(1)}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full font-bold"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setActiveTab("inbox")} className="relative">
            <span className="text-2xl">✉️</span>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </button>
        </header>

        <main className="flex-1">
          {activeTab === "home" && (
            <HomeView
              year={selectedYear}
              month={selectedMonth}
              today={today || new Date()}
            />
          )}
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

function HomeView({
  year,
  month,
  today,
}: {
  year: number;
  month: number;
  today: Date;
}) {
  const [stamps, setStamps] = useState<
    Record<number, { img: string; memo: string; time: string }>
  >({});
  const [currentDay, setCurrentDay] = useState<number>(today.getDate());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropAnimation, setCropAnimation] = useState(false);

  // Check if a day is today
  const isToday = (day: number) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  // Get days in month
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // Get day name from date
  const getDayName = (y: number, m: number, d: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(y, m, d).getDay()];
  };

  const daysInMonth = getDaysInMonth(year, month);

  // Get first day of month (0 = Sunday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    setCurrentDay(day);
    if (!stamps[day]) fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageToCrop(result);
        setCropModalOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createCroppedImage = useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    const image = new Image();
    image.src = imageToCrop;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 120;
    canvas.height = 160;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      120,
      160,
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  }, [imageToCrop, croppedAreaPixels]);

  const handleCrop = async () => {
    setCropAnimation(true);

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 500));

    const croppedImage = await createCroppedImage();
    if (croppedImage) {
      const monthStr = (month + 1).toString().padStart(2, "0");
      const dayName = getDayName(year, month, currentDay);
      const timeStr = `${year.toString().slice(2)}.${monthStr}.${currentDay < 10 ? "0" + currentDay : currentDay}(${dayName}) 17:29`;

      setStamps((prev) => ({
        ...prev,
        [currentDay]: {
          img: croppedImage,
          memo: "우표 내용 우표우표우표",
          time: timeStr,
        },
      }));
    }

    setCropAnimation(false);
    setCropModalOpen(false);
    setImageToCrop(null);
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
        onChange={handleFileSelect}
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
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
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
                  <span
                    className={`absolute z-10 text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold top-[-8px] border border-white ${isToday(day) ? "bg-black text-white" : "bg-black text-white"}`}
                  >
                    {day}
                  </span>
                </div>
              ) : isToday(day) ? (
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{day}</span>
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

      <div className="border-t border-dashed border-gray-700 my-8"></div>

      {/* [cite: 231, 248, 442, 446] 상세 정보 섹션 */}
      <div className="space-y-6 px-4">
        <h2 className="text-[17px] font-anemone underline underline-offset-[6px] decoration-gray-600">
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
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-anemone text-center px-2">
                아직 발행된
                <br />
                우표가 없어요
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between min-h-[160px] py-1">
            <div className="space-y-3">
              <p className="text-[13px] font-anemone text-gray-700">
                {stamps[currentDay]?.time ||
                  `${year.toString().slice(2)}.${(month + 1).toString().padStart(2, "0")}.${currentDay.toString().padStart(2, "0")}(${getDayName(year, month, currentDay)}) 17:29`}
              </p>
              <p className="text-[14px] text-gray-700 font-anemone">
                {stamps[currentDay]?.memo || "우표 내용 우표우표우표"}
              </p>
            </div>

            {/* [cite: 234, 447] 액션 링크 */}
            <div className="flex gap-5 mt-auto">
              <button className="text-[13px] font-anemone underline underline-offset-4 decoration-gray-600">
                친구에게 보내기
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[13px] font-anemone underline underline-offset-4 decoration-gray-600"
              >
                재발행하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && imageToCrop && (
        <CropModal
          image={imageToCrop}
          onClose={() => {
            setCropModalOpen(false);
            setImageToCrop(null);
          }}
          onCrop={() => {
            // Get cropped image from sessionStorage
            const croppedImage = sessionStorage.getItem("pendingCroppedImage");
            if (croppedImage) {
              const monthStr = (month + 1).toString().padStart(2, "0");
              const dayName = getDayName(year, month, currentDay);
              const timeStr = `${year.toString().slice(2)}.${monthStr}.${currentDay < 10 ? "0" + currentDay : currentDay}(${dayName}) 17:29`;
              setStamps((prev) => ({
                ...prev,
                [currentDay]: {
                  img: croppedImage,
                  memo: "우표 내용 우표우표우표",
                  time: timeStr,
                },
              }));
              sessionStorage.removeItem("pendingCroppedImage");
            }
            setCropModalOpen(false);
            setImageToCrop(null);
          }}
        />
      )}
    </div>
  );
}

function InboxView() {
  return (
    <div className="py-20 text-center text-gray-400 italic text-sm">
      우편함 비어있음
    </div>
  );
}
function FriendsView() {
  return (
    <div className="py-20 text-center text-gray-400 italic text-sm">
      친구 목록...
    </div>
  );
}

// Crop Modal Component
function CropModal({
  image,
  onClose,
  onCrop,
}: {
  image: string;
  onClose: () => void;
  onCrop: () => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsAnimating(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // 감성 플래시 효과 [cite: 631]

    const imageEl = new Image();
    imageEl.src = image;
    await new Promise((r) => {
      imageEl.onload = r;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 우표 규격 3:4 비율 (120x160) [cite: 209, 586]
    canvas.width = 1200;
    canvas.height = 1600;

    ctx.drawImage(
      imageEl,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      1200,
      1600,
    );

    sessionStorage.setItem(
      "pendingCroppedImage",
      canvas.toDataURL("image/jpeg", 0.9),
    );
    setIsAnimating(false);
    onCrop();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
      {isAnimating && (
        <div className="absolute inset-0 bg-white z-[110] animate-flash" />
      )}
      {/* 상단 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-2xl opacity-50 hover:opacity-100"
      >
        ✕
      </button>
      <div className="w-full max-w-[340px] px-4 space-y-8">
        {/* 우표 가이드라인이 포함된 크롭 영역 */}
        <div className="relative aspect-[3/4] w-full bg-neutral-900 shadow-2xl overflow-hidden rounded-sm">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
            classes={{
              cropAreaClassName: "stamp-crop-area",
            }}
          />
          {/* 실제 우표 모양 미리보기 가이드 [cite: 188] */}
          <div
            className="absolute inset-0 pointer-events-none border-[12px] border-black/40"
            style={{
              maskImage: STAMP_MASK,
              WebkitMaskImage: STAMP_MASK,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
          ></div>
        </div>

        {/* 조작 UI - 빈티지한 느낌으로 강조 */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs font-bold italic">ZOOM</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-white cursor-pointer"
            />
          </div>

          <button
            onClick={handleCrop}
            disabled={isAnimating}
            className="w-full py-4 bg-white text-black font-black text-sm tracking-widest rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isAnimating ? "STAMPING..." : "우표 발행하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
