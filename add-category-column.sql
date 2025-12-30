-- tarot_historyテーブルにcategoryカラムを追加
ALTER TABLE tarot_history ADD COLUMN IF NOT EXISTS category TEXT;

-- カテゴリーのインデックスを追加（検索高速化）
CREATE INDEX IF NOT EXISTS idx_tarot_history_category ON tarot_history(category);
