"use client";

import { useRef } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTenantImageUpload } from "@/hooks/use-tenant-image-upload";
import { ALLOWED_IMAGE_EXTENSIONS } from "@/lib/upload/constants";
import type { StorageBucket } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type ImageUploaderProps = {
  bucket: StorageBucket;
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
};

export function ImageUploader({
  bucket,
  value,
  onChange,
  label = "上传图片",
  description = "支持 JPG、PNG、WebP、GIF，最大 5MB",
  disabled = false,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error, clearError } = useTenantImageUpload(bucket);

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    clearError();

    try {
      const publicUrl = await upload(file);
      onChange(publicUrl);
      toast({ title: "上传成功", description: "图片已保存到 Storage" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: err instanceof Error ? err.message : "请稍后重试",
      });
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleRemove() {
    onChange(null);
    clearError();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const isDisabled = disabled || isUploading;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <p className="text-sm font-medium leading-none">{label}</p>
      ) : null}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_EXTENSIONS}
        className="sr-only"
        disabled={isDisabled}
        onChange={(e) => void handleFileChange(e.target.files)}
      />

      {value ? (
        <div className="relative inline-block">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="预览"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-7 w-7 rounded-full shadow"
            disabled={isDisabled}
            onClick={handleRemove}
            aria-label="移除图片"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-32 w-full max-w-xs flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 transition-colors",
            "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isDisabled && "cursor-not-allowed opacity-60",
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">上传中…</span>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">点击选择图片</span>
              <span className="text-xs text-muted-foreground">
                将上传至您的租户目录
              </span>
            </>
          )}
        </button>
      )}

      {value && !isUploading ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          更换图片
        </Button>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
