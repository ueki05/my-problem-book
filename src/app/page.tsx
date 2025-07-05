"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, PlusSquare, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

type ProblemSet = Database["public"]["Tables"]["problem_sets"]["Row"];

export default function Home() {
  const [problemSets, setProblemSets] = useState<ProblemSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ダミーデータ（復習機能は後で実装）
  const reviewCount = 5;

  useEffect(() => {
    fetchProblemSets();
  }, []);

  const fetchProblemSets = async () => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("problem_sets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProblemSets(data || []);
    } catch (err) {
      console.error("Error fetching problem sets:", err);
      setError("問題集の取得に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">資格勉強アプリ</h1>
          <p className="text-sm text-gray-600 mt-1">忘却曲線に基づく効率的な復習</p>
        </div>
      </header>

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
            
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-600">問題集を読み込み中...</p>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-red-600">
                    <p>{error}</p>
                    <Button 
                      onClick={fetchProblemSets} 
                      variant="outline" 
                      className="mt-4"
                    >
                      再試行
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : problemSets.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">まだ問題集がありません</p>
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
