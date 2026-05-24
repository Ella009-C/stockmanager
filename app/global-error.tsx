"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>应用发生错误</h1>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
            {error.message || "请检查 Supabase 环境变量是否已在 Vercel 中配置。"}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #ccc",
              cursor: "pointer",
              marginRight: 8,
            }}
          >
            重试
          </button>
          <a href="/login" style={{ fontSize: 14 }}>
            前往登录
          </a>
        </div>
      </body>
    </html>
  );
}
