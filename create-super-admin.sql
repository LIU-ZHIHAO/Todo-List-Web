-- ============================================
-- 简化版：创建超级管理员账户
-- 这个脚本可以直接创建超级管理员
-- ============================================

-- 方法 1: 如果你已经在 Dashboard 中创建了用户，运行这个
-- 替换 'your-email@example.com' 为你的邮箱
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';

-- 验证是否设置成功
SELECT id, email, role, is_active, created_at
FROM user_profiles
WHERE role = 'super_admin';


-- ============================================
-- 方法 2: 查看所有用户，然后设置超级管理员
-- ============================================

-- 第一步：查看所有用户
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    p.role,
    p.is_active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 第二步：复制你想设置为超级管理员的用户 ID，然后运行：
-- UPDATE user_profiles SET role = 'super_admin' WHERE id = '用户ID';


-- ============================================
-- 方法 3: 为现有用户补充 profile（如果 profile 不存在）
-- ============================================

-- 检查是否有用户没有 profile
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 如果有用户没有 profile，为他们创建
INSERT INTO user_profiles (id, email, role, is_active)
SELECT u.id, u.email, 'user', true
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 然后设置超级管理员
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';


-- ============================================
-- 快速设置（推荐）
-- ============================================

-- 一步到位：查找最新创建的用户并设置为超级管理员
-- 注意：这会将最新创建的用户设置为超级管理员
-- 只在你刚创建了管理员账户时使用！

/*
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE id = (
    SELECT id FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
);
*/

-- 验证结果
SELECT 
    u.id,
    u.email,
    p.role,
    p.is_active,
    u.created_at
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE p.role = 'super_admin';
