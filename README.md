# 库存管理系统 (Stock Manager)

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Shadcn UI + Supabase

## 目录结构

详见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

```
stockmanager/
├── app/
│   ├── layout.tsx                   # 根布局 + Toaster
│   ├── (auth)/login/                # 登录页
│   ├── auth/callback/               # OAuth 回调
│   └── (dashboard)/                 # 后台（需登录）
│       └── products/new/
├── components/
│   ├── layout/
│   │   ├── app-sidebar.tsx          # 左侧导航
│   │   └── dashboard-shell.tsx      # 后台布局壳
│   ├── products/
│   │   └── product-form.tsx         # 动态 SKU 表单
│   └── ui/                          # Shadcn UI 组件
├── config/
│   └── navigation.ts                # 导航配置
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils.ts
│   └── validations/product.ts
├── types/database.ts
└── supabase/schema.sql              # Supabase 表结构与 RPC
```

## 本地启动

```bash
cp .env.local.example .env.local
# 填入 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
# 在 Supabase SQL Editor 执行 supabase/schema.sql

npm run dev
```

访问 [http://localhost:3000/products/new](http://localhost:3000/products/new)

## Supabase 配置

1. Authentication → 启用 **Google** Provider，Redirect URL 添加：`http://localhost:3000/auth/callback`
2. SQL Editor 执行 `supabase/schema-multitenant.sql`（多租户 RLS + Storage + RPC）
3. 若表已存在，请按脚本中的 `alter table` 迁移

## 当前进度

- [x] 登录页 + 路由守卫（Middleware）
- [x] Sidebar 用户 Profile + 退出登录
- [x] 产品与 SKU 录入页（含 `user_id` 写入）
- [x] 产品/SKU 图片上传
- [ ] 库存操作台 (`/inventory/operate`)
- [ ] 库存明细与日志 (`/inventory/logs`)
# stockmanager
