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
    throw new Error('ログインが必要です');
  }

  try {
    const { error } = await supabase
      .from('problem_sets')
      .insert({
        title: name.trim(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    revalidatePath('/');
    redirect('/');
  } catch (error) {
    console.error('Error creating problem set:', error);
    throw new Error('問題集の作成に失敗しました');
  }
}

export async function signOut() {
  const supabase = await createClient();
  
  await supabase.auth.signOut();
  
  revalidatePath('/');
  redirect('/login');
} 