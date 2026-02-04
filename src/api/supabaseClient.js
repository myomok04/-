import { createClient } from '@supabase/supabase-js';

// 공정 진단: 주소와 키를 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ⚠️ .env 파일 확인 팁: 
// 1. 주소 끝에 /가 없는지 확인하세요 (예: https://xxx.supabase.co 가 맞음)
// 2. 따옴표("")를 모두 제거하고 값만 넣으셨는지 확인하세요.

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ 물류 경로 유실: .env 파일의 주소나 키가 유효하지 않습니다.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);