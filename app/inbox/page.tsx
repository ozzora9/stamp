"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

// 톱니 마스크 스타일 (공통)
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

function InboxContent() {
  const router = useRouter();
  const [myName, setMyName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [postcards, setPostcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getInboxLastSeenKey = (id: string | null) =>
    id ? `stampit_inbox_last_seen_${id}` : "";

  useEffect(() => {
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("세션 조회 실패:", error);
        setLoading(false);
        return;
      }

      const user = data.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const id = user.id;
      setUserId(id);
      const metadata = user.user_metadata as Record<string, any> | undefined;
      const nickname = metadata?.nickname || metadata?.name || null;
      setMyName(nickname);
      if (id) {
        window.localStorage.setItem(getInboxLastSeenKey(id), `${Date.now()}`);
      }
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (!myName) {
      setLoading(false);
      return;
    }

    const fetchPostcards = async () => {
      const { data, error } = await supabase
        .from("postcards")
        .select("*")
        .eq("receiver_name", myName)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("우편함 로드 실패:", error);
      } else if (data) {
        setPostcards(data);
      }
      setLoading(false);
    };

    fetchPostcards();

    const channel = supabase
      .channel(`inbox-${myName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "postcards",
          filter: `receiver_name=eq.${myName}`,
        },
        (payload) => {
          console.log("새 엽서 도착!", payload);
          setPostcards((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myName]);

  return (
    <div className="w-[375px] relative pt-12 pb-24 px-4 z-10 selection:bg-pink-100 flex flex-col min-h-screen font-anemone">
      <header className="mb-10">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 mb-2"
        >
          ← back
        </button>
        <h1 className="text-4xl font-black tracking-tighter">INBOX</h1>
        <p className="text-[10px] text-gray-400 tracking-widest uppercase">
          {myName ? `${myName}님의 우체통` : "로그인 후 확인하세요"}
        </p>
      </header>

      <main className="space-y-8 flex-1">
        {loading ? (
          <div className="py-20 text-center text-gray-300">
            우체부 기다리는 중...
          </div>
        ) : postcards.length === 0 ? (
          <div className="py-20 text-center text-gray-300 italic">
            아직 도착한 마음이 없어요.
          </div>
        ) : (
          postcards.map((card) => (
            <div
              key={card.id}
              className="w-full bg-white p-6 shadow-md border border-gray-100 relative group flex flex-col min-h-[220px] animate-in fade-in slide-in-from-bottom-3 duration-700"
            >
              {/* 우측 상단 우표 구역 (보낼 때 배치했던 그 위치 그대로) */}
              <div className="absolute top-4 right-4 w-12 aspect-[3/4] shadow-sm">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${card.stamp_url})`,
                    maskImage: STAMP_MASK,
                    WebkitMaskImage: STAMP_MASK,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                  }}
                />
              </div>

              {/* 엽서 상단 정보 (From 헤더) */}
              <div className="space-y-1 mb-4">
                <div className="text-[10px] text-gray-400 tracking-widest uppercase italic">
                  From. {card.sender_name}
                </div>
              </div>

              {/* 엽서 본문 내용 (보낼 때 작성자가 줄바꿈한 것까지 그대로 보존) */}
              <p className="text-[15px] leading-relaxed text-gray-700 font-anemone flex-1 whitespace-pre-wrap">
                {card.message}
              </p>

              {/* 엽서 하단 메타데이터 (우측 정렬된 타임스탬프) */}
              <div className="text-[9px] text-gray-300 text-right mt-4 border-t border-gray-50 pt-2">
                {new Date(card.created_at).toLocaleDateString("ko-KR", {
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-[#fdfcf0] text-[#333] flex justify-center">
      {/* 빈티지 배경 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <InboxContent />
      </Suspense>
    </div>
  );
}
