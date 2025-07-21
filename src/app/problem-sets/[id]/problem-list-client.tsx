'use client';

import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import type { ProblemSet, Problem } from './page';

interface Props {
  problemSet: ProblemSet | null;
  problems: Problem[];
}

export default function ProblemListClient({ problemSet, problems }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {problemSet ? problemSet.name : '問題集が見つかりません'}
        </h1>
        {problems.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            まだ問題が登録されていません。
          </div>
        ) : (
          <div className="grid gap-4">
            {problems.map((problem) => (
              <Link
                key={problem.id}
                href={`/problem-sets/${problem.problem_set_id}/${problem.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-gray-50">
                  <CardContent className="p-4 flex items-center gap-4">
                    {problem.question_image_url && (
                      <div className="w-24 h-24 relative flex-shrink-0">
                        <Image
                          src={problem.question_image_url}
                          alt="問題画像"
                          fill
                          className="object-contain rounded border"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">問題ID: {problem.id.slice(0, 8)}...</div>
                      {problem.last_answered_at && (
                        <div className="text-sm text-gray-500 mt-1">
                          最終解答: {new Date(problem.last_answered_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 