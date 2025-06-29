import Link from "next/link";

interface ProblemSetPageProps {
  params: Promise<{
    problemSetId: string;
  }>;
}

export default async function ProblemSetPage({ params }: ProblemSetPageProps) {
  // URLパラメータを非同期で取得してデコード（日本語対応）
  const { problemSetId } = await params;
  const decodedProblemSetId = decodeURIComponent(problemSetId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">問題集詳細</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            問題集ID: {decodedProblemSetId} のページです
          </h1>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </main>
    </div>
  );
} 