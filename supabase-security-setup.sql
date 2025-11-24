-- ============================================
-- Supabase 安全配置 SQL
-- 执行顺序：请按照标注的步骤依次执行
-- ============================================

-- ============================================
-- 步骤 1: 添加 user_id 字段
-- ============================================

-- 为 tasks 表添加 user_id 字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 为 quick_notes 表添加 user_id 字段
ALTER TABLE quick_notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 为 user_id 字段创建索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_user_id ON quick_notes(user_id);


-- ============================================
-- 步骤 2: 删除旧的不安全策略
-- ============================================

-- 删除 tasks 表的旧策略
DROP POLICY IF EXISTS "Allow all for anon users" ON tasks;

-- 删除 quick_notes 表的旧策略
DROP POLICY IF EXISTS "Allow all for anon users" ON quick_notes;


-- ============================================
-- 步骤 3: 创建基于用户的安全策略 - Tasks 表
-- ============================================

-- 用户只能查看自己的任务
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的任务
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的任务
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的任务
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 步骤 4: 创建基于用户的安全策略 - Quick Notes 表
-- ============================================

-- 用户只能查看自己的笔记
CREATE POLICY "Users can view own notes" ON quick_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能插入自己的笔记
CREATE POLICY "Users can insert own notes" ON quick_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的笔记
CREATE POLICY "Users can update own notes" ON quick_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的笔记
CREATE POLICY "Users can delete own notes" ON quick_notes
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 步骤 5: 验证配置
-- ============================================

-- 检查 RLS 是否启用（应该返回 true）
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tasks', 'quick_notes');

-- 查看当前策略（应该看到新创建的策略）
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tasks', 'quick_notes')
ORDER BY tablename, policyname;

-- 检查字段是否添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'user_id';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quick_notes' AND column_name = 'user_id';


-- ============================================
-- 完成！
-- ============================================
-- 执行完成后，请在前端代码中实施用户认证功能
