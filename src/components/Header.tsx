import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";

export default async function Header() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              資格勉強アプリ
            </Link>
            <p className="text-sm text-gray-600 mt-1">忘却曲線に基づく効率的な復習</p>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <form action={signOut}>
                  <Button type="submit" variant="outline" size="sm" className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    ログアウト
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  ログイン
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 