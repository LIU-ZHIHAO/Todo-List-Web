-- ============================================
-- 最简单的解决方案
-- 允许所有已认证用户读取 user_profiles
-- 但只有超级管理员可以修改
-- ============================================

-- 删除所有 user_profiles 策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;

-- 创建新策略：所有已认证用户可以读取所有 profiles（只读）
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 只有超级管理员可以插入
CREATE POLICY "Super admins can insert profiles" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid() 
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

-- 只有超级管理员可以更新
CREATE POLICY "Super admins can update profiles" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid() 
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

-- 只有超级管理员可以删除
CREATE POLICY "Super admins can delete profiles" ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles p
      WHERE p.id = auth.uid() 
        AND p.role = 'super_admin'
        AND p.is_active = true
    )
  );

-- 验证
SELECT id, email, role, is_active 
FROM user_profiles;
