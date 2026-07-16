import Check from "lucide-react/dist/esm/icons/check.mjs";
import Copy from "lucide-react/dist/esm/icons/copy.mjs";
import { useEffect, useState } from "react";

export default function CodePanel({ code }) {
  const [copyState, setCopyState] = useState("idle");

  useEffect(() => {
    if (copyState === "idle") return undefined;
    const timeout = window.setTimeout(() => setCopyState("idle"), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className="code-panel">
      <div className="code-toolbar">
        <span>Python</span>
        <button type="button" onClick={copyCode} aria-label="复制 Python 代码">
          {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copyState === "copied" ? "已复制" : copyState === "failed" ? "请选择代码复制" : "复制"}
        </button>
      </div>
      <pre tabIndex="0">
        <code>{code}</code>
      </pre>
    </div>
  );
}
