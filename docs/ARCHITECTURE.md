# 多租户库存系统 — 目录与数据流

## 我对多租户 RLS 与图片上传的理解

### 多租户 RLS

- **租户键**：`auth.uid()`，即 Supabase 登录用户的 UUID。
- **业务表**（`products`、`skus`、`inventory_logs`）均增加 `user_id`，与 `auth.users.id` 对齐。
- **RLS 策略**：`using (user_id = auth.uid())` / `with check (user_id = auth.uid())`，保证用户只能读写自己的行。
- **RPC** `process_inventory_transaction`：接收 `p_user_id`，在函数内校验 `p_user_id = auth.uid()`，且 SKU 属于该用户后再改库存、写日志（`security definer` + 内部校验，避免越权）。

### 图片上传流程

1. 客户端用 **Browser Supabase Client** + 当前会话的 `user.id`。
2. 选择文件 → 上传到 Storage：
   - 产品主图：`product-images` bucket，路径 `{auth.uid()}/{timestamp}-{filename}`
   - SKU 图：`sku-images` bucket，路径同上。
3. Storage **RLS**：仅允许 `auth.uid()` 读写自己前缀下的对象（`storage.foldername(name)[1] = auth.uid()::text`）。
4. 上传成功后 `getPublicUrl`（或 signed URL）得到 `image_url`。
5. 创建产品时，将 **已上传的 URL** 随表单提交写入 `products.image_url`、`skus.image_url`（不在 Server Action 里再传 File）。

---

## 推荐目录结构

```
stockmanager/
├── app/
│   ├── layout.tsx                      # 根布局 + Toaster
│   ├── (auth)/
│   │   ├── layout.tsx                  # 居中登录布局（无 Sidebar）
│   │   └── login/page.tsx
│   ├── auth/callback/route.ts          # OAuth / 邮箱确认回调
│   └── (dashboard)/                    # 需登录的后台
│       ├── layout.tsx                  # 校验 session + DashboardShell
│       ├── page.tsx
│       ├── products/new/
│       │   ├── page.tsx
│       │   └── actions.ts
│       └── inventory/
│           ├── operate/page.tsx          # 待实现
│           └── logs/page.tsx             # 待实现
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── google-sign-in-button.tsx
│   ├── layout/
│   │   ├── app-sidebar.tsx
│   │   ├── dashboard-shell.tsx
│   │   └── sidebar-user-profile.tsx    # ✅ 已实现
│   ├── upload/                         # 下一步
│   │   ├── image-uploader.tsx            # 通用：选择文件、预览、上传状态
│   │   └── hooks/use-tenant-image-upload.ts
│   ├── products/
│   │   └── product-form.tsx            # 将接入 ImageUploader
│   └── ui/                             # Shadcn 组件
├── lib/
│   ├── auth/
│   │   ├── constants.ts                # 路径、bucket 名
│   │   └── session.ts                  # getCurrentUser()
│   └── supabase/
│       ├── client.ts                   # 浏览器（登录、上传、RPC）
│       ├── server.ts                   # Server Actions / RSC
│       ├── middleware.ts               # 刷新 session + 路由守卫
│       └── storage.ts                  # buildTenantStoragePath、uploadTenantImage
├── middleware.ts                       # 未登录 → /login；已登录访问 /login → 后台
├── supabase/
│   ├── schema.sql                      # 初始 schema（旧）
│   └── schema-multitenant.sql          # 多租户 + Storage + RPC
└── docs/ARCHITECTURE.md
```

---

## Supabase 客户端职责划分

| 场景 | 客户端 | 说明 |
|------|--------|------|
| 登录 / OAuth / 退出 | `lib/supabase/client.ts` | 浏览器，写 cookie |
| Middleware 刷新 session | `lib/supabase/middleware.ts` | Edge，同步 cookie |
| Server Action 写库 | `lib/supabase/server.ts` | 带 cookie 的 server client |
| Storage 上传 | `lib/supabase/client.ts` + `storage.ts` | 必须用浏览器 session |
| 库存 RPC | `lib/supabase/client.ts` 或 server | 传 `p_user_id: user.id` |

---

## 当前进度

- [x] 登录页（Google OAuth + 邮箱登录/注册）
- [x] Middleware 路由守卫
- [x] Sidebar 用户 Profile + 退出
- [x] 多租户 schema 脚本（待你在 Supabase 执行）
- [x] 产品/SKU 图片上传组件
- [ ] 库存操作台 RPC（含 `p_user_id`）
- [ ] 库存日志联表页
