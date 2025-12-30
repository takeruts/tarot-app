import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTagSimilarity, extractTags } from '@/src/lib/matchingService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Service roleクライアントを使用（RLSをバイパスして全データ取得）
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 現在のユーザーの相談履歴を取得
    const { data: userHistories, error: userError } = await supabase
      .from('tarot_history')
      .select('question')
      .eq('user_id', userId)
      .limit(10)
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('ユーザー履歴取得エラー:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!userHistories || userHistories.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // ユーザーの相談内容からタグを抽出
    const userTags = userHistories.flatMap((h) => extractTags(h.question || ''));
    const uniqueUserTags = [...new Set(userTags)];

    // 他のユーザーの相談履歴を取得（自分以外）
    const { data: otherHistories, error: otherError } = await supabase
      .from('tarot_history')
      .select('user_id, question, created_at')
      .neq('user_id', userId)
      .limit(100)
      .order('created_at', { ascending: false });

    if (otherError) {
      console.error('他ユーザー履歴取得エラー:', otherError);
      return NextResponse.json({ error: otherError.message }, { status: 500 });
    }

    // ユーザーごとにタグを集約してスコアリング
    const userScores = new Map<string, { score: number; questions: string[]; tags: string[] }>();

    otherHistories?.forEach((history) => {
      const tags = extractTags(history.question || '');
      const score = calculateTagSimilarity(uniqueUserTags, tags);

      if (!userScores.has(history.user_id)) {
        userScores.set(history.user_id, { score: 0, questions: [], tags: [] });
      }

      const current = userScores.get(history.user_id)!;
      current.score = Math.max(current.score, score); // 最高スコアを保持
      current.questions.push(history.question || '');
      current.tags.push(...tags);
    });

    // スコアでソートして上位を取得
    const matches = Array.from(userScores.entries())
      .map(([otherUserId, data]) => ({
        userId: otherUserId,
        score: data.score,
        commonTags: [...new Set(data.tags.filter((t) => uniqueUserTags.includes(t)))],
        sampleQuestion: data.questions[0],
      }))
      .filter((m) => m.score > 0.3) // 閾値以上のみ
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // 上位10人

    // ユーザー情報を取得
    const matchUserIds = matches.map((m) => m.userId);
    const { data: users } = await supabase.auth.admin.listUsers();

    const matchesWithUserInfo = matches.map((match) => {
      const user = users?.users.find((u) => u.id === match.userId);
      return {
        ...match,
        nickname: user?.user_metadata?.nickname || user?.email?.split('@')[0] || '匿名ユーザー',
        email: user?.email,
      };
    });

    return NextResponse.json({ matches: matchesWithUserInfo });
  } catch (error) {
    console.error('マッチングエラー:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
