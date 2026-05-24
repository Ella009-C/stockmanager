"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { createProductWithSkus } from "@/app/(dashboard)/products/new/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/upload/image-uploader";
import {
  PRODUCT_IMAGES_BUCKET,
  SKU_IMAGES_BUCKET,
} from "@/lib/auth/constants";
import {
  createProductFormSchema,
  type CreateProductFormValues,
} from "@/lib/validations/product";

const defaultSku = (): CreateProductFormValues["skus"][number] => ({
  imageUrl: null,
  skuCode: "",
  stockQuantity: 0,
  attributePairs: [],
});

export function ProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: null,
      skus: [defaultSku()],
    },
  });

  const {
    fields: skuFields,
    append: appendSku,
    remove: removeSku,
  } = useFieldArray({
    control: form.control,
    name: "skus",
  });

  function onSubmit(values: CreateProductFormValues) {
    setSubmitError(null);
    setSubmitSuccess(null);

    startTransition(async () => {
      const result = await createProductWithSkus(values);

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      setSubmitSuccess(`产品创建成功（ID: ${result.productId}）`);
      form.reset({
        name: "",
        description: "",
        imageUrl: null,
        skus: [defaultSku()],
      });
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>产品信息</CardTitle>
            <CardDescription>填写产品基础信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUploader
                      bucket={PRODUCT_IMAGES_BUCKET}
                      label="产品主图"
                      description="上传后保存至 product-images/{您的用户ID}/..."
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：纯棉 T 恤" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="可选：材质、用途等说明"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">SKU 列表</h2>
              <p className="text-sm text-muted-foreground">
                支持动态添加多组 SKU，提交时批量写入 Supabase
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSku(defaultSku())}
            >
              <Plus className="h-4 w-4" />
              添加 SKU
            </Button>
          </div>

          {skuFields.map((skuField, skuIndex) => (
            <SkuCard
              key={skuField.id}
              skuIndex={skuIndex}
              canRemove={skuFields.length > 1}
              onRemove={() => removeSku(skuIndex)}
              form={form}
            />
          ))}
        </div>

        {submitError ? (
          <p className="text-sm font-medium text-destructive">{submitError}</p>
        ) : null}
        {submitSuccess ? (
          <p className="text-sm font-medium text-green-600">{submitSuccess}</p>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => form.reset()}
          >
            重置
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "提交中…" : "创建产品与 SKU"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

type SkuCardProps = {
  skuIndex: number;
  canRemove: boolean;
  onRemove: () => void;
  form: ReturnType<typeof useForm<CreateProductFormValues>>;
};

function SkuCard({ skuIndex, canRemove, onRemove, form }: SkuCardProps) {
  const {
    fields: attrFields,
    append: appendAttr,
    remove: removeAttr,
  } = useFieldArray({
    control: form.control,
    name: `skus.${skuIndex}.attributePairs`,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">SKU #{skuIndex + 1}</CardTitle>
          <CardDescription>编号唯一，规格以键值对存入 JSON</CardDescription>
        </div>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="删除此 SKU"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name={`skus.${skuIndex}.imageUrl`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ImageUploader
                  bucket={SKU_IMAGES_BUCKET}
                  label="SKU 图片"
                  description="上传后保存至 sku-images/{您的用户ID}/..."
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name={`skus.${skuIndex}.skuCode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU 编号 *</FormLabel>
                <FormControl>
                  <Input placeholder="例如：TSHIRT-WHT-M" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`skus.${skuIndex}.stockQuantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>初始库存</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={1} {...field} />
                </FormControl>
                <FormDescription>新建 SKU 时的起始库存数量</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>规格属性（JSON）</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAttr({ key: "", value: "" })}
            >
              <Plus className="h-4 w-4" />
              添加规格
            </Button>
          </div>

          {attrFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              暂无规格，可点击「添加规格」填写颜色、尺码等
            </p>
          ) : (
            <div className="space-y-2">
              {attrFields.map((attr, attrIndex) => (
                <div
                  key={attr.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <FormField
                    control={form.control}
                    name={`skus.${skuIndex}.attributePairs.${attrIndex}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="规格名，如 color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`skus.${skuIndex}.attributePairs.${attrIndex}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="规格值，如 白色" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0.5"
                    onClick={() => removeAttr(attrIndex)}
                    aria-label="删除规格"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
