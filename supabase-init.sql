-- ============================================
-- Supabase 数据库初始化脚本
-- Todo List 应用 - 多设备数据同步
-- ============================================

-- ============================================
-- 1. tasks 表 - 存储所有任务
-- ============================================
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  date TEXT NOT NULL,
  quadrant TEXT NOT NULL CHECK (quadrant IN ('Q1', 'Q2', 'Q3', 'Q4')),
  tag TEXT NOT NULL,
  completed TEXT,
  completed_at BIGINT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at BIGINT NOT NULL,
  "order" BIGINT NOT NULL,
  is_overdue BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_quadrant ON tasks(quadrant);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);

-- 自动更新 updated_at 的触发器函数
CREATE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER tasks_updated_at_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_tasks_updated_at();

-- ============================================
-- 2. quick_notes 表 - 存储快速笔记
-- ============================================
CREATE TABLE quick_notes (
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

-- 创建索引
CREATE INDEX idx_quick_notes_created_at ON quick_notes(created_at);
CREATE INDEX idx_quick_notes_linked_task ON quick_notes(linked_task_id);
CREATE INDEX idx_quick_notes_is_starred ON quick_notes(is_starred);
CREATE INDEX idx_quick_notes_updated_at ON quick_notes(updated_at);

-- 自动更新 updated_at 的触发器函数
CREATE FUNCTION update_quick_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER quick_notes_updated_at_trigger
  BEFORE UPDATE ON quick_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_quick_notes_updated_at();

-- ============================================
-- 3. 启用 Row Level Security (RLS)
-- ============================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_notes ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户访问 (开发环境)
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
CREATE FUNCTION get_task_stats()
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  overdue_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE completed IS NOT NULL)::BIGINT,
    COUNT(*) FILTER (WHERE completed IS NULL)::BIGINT,
    COUNT(*) FILTER (WHERE is_overdue = true AND completed IS NULL)::BIGINT
  FROM tasks;
END;
$$ LANGUAGE plpgsql;

-- 清理旧的已完成任务
CREATE FUNCTION cleanup_old_completed_tasks(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TEXT;
BEGIN
  cutoff_date := TO_CHAR(CURRENT_DATE - days_to_keep, 'YYYY-MM-DD');
  
  DELETE FROM tasks
  WHERE completed IS NOT NULL
    AND completed < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 完成!
-- ============================================
-- 
-- 验证命令:
-- SELECT * FROM tasks LIMIT 1;
-- SELECT * FROM quick_notes LIMIT 1;
-- SELECT * FROM get_task_stats();
