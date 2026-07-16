import { renderToString } from "katex";

function renderFormula(latex) {
  return {
    __html: renderToString(latex, {
      displayMode: true,
      throwOnError: true,
      strict: "ignore",
    }),
  };
}

export default function FormulaPanel({ title, formulas, callout }) {
  return (
    <div className="formula-panel">
      <h3>{title}</h3>
      {formulas.map(({ latex, note }) => (
        <div className="formula-unit" key={latex}>
          <div className="formula-scroll" dangerouslySetInnerHTML={renderFormula(latex)} />
          <p>{note}</p>
        </div>
      ))}
      {callout && <aside>{callout}</aside>}
    </div>
  );
}
