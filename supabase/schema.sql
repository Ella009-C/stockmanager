-- 在 Supabase SQL Editor 中执行，用于本地开发与联调

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.skus (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku_code text not null unique,
  attributes jsonb not null default '{}'::jsonb,
  stock_quantity integer not null default 0 check (stock_quantity >= 0)
);

create index if not exists skus_product_id_idx on public.skus (product_id);

create type public.inventory_movement_type as enum ('INBOUND', 'OUTBOUND');

create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  sku_id uuid not null references public.skus (id) on delete cascade,
  type public.inventory_movement_type not null,
  quantity integer not null check (quantity > 0),
  previous_stock integer not null,
  new_stock integer not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists inventory_logs_sku_created_idx
  on public.inventory_logs (sku_id, created_at desc);

-- 库存变动 RPC（第二步库存操作台将调用）
create or replace function public.process_inventory_transaction(
  p_sku_id uuid,
  p_operation_type public.inventory_movement_type,
  p_quantity integer,
  p_operator text default null,
  p_notes text default null
)
returns public.inventory_logs
language plpgsql
security definer
as $$
declare
  v_previous integer;
  v_new integer;
  v_log public.inventory_logs;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be a positive integer';
  end if;

  select stock_quantity into v_previous
  from public.skus
  where id = p_sku_id
  for update;

  if not found then
    raise exception 'SKU not found: %', p_sku_id;
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
    sku_id, type, quantity, previous_stock, new_stock, notes
  )
  values (
    p_sku_id, p_operation_type, p_quantity, v_previous, v_new, p_notes
  )
  returning * into v_log;

  return v_log;
end;
$$;

-- RLS 示例（按项目需求调整；开发阶段可先放开）
alter table public.products enable row level security;
alter table public.skus enable row level security;
alter table public.inventory_logs enable row level security;

create policy "Allow anon read write products" on public.products
  for all using (true) with check (true);

create policy "Allow anon read write skus" on public.skus
  for all using (true) with check (true);

create policy "Allow anon read inventory_logs" on public.inventory_logs
  for select using (true);
