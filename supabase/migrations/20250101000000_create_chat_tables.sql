-- チャットルームテーブル
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- チャットルームメンバーテーブル
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- チャットメッセージテーブル
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_chat_rooms_category ON chat_rooms(category);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Row Level Security (RLS) 有効化
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: チャットルーム
CREATE POLICY "Users can view all chat rooms"
  ON chat_rooms FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create chat rooms"
  ON chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON chat_rooms FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms"
  ON chat_rooms FOR DELETE
  USING (auth.uid() = created_by);

-- RLSポリシー: チャットルームメンバー
CREATE POLICY "Users can view room members"
  ON chat_room_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join rooms"
  ON chat_room_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON chat_room_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLSポリシー: チャットメッセージ
CREATE POLICY "Room members can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE chat_room_members.room_id = chat_messages.room_id
      AND chat_room_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE chat_room_members.room_id = chat_messages.room_id
      AND chat_room_members.user_id = auth.uid()
    )
  );

-- 関数: チャットルームの最終更新時刻を更新
CREATE OR REPLACE FUNCTION update_chat_room_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET updated_at = NOW()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー: メッセージ送信時にルームの更新時刻を更新
CREATE TRIGGER trigger_update_chat_room_on_message
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_room_updated_at();
