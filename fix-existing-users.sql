-- ============================================
-- 修复脚本：为现有用户创建 profile 并设置超级管理员
-- ============================================

-- 步骤 1: 查看现有用户（确认用户存在）
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 步骤 2: 为所有现有用户创建 user_profiles（如果不存在）
INSERT INTO user_profiles (id, email, role, is_active)
SELECT 
    u.id, 
    u.email, 
    'user' as role,  -- 默认为普通用户
    true as is_active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;  -- 只插入没有 profile 的用户

-- 步骤 3: 验证 user_profiles 是否创建成功
SELECT id, email, role, is_active, created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 步骤 4: 设置超级管理员
-- 方法 1: 通过邮箱设置（推荐）
-- 请将 'your-email@example.com' 替换为你的实际邮箱
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';

-- 方法 2: 将最新创建的用户设为超级管理员
-- 如果你刚创建了管理员账户，可以用这个
/*
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = (
    SELECT id FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
);
*/

-- 方法 3: 通过用户 ID 设置
-- 从步骤 1 的结果中复制用户 ID，替换下面的 'USER_ID'
/*
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = 'USER_ID';
*/

-- 步骤 5: 验证超级管理员设置成功
SELECT 
    u.id,
    u.email,
    p.role,
    p.is_active,
    u.created_at
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE p.role = 'super_admin';

-- 应该看到你的管理员账户！

-- ============================================
-- 完成！现在可以登录测试了
-- ============================================
