"use client";

import { useCallback, useState } from "react";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/upload/constants";
import {
  uploadTenantImage,
  type StorageBucket,
} from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/client";

function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "仅支持 JPG、PNG、WebP、GIF 格式";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "图片大小不能超过 5MB";
  }
  return null;
}

export function useTenantImageUpload(bucket: StorageBucket) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string> => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        throw new Error(validationError);
      }

      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const message = "请先登录后再上传图片";
        setError(message);
        throw new Error(message);
      }

      setIsUploading(true);
      setError(null);

      try {
        const { publicUrl } = await uploadTenantImage(bucket, user.id, file);
        return publicUrl;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "图片上传失败，请重试";
        setError(message);
        throw new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [bucket],
  );

  const clearError = useCallback(() => setError(null), []);

  return { upload, isUploading, error, clearError };
}
