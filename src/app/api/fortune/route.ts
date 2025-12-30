import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TarotCard } from '@/src/types';

interface RawTarotCard {
  id: string;
  name: string;
  image_url: string;
  meaning?: string;
  reversed_meaning?: string;
}

export async function GET(): Promise<NextResponse<TarotCard[] | { error: string }>> {
  try {
    // 1. JSONデータの読み込みパスを設定
    // ファイルは src/data/tarot_data.json または public/data/tarot_data.json に配置
    const filePath = path.join(process.cwd(), 'src/data/tarot_data.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const allCards: RawTarotCard[] = JSON.parse(jsonData);

    // 2. シャッフルして10枚選ぶ
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selectedCards: TarotCard[] = shuffled.slice(0, 10).map((card) => ({
      ...card,
      isReversed: Math.random() > 0.5 // 正逆をランダムに決定
    }));

    return NextResponse.json(selectedCards);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}