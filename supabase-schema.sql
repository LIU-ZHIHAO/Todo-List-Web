-- Supabase 数据库表结构
-- 用于 Todo List 应用的多设备数据同步

-- ============================================
-- 1. tasks 表 - 存储所有任务
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  date TEXT NOT NULL,
  quadrant TEXT NOT NULL CHECK (quadrant IN ('Q1', 'Q2', 'Q3', 'Q4')),
  tag TEXT NOT NULL,
  completed TEXT,  -- ISO date string or NULL
  completed_at BIGINT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at BIGINT NOT NULL,
  "order" BIGINT NOT NULL,
  is_overdue BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tasks 表索引
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_quadrant ON tasks(quadrant);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

-- tasks 表触发器 - 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- ============================================
-- 2. quick_notes 表 - 存储快速笔记
-- ============================================
CREATE TABLE IF NOT EXISTS quick_notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  linked_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  is_starred BOOLEAN DEFAULT false,
  color TEXT,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- quick_notes 表索引
CREATE INDEX IF NOT EXISTS idx_quick_notes_created_at ON quick_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_quick_notes_linked_task ON quick_notes(linked_task_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_is_starred ON quick_notes(is_starred);
CREATE INDEX IF NOT EXISTS idx_quick_notes_updated_at ON quick_notes(updated_at);

-- quick_notes 表触发器 - 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_quick_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quick_notes_updated_at_trigger
  BEFORE UPDATE ON quick_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_notes_updated_at();

-- ============================================
-- 3. Row Level Security (RLS) 策略
-- ============================================
-- 注意: 这里使用匿名访问,所以允许所有操作
-- 在生产环境中,应该根据用户认证添加更严格的策略

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户的所有操作 (开发/测试环境)
CREATE POLICY "Allow all for anon users" ON tasks
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all for anon users" ON quick_notes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. 辅助函数
-- ============================================

-- 获取任务统计信息
CREATE OR REPLACE FUNCTION get_task_stats()
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  overdue_tasks BIGINT,
  tasks_by_quadrant JSONB
) AS $$
DECLARE
  v_total_tasks BIGINT;
  v_completed_tasks BIGINT;
  v_pending_tasks BIGINT;
  v_overdue_tasks BIGINT;
  v_tasks_by_quadrant JSONB;
BEGIN
  -- 获取总体统计
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE completed IS NOT NULL)::BIGINT,
    COUNT(*) FILTER (WHERE completed IS NULL)::BIGINT,
    COUNT(*) FILTER (WHERE is_overdue = true AND completed IS NULL)::BIGINT
  INTO v_total_tasks, v_completed_tasks, v_pending_tasks, v_overdue_tasks
  FROM tasks;

  -- 获取按象限分组的统计
  SELECT jsonb_object_agg(quadrant, task_count)
  INTO v_tasks_by_quadrant
  FROM (
    SELECT quadrant, COUNT(*)::BIGINT as task_count
    FROM tasks
    GROUP BY quadrant
  ) q;

  -- 返回结果
  RETURN QUERY SELECT v_total_tasks, v_completed_tasks, v_pending_tasks, v_overdue_tasks, v_tasks_by_quadrant;
END;
$$ LANGUAGE plpgsql;

-- 清理旧的已完成任务 (保留最近30天)
CREATE OR REPLACE FUNCTION cleanup_old_completed_tasks(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TEXT;
BEGIN
  -- 计算截止日期
  cutoff_date := TO_CHAR(CURRENT_DATE - days_to_keep, 'YYYY-MM-DD');
  
  -- 删除旧的已完成任务
  DELETE FROM tasks
  WHERE completed IS NOT NULL
    AND completed < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. 示例数据 (可选)
-- ============================================
-- 取消注释以插入示例数据

/*
INSERT INTO tasks (id, title, description, date, quadrant, tag, completed, progress, created_at, "order")
VALUES
  ('demo-1', '完成项目文档', '编写项目的技术文档和用户手册', '2025-11-25', 'Q1', '工作', NULL, 50, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000),
  ('demo-2', '学习 React 新特性', '研究 React 19 的新功能', '2025-11-26', 'Q2', '学习', NULL, 20, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000),
  ('demo-3', '团队会议', '每周例会讨论项目进度', '2025-11-23', 'Q3', '工作', '2025-11-23', 100, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000);

INSERT INTO quick_notes (id, content, created_at, tags, is_starred)
VALUES
  ('note-1', '记得明天带笔记本电脑充电器', EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, ARRAY['提醒'], true),
  ('note-2', '项目想法: 开发一个时间管理工具', EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, ARRAY['想法', '项目'], false);
*/

-- ============================================
-- 完成
-- ============================================
-- 数据库表结构创建完成!
-- 
-- 使用说明:
-- 1. 在 Supabase Dashboard 中执行此 SQL
-- 2. 确认表和索引已创建
-- 3. 测试 RLS 策略是否正常工作
-- 4. 在应用中测试数据同步功能
