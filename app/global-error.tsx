"use client";

import { useEffect } from "react";

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    console.error("GlobalError:", error);
  }, [error]);

  return (
    <html>
      <body style={{ padding: 24 }}>
        <h1>앱 오류가 발생했습니다.</h1>
        <p style={{ opacity: 0.7 }}>잠시 후 다시 시도해주세요.</p>
        <pre style={{ whiteSpace: "pre-wrap", opacity: 0.6 }}>
          {error.message}
          {"\n"}
          {error.digest ?? ""}
        </pre>
      </body>
    </html>
  );
};

export default GlobalError;
