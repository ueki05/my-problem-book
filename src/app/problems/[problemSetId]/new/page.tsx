"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Plus, Loader2 } from "lucide-react";

interface NewProblemPageProps {
  params: Promise<{
    problemSetId: string;
  }>;
}

export default function NewProblemPage({ params }: NewProblemPageProps) {
  const router = useRouter();
  const [problemSetId, setProblemSetId] = useState<string>("");
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [answerImage, setAnswerImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // パラメータを取得
  useEffect(() => {
    params.then(({ problemSetId }) => {
      setProblemSetId(decodeURIComponent(problemSetId));
    });
  }, [params]);

  const handleImageUpload = (file: File, type: 'question' | 'answer') => {
    if (file.size > 5 * 1024 * 1024) { // 5MB制限
      setError("画像サイズは5MB以下にしてください。");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("画像ファイルを選択してください。");
      return;
    }

    if (type === 'question') {
      setQuestionImage(file);
    } else {
      setAnswerImage(file);
    }
    setError("");
  };

  const uploadImage = async (file: File, type: 'question' | 'answer'): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileName = `${Date.now()}_${type}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('problem-images')
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('problem-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error(`Error uploading ${type} image:`, err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!questionImage && !answerImage) {
        setError("問題画像または解答画像のいずれかをアップロードしてください。");
        return;
      }

      const supabase = createClient();
      
      // 画像をアップロード
      const questionImageUrl = questionImage ? await uploadImage(questionImage, 'question') : null;
      const answerImageUrl = answerImage ? await uploadImage(answerImage, 'answer') : null;

      if (questionImage && !questionImageUrl) {
        throw new Error("問題画像のアップロードに失敗しました。");
      }

      if (answerImage && !answerImageUrl) {
        throw new Error("解答画像のアップロードに失敗しました。");
      }

      // 問題データを保存
      const { data, error } = await supabase
        .from("problems")
        .insert([
          {
            problem_set_id: problemSetId,
            question_image_url: questionImageUrl,
            answer_image_url: answerImageUrl,
            created_at: new Date().toISOString(),
            user_id: "temp-user", // 一時的なダミーID（認証機能実装後に変更）
          }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 作成成功後、問題集詳細ページにリダイレクト
      router.push(`/problems/${encodeURIComponent(problemSetId)}`);
    } catch (err) {
      console.error("Error creating problem:", err);
      setError("問題の作成に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href={`/problems/${encodeURIComponent(problemSetId)}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">問題を追加</h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新しい問題を追加
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  問題画像
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'question')}
                    className="hidden"
                    id="question-image"
                  />
                  <label htmlFor="question-image" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {questionImage ? questionImage.name : "問題画像をアップロード"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (最大5MB)</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解答画像
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'answer')}
                    className="hidden"
                    id="answer-image"
                  />
                  <label htmlFor="answer-image" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {answerImage ? answerImage.name : "解答画像をアップロード"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (最大5MB)</p>
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || (!questionImage && !answerImage)}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    "問題を作成"
                  )}
                </Button>
                <Link href={`/problems/${encodeURIComponent(problemSetId)}`}>
                  <Button type="button" variant="outline">
                    キャンセル
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 