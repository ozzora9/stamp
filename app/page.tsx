"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area, Point } from "react-easy-crop";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";

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

const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

export default function StampIt() {
  const [activeTab, setActiveTab] = useState("home");
  const [today, setToday] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [showDial, setShowDial] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  // 데이터 상태 관리 (부모에서 통합 관리)
  const [stamps, setStamps] = useState<
    Record<string, { img: string; memo: string; time: string }>
  >({});
  const [isPunching, setIsPunching] = useState(false);
  const [targetDay, setTargetDay] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  }, []);

  // Supabase 데이터 로드 (연/월 변경 시 재실행)
  useEffect(() => {
    const fetchStamps = async () => {
      const { data, error } = await supabase.from("stamps").select("*");
      if (error) {
        console.error("데이터 로드 실패:", error);
        return;
      }
      if (data) {
        const stampMap: any = {};
        data.forEach((s: any) => {
          stampMap[s.date] = {
            img: s.image_url,
            memo: s.memo,
            time: new Date(s.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });
        setStamps(stampMap);
      }
    };
    fetchStamps();
  }, [selectedYear, selectedMonth]);

  const isToday =
    today &&
    selectedYear === today.getFullYear() &&
    selectedMonth === today.getMonth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialRef.current && !dialRef.current.contains(e.target as Node))
        setShowDial(false);
    };
    if (showDial) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDial]);

  const handleYearChange = (delta: number) =>
    setSelectedYear((prev) => Math.max(2020, Math.min(2030, prev + delta)));
  const handleMonthChange = (delta: number) =>
    setSelectedMonth((prev) => (prev + delta + 12) % 12);
  const goToToday = () => {
    if (today) {
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth());
    }
  };

  // 업로드 및 저장 로직
  const handlePunchComplete = async (croppedImg: string) => {
    if (targetDay === null) return;
    setIsPunching(true);
    try {
      const res = await fetch(croppedImg);
      const blob = await res.blob();
      const fileName = `${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("stamps")
        .upload(fileName, blob);
      if (storageError) throw storageError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("stamps").getPublicUrl(fileName);

      const dateKey = `${selectedYear}-${selectedMonth}-${targetDay}`;
      const { error: dbError } = await supabase.from("stamps").insert([
        {
          date: dateKey,
          image_url: publicUrl,
          memo: "오늘의 소중한 한 조각",
        },
      ]);
      if (dbError) throw dbError;

      setStamps((prev) => ({
        ...prev,
        [dateKey]: {
          img: publicUrl,
          memo: "오늘의 소중한 한 조각",
          time: "방금 전",
        },
      }));
    } catch (e) {
      console.error("저장 실패:", e);
      alert("우표 저장에 실패했습니다.");
    } finally {
      setIsPunching(false);
      setTargetDay(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#333] font-sans selection:bg-pink-100 flex justify-center overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="w-[375px] relative pt-8 pb-24 flex flex-col min-h-screen z-10">
        <header className="flex justify-between items-end mb-8 px-4">
          <div className="relative">
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
            {showDial && (
              <div
                ref={dialRef}
                className="absolute top-full left-0 mt-2 bg-white border-2 border-black shadow-xl z-50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => handleYearChange(-1)}
                    className="w-8 h-8 bg-gray-100 rounded-full font-bold"
                  >
                    ‹
                  </button>
                  <div className="w-16 text-center font-bold text-lg">
                    {selectedYear}
                  </div>
                  <button
                    onClick={() => handleYearChange(1)}
                    className="w-8 h-8 bg-gray-100 rounded-full font-bold"
                  >
                    ›
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMonthChange(-1)}
                    className="w-8 h-8 bg-gray-100 rounded-full font-bold"
                  >
                    ‹
                  </button>
                  <div className="w-20 text-center font-black text-xl">
                    {MONTHS[selectedMonth]}
                  </div>
                  <button
                    onClick={() => handleMonthChange(1)}
                    className="w-8 h-8 bg-gray-100 rounded-full font-bold"
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
              stamps={stamps}
              onPunchComplete={handlePunchComplete}
              isPunching={isPunching}
              setTargetDay={setTargetDay}
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
  stamps,
  onPunchComplete,
  isPunching,
  setTargetDay,
}: any) {
  const router = useRouter();

  const [currentDay, setCurrentDay] = useState<number>(today.getDate());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const isToday = (day: number) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const handleDayClick = (day: number) => {
    setCurrentDay(day);
    if (!stamps[`${year}-${month}-${day}`]) {
      setTargetDay(day);
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToCrop(event.target?.result as string);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const handleGoToEditor = () => {
    const dateKey = `${year}-${month}-${currentDay}`;
    // 예: /postcard/write?date=2026-3-29 형태로 이동
    router.push(`/postcard/write?date=${dateKey}`);
  };

  const stampMaskStyle = (imgSrc: string) => ({
    backgroundImage: `url(${imgSrc})`,
    WebkitMaskImage: STAMP_MASK,
    WebkitMaskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskImage: STAMP_MASK,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
  });

  const getDayName = (y: number, m: number, d: number) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(y, m, d).getDay()];
  };

  return (
    <div className="animate-in fade-in duration-700">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
      />

      {/* 캘린더 그리드 (디자인 유지) */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-0 mb-12 text-center text-[13px] font-medium text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="pb-2">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-16"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const stamp = stamps[`${year}-${month}-${day}`];
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

      {/* 상세 정보 섹션 (디자인 유지) */}
      <div className="space-y-6 px-4">
        <h2 className="text-[17px] font-anemone underline underline-offset-[6px] decoration-gray-600">
          오늘의 우표
        </h2>
        <div className="flex gap-6 items-start">
          <div
            className="w-[120px] aspect-[3/4] bg-gray-200/50 shadow-sm bg-cover bg-center"
            style={
              stamps[`${year}-${month}-${currentDay}`]
                ? stampMaskStyle(stamps[`${year}-${month}-${currentDay}`].img)
                : {}
            }
          >
            {!stamps[`${year}-${month}-${currentDay}`] && (
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
                {stamps[`${year}-${month}-${currentDay}`]?.time ||
                  `${year.toString().slice(2)}.${(month + 1).toString().padStart(2, "0")}.${currentDay.toString().padStart(2, "0")}(${getDayName(year, month, currentDay)})`}
              </p>
              <p className="text-[14px] text-gray-700 font-anemone">
                {stamps[`${year}-${month}-${currentDay}`]?.memo ||
                  "우표 내용 우표우표우표"}
              </p>
            </div>
            <div className="flex gap-5 mt-auto">
              <button
                onClick={handleGoToEditor}
                className="text-[13px] font-anemone underline underline-offset-4 decoration-gray-600"
              >
                친구에게 보내기
              </button>
              <button
                onClick={() => {
                  setTargetDay(currentDay);
                  fileInputRef.current?.click();
                }}
                className="text-[13px] font-anemone underline underline-offset-4 decoration-gray-600"
              >
                재발행하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {cropModalOpen && imageToCrop && (
        <CropModal
          image={imageToCrop}
          isAnimating={isPunching}
          onClose={() => setCropModalOpen(false)}
          onCrop={(img: string) => {
            onPunchComplete(img);
            setCropModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CropModal({ image, onClose, onCrop, isAnimating }: any) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);

  const handleCrop = async () => {
    if (!pixels) return;
    const imgEl = new Image();
    imgEl.src = image;
    await imgEl.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(
      imgEl,
      pixels.x,
      pixels.y,
      pixels.width,
      pixels.height,
      0,
      0,
      1200,
      1600,
    );
    onCrop(canvas.toDataURL("image/jpeg", 0.9));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
      {isAnimating && (
        <div className="absolute inset-0 bg-white z-[110] animate-flash" />
      )}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-2xl opacity-50 hover:opacity-100"
      >
        ✕
      </button>
      <div className="w-full max-w-[340px] px-4 space-y-8">
        <div className="relative aspect-[3/4] w-full bg-neutral-900 shadow-2xl overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, p) => setPixels(p)}
            showGrid={false}
            classes={{ cropAreaClassName: "stamp-crop-area" }}
          />
          <div
            className="absolute inset-0 pointer-events-none border-[12px] border-black/40"
            style={{
              maskImage: STAMP_MASK,
              WebkitMaskImage: STAMP_MASK,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
          />
        </div>
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
            className="w-full py-4 bg-white text-black font-black text-sm tracking-widest rounded-xl hover:bg-neutral-200 disabled:opacity-50"
          >
            {isAnimating ? "STAMPING..." : "우표 발행하기"}
          </button>
        </div>
      </div>
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
