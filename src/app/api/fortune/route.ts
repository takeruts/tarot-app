import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TarotCard } from '@/src/types';
import { NextRequest } from 'next/server';

interface RawTarotCard {
  id: string;
  name: string;
  english_name: string;
  image_url: string;
  meaning?: {
    upright: string;
    reversed: string;
  };
}

// Chinese translations for tarot cards
const chineseNames: { [key: string]: string } = {
  "The Fool": "愚者",
  "The Magician": "魔术师",
  "The High Priestess": "女教皇",
  "The Empress": "女皇",
  "The Emperor": "皇帝",
  "The Hierophant": "教皇",
  "The Lovers": "恋人",
  "The Chariot": "战车",
  "Strength": "力量",
  "The Hermit": "隐者",
  "Wheel of Fortune": "命运之轮",
  "Justice": "正义",
  "The Hanged Man": "倒吊人",
  "Death": "死神",
  "Temperance": "节制",
  "The Devil": "恶魔",
  "The Tower": "塔",
  "The Star": "星星",
  "The Moon": "月亮",
  "The Sun": "太阳",
  "Judgement": "审判",
  "The World": "世界",
  "Ace of Cups": "圣杯王牌",
  "Two of Cups": "圣杯二",
  "Three of Cups": "圣杯三",
  "Four of Cups": "圣杯四",
  "Five of Cups": "圣杯五",
  "Six of Cups": "圣杯六",
  "Seven of Cups": "圣杯七",
  "Eight of Cups": "圣杯八",
  "Nine of Cups": "圣杯九",
  "Ten of Cups": "圣杯十",
  "Page of Cups": "圣杯侍从",
  "Knight of Cups": "圣杯骑士",
  "Queen of Cups": "圣杯王后",
  "King of Cups": "圣杯国王",
  "Ace of Pentacles": "星币王牌",
  "Two of Pentacles": "星币二",
  "Three of Pentacles": "星币三",
  "Four of Pentacles": "星币四",
  "Five of Pentacles": "星币五",
  "Six of Pentacles": "星币六",
  "Seven of Pentacles": "星币七",
  "Eight of Pentacles": "星币八",
  "Nine of Pentacles": "星币九",
  "Ten of Pentacles": "星币十",
  "Page of Pentacles": "星币侍从",
  "Knight of Pentacles": "星币骑士",
  "Queen of Pentacles": "星币王后",
  "King of Pentacles": "星币国王",
  "Ace of Swords": "宝剑王牌",
  "Two of Swords": "宝剑二",
  "Three of Swords": "宝剑三",
  "Four of Swords": "宝剑四",
  "Five of Swords": "宝剑五",
  "Six of Swords": "宝剑六",
  "Seven of Swords": "宝剑七",
  "Eight of Swords": "宝剑八",
  "Nine of Swords": "宝剑九",
  "Ten of Swords": "宝剑十",
  "Page of Swords": "宝剑侍从",
  "Knight of Swords": "宝剑骑士",
  "Queen of Swords": "宝剑王后",
  "King of Swords": "宝剑国王",
  "Ace of Wands": "权杖王牌",
  "Two of Wands": "权杖二",
  "Three of Wands": "权杖三",
  "Four of Wands": "权杖四",
  "Five of Wands": "权杖五",
  "Six of Wands": "权杖六",
  "Seven of Wands": "权杖七",
  "Eight of Wands": "权杖八",
  "Nine of Wands": "权杖九",
  "Ten of Wands": "权杖十",
  "Page of Wands": "权杖侍从",
  "Knight of Wands": "权杖骑士",
  "Queen of Wands": "权杖王后",
  "King of Wands": "权杖国王"
};

export async function GET(request: NextRequest): Promise<NextResponse<TarotCard[] | { error: string }>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const language = (searchParams.get('lang') || 'ja') as 'ja' | 'en' | 'zh';

    // 1. JSONデータの読み込みパスを設定
    const filePath = path.join(process.cwd(), 'src/data/tarot_data.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const allCards: RawTarotCard[] = JSON.parse(jsonData);

    // 2. シャッフルして10枚選ぶ
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selectedCards: TarotCard[] = shuffled.slice(0, 10).map((card) => {
      let cardName = card.name; // デフォルトは日本語

      if (language === 'en') {
        cardName = card.english_name;
      } else if (language === 'zh') {
        cardName = chineseNames[card.english_name] || card.english_name;
      }

      return {
        id: card.id,
        name: cardName,
        image_url: card.image_url,
        isReversed: Math.random() > 0.5 // 正逆をランダムに決定
      };
    });

    return NextResponse.json(selectedCards);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}