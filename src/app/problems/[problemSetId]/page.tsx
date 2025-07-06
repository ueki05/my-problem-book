import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, Image } from "lucide-react";

type ProblemSet = Database["public"]["Tables"]["problem_sets"]["Row"];
type Problem = Database["public"]["Tables"]["problems"]["Row"];

interface ProblemSetPageProps {
  params: Promise<{
    problemSetId: string;
  }>;
}

async function getProblemSetData(problemSetId: string): Promise<{ problemSet: ProblemSet | null; problems: Problem[]; error?: string }> {
  try {
    const supabase = await createClient();
    
    // 現在ログインしているユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { problemSet: null, problems: [], error: "ログインが必要です" };
    }

    // 問題集データを取得
    const { data: problemSetData, error: problemSetError } = await supabase
      .from("problem_sets")
      .select("*")
      .eq("id", problemSetId)
      .eq("user_id", user.id)
      .single();

    if (problemSetError) {
      return { problemSet: null, problems: [], error: "問題集が見つかりません" };
    }

    // 問題データを取得
    const { data: problemsData, error: problemsError } = await supabase
      .from("problems")
      .select("*")
      .eq("problem_set_id", problemSetId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (problemsError) {
      return { problemSet: problemSetData, problems: [], error: "問題の取得に失敗しました" };
    }

    return { problemSet: problemSetData, problems: problemsData || [] };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { problemSet: null, problems: [], error: "データの取得に失敗しました" };
  }
}

export default async function ProblemSetPage({ params }: ProblemSetPageProps) {
  const { problemSetId } = await params;
  const decodedProblemSetId = decodeURIComponent(problemSetId);
  const { problemSet, problems, error } = await getProblemSetData(decodedProblemSetId);

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
      {/* ページヘッダー */}
      <div className="bg-white shadow-sm border-b">
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
      </div>

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