-- ============================================
-- 修复 RLS 循环依赖问题
-- 这个脚本解决了策略中的循环引用
-- ============================================

-- ============================================
-- 步骤 1: 删除有问题的策略
-- ============================================

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view own notes" ON quick_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON quick_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON quick_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON quick_notes;


-- ============================================
-- 步骤 2: 创建简化的 tasks 策略（不检查 is_active）
-- ============================================

-- 用户只能查看自己的任务
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户只能插入自己的任务
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的任务
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的任务
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================
-- 步骤 3: 创建简化的 quick_notes 策略（不检查 is_active）
-- ============================================

-- 用户只能查看自己的笔记
CREATE POLICY "Users can view own notes" ON quick_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 用户只能插入自己的笔记
CREATE POLICY "Users can insert own notes" ON quick_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的笔记
CREATE POLICY "Users can update own notes" ON quick_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的笔记
CREATE POLICY "Users can delete own notes" ON quick_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================
-- 步骤 4: 验证策略
-- ============================================

-- 查看所有策略
SELECT tablename, policyname 
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 测试查询自己的 profile
SELECT id, email, role, is_active 
FROM user_profiles 
WHERE id = auth.uid();


-- ============================================
-- 完成！
-- ============================================
-- 现在策略更简单，避免了循环依赖
-- is_active 检查可以在应用层面进行
