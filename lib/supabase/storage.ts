import {
  PRODUCT_IMAGES_BUCKET,
  SKU_IMAGES_BUCKET,
} from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase";

export type StorageBucket =
  | typeof PRODUCT_IMAGES_BUCKET
  | typeof SKU_IMAGES_BUCKET;

/**
 * 多租户上传路径：{userId}/{fileName}
 * Storage RLS 需限制用户只能读写自己 uid 前缀下的对象。
 */
export function buildTenantStoragePath(userId: string, fileName: string) {
  const safeName = fileName.replace(/[/\\]/g, "_");
  return `${userId}/${Date.now()}-${safeName}`;
}

export async function uploadTenantImage(
  bucket: StorageBucket,
  userId: string,
  file: File,
) {
  const supabase = createClient();
  const path = buildTenantStoragePath(userId, file.name);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { path, publicUrl };
}
