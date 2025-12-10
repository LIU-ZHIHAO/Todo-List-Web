
# ZhiHao Todo List / 志豪矩阵待办清单

[中文](#中文) | [English](#english)

---

## 中文

这是一个现代、高效的待办事项应用，基于艾森豪威尔矩阵方法，帮助您有效地排列任务优先级。

### 🚀 部署指南

本项目设计为可通过 **Vercel**（前端）和 **Supabase**（数据库）轻松部署。

#### 先决条件

在开始之前，请确保您拥有以下账户：
- [GitHub](https://github.com/)
- [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/)

#### 步骤 1: Supabase 设置 (数据库)

1.  **创建项目**:
    - 登录 Supabase 仪表板并创建一个新项目。
    - 记下您的数据库密码。

2.  **获取环境变量**:
    - 转到 **Project Settings (项目设置)** -> **API**。
    - 复制 `Project URL` 和 `anon public` 密钥。您将在 Vercel 中使用这些。

3.  **初始化数据库**:
    - 在左侧边栏中转到 **SQL Editor (SQL 编辑器)**。
    - 点击 **New Query (新建查询)**。
    - 打开此存储库中的 `supabase/migrations/init_schema.sql` 文件，复制其全部内容，粘贴到 SQL 编辑器中，然后点击 **Run (运行)**。
    - 这将设置必要的表、行级安全 (RLS) 策略和权限。

4.  **创建管理员用户**:
    - 在 SQL 编辑器中，创建另一个 **New Query (新建查询)**。
    - 打开 `supabase/migrations/seed_admin.sql`，复制内容，粘贴并点击 **Run (运行)**。
    - 这将创建一个默认管理员用户：
        - **邮箱**: `admin@antigravity.app`
        - **密码**: `adminadmin`

#### 步骤 2: Vercel 设置 (前端)

1.  **导入项目**:
    - 登录 Vercel 并点击 **Add New ...** -> **Project**。
    - 选择包含此项目的 GitHub 存储库，然后点击 **Import (导入)**。

2.  **配置环境变量**:
    - 在配置页面上，展开 **Environment Variables (环境变量)** 部分。
    - 使用从 Supabase 获取的值添加以下变量：
        - `VITE_SUPABASE_URL`: 您的 Supabase 项目 URL。
        - `VITE_SUPABASE_ANON_KEY`: 您的 Supabase Anon Public Key。

3.  **部署**:
    - 点击 **Deploy (部署)**。
    - Vercel 将构建并部署您的应用程序。完成后，您将获得一个访问应用程序的实时 URL。

#### 步骤 3: 本地开发 (可选)

如果您想在本地运行项目：

1.  **克隆存储库**:
    ```bash
    git clone <your-repo-url>
    cd Todo-List-Web
    ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **配置环境**:
    - 在根目录下创建一个 `.env` 文件。
    - 添加您的 Supabase 凭据：
      ```env
      VITE_SUPABASE_URL=your_supabase_project_url
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
      ```

4.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

### 🛠 技术栈

- **前端**: React, TypeScript, Vite, Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **状态管理**: React Hooks
- **图标**: Lucide React

---

友情打赏：
![eeed259e380356d455cffbca47f1d671](https://github.com/user-attachments/assets/f9bdc76f-d2e1-4662-b38b-141a45916fea)

## English

A modern, efficient Todo List application based on the Eisenhower Matrix method to help you prioritize tasks effectively.

### 🚀 Deployment Guide

This project is designed to be easily deployed using **Vercel** (for the frontend) and **Supabase** (for the database).

#### Prerequisites

Before you begin, ensure you have accounts on:
- [GitHub](https://github.com/)
- [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/)

#### Step 1: Supabase Setup (Database)

1.  **Create a Project**:
    - Log in to your Supabase Dashboard and create a new project.
    - Note down your database password.

2.  **Get Environment Variables**:
    - Go to **Project Settings** -> **API**.
    - Copy the `Project URL` and `anon public` key. You will need these for Vercel.

3.  **Initialize Database**:
    - Go to the **SQL Editor** in the left sidebar.
    - Click **New Query**.
    - Open the file `supabase/migrations/init_schema.sql` from this repository, copy its entire content, paste it into the SQL Editor, and click **Run**.
    - This sets up the necessary tables, Row Level Security (RLS) policies, and permissions.

4.  **Create Admin User**:
    - In the SQL Editor, create another **New Query**.
    - Open `supabase/migrations/seed_admin.sql`, copy the content, paste it, and click **Run**.
    - This creates a default admin user:
        - **Email**: `admin@antigravity.app`
        - **Password**: `adminadmin`

#### Step 2: Vercel Setup (Frontend)

1.  **Import Project**:
    - Log in to Vercel and click **Add New ...** -> **Project**.
    - Select your GitHub repository containing this project and clicked **Import**.

2.  **Configure Environment Variables**:
    - On the configuration page, expand the **Environment Variables** section.
    - Add the following variables using the values you got from Supabase:
        - `VITE_SUPABASE_URL`: Your Supabase Project URL.
        - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key.

3.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build and deploy your application. Once finished, you will get a live URL to access your app.

#### Step 3: Local Development (Optional)

If you want to run the project locally:

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd Todo-List-Web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    - Create a `.env` file in the root directory.
    - Add your Supabase credentials:
      ```env
      VITE_SUPABASE_URL=your_supabase_project_url
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
      ```

4.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

### 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Icons**: Lucide React
