export default function FrameworkTimeline({ steps, accent }) {
  return (
    <ol className="framework-timeline" style={{ "--accent": accent }}>
      {steps.map(([title, description], index) => (
        <li key={title}>
          <span>{index + 1}</span>
          <div>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
