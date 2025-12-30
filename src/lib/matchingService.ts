import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 2つの相談内容の類似度を計算（0-1のスコア）
 */
export async function calculateSimilarity(
  question1: string,
  question2: string
): Promise<number> {
  try {
    const prompt = `以下の2つの悩み相談の内容がどれだけ似ているか、0から1のスコアで評価してください。
1に近いほど似ており、0に近いほど異なります。

悩み1: ${question1}
悩み2: ${question2}

以下の基準で評価してください：
- テーマの類似性（恋愛、仕事、人間関係など）
- 感情の共通性
- 状況の類似性

スコアのみを数値で返してください（例: 0.75）`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '相談内容の類似度を0-1の数値のみで返す専門家です。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const scoreText = response.choices[0]?.message?.content?.trim() || '0';
    const score = parseFloat(scoreText);

    // 0-1の範囲に収める
    return Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('類似度計算エラー:', error);
    return 0;
  }
}

/**
 * ユーザーの相談履歴から類似するユーザーを見つける
 */
export async function findSimilarUsers(
  userId: string,
  userQuestions: string[],
  threshold: number = 0.6 // 類似度の閾値
): Promise<Array<{ userId: string; score: number; question: string }>> {
  // この関数は後でAPIルートから呼び出す
  // Supabaseから他のユーザーの公開された相談内容を取得し、
  // 類似度を計算してマッチング候補を返す
  return [];
}

/**
 * タグベースでの簡易マッチング（軽量版）
 */
export function extractTags(question: string): string[] {
  const keywords = {
    恋愛: ['恋愛', '恋', '好き', '彼氏', '彼女', 'パートナー', '片思い', '失恋'],
    仕事: ['仕事', '職場', '転職', 'キャリア', '上司', '同僚', '会社'],
    人間関係: ['友達', '友人', '家族', '親', '兄弟', '姉妹', '人間関係'],
    健康: ['健康', '病気', '体調', 'メンタル', '不安', 'ストレス'],
    お金: ['お金', '金銭', '経済', '貯金', '収入', '支出', '借金'],
    将来: ['将来', '未来', '目標', '夢', '進路', '選択'],
  };

  const tags: string[] = [];
  const lowerQuestion = question.toLowerCase();

  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerQuestion.includes(word))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ['その他'];
}

/**
 * タグの一致度でスコアリング
 */
export function calculateTagSimilarity(tags1: string[], tags2: string[]): number {
  if (tags1.length === 0 || tags2.length === 0) return 0;

  const set1 = new Set(tags1);
  const set2 = new Set(tags2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));

  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size; // Jaccard係数
}
