"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
const STAMP_CANVAS = { width: 1200, height: 1600 };
const PUNCHER_IMAGE = { width: 1024, height: 1024 };
const PUNCHER_DISPLAY = { width: 600, height: 600 };
const PUNCHER_HOLE_NATURAL = { x: 386, y: 383, width: 243, height: 296 };
const PUNCHER_CROP_NATURAL = { x: 320, y: 300, width: 380, height: 500 };
const PUNCHER_ANIMATION_MS = 210;
const STAMP_POP_MS = 330;
const PUNCHER_OVERLAY_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="304" height="332" viewBox="0 0 304 332" fill="none">
    <defs>
      <linearGradient id="body" x1="152" y1="0" x2="152" y2="332" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFF7E7"/>
        <stop offset="0.58" stop-color="#E9D7B7"/>
        <stop offset="1" stop-color="#C9B086"/>
      </linearGradient>
      <linearGradient id="rim" x1="152" y1="58" x2="152" y2="274" gradientUnits="userSpaceOnUse">
        <stop stop-color="#B78749"/>
        <stop offset="1" stop-color="#7E5625"/>
      </linearGradient>
      <filter id="shadow" x="0" y="12" width="304" height="320" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000" flood-opacity="0.28"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <path d="M52 48C52 21.49 73.49 0 100 0H204C230.51 0 252 21.49 252 48V66H52V48Z" fill="#DCC39E"/>
      <rect x="20" y="44" width="264" height="240" rx="56" fill="url(#body)"/>
      <rect x="36" y="60" width="232" height="208" rx="44" fill="#F5E4C5"/>
      <rect x="58" y="68" width="188" height="196" rx="32" fill="url(#rim)"/>
      <path d="M98 96C98 83.85 107.85 74 120 74H184C196.15 74 206 83.85 206 96V236C206 248.15 196.15 258 184 258H120C107.85 258 98 248.15 98 236V96Z" fill="#6B4A25"/>
      <path d="M108 104C108 93.51 116.51 85 127 85H177C187.49 85 196 93.51 196 104V228C196 238.49 187.49 247 177 247H127C116.51 247 108 238.49 108 228V104Z" fill="#1A1208" fill-opacity="0.82"/>
      <rect x="96" y="286" width="112" height="18" rx="9" fill="#B08A58"/>
      <rect x="118" y="16" width="68" height="20" rx="10" fill="#B99667"/>
      <rect x="128" y="21" width="48" height="10" rx="5" fill="#F6E2BE" fill-opacity="0.86"/>
    </g>
  </svg>`,
)}`;

function drawRoundStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const corner = Math.min(width, height) * 0.12;
  ctx.beginPath();
  ctx.moveTo(x + corner, y);
  ctx.lineTo(x + width - corner, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
  ctx.lineTo(x + width, y + height - corner);
  ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
  ctx.lineTo(x + corner, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
  ctx.lineTo(x, y + corner);
  ctx.quadraticCurveTo(x, y, x + corner, y);
  ctx.closePath();
  ctx.fill();
}

function punchHoles(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const radius = Math.round(Math.min(width, height) * 0.065);
  const cols = 6;
  const rows = 7;
  for (let i = 0; i <= cols; i += 1) {
    const px = x + (width / cols) * i;
    ctx.beginPath();
    ctx.arc(px, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, y + height, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let j = 1; j < rows; j += 1) {
    const py = y + (height / rows) * j;
    ctx.beginPath();
    ctx.arc(x, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function StampIt() {
  const [today, setToday] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [showDial, setShowDial] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [myName, setMyName] = useState<string | null>(null);
  const [hasNewInbox, setHasNewInbox] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getInboxLastSeenKey = (id: string | null) =>
    id ? `stampit_inbox_last_seen_${id}` : "";

  const markInboxRead = () => {
    if (userId) {
      window.localStorage.setItem(getInboxLastSeenKey(userId), `${Date.now()}`);
    }
    setHasNewInbox(false);
  };

  const checkInboxUnread = async (
    id: string | null,
    nickname: string | null,
  ) => {
    if (!id || !nickname) {
      setHasNewInbox(false);
      return;
    }

    const lastSeenValue = window.localStorage.getItem(getInboxLastSeenKey(id));
    const lastSeen = lastSeenValue ? Number(lastSeenValue) : null;

    const { data, error } = await supabase
      .from("postcards")
      .select("created_at")
      .eq("receiver_name", nickname)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data?.length) {
      setHasNewInbox(false);
      return;
    }

    const latest = data[0]?.created_at;
    const latestTime = latest ? new Date(latest).getTime() : 0;
    const unread = !lastSeen || latestTime > lastSeen;
    setHasNewInbox(unread);
  };

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

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user;
      setIsLoggedIn(!!currentUser);
      const id = currentUser?.id ?? null;
      setUserId(id);

      const metadata = currentUser?.user_metadata as
        | Record<string, any>
        | undefined;
      const nickname = metadata?.nickname || metadata?.name || null;
      setMyName(nickname || null);

      await checkInboxUnread(id, nickname);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;
        setIsLoggedIn(!!session);
        const id = currentUser?.id ?? null;
        setUserId(id);

        const metadata = currentUser?.user_metadata as
          | Record<string, any>
          | undefined;
        const nickname = metadata?.nickname || metadata?.name || null;
        setMyName(nickname || null);

        await checkInboxUnread(id, nickname);
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!myName) return;

    const channel = supabase
      .channel(`inbox-notify-${myName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "postcards",
          filter: `receiver_name=eq.${myName}`,
        },
        () => {
          console.log("새 엽서 도착!");
          setHasNewInbox(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myName, userId]);

  // Supabase 데이터 로드 및 Realtime 구독
  useEffect(() => {
    if (!userId) return;

    // 1. 기존 데이터 초기 로드
    const fetchStamps = async () => {
      const { data, error } = await supabase
        .from("stamps")
        .select("*")
        .eq("user_id", userId);
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
            time: s.date, // 날짜를 그대로 저장
          };
        });
        setStamps(stampMap);
      }
    };

    fetchStamps();

    // 2. Realtime 구독 설정
    const channel = supabase
      .channel("realtime-stamps")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stamps",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("데이터베이스 변경 감지!", payload);

          if (payload.eventType === "INSERT") {
            const newStamp = payload.new;
            setStamps((prev) => ({
              ...prev,
              [newStamp.date]: {
                img: newStamp.image_url,
                memo: newStamp.memo,
                time: newStamp.date,
              },
            }));
          } else if (payload.eventType === "DELETE") {
            const oldStamp = payload.old;
            setStamps((prev) => {
              const newStamps = { ...prev };
              delete newStamps[oldStamp.date];
              return newStamps;
            });
          }
        },
      )
      .subscribe();

    // 3. 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
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

      await supabase
        .from("stamps")
        .delete()
        .eq("date", dateKey)
        .eq("user_id", userId);

      const { error: dbError } = await supabase.from("stamps").insert([
        {
          date: dateKey,
          image_url: publicUrl,
          memo: "오늘의 소중한 한 조각",
          user_id: userId,
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
                  <div className="w-16 text-center font-black text-lg">
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
          <button
            onClick={() => {
              if (isLoggedIn) {
                const date = today || new Date();
                router.push(
                  `/postcard/write?date=${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
                );
              } else {
                router.push("/auth");
              }
            }}
            className="relative"
          >
            <span className="text-[13px]">
              {isLoggedIn ? "send →" : "login →"}
            </span>
            {/* <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div> */}
          </button>
        </header>

        <main className="flex-1">
          <HomeView
            year={selectedYear}
            month={selectedMonth}
            today={today || new Date()}
            stamps={stamps}
            setStamps={setStamps}
            onPunchComplete={handlePunchComplete}
            isPunching={isPunching}
            setTargetDay={setTargetDay}
          />
        </main>

        <nav className="fixed bottom-0 w-[375px] bg-[#fdfcf0]/90 backdrop-blur-sm border-t border-dashed border-gray-300 py-4 px-8 flex justify-between items-center z-20">
          <button className="text-[13px] opacity-100">home</button>
          <button
            onClick={() => {
              markInboxRead();
              router.push("/inbox");
            }}
            className="relative text-[13px] transition hover:text-black"
          >
            inbox
            {hasNewInbox ? (
              <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
            ) : null}
          </button>
          <button
            onClick={() => router.push("/friends")}
            className="text-[13px] transition hover:text-black"
          >
            friends
          </button>
          <button
            onClick={() => router.push("/setting")}
            className="text-[13px] transition hover:text-black"
          >
            setting
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
  setStamps,
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
    const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
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

  const formatStampTime = (time: string) => {
    const [y, m, d] = time.split("-").map(Number);
    if (!y || m == null || !d) return time;
    const monthNumber = m + 1;
    return `${y.toString().slice(2)}.${String(monthNumber).padStart(2, "0")}.${String(d).padStart(2, "0")}(${getDayName(y, m, d)})`;
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
                {stamps[`${year}-${month}-${currentDay}`]?.time
                  ? formatStampTime(
                      stamps[`${year}-${month}-${currentDay}`].time,
                    )
                  : `${year.toString().slice(2)}.${(month + 1).toString().padStart(2, "0")}.${currentDay.toString().padStart(2, "0")}(${getDayName(year, month, currentDay)})`}
              </p>
              <p className="text-[14px] text-gray-700 font-anemone">
                {stamps[`${year}-${month}-${currentDay}`]?.memo ||
                  "오늘의 한 조각을 채워보세요"}
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
        <PuncherCropModal
          image={imageToCrop}
          onClose={() => setCropModalOpen(false)}
          onCrop={onPunchComplete}
        />
      )}
    </div>
  );
}

