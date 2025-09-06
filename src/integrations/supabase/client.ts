// 개발 환경에서는 로컬 Supabase를, 배포 시에는 원격 Supabase를 사용합니다.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// 환경에 따른 Supabase 설정
const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

// 임시로 원격 Supabase 사용 (Docker 문제 해결 전까지)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://tnojbrbsprjfvfliosyl.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub2picmJzcHJqZnZmbGlvc3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzczNTMsImV4cCI6MjA3MTAxMzM1M30.DSGMRKOKZNQSWrZXDdU0AJvAwAsxg0NxNOEAtrCjfvE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
