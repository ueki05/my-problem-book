'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProblemSet(formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name || name.trim().length === 0) {
    throw new Error('問題集名は必須です');
  }

  const supabase = await createClient();
  
  // 現在ログインしているユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/login');
  }

  // 問題集をデータベースに挿入
  const { error } = await supabase
    .from('problem_sets')
    .insert({
      name: name.trim(),
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

  // エラーが発生した場合はコンソールに出力して処理を終了
  if (error) {
    console.error('Error creating problem set:', error);
    return;
  }

  // 成功した場合のみリダイレクト処理を実行
  revalidatePath('/');
  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  
  await supabase.auth.signOut();
  
  revalidatePath('/');
  redirect('/login');
}

export async function createProblem(formData: FormData, problemSetId: string) {
  const supabase = await createClient();
  
  // 現在ログインしているユーザーを取得
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('ログインが必要です');
  }

  try {
    // フォームデータから画像ファイルを取得
    const questionImage = formData.get('question_image') as File;
    const answerImage = formData.get('answer_image') as File;

    if (!questionImage || !answerImage) {
      throw new Error('問題画像と解答画像の両方が必要です');
    }

    // ファイルサイズチェック（5MB制限）
    if (questionImage.size > 5 * 1024 * 1024 || answerImage.size > 5 * 1024 * 1024) {
      throw new Error('画像サイズは5MB以下にしてください');
    }

    // ファイルタイプチェック
    if (!questionImage.type.startsWith('image/') || !answerImage.type.startsWith('image/')) {
      throw new Error('画像ファイルを選択してください');
    }

    // 一意のファイル名を生成
    const timestamp = Date.now();
    const questionFileName = `${user.id}/${timestamp}_question_${questionImage.name}`;
    const answerFileName = `${user.id}/${timestamp}_answer_${answerImage.name}`;

    // 画像をストレージにアップロード
    const { error: questionUploadError } = await supabase.storage
      .from('problem-images')
      .upload(questionFileName, questionImage);

    if (questionUploadError) {
      throw new Error('問題画像のアップロードに失敗しました');
    }

    const { error: answerUploadError } = await supabase.storage
      .from('problem-images')
      .upload(answerFileName, answerImage);

    if (answerUploadError) {
      throw new Error('解答画像のアップロードに失敗しました');
    }

    // 公開URLを取得
    const { data: questionUrlData } = supabase.storage
      .from('problem-images')
      .getPublicUrl(questionFileName);

    const { data: answerUrlData } = supabase.storage
      .from('problem-images')
      .getPublicUrl(answerFileName);

    // 問題データをデータベースに保存
    const { error: insertError } = await supabase
      .from('problems')
      .insert({
        problem_set_id: problemSetId,
        question_image_url: questionUrlData.publicUrl,
        answer_image_url: answerUrlData.publicUrl,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      throw insertError;
    }

    revalidatePath(`/problems/${encodeURIComponent(problemSetId)}`);
    redirect(`/problems/${encodeURIComponent(problemSetId)}`);
  } catch (error) {
    console.error('Error creating problem:', error);
    throw new Error('問題の作成に失敗しました');
  }
} 