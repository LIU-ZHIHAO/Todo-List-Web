
**Prerequisites:**  Node.js (Version 18 or higher recommended)
## Node.js Deployment

To deploy the application for production:

1. **Build the project**
   ```bash
   npm run build
   ```
   This will create a `dist` directory containing the optimized static files.

2. **Serve the Application**
   Since this is a client-side application, you can serve the `dist` folder using any static file server.

   **Using Node.js `serve`:**
   ```bash
   # Install serve globally
   npm install -g serve

   # Serve the build folder
   serve -s dist
   ```

   **Using PM2 (for persistent deployment):**
   ```bash
   # Install pm2 and serve
   npm install -g pm2 serve

   # Start the application
   pm2 start serve --name "todo-app" -- -s dist
   ```


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

Copy the content of `supabase/migrations/init_schema.sql` and run it.

This script will:
1. Initialize the database schema (tables).
2. Enable Row Level Security (RLS) and policies.
3. Create necessary RPC functions (with correct permissions and search paths).
4. Grant necessary permissions to roles.

### 3. Create First Admin User

Since the `create_user_by_admin` function requires an existing admin to execute, you need to create the first admin user manually via SQL.

Copy the content of `supabase/migrations/seed_admin.sql` and run it in the Supabase SQL Editor.

This will create a super admin user with:
- **Username:** `admin`
- **Email:** `admin@antigravity.app`
- **Password:** `adminadmin`

After running this, you can log in with these credentials and create other users.

After running this, you can log in with `admin` / `adminadmin` and create other users.

友情打赏：
![eeed259e380356d455cffbca47f1d671](https://github.com/user-attachments/assets/f9bdc76f-d2e1-4662-b38b-141a45916fea)

