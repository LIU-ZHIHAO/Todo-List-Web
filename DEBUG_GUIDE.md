# 🔍 调试指南 - 查看认证状态

## 问题

数据库中已经设置了 `super_admin`，但登录后看不到用户管理入口。

## 解决方案

我已经添加了一个调试面板来帮你查看实际的认证状态。

---

## 📊 使用调试面板

### 步骤 1: 刷新应用

刷新浏览器页面（或等待自动编译完成）

### 步骤 2: 登录

使用你的超级管理员账户登录

### 步骤 3: 查看调试面板

登录后，你会在**右下角**看到一个黑色的调试面板，显示：

```
🔍 认证调试信息

Loading: ❌ No
User Email: 1211574210@qq.com
User ID: xxxxxxxx...

Context State:
isSuperAdmin: ✅ TRUE / ❌ FALSE  ← 这个应该是 TRUE
userProfile.role: super_admin / null
userProfile.is_active: ✅ true / ❌ false

Direct Query:
profile.role: super_admin / null
profile.is_active: ✅ true / ❌ false
Computed isSuperAdmin: ✅ TRUE / ❌ FALSE

Expected:
• isSuperAdmin should be TRUE
• role should be 'super_admin'
• is_active should be true
```

### 步骤 4: 分析结果

**情况 A：所有值都正确**
- isSuperAdmin: ✅ TRUE
- role: super_admin
- is_active: ✅ true

→ 但还是看不到用户管理图标？
→ 可能是浏览器缓存问题，尝试：
  1. 完全刷新（Ctrl + Shift + R）
  2. 清除浏览器缓存
  3. 使用无痕模式

**情况 B：isSuperAdmin 是 FALSE**
- role 是 null 或 'user'
- 或 is_active 是 false

→ 数据库查询有问题，检查：
  1. RLS 策略是否正确
  2. user_profiles 表的数据
  3. 浏览器控制台错误

**情况 C：Direct Query 正确，但 Context State 错误**
- Direct Query 显示 super_admin
- 但 Context State 显示 null 或 false

→ 状态更新有问题，尝试：
  1. 点击调试面板的"刷新页面"按钮
  2. 登出后重新登录

---

## 🔧 常见问题修复

### 问题 1: RLS 策略阻止查询

如果调试面板显示 `role: null`，可能是 RLS 策略问题。

**临时解决方案（仅用于调试）：**

在 Supabase SQL Editor 中运行：

```sql
-- 临时禁用 RLS（仅用于测试）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 测试完成后记得重新启用
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

然后刷新页面，看调试面板是否显示正确的角色。

### 问题 2: 数据不一致

验证数据库数据：

```sql
-- 查看你的用户 profile
SELECT 
    u.id,
    u.email,
    p.role,
    p.is_active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = '1211574210@qq.com';
```

应该看到：
- role: super_admin
- is_active: true

### 问题 3: 浏览器缓存

1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

---

## 📸 截图调试面板

请截图调试面板的内容，这样我可以帮你分析问题。

特别注意：
- `isSuperAdmin` 的值
- `userProfile.role` 的值
- `Direct Query` 部分的值

---

## ✅ 预期结果

调试面板应该显示：

```
Context State:
isSuperAdmin: ✅ TRUE
userProfile.role: super_admin
userProfile.is_active: ✅ true

Direct Query:
profile.role: super_admin
profile.is_active: ✅ true
Computed isSuperAdmin: ✅ TRUE
```

如果看到这些值，Header 应该显示：
- 你的邮箱
- "管理员" 紫色标签
- 紫色的 Users 图标

---

## 🗑️ 移除调试面板

问题解决后，可以移除调试面板：

1. 打开 `features/layout/components/AppLayout.tsx`
2. 删除或注释掉这两行：
   ```tsx
   import { AuthDebugPanel } from '../../core/components/AuthDebugPanel';
   // ...
   <AuthDebugPanel />
   ```

---

## 📞 需要帮助？

如果调试面板显示异常值，请：
1. 截图调试面板
2. 告诉我显示的具体内容
3. 我会帮你进一步排查

🔍 让我们一起找出问题所在！
