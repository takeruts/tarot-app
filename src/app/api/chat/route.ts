import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import type { TarotCard, AIAdviceRequest, AIAdviceResponse } from '@/src/types';

// OpenAI APIキーの存在確認
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request): Promise<NextResponse<AIAdviceResponse>> {
  try {
    const body: AIAdviceRequest = await req.json();
    const { cards, userMessage, language = 'ja' } = body;

    // Language-specific position names
    const positionNames = {
      ja: ["現状", "障害", "顕在意識", "潜在意識", "過去", "未来", "立場", "環境", "願望", "結論"],
      en: ["Present", "Challenge", "Conscious", "Subconscious", "Past", "Future", "Position", "Environment", "Hopes", "Outcome"],
      zh: ["现状", "障碍", "显意识", "潜意识", "过去", "未来", "立场", "环境", "愿望", "结论"]
    };

    // Language-specific reversed/upright labels
    const positionLabels = {
      ja: { reversed: '逆位置', upright: '正位置' },
      en: { reversed: 'Reversed', upright: 'Upright' },
      zh: { reversed: '逆位', upright: '正位' }
    };

    const positions = positionNames[language];
    const labels = positionLabels[language];

    // 10枚のカード結果をテキストに変換
    const cardResults = cards.map((c: TarotCard, i: number) => {
      return `${i + 1}. ${positions[i]}: ${c.name} (${c.isReversed ? labels.reversed : labels.upright})`;
    }).join('\n');

    // Language-specific system prompts
    const systemPrompts = {
      ja: `あなたは熟練のタロット占い師です。
以下のケルト十字スプレッドの結果に基づき、相談者の悩みに答えてください。
【カード結果】
${cardResults}

【回答指針】
・各カードの関連性を重視してストーリーを組み立てること
・相談者の背中を押すような、具体的で温かい言葉をかけること
・カードのポジション毎に【】でポジション名を最初に書き、読みやすくすること`,

      en: `You are an experienced tarot reader.
Based on the following Celtic Cross spread, please answer the querent's question.
【Card Results】
${cardResults}

【Guidelines】
・Build a narrative emphasizing the relationships between cards
・Offer specific, warm encouragement to support the querent
・Use 【】brackets to mark each position name at the beginning for readability`,

      zh: `您是一位经验丰富的塔罗占卜师。
根据以下凯尔特十字牌阵的结果，请回答咨询者的问题。
【牌面结果】
${cardResults}

【回答指引】
・重视各张牌之间的关联性来构建故事
・给予咨询者具体且温暖的鼓励
・在每个位置开头用【】标记位置名称，以便阅读`
    };

    const defaultMessages = {
      ja: "私の今の運勢を教えてください",
      en: "Please tell me about my current fortune",
      zh: "请告诉我现在的运势"
    };

    const questionPrefix = {
      ja: "悩み: ",
      en: "Question: ",
      zh: "问题: "
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // または "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemPrompts[language] },
        { role: "user", content: `${questionPrefix[language]}${userMessage || defaultMessages[language]}` }
      ],
    });

    const fallbackMessages = {
      ja: "申し訳ございません。星々の声が聞き取れませんでした。",
      en: "I apologize, I could not hear the voices of the stars.",
      zh: "抱歉，我无法听到星星的声音。"
    };

    const advice = response.choices[0].message.content || fallbackMessages[language];
    return NextResponse.json({ advice });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ advice: "", error: "AI鑑定中にエラーが発生しました" }, { status: 500 });
  }
}