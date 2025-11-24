# 🔒 安全 RLS 配置指南

## 当前状态

- ❌ RLS 已禁用（临时调试）
- ⚠️ 数据暴露在互联网上，不安全

## 目标

- ✅ 启用 RLS
- ✅ 保持功能正常
- ✅ 确保数据安全

---

## 🚀 执行安全配置

### 步骤 1: 执行安全 RLS 脚本

1. 打开 Supabase Dashboard → SQL Editor
2. 打开 `supabase-secure-rls.sql` 文件
3. **复制全部内容**
4. 在 SQL Editor 中**粘贴并执行**

这个脚本会：
- ✅ 重新启用 RLS
- ✅ 删除所有旧策略
- ✅ 创建新的安全策略
- ✅ 验证配置

### 步骤 2: 验证功能

执行完成后，**刷新应用页面**，检查：

1. **登录功能** ✅
   - 可以正常登录

2. **查看自己的 profile** ✅
   - 调试面板显示正确的角色

3. **用户管理** ✅（仅超级管理员）
   - 可以查看所有用户
   - 可以创建新用户
   - 可以修改用户角色

4. **任务管理** ✅
   - 可以创建、查看、编辑、删除自己的任务
   - 看不到其他用户的任务

5. **笔记管理** ✅
   - 可以创建、查看、编辑、删除自己的笔记
   - 看不到其他用户的笔记

### 步骤 3: 安全测试

创建一个普通用户，测试数据隔离：

1. 用超级管理员登录
2. 创建一个新的普通用户
3. 登出，用新用户登录
4. 确认：
   - ❌ 看不到超级管理员的任务
   - ❌ 看不到超级管理员的笔记
   - ❌ 没有用户管理图标
   - ✅ 可以创建自己的任务和笔记

---

## 🔐 安全策略说明

### user_profiles 表

**用户权限：**
- ✅ 可以查看自己的 profile
- ❌ 不能查看其他用户的 profile
- ❌ 不能修改任何 profile

**超级管理员权限：**
- ✅ 可以查看所有用户的 profile
- ✅ 可以创建新用户的 profile
- ✅ 可以修改任何用户的 profile
- ✅ 可以删除用户的 profile

### tasks 表

**所有用户：**
- ✅ 只能查看自己的任务（`user_id = auth.uid()`）
- ✅ 只能创建自己的任务
- ✅ 只能修改自己的任务
- ✅ 只能删除自己的任务
- ❌ 完全看不到其他用户的任务

**额外检查：**
- ✅ 必须是活跃用户（`is_active = true`）
- ❌ 停用的用户无法访问任何数据

### quick_notes 表

**所有用户：**
- ✅ 只能查看自己的笔记（`user_id = auth.uid()`）
- ✅ 只能创建自己的笔记
- ✅ 只能修改自己的笔记
- ✅ 只能删除自己的笔记
- ❌ 完全看不到其他用户的笔记

**额外检查：**
- ✅ 必须是活跃用户（`is_active = true`）
- ❌ 停用的用户无法访问任何数据

---

## 🛡️ 安全特性

### 1. 用户隔离
- 每个用户只能访问自己的数据
- 数据库级别的强制隔离
- 即使前端被破解，也无法访问其他用户数据

### 2. 角色控制
- 超级管理员有额外的管理权限
- 普通用户只有基本权限
- 角色在数据库中验证，无法伪造

### 3. 活跃状态检查
- 停用的用户立即失去所有访问权限
- 无需等待 token 过期
- 管理员可以立即撤销访问

### 4. 认证要求
- 所有策略都要求 `authenticated` 角色
- 未登录用户无法访问任何数据
- 匿名访问完全被阻止

---

## 📊 策略对比

### 之前（不安全）
```sql
-- RLS 禁用
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```
- ❌ 任何已认证用户可以访问所有数据
- ❌ 没有数据隔离
- ❌ 不安全

### 现在（安全）
```sql
-- RLS 启用 + 严格策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```
- ✅ 用户只能访问自己的数据
- ✅ 完全的数据隔离
- ✅ 安全

---

## 🔍 验证安全性

### 测试 1: 尝试访问其他用户数据

在浏览器控制台运行：

```javascript
// 尝试获取所有用户（应该只返回自己）
const { data, error } = await supabase
  .from('user_profiles')
  .select('*');

console.log('Can see profiles:', data?.length);
// 普通用户应该只看到 1 个（自己）
// 超级管理员应该看到所有用户
```

### 测试 2: 尝试访问其他用户任务

```javascript
// 尝试获取所有任务（应该只返回自己的）
const { data, error } = await supabase
  .from('tasks')
  .select('*');

console.log('Can see tasks:', data?.length);
// 应该只看到自己的任务
```

### 测试 3: 停用用户测试

1. 用超级管理员停用一个用户
2. 该用户刷新页面
3. 应该无法加载任何数据

---

## ⚠️ 重要提示

### 不要禁用 RLS！

即使遇到问题，也不要禁用 RLS。正确的做法是：

1. 检查策略是否正确
2. 检查用户是否有 `is_active = true`
3. 检查 `user_id` 字段是否正确设置
4. 查看 Supabase 日志找出问题

### 定期审计

定期运行以下 SQL 检查安全配置：

```sql
-- 检查 RLS 状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 查看所有策略
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

---

## ✅ 完成检查清单

执行完安全配置后，确认：

- [ ] RLS 已在所有表上启用
- [ ] 可以正常登录
- [ ] 调试面板显示正确的角色
- [ ] 超级管理员可以访问用户管理
- [ ] 可以创建和查看自己的任务
- [ ] 可以创建和查看自己的笔记
- [ ] 创建普通用户测试数据隔离
- [ ] 普通用户看不到管理员的数据
- [ ] 普通用户没有用户管理图标

---

## 🎉 完成！

执行完 `supabase-secure-rls.sql` 后，你的系统将：

✅ 完全安全  
✅ 功能正常  
✅ 数据隔离  
✅ 可以安全地暴露在互联网上  

现在可以放心使用了！🔒
