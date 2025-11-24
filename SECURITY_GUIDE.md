# 🔐 Supabase 安全配置指南

## ⚠️ 当前安全问题

**严重**: 当前配置允许任何人访问和修改数据库中的所有数据！

## 🛡️ 推荐的安全方案

### 方案一：添加用户认证（推荐）

#### 1. 启用 Supabase Auth

在 Supabase Dashboard 中：
1. 进入 **Authentication** → **Providers**
2. 启用以下任一认证方式：
   - Email/Password
   - Google OAuth
   - GitHub OAuth
   - 其他第三方登录

#### 2. 修改数据库表结构

在 Supabase SQL Editor 中执行：

```sql
-- 为 tasks 表添加 user_id 字段
ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 为 quick_notes 表添加 user_id 字段
ALTER TABLE quick_notes ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 为现有数据设置默认 user_id（可选，仅用于迁移）
-- UPDATE tasks SET user_id = '你的用户ID';
-- UPDATE quick_notes SET user_id = '你的用户ID';
```

#### 3. 更新 RLS 策略

**删除旧的不安全策略：**

```sql
-- 删除旧策略
DROP POLICY IF EXISTS "Allow all for anon users" ON tasks;
DROP POLICY IF EXISTS "Allow all for anon users" ON quick_notes;
```

**创建基于用户的安全策略：**

```sql
-- Tasks 表策略 - 用户只能访问自己的数据
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Quick Notes 表策略 - 用户只能访问自己的数据
CREATE POLICY "Users can view own notes" ON quick_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON quick_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON quick_notes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON quick_notes
  FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4. 更新前端代码

需要修改以下文件以支持用户认证：

**a. 创建认证服务** (`features/core/services/auth.ts`):

```typescript
import { supabase } from './supabase';

export const authService = {
  // 注册
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // 登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // 监听认证状态变化
  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
};
```

**b. 修改数据库操作** (`features/core/services/db.ts`):

在所有数据库操作中添加 `user_id`:

```typescript
// 示例：创建任务时添加 user_id
export const addTask = async (task: Task): Promise<void> => {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const taskWithUserId = {
    ...task,
    user_id: user.id  // 添加 user_id
  };

  // 保存到 IndexedDB
  await db.tasks.add(taskWithUserId);

  // 同步到 Supabase
  if (navigator.onLine) {
    const { error } = await supabase
      .from('tasks')
      .insert([taskWithUserId]);
    
    if (error) console.error('Supabase sync error:', error);
  }
};
```

---

### 方案二：使用设备 ID（临时方案，不推荐）

如果暂时不想实现用户认证，可以使用设备 ID 进行基本隔离：

#### 1. 生成设备 ID

```typescript
// features/core/utils/deviceId.ts
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
};
```

#### 2. 修改数据库表

```sql
ALTER TABLE tasks ADD COLUMN device_id TEXT;
ALTER TABLE quick_notes ADD COLUMN device_id TEXT;

-- 更新 RLS 策略
DROP POLICY IF EXISTS "Allow all for anon users" ON tasks;

CREATE POLICY "Users can access own device data" ON tasks
  FOR ALL
  TO anon
  USING (device_id = current_setting('app.device_id', true))
  WITH CHECK (device_id = current_setting('app.device_id', true));
```

⚠️ **注意**: 这个方案不安全，因为：
- 设备 ID 可以被伪造
- 清除浏览器缓存会丢失数据访问权限
- 不适合生产环境

---

## 🚨 立即采取的临时措施

在实施完整方案之前，建议：

### 1. 限制 Anon Key 权限

在 Supabase Dashboard 中：
1. 进入 **Settings** → **API**
2. 考虑重新生成 `anon` key
3. 在 **Database** → **Policies** 中暂时禁用公开访问

### 2. 添加 IP 白名单（如果可能）

在 Supabase 项目设置中限制访问 IP

### 3. 监控数据库访问

在 Supabase Dashboard 中：
1. 进入 **Database** → **Logs**
2. 监控异常访问

---

## 📋 实施检查清单

- [ ] 启用 Supabase Auth
- [ ] 添加 user_id 字段到所有表
- [ ] 更新 RLS 策略
- [ ] 创建认证服务
- [ ] 修改前端代码添加登录/注册功能
- [ ] 更新所有数据库操作以包含 user_id
- [ ] 测试用户隔离
- [ ] 删除旧的不安全策略
- [ ] 更新文档

---

## 🔍 安全检查

执行以下 SQL 验证安全配置：

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 查看当前策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- 测试匿名访问（应该返回空或错误）
SELECT * FROM tasks LIMIT 1;
```

---

## 📚 参考资料

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Row Level Security 最佳实践](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase 安全指南](https://supabase.com/docs/guides/platform/going-into-prod)
