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

// テスト用のシンプルなサーバーアクション
export async function testServerAction() {
  console.log('=== testServerAction started ===');
  return { success: true, message: 'Server action is working' };
}

export async function createProblem(data: {
  problemSetId: string;
  questionImageBase64: string;
  answerImageBase64: string;
}): Promise<{ success: boolean; error?: string }> {
  console.log('=== createProblem started ===');
  console.log('Problem Set ID:', data.problemSetId);
  console.log('Question Image Base64 length:', data.questionImageBase64.length);
  console.log('Answer Image Base64 length:', data.answerImageBase64.length);

  try {
    const supabase = await createClient();

    // ユーザー認証を確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('=== createProblem: Auth error ===', authError);
      return { success: false, error: '認証エラーが発生しました' };
    }

    console.log('=== createProblem: User authenticated ===', user.id);

    // 問題集の存在確認
    const { data: problemSet, error: problemSetError } = await supabase
      .from('problem_sets')
      .select('id')
      .eq('id', data.problemSetId)
      .eq('user_id', user.id)
      .single();

    if (problemSetError || !problemSet) {
      console.error('=== createProblem: Problem set not found ===', problemSetError);
      return { success: false, error: '問題集が見つかりません' };
    }

    console.log('=== createProblem: Problem set found ===', problemSet.id);

    let questionImageUrl = null;
    let answerImageUrl = null;

    // 問題画像をSupabase Storageにアップロード
    try {
      console.log('=== createProblem: Processing question image ===');
      
      // Base64からバイナリデータに変換
      const questionBase64Data = data.questionImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const questionBinaryData = Buffer.from(questionBase64Data, 'base64');
      
      // ファイル名を生成
      const questionFileName = `problems/${data.problemSetId}/question_${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      console.log('=== createProblem: Uploading question image ===', questionFileName);
      
              const { error: questionUploadError } = await supabase.storage
        .from('images')
        .upload(questionFileName, questionBinaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (questionUploadError) {
        console.error('=== createProblem: Question image upload error ===', questionUploadError);
        return { success: false, error: '問題画像のアップロードに失敗しました' };
      }

      // 公開URLを取得
      const { data: questionUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(questionFileName);

      questionImageUrl = questionUrlData.publicUrl;
      console.log('=== createProblem: Question image uploaded successfully ===', questionImageUrl);
    } catch (questionImageError) {
      console.error('=== createProblem: Question image processing error ===', questionImageError);
      return { success: false, error: '問題画像の処理に失敗しました' };
    }

    // 解答画像をSupabase Storageにアップロード
    try {
      console.log('=== createProblem: Processing answer image ===');
      
      // Base64からバイナリデータに変換
      const answerBase64Data = data.answerImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const answerBinaryData = Buffer.from(answerBase64Data, 'base64');
      
      // ファイル名を生成
      const answerFileName = `problems/${data.problemSetId}/answer_${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      console.log('=== createProblem: Uploading answer image ===', answerFileName);
      
              const { error: answerUploadError } = await supabase.storage
        .from('images')
        .upload(answerFileName, answerBinaryData, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (answerUploadError) {
        console.error('=== createProblem: Answer image upload error ===', answerUploadError);
        return { success: false, error: '解答画像のアップロードに失敗しました' };
      }

      // 公開URLを取得
      const { data: answerUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(answerFileName);

      answerImageUrl = answerUrlData.publicUrl;
      console.log('=== createProblem: Answer image uploaded successfully ===', answerImageUrl);
    } catch (answerImageError) {
      console.error('=== createProblem: Answer image processing error ===', answerImageError);
      return { success: false, error: '解答画像の処理に失敗しました' };
    }

    // 問題を作成
    const { data: problem, error: insertError } = await supabase
      .from('problems')
      .insert({
        problem_set_id: data.problemSetId,
        question_image_url: questionImageUrl,
        answer_image_url: answerImageUrl,
        user_id: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('=== createProblem: Database insert error ===', insertError);
      return { success: false, error: '問題の作成に失敗しました' };
    }

    console.log('=== createProblem: Problem created successfully ===', problem.id);
    return { success: true };

  } catch (error) {
    console.error('=== createProblem: Unexpected error ===', error);
    return { success: false, error: '予期しないエラーが発生しました' };
  }
} 