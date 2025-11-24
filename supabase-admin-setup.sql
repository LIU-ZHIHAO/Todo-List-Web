-- ============================================
-- 超级管理员和用户管理系统 SQL
-- 执行顺序：在 supabase-security-setup.sql 之后执行
-- ============================================

-- ============================================
-- 步骤 1: 创建用户角色表
-- ============================================

-- 创建用户角色枚举类型
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 创建用户配置表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role DEFAULT 'user',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by ON user_profiles(created_by);

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的配置
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 超级管理员可以查看所有用户
CREATE POLICY "Super admins can view all profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 超级管理员可以创建用户配置
CREATE POLICY "Super admins can insert profiles" ON user_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 超级管理员可以更新用户配置
CREATE POLICY "Super admins can update profiles" ON user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 超级管理员可以删除用户配置（软删除）
CREATE POLICY "Super admins can delete profiles" ON user_profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );


-- ============================================
-- 步骤 2: 创建触发器自动创建用户配置
-- ============================================

-- 当新用户注册时自动创建用户配置
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role, is_active)
  VALUES (NEW.id, NEW.email, 'user', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();


-- ============================================
-- 步骤 3: 创建超级管理员账户
-- ============================================

-- 注意：你需要手动替换下面的邮箱为你的超级管理员邮箱
-- 首先在 Supabase Dashboard 的 Authentication 中手动创建一个用户
-- 然后运行下面的 SQL，将 'your-admin@email.com' 替换为实际邮箱

/*
-- 示例：设置超级管理员
-- 1. 先在 Authentication 中创建用户
-- 2. 然后运行下面的 SQL（替换邮箱）

UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'your-admin@email.com';

-- 或者如果你知道用户 ID：
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = '你的用户ID';
*/


-- ============================================
-- 步骤 4: 辅助函数
-- ============================================

-- 检查用户是否是超级管理员
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'super_admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取当前用户角色
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN user_role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 步骤 5: 验证配置
-- ============================================

-- 查看所有用户配置
SELECT id, email, role, is_active, created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 查看超级管理员
SELECT id, email, role, created_at
FROM user_profiles
WHERE role = 'super_admin';


-- ============================================
-- 完成！
-- ============================================
-- 下一步：
-- 1. 在 Supabase Dashboard → Authentication 中手动创建第一个用户
-- 2. 运行上面注释中的 UPDATE 语句，设置为超级管理员
-- 3. 在前端实现用户管理界面
