import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, PlusSquare } from "lucide-react";
import { createClient } from '@/lib/supabase/server';
import { Database } from "@/lib/database.types";

type ProblemSet = Database["public"]["Tables"]["problem_sets"]["Row"];

async function getProblemSets(): Promise<ProblemSet[]> {
  const supabase = await createClient();
  
  // 現在ログインしているユーザーを取得
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("problem_sets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching problem sets:", error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const problemSets = await getProblemSets();
  
  // ダミーデータ（復習機能は後で実装）
  const reviewCount = 5;

  // ログインしていない場合はログインページにリダイレクト
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">資格勉強アプリ</h1>
          <p className="text-gray-600 mb-6">ログインして問題集を管理しましょう</p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">
              ログイン
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              復習
            </TabsTrigger>
            <TabsTrigger value="problems" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              問題集
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>今日の復習</CardTitle>
                <CardDescription>
                  忘却曲線に基づいて、今日復習すべき問題が表示されます
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewCount > 0 ? (
                  <div className="text-center py-6">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <p className="text-lg font-medium text-gray-900 mb-4">
                      復習が必要な問題が {reviewCount} 問あります。
                    </p>
                    <Link href="/review">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        復習を開始する
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p className="text-lg font-medium text-gray-900">
                      今日の復習はありません。素晴らしい！
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problems" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">問題集一覧</h2>
              <Link href="/problems/new">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <PlusSquare className="w-4 h-4" />
                  問題集追加
                </Button>
              </Link>
            </div>
            
            {problemSets.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">問題集がありません。最初の問題集を作成しましょう。</p>
                    <Link href="/problems/new">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        最初の問題集を作成
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {problemSets.map((problemSet) => (
                  <Link 
                    key={problemSet.id} 
                    href={`/problems/${encodeURIComponent(problemSet.id)}`}
                    className="block"
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <span className="font-medium text-gray-900">{problemSet.title}</span>
                            </div>
                            {problemSet.description && (
                              <p className="text-sm text-gray-600 ml-8">
                                {problemSet.description}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            問題数: 0問
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
