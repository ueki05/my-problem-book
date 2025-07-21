"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";
import { createProblem } from "@/app/actions";

interface NewProblemPageProps {
  params: Promise<{
    problemSetId: string;
  }>;
}

export default function NewProblemPage({ params }: NewProblemPageProps) {
  const [decodedProblemSetId, setDecodedProblemSetId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  const [questionImagePreview, setQuestionImagePreview] = useState<string>('');
  const [answerImagePreview, setAnswerImagePreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  // paramsを非同期で処理
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const decoded = decodeURIComponent(resolvedParams.problemSetId);
      setDecodedProblemSetId(decoded);
    };
    getParams();
  }, [params]);

  // paramsがまだ読み込まれていない場合はローディング表示
  if (!decodedProblemSetId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuestionImageFile(file);
      
      // プレビュー用のURLを作成
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnswerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnswerImageFile(file);
      
      // プレビュー用のURLを作成
      const reader = new FileReader();
      reader.onload = (e) => {
        setAnswerImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!questionImageFile || !answerImageFile) {
      setError('問題画像と解答画像の両方をアップロードしてください');
      return;
    }

    startTransition(async () => {
      try {
        console.log('=== Client: Form submission started ===');
        console.log('Problem Set ID:', decodedProblemSetId);
        console.log('Question image:', questionImageFile.name, questionImageFile.size);
        console.log('Answer image:', answerImageFile.name, answerImageFile.size);

        // 問題画像をBase64エンコード
        const questionImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(questionImageFile!);
        });

        // 解答画像をBase64エンコード
        const answerImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(answerImageFile!);
        });

        const result = await createProblem({
          problemSetId: decodedProblemSetId,
          questionImageBase64,
          answerImageBase64
        });

        if (result.success) {
          console.log('=== Client: Problem created successfully ===');
          router.push(`/problems/${encodeURIComponent(decodedProblemSetId)}`);
        } else {
          console.error('=== Client: Problem creation failed ===', result.error);
          setError(result.error || '問題の作成に失敗しました');
        }
      } catch (error) {
        console.error('=== Client: Unexpected error ===', error);
        setError('予期しないエラーが発生しました');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ページヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href={`/problems/${encodeURIComponent(decodedProblemSetId)}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">問題を追加</h1>
          </div>
        </div>
      </div>

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
                    className="hidden"
                    id="question-image"
                    required
                    onChange={handleQuestionImageChange}
                  />
                  <label htmlFor="question-image" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">問題画像をアップロード</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (最大5MB)</p>
                  </label>
                </div>
                {questionImagePreview && (
                  <div className="mt-2">
                    <img
                      src={questionImagePreview}
                      alt="問題プレビュー"
                      className="max-w-xs max-h-48 object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解答画像
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="answer-image"
                    required
                    onChange={handleAnswerImageChange}
                  />
                  <label htmlFor="answer-image" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">解答画像をアップロード</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (最大5MB)</p>
                  </label>
                </div>
                {answerImagePreview && (
                  <div className="mt-2">
                    <img
                      src={answerImagePreview}
                      alt="解答プレビュー"
                      className="max-w-xs max-h-48 object-contain border rounded"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? "登録中..." : "問題を登録"}
                </Button>
                <Link href={`/problems/${encodeURIComponent(decodedProblemSetId)}`}>
                  <Button type="button" variant="outline" disabled={isPending}>
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