"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, Image, Loader2 } from "lucide-react";

type ProblemSet = Database["public"]["Tables"]["problem_sets"]["Row"];
type Problem = Database["public"]["Tables"]["problems"]["Row"];

interface ProblemSetPageProps {
  params: Promise<{
    problemSetId: string;
  }>;
}

export default function ProblemSetPage({ params }: ProblemSetPageProps) {
  const [problemSet, setProblemSet] = useState<ProblemSet | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { problemSetId } = await params;
        const decodedProblemSetId = decodeURIComponent(problemSetId);
        
        const supabase = createClient();
        
        // 問題集データを取得
        const { data: problemSetData, error: problemSetError } = await supabase
          .from("problem_sets")
          .select("*")
          .eq("id", decodedProblemSetId)
          .single();

        if (problemSetError) {
          throw problemSetError;
        }

        setProblemSet(problemSetData);

        // 問題データを取得
        const { data: problemsData, error: problemsError } = await supabase
          .from("problems")
          .select("*")
          .eq("problem_set_id", decodedProblemSetId)
          .order("created_at", { ascending: true });

        if (problemsError) {
          throw problemsError;
        }

        setProblems(problemsData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !problemSet) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || "問題集が見つかりません"}</p>
            <Link href="/">
              <Button>ホームに戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              戻る
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{problemSet.title}</h1>
              {problemSet.description && (
                <p className="text-sm text-gray-600 mt-1">{problemSet.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">問題一覧</h2>
          <Link href={`/problems/${encodeURIComponent(problemSet.id)}/new`}>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              問題を追加
            </Button>
          </Link>
        </div>

        {problems.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">まだ問題がありません</p>
                <Link href={`/problems/${encodeURIComponent(problemSet.id)}/new`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    最初の問題を追加
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {problems.map((problem) => (
              <Card key={problem.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {problem.question_image_url && (
                          <Image className="w-4 h-4 text-blue-600" />
                        )}
                        {problem.answer_image_url && (
                          <Image className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        問題 {problem.id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {problem.last_answered_at ? (
                        <span>最終解答: {new Date(problem.last_answered_at).toLocaleDateString()}</span>
                      ) : (
                        <span>未解答</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 