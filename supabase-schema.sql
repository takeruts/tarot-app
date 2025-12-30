-- 既存のテーブルを削除（再実行可能にするため）
-- 注意: tarot_history（単数形）は既存データがあるので削除しない
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS tarot_histories CASCADE; -- 複数形の空テーブルは削除

-- ユーザー接続テーブル（マッチング情報）
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  similarity_score FLOAT, -- 類似度スコア (0-1)
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- 重複防止のため、常にuser1 < user2
);

-- connectionsテーブルのインデックス
CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);
CREATE INDEX idx_connections_status ON connections(status);

-- メッセージテーブル
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- messagesテーブルのインデックス
CREATE INDEX idx_messages_connection ON messages(connection_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- tarot_historiesテーブルに公開設定を追加（既存テーブルがある場合）
-- ALTER TABLE tarot_histories ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
-- ALTER TABLE tarot_histories ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Row Level Security (RLS) の有効化
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- connectionsのRLSポリシー
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own connections"
  ON connections FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- messagesのRLSポリシー
CREATE POLICY "Users can view messages in their connections"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
      AND (connections.user1_id = auth.uid() OR connections.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their connections"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());
