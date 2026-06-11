import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: "Server not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const body = await request.json();
  const nickname = (body.nickname as string)?.trim();

  if (!nickname) {
    return new Response(
      JSON.stringify({ exists: false, error: "닉네임을 입력해 주세요." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const profileRes = await supabaseAdmin
      .from("profiles")
      .select("nickname")
      .eq("nickname", nickname)
      .maybeSingle();

    if (profileRes.data) {
      return new Response(JSON.stringify({ exists: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (profileRes.error && profileRes.error.code !== "PGRST116") {
      throw profileRes.error;
    }

    // profiles 테이블에 정보가 없으면 사용자가 존재하지 않는 것으로 취급
    return new Response(JSON.stringify({ exists: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("verify friend error", error);
    return new Response(
      JSON.stringify({
        exists: false,
        error: error.message || "검증 중 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
