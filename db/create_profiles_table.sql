-- Supabase profiles 테이블 생성용 SQL
-- Supabase SQL editor 또는 migration 도구에 붙여넣어 실행하세요.

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  nickname text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles (nickname);
