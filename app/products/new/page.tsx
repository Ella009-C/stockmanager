import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">产品与 SKU 录入</h1>
        <p className="mt-1 text-muted-foreground">
          上传产品主图与 SKU 图片，支持动态添加多组 SKU，提交后写入 Supabase。
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
