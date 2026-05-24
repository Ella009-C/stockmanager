import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">产品与 SKU 录入</h1>
        <p className="text-muted-foreground">
          创建产品并同时录入多个 SKU，数据将写入您租户下的 products 与 skus 表。
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
