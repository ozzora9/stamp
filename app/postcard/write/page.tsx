"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

// 톱니 마스크 스타일 (홈과 동일)
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Cmask id='m'%3E%3Crect width='120' height='160' fill='white'/%3E%3Ccircle cx='0' cy='0' r='6' fill='black'/%3E%3Ccircle cx='20' cy='0' r='6' fill='black'/%3E%3Ccircle cx='40' cy='0' r='6' fill='black'/%3E%3Ccircle cx='60' cy='0' r='6' fill='black'/%3E%3Ccircle cx='80' cy='0' r='6' fill='black'/%3E%3Ccircle cx='100' cy='0' r='6' fill='black'/%3E%3Ccircle cx='120' cy='0' r='6' fill='black'/%3E%3Ccircle cx='0' cy='160' r='6' fill='black'/%3E%3Ccircle cx='20' cy='160' r='6' fill='black'/%3E%3Ccircle cx='40' cy='160' r='6' fill='black'/%3E%3Ccircle cx='60' cy='160' r='6' fill='black'/%3E%3Ccircle cx='80' cy='160' r='6' fill='black'/%3E%3Ccircle cx='100' cy='160' r='6' fill='black'/%3E%3Ccircle cx='120' cy='160' r='6' fill='black'/%3E%3Ccircle cx='0' cy='20' r='6' fill='black'/%3E%3Ccircle cx='0' cy='40' r='6' fill='black'/%3E%3Ccircle cx='0' cy='60' r='6' fill='black'/%3E%3Ccircle cx='0' cy='80' r='6' fill='black'/%3E%3Ccircle cx='0' cy='100' r='6' fill='black'/%3E%3Ccircle cx='0' cy='120' r='6' fill='black'/%3E%3Ccircle cx='0' cy='140' r='6' fill='black'/%3E%3Ccircle cx='120' cy='20' r='6' fill='black'/%3E%3Ccircle cx='120' cy='40' r='6' fill='black'/%3E%3Ccircle cx='120' cy='60' r='6' fill='black'/%3E%3Ccircle cx='120' cy='80' r='6' fill='black'/%3E%3Ccircle cx='120' cy='100' r='6' fill='black'/%3E%3Ccircle cx='120' cy='120' r='6' fill='black'/%3E%3Ccircle cx='120' cy='140' r='6' fill='black'/%3E%3C/mask%3E%3Crect width='120' height='160' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`;

function PostcardWriteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialDate = searchParams.get("date");

  const [allStamps, setAllStamps] = useState<any[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<any>(null);
  const [receiverName, setReceiverName] = useState("누구");
  const [senderName, setSenderName] = useState("보내는 이");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [showFriendsPopup, setShowFriendsPopup] = useState(false);

  const getFriendStorageKey = (id: string | null) =>
    id ? `stampit_friends_${id}` : "";

  const todayStr = new Date()
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      const id = user?.id ?? null;
      setUserId(id);
      const metadata = user?.user_metadata as Record<string, any> | undefined;
      const nickname = metadata?.nickname || metadata?.name || "보내는 이";
      setSenderName(nickname);

      if (!id) {
        setFriends([]);
        return;
      }

      const saved = localStorage.getItem(getFriendStorageKey(id));
      if (saved) {
        try {
          setFriends(JSON.parse(saved));
        } catch {
          setFriends([]);
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchAllStamps();
  }, [userId]);

  const handleSendPostcard = async () => {
    if (!selectedStamp || !message.trim()) {
      alert("우표를 붙이고 마음을 적어주세요! 📮");
      return;
    }

    if (friends.length === 0) {
      alert("먼저 친구를 등록한 뒤, 친구를 선택해 주세요.");
      return;
    }

    if (!friends.includes(receiverName)) {
      alert("수신인은 친구 목록에서 선택해 주세요.");
      return;
    }

    const { error } = await supabase.from("postcards").insert([
      {
        sender_name: senderName,
        receiver_name: receiverName,
        message: message,
        stamp_url: selectedStamp.image_url,
      },
    ]);

    if (error) {
      console.error("전송 에러:", error);
      alert("우편 배달 사고가 났어요. 다시 시도해 주세요!");
    } else {
      alert("엽서가 우체통에 쏙 들어갔습니다! ✨");
      router.push("/");
    }
  };

  const fetchAllStamps = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("stamps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("우표 로드 실패:", error);
      return;
    }

    if (data) {
      setAllStamps(data);
      const initial = data.find((s: any) => s.date === initialDate);
      setSelectedStamp(initial || data[0] || null);
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
            SEND
          </h1>
        </header>

        <div className="flex items-baseline gap-2 px-4 mb-2 relative">
          <span className="text-gray-400 text-[10px] tracking-widest uppercase">
            send to.
          </span>
          <button
            onClick={() => setShowFriendsPopup(true)}
            className="text-[14px] border-b-2 border-black hover:opacity-50 transition-opacity"
          >
            {receiverName}
          </button>
        </div>

        {showFriendsPopup ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
            onClick={() => setShowFriendsPopup(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-bold">친구 목록</div>
                <button
                  onClick={() => setShowFriendsPopup(false)}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  닫기
                </button>
              </div>
              {friends.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                  아직 친구가 없어요.
                  <div className="mt-2 text-xs text-gray-400">
                    친구를 추가하면 여기에서 선택할 수 있어요.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <button
                      key={friend}
                      type="button"
                      onClick={() => {
                        setReceiverName(friend);
                        setShowFriendsPopup(false);
                      }}
                      className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium hover:bg-gray-100"
                    >
                      {friend}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

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

            {/* 고정 텍스트 (From. 닉네임) */}
            <div className="w-full space-y-2 opacity-30 select-none text-[9px] pr-1">
              <div className="border-b border-gray-300 pb-1 italic leading-none text-right">
                From. {senderName}
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
            <button
              onClick={handleSendPostcard}
              className="text-sm active:scale-95 transition-all"
            >
              전송하기
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
            {allStamps.length === 0 ? (
              <div className="text-sm text-gray-400">
                보유한 우표가 없습니다. 우표를 먼저 찍어보세요.
              </div>
            ) : (
              allStamps.map((stamp) => (
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
              ))
            )}
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

export default function PostcardWritePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostcardWriteContent />
    </Suspense>
  );
}
