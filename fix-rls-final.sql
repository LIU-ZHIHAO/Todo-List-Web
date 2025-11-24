-- ============================================
-- 完全修复 RLS - 最终版本
-- 这个版本彻底解决所有循环依赖问题
-- ============================================

-- ============================================
-- 步骤 1: 删除 user_profiles 的所有策略
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON user_profiles;


-- ============================================
-- 步骤 2: 创建简化的 user_profiles 策略
-- ============================================

-- 所有已认证用户可以查看自己的 profile（不能有循环引用）
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 超级管理员可以查看所有 profiles
-- 使用函数避免循环依赖
CREATE POLICY "Super admins can view all profiles" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  );

-- 超级管理员可以插入 profiles
CREATE POLICY "Super admins can insert profiles" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  );

-- 超级管理员可以更新 profiles
CREATE POLICY "Super admins can update profiles" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  );

-- 超级管理员可以删除 profiles
CREATE POLICY "Super admins can delete profiles" ON user_profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1) = 'super_admin'
  );


-- ============================================
-- 步骤 3: 验证
-- ============================================

-- 查看策略
SELECT tablename, policyname 
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 测试查询（应该能看到自己的 profile）
SELECT id, email, role, is_active 
FROM user_profiles 
WHERE id = auth.uid();


-- ============================================
-- 完成！
-- ============================================
