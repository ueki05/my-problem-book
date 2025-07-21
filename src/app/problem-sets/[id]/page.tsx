import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import ProblemListClient from "./problem-list-client";

export type ProblemSet = Database["public"]["Tables"]["problem_sets"]["Row"];
export type Problem = Database["public"]["Tables"]["problems"]["Row"];

interface PageProps {
  params: { id: string };
}

export default async function ProblemSetPage({ params }: PageProps) {
  const supabase = createClient(cookies());

  // 問題集データ取得
  const { data: problemSet } = await supabase
    .from("problem_sets")
    .select("*")
    .eq("id", params.id)
    .single();

  // 問題リスト取得
  const { data: problems } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_set_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <ProblemListClient problemSet={problemSet} problems={problems ?? []} />
  );
} 