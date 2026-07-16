import { comparisonRows, lessons } from "../data/lessonData";

const accentById = Object.fromEntries(lessons.map(({ id, accent }) => [id, accent]));

export default function AlgorithmComparison({ compact = false }) {
  return (
    <div className={`comparison-wrap ${compact ? "is-compact" : ""}`}>
      <table>
        <thead>
          <tr>
            <th>算法</th>
            <th>灵感来源</th>
            <th>信息传递方式</th>
            <th>典型优势</th>
            <th>典型适用场景</th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <i style={{ background: accentById[row.id] }} />
                {row.name}
              </th>
              <td data-label="灵感来源">{row.inspiration}</td>
              <td data-label="信息传递">{row.transfer}</td>
              <td data-label="典型优势">{row.strength}</td>
              <td data-label="适用场景">{row.scenario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
