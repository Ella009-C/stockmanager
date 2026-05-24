"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  attributePairsToJson,
  createProductFormSchema,
  type CreateProductFormValues,
} from "@/lib/validations/product";
import type { Database } from "@/types/database";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type SkuInsert = Database["public"]["Tables"]["skus"]["Insert"];

function normalizeImageUrl(url?: string | null) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : null;
}

export type CreateProductResult =
  | { success: true; productId: string }
  | { success: false; error: string };

export async function createProductWithSkus(
  values: CreateProductFormValues,
): Promise<CreateProductResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "未登录，请先登录" };
  }

  const parsed = createProductFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "表单校验失败",
    };
  }

  const { name, description, imageUrl, skus } = parsed.data;

  const skuCodes = skus.map((s) => s.skuCode);
  if (new Set(skuCodes).size !== skuCodes.length) {
    return { success: false, error: "SKU 编号不能重复" };
  }

  const supabase = await createClient();

  const productPayload: ProductInsert = {
    name,
    description: description?.trim() ? description.trim() : null,
    image_url: normalizeImageUrl(imageUrl),
    user_id: user.id,
  };

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productPayload)
    .select("id")
    .single();

  if (productError || !product) {
    return {
      success: false,
      error: productError?.message ?? "创建产品失败",
    };
  }

  const skuRows: SkuInsert[] = skus.map((sku) => ({
    product_id: product.id,
    user_id: user.id,
    sku_code: sku.skuCode,
    image_url: normalizeImageUrl(sku.imageUrl),
    attributes: attributePairsToJson(sku.attributePairs),
    stock_quantity: sku.stockQuantity,
  }));

  const { error: skuError } = await supabase.from("skus").insert(skuRows);

  if (skuError) {
    await supabase.from("products").delete().eq("id", product.id);
    return {
      success: false,
      error:
        skuError.code === "23505"
          ? "SKU 编号已存在，请更换后重试"
          : skuError.message,
    };
  }

  revalidatePath("/products/new");
  return { success: true, productId: product.id };
}
