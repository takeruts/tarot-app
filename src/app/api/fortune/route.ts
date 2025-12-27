import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. JSONデータの読み込みパスを設定
    // ファイルは src/data/tarot_data.json または public/data/tarot_data.json に配置
    const filePath = path.join(process.cwd(), 'src/data/tarot_data.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const allCards = JSON.parse(jsonData);

    // 2. シャッフルして10枚選ぶ
    const shuffled = allCards.sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 10).map((card: any) => ({
      ...card,
      isReversed: Math.random() > 0.5 // 正逆をランダムに決定
    }));

    return NextResponse.json(selectedCards);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}