<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/10lTwc9da2ZP3gHrL0Qcm-i4u1GVh6vxZ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase Setup

https://supabase.com/ free to person,To run this project, you need to set up a Supabase project and configure the database.

### 1. Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
### 2. Database Initialization

Go to your Supabase Dashboard -> SQL Editor.

Copy the content of `supabase/migrations/20241125_01_init_schema.sql` and run it.

This script will:
1. Initialize the database schema (tables).
2. Enable Row Level Security (RLS) and policies.
3. Create necessary RPC functions (with correct permissions and search paths).
4. Grant necessary permissions to roles.

### 3. Create First Admin User

Since the `create_user_by_admin` function requires an existing admin to execute, you need to create the first admin user manually via SQL.

Copy the content of `supabase/migrations/20241125_02_seed_admin.sql` and run it in the Supabase SQL Editor.

This will create a super admin user with:
- **Username:** `admin`
- **Email:** `admin@antigravity.app`
- **Password:** `adminadmin`

After running this, you can log in with these credentials and create other users.

After running this, you can log in with `admin` / `adminadmin` and create other users.