function PuncherCropModal({
  image,
  onClose,
  onCrop,
}: {
  image: string;
  onClose: () => void;
  onCrop: (img: string) => Promise<void> | void;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);
  const [imageBounds, setImageBounds] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [puncherPosition, setPuncherPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPunching, setIsPunching] = useState(false);
  const [holePreview, setHolePreview] = useState(image);
  const [generatedStamp, setGeneratedStamp] = useState<string | null>(null);
  const [overlaySrc, setOverlaySrc] = useState("/puncher-overlay.png");

  const getHoleFrame = useCallback(() => {
    const scaleX = PUNCHER_DISPLAY.width / PUNCHER_IMAGE.width;
    const scaleY = PUNCHER_DISPLAY.height / PUNCHER_IMAGE.height;

    return {
      frame: {
        x: PUNCHER_HOLE_NATURAL.x * scaleX,
        y: PUNCHER_HOLE_NATURAL.y * scaleY,
        width: PUNCHER_HOLE_NATURAL.width * scaleX,
        height: PUNCHER_HOLE_NATURAL.height * scaleY,
      },
      crop: {
        x: PUNCHER_CROP_NATURAL.x * scaleX,
        y: PUNCHER_CROP_NATURAL.y * scaleY,
        width: PUNCHER_CROP_NATURAL.width * scaleX,
        height: PUNCHER_CROP_NATURAL.height * scaleY,
      },
    };
  }, []);

  const clampPuncherPosition = useCallback(
    (left: number, top: number) => {
      if (!imageBounds) return { left, top };
      const { crop } = getHoleFrame();

      return {
        left: Math.min(
          Math.max(left, imageBounds.left - PUNCHER_DISPLAY.width / 2),
          imageBounds.left + imageBounds.width - PUNCHER_DISPLAY.width / 2,
        ),
        top: Math.min(
          Math.max(
            top,
            imageBounds.top - PUNCHER_DISPLAY.height + imageBounds.height / 2,
          ),
          imageBounds.top + imageBounds.height / 2,
        ),
      };
    },
    [imageBounds],
  );

  const updateImageBounds = useCallback(() => {
    const imgEl = imageRef.current;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!imgEl || !containerRect) return;

    const boxRect = imgEl.getBoundingClientRect();
    const naturalW = imgEl.naturalWidth;
    const naturalH = imgEl.naturalHeight;
    if (!naturalW || !naturalH) return;

    const boxAspect = boxRect.width / boxRect.height;
    const imgAspect = naturalW / naturalH;

    let renderedW: number, renderedH: number;
    if (imgAspect > boxAspect) {
      renderedW = boxRect.width;
      renderedH = boxRect.width / imgAspect;
    } else {
      renderedH = boxRect.height;
      renderedW = boxRect.height * imgAspect;
    }

    const offsetX = (boxRect.width - renderedW) / 2;
    const offsetY = (boxRect.height - renderedH) / 2;

    const nextBounds = {
      left: boxRect.left - containerRect.left + offsetX,
      top: boxRect.top - containerRect.top + offsetY,
      width: renderedW,
      height: renderedH,
    };

    setImageBounds(nextBounds);

    setPuncherPosition((current) => {
      const { crop } = getHoleFrame();

      const clamp = (left: number, top: number) => ({
        left: Math.min(
          Math.max(left, nextBounds.left - PUNCHER_DISPLAY.width / 2),
          nextBounds.left + nextBounds.width - PUNCHER_DISPLAY.width / 2,
        ),
        top: Math.min(
          Math.max(
            top,
            nextBounds.top - PUNCHER_DISPLAY.height + nextBounds.height / 2,
          ),
          nextBounds.top + nextBounds.height / 2,
        ),
      });

      if (!current) {
        return clamp(
          nextBounds.left + nextBounds.width / 2 - crop.x - crop.width / 2,
          nextBounds.top + nextBounds.height / 2 - crop.y - crop.height / 2,
        );
      }

      return clamp(current.left, current.top);
    });
  }, [getHoleFrame]);

  useEffect(() => {
    updateImageBounds();
    window.addEventListener("resize", updateImageBounds);
    return () => window.removeEventListener("resize", updateImageBounds);
  }, [updateImageBounds]);

  const getCropRect = useCallback(() => {
    if (!puncherPosition) return null;
    const { crop } = getHoleFrame();

    return {
      left: puncherPosition.left + crop.x,
      top: puncherPosition.top + crop.y,
      width: crop.width,
      height: crop.height,
    };
  }, [getHoleFrame, puncherPosition]);

  const createStampImage = async () => {
    if (!imageBounds) return null;
    const cropRect = getCropRect();
    if (!cropRect) return null;

    const imgEl = new Image();
    imgEl.src = image;
    await imgEl.decode();

    // cropRect와 imageBounds의 교차 영역 계산
    const clampedLeft = Math.max(cropRect.left, imageBounds.left);
    const clampedTop = Math.max(cropRect.top, imageBounds.top);
    const clampedRight = Math.min(
      cropRect.left + cropRect.width,
      imageBounds.left + imageBounds.width,
    );
    const clampedBottom = Math.min(
      cropRect.top + cropRect.height,
      imageBounds.top + imageBounds.height,
    );

    const scale = imgEl.naturalWidth / imageBounds.width;
    const cropX = (clampedLeft - imageBounds.left) * scale;
    const cropY = (clampedTop - imageBounds.top) * scale;
    const cropWidth = (clampedRight - clampedLeft) * scale;
    const cropHeight = (clampedBottom - clampedTop) * scale;

    const stampCanvas = document.createElement("canvas");
    stampCanvas.width = STAMP_CANVAS.width;
    stampCanvas.height = STAMP_CANVAS.height;
    const ctx = stampCanvas.getContext("2d");
    if (!ctx) return null;

    // 교차 영역을 stamp 전체에 꽉 차게 그림
    ctx.drawImage(
      imgEl,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      STAMP_CANVAS.width,
      STAMP_CANVAS.height,
    );

    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "white";
    drawRoundStamp(ctx, 0, 0, STAMP_CANVAS.width, STAMP_CANVAS.height);
    ctx.restore();

    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "black";
    punchHoles(ctx, 0, 0, STAMP_CANVAS.width, STAMP_CANVAS.height);
    ctx.globalCompositeOperation = "source-over";

    return stampCanvas.toDataURL("image/png");
  };

  const createHolePreview = async () => {
    if (!imageBounds) return null;
    const cropRect = getCropRect();
    if (!cropRect) return null;

    const imgEl = new Image();
    imgEl.src = image;
    await imgEl.decode();

    const containerEl = containerRef.current;
    if (!containerEl) return null;

    const containerW = containerEl.clientWidth;
    const containerH = containerEl.clientHeight;

    const holeCanvas = document.createElement("canvas");
    holeCanvas.width = containerW;
    holeCanvas.height = containerH;
    const ctx = holeCanvas.getContext("2d");
    if (!ctx) return null;

    // 컨테이너 기준으로 imageBounds 위치에 이미지 그림
    ctx.drawImage(
      imgEl,
      imageBounds.left,
      imageBounds.top,
      imageBounds.width,
      imageBounds.height,
    );

    // cropRect는 이미 컨테이너 기준 좌표이므로 그대로 사용
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "black";
    drawRoundStamp(
      ctx,
      cropRect.left,
      cropRect.top,
      cropRect.width,
      cropRect.height,
    );
    punchHoles(
      ctx,
      cropRect.left,
      cropRect.top,
      cropRect.width,
      cropRect.height,
    );

    return holeCanvas.toDataURL("image/png");
  };

  const handlePunch = useCallback(async () => {
    if (isPunching || !puncherPosition) return;

    setIsPunching(true);
    const [stampUrl, holeUrl] = await Promise.all([
      createStampImage(),
      createHolePreview(),
    ]);

    await new Promise((resolve) => setTimeout(resolve, PUNCHER_ANIMATION_MS));
    if (holeUrl) setHolePreview(holeUrl);
    if (stampUrl) setGeneratedStamp(stampUrl);
    await new Promise((resolve) => setTimeout(resolve, STAMP_POP_MS));
    if (stampUrl) await onCrop(stampUrl);
    setIsPunching(false);
    onClose();
  }, [
    createHolePreview,
    createStampImage,
    isPunching,
    onClose,
    onCrop,
    puncherPosition,
  ]);

  const handlePuncherPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!puncherPosition || isPunching) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: puncherPosition.left,
      startTop: puncherPosition.top,
      moved: false,
    };
    setIsDragging(false);
  };

  const handlePuncherPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const moved = Math.abs(dx) > 4 || Math.abs(dy) > 4;

    if (moved && !dragState.moved) {
      dragState.moved = true;
      setIsDragging(true);
    }

    if (!dragState.moved) return;

    setPuncherPosition(
      clampPuncherPosition(dragState.startLeft + dx, dragState.startTop + dy),
    );
  };

  const handlePuncherPointerUp = async (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== e.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const shouldPunch = !dragState.moved;
    dragStateRef.current = null;
    setIsDragging(false);

    if (shouldPunch) {
      await handlePunch();
    }
  };

  const handlePuncherPointerCancel = (
    e: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStateRef.current = null;
    setIsDragging(false);
  };

  const cropRect = getCropRect();
  const holeFrame = getHoleFrame();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 py-6">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-20 text-2xl text-white opacity-70 transition hover:opacity-100"
      >
        x
      </button>
      <div className="relative w-full max-w-[360px] shadow-2xl">
        <div
          ref={containerRef}
          className="relative bg-black"
          style={{ height: "70vw", maxHeight: "70vh" }}
        >
          <img
            ref={imageRef}
            src={holePreview}
            alt="stamp source"
            className={`absolute inset-0 h-full w-full ${holePreview === image ? "object-contain" : "object-fill"}`}
            onLoad={updateImageBounds}
          />

          {cropRect && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: cropRect.left,
                top: cropRect.top,
                width: cropRect.width,
                height: cropRect.height,
              }}
            >
              <div
                className="absolute inset-0 rounded-[18px] border border-white/70"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.22) inset, 0 10px 24px rgba(0,0,0,0.12)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  maskImage: STAMP_MASK,
                  WebkitMaskImage: STAMP_MASK,
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  boxShadow: "0 0 18px rgba(255,255,255,0.14) inset",
                }}
              />
            </div>
          )}

          {puncherPosition && (
            <div
              className="absolute touch-none"
              style={{
                left: puncherPosition.left,
                top: puncherPosition.top,
                width: PUNCHER_DISPLAY.width,
                height: PUNCHER_DISPLAY.height,
              }}
              onPointerDown={handlePuncherPointerDown}
              onPointerMove={handlePuncherPointerMove}
              onPointerUp={handlePuncherPointerUp}
              onPointerCancel={handlePuncherPointerCancel}
            >
              <motion.div
                className="relative h-full w-full"
                initial={false}
                animate={
                  isPunching
                    ? { y: 18, scale: 0.96 }
                    : isDragging
                      ? { scale: 1.01 }
                      : { y: 0, scale: 1 }
                }
                transition={{
                  duration: PUNCHER_ANIMATION_MS / 1000,
                  ease: [0.25, 0.8, 0.25, 1],
                }}
              >
                <img
                  src={overlaySrc}
                  alt="stamp puncher"
                  className={`h-full w-full select-none object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.28)] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  draggable={false}
                  onError={() => setOverlaySrc(PUNCHER_OVERLAY_SVG)}
                />
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: holeFrame.frame.x,
                    top: holeFrame.frame.y,
                    width: holeFrame.frame.width,
                    height: holeFrame.frame.height,
                    boxShadow:
                      "inset 0 0 0 1px rgba(255,255,255,0.55), inset 0 0 18px rgba(255,255,255,0.18)",
                  }}
                />
              </motion.div>
            </div>
          )}

          {generatedStamp && cropRect && (
            <motion.img
              src={generatedStamp}
              alt="popped stamp"
              className="absolute rounded-[24px] shadow-2xl"
              style={{
                left: cropRect.left + cropRect.width / 2,
                top: cropRect.top + cropRect.height / 2,
                width: cropRect.width * 1.4,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, scale: 0.78, y: 24, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, y: -18, rotate: 1 }}
              transition={{
                duration: STAMP_POP_MS / 1000,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
