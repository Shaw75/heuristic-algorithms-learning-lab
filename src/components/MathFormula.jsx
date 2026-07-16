import { renderToString } from "katex";

export default function MathFormula({ latex, inline = false, className = "", label }) {
  const html = renderToString(latex, {
    displayMode: !inline,
    throwOnError: false,
    strict: "ignore",
  });

  const Tag = inline ? "span" : "div";

  return (
    <Tag
      className={`math-formula ${inline ? "is-inline" : "is-display"} ${className}`.trim()}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

