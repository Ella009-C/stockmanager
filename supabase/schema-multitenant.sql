-- 多租户库存系统：在 Supabase SQL Editor 执行
-- 若已有旧表，请先备份；本脚本面向新环境或迁移时按需调整

-- ---------------------------------------------------------------------------
-- 1. 业务表增加 user_id 与图片字段
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists user_id uuid references auth.users (id) on delete cascade,
  add column if not exists image_url text;

alter table public.skus
  add column if not exists user_id uuid references auth.users (id) on delete cascade,
  add column if not exists image_url text;

alter table public.inventory_logs
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- 若 sku_code 需租户内唯一而非全局唯一，可改为：
-- create unique index skus_user_sku_code_uidx on public.skus (user_id, sku_code);

create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists skus_user_id_idx on public.skus (user_id);
create index if not exists inventory_logs_user_id_idx on public.inventory_logs (user_id);

-- ---------------------------------------------------------------------------
-- 2. RLS：仅允许访问自己的数据
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.skus enable row level security;
alter table public.inventory_logs enable row level security;

drop policy if exists "Allow anon read write products" on public.products;
drop policy if exists "Allow anon read write skus" on public.skus;
drop policy if exists "Allow anon read inventory_logs" on public.inventory_logs;

create policy "products_tenant_isolation" on public.products
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "skus_tenant_isolation" on public.skus
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "inventory_logs_tenant_select" on public.inventory_logs
  for select
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Storage Buckets（在 Dashboard 创建 bucket 后执行策略）
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('sku-images', 'sku-images', true)
on conflict (id) do nothing;

create policy "product_images_tenant_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "product_images_tenant_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "product_images_tenant_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "sku_images_tenant_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'sku-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "sku_images_tenant_select"
on storage.objects for select to authenticated
using (
  bucket_id = 'sku-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "sku_images_tenant_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'sku-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- 4. 库存 RPC（含 p_user_id 校验）
-- ---------------------------------------------------------------------------

create or replace function public.process_inventory_transaction(
  p_user_id uuid,
  p_sku_id uuid,
  p_operation_type public.inventory_movement_type,
  p_quantity integer,
  p_operator text default null,
  p_notes text default null
)
returns public.inventory_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous integer;
  v_new integer;
  v_log public.inventory_logs;
  v_sku_user_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'unauthorized: p_user_id must match authenticated user';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be a positive integer';
  end if;

  select stock_quantity, user_id
  into v_previous, v_sku_user_id
  from public.skus
  where id = p_sku_id
  for update;

  if not found then
    raise exception 'SKU not found: %', p_sku_id;
  end if;

  if v_sku_user_id <> p_user_id then
    raise exception 'forbidden: SKU does not belong to user';
  end if;

  if p_operation_type = 'INBOUND' then
    v_new := v_previous + p_quantity;
  else
    v_new := v_previous - p_quantity;
    if v_new < 0 then
      raise exception 'insufficient stock for SKU %', p_sku_id;
    end if;
  end if;

  update public.skus
  set stock_quantity = v_new
  where id = p_sku_id;

  insert into public.inventory_logs (
    sku_id, user_id, type, quantity, previous_stock, new_stock, notes
  )
  values (
    p_sku_id, p_user_id, p_operation_type, p_quantity, v_previous, v_new, p_notes
  )
  returning * into v_log;

  return v_log;
end;
$$;

grant execute on function public.process_inventory_transaction(
  uuid, uuid, public.inventory_movement_type, integer, text, text
) to authenticated;
