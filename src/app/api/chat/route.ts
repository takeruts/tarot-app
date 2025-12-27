import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { cards, userMessage } = await req.json();

  // 10枚のカード結果をテキストに変換
  const cardResults = cards.map((c: any, i: number) => {
    const positions = ["現状", "障害", "顕在意識", "潜在意識", "過去", "未来", "立場", "環境", "願望", "結論"];
    return `${i + 1}. ${positions[i]}: ${c.name} (${c.isReversed ? '逆位置' : '正位置'})`;
  }).join('\n');

  const systemPrompt = `あなたは熟練のタロット占い師です。
以下のケルト十字スプレッドの結果に基づき、相談者の悩みに答えてください。
【カード結果】
${cardResults}

【回答指針】
・各カードの関連性を重視してストーリーを組み立てること
・相談者の背中を押すような、具体的で温かい言葉をかけること
・カードのポジション毎に【】でポジション名を最初に書き、読みやすくすること`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // または "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `悩み: ${userMessage || "私の今の運勢を教えてください"}` }
      ],
    });

    return NextResponse.json({ advice: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "AI鑑定中にエラーが発生しました" }, { status: 500 });
  }
}