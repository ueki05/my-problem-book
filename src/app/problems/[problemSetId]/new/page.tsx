"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { createProblem } from "@/app/actions";

interface NewProblemPageProps {
  params: Promise<{
    problemSetId: string;
  }>;
}

export default async function NewProblemPage({ params }: NewProblemPageProps) {
  const { problemSetId } = await params;
  const decodedProblemSetId = decodeURIComponent(problemSetId);

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
            <form action={createProblem.bind(null, decodedProblemSetId)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  問題画像
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    name="question_image"
                    accept="image/*"
                    className="hidden"
                    id="question-image"
                    required
                  />
                  <label htmlFor="question-image" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">問題画像をアップロード</p>
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
                    name="answer_image"
                    accept="image/*"
                    className="hidden"
                    id="answer-image"
                    required
                  />
                  <label htmlFor="answer-image" className="cursor-pointer">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">解答画像をアップロード</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (最大5MB)</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  問題を登録
                </Button>
                <Link href={`/problems/${encodeURIComponent(decodedProblemSetId)}`}>
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