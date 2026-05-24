import { z } from "zod";

const attributePairSchema = z.object({
  key: z.string().trim().min(1, "规格名不能为空"),
  value: z.string().trim().min(1, "规格值不能为空"),
});

const optionalImageUrlSchema = z.union([
  z.string().url("图片地址无效"),
  z.literal(""),
  z.null(),
]);

export const skuFormSchema = z.object({
  imageUrl: optionalImageUrlSchema,
  skuCode: z
    .string()
    .trim()
    .min(1, "SKU 编号不能为空")
    .max(64, "SKU 编号过长"),
  stockQuantity: z.coerce
    .number()
    .int("库存必须为整数")
    .min(0, "初始库存不能为负数"),
  attributePairs: z.array(attributePairSchema),
});

export const createProductFormSchema = z.object({
  name: z.string().trim().min(1, "产品名称不能为空").max(200),
  description: z.string().trim().max(2000).optional(),
  imageUrl: optionalImageUrlSchema,
  skus: z.array(skuFormSchema).min(1, "至少添加一个 SKU"),
});

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;
export type SkuFormValues = z.infer<typeof skuFormSchema>;

export function attributePairsToJson(
  pairs: { key: string; value: string }[],
): Record<string, string> {
  return pairs.reduce<Record<string, string>>((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
}
