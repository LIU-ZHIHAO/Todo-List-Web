-- ============================================
-- 安全的 RLS 策略配置
-- 这个配置既保证安全，又允许正常功能
-- ============================================

-- ============================================
-- 步骤 1: 重新启用 RLS
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;


-- ============================================
-- 步骤 2: 删除所有旧策略（清理）
-- ============================================

-- user_profiles 表
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON user_profiles;

-- tasks 表
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- quick_notes 表
DROP POLICY IF EXISTS "Users can view own notes" ON quick_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON quick_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON quick_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON quick_notes;


-- ============================================
-- 步骤 3: 创建安全的 user_profiles 策略
-- ============================================

-- 所有已认证用户可以查看自己的 profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 超级管理员可以查看所有 profiles
CREATE POLICY "Super admins can view all profiles" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
    )
  );

-- 超级管理员可以插入新的 profiles
CREATE POLICY "Super admins can insert profiles" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
    )
  );

-- 超级管理员可以更新 profiles
CREATE POLICY "Super admins can update profiles" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
    )
  );

-- 超级管理员可以删除 profiles
CREATE POLICY "Super admins can delete profiles" ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
    )
  );


-- ============================================
-- 步骤 4: 创建安全的 tasks 策略
-- ============================================

-- 用户只能查看自己的任务
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 用户只能插入自己的任务
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 用户只能更新自己的任务
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 用户只能删除自己的任务
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );


-- ============================================
-- 步骤 5: 创建安全的 quick_notes 策略
-- ============================================

-- 用户只能查看自己的笔记
CREATE POLICY "Users can view own notes" ON quick_notes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 用户只能插入自己的笔记
CREATE POLICY "Users can insert own notes" ON quick_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 用户只能更新自己的笔记
CREATE POLICY "Users can update own notes" ON quick_notes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- 用户只能删除自己的笔记
CREATE POLICY "Users can delete own notes" ON quick_notes
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_active = true
    )
  );


-- ============================================
-- 步骤 6: 验证策略
-- ============================================

-- 查看所有策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'tasks', 'quick_notes')
ORDER BY tablename, policyname;

-- 测试当前用户是否可以查看自己的 profile
SELECT id, email, role, is_active 
FROM user_profiles 
WHERE id = auth.uid();


-- ============================================
-- 步骤 7: 安全检查
-- ============================================

-- 确认 RLS 已启用
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'tasks', 'quick_notes');

-- 应该全部显示 true


-- ============================================
-- 完成！
-- ============================================
-- 现在系统既安全又可用：
-- ✅ 用户只能访问自己的数据
-- ✅ 超级管理员可以管理所有用户
-- ✅ 停用的用户无法访问数据
-- ✅ 未认证用户无法访问任何数据
