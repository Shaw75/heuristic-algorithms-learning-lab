import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check-big.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import XCircle from "lucide-react/dist/esm/icons/circle-x.mjs";
import { useEffect, useState } from "react";

export default function QuizCheck({ lessonId, quiz, accent }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
  }, [lessonId]);

  if (!quiz) return null;

  const isCorrect = selected === quiz.answer;

  const reset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <section className="knowledge-check" style={{ "--accent": accent }} aria-labelledby={`${lessonId}-quiz-title`}>
      <header>
        <span>09</span>
        <div>
          <h2 id={`${lessonId}-quiz-title`}>一分钟自测</h2>
          <p>能答对，才算真正把这一页的核心逻辑串起来。</p>
        </div>
      </header>

      <fieldset>
        <legend>{quiz.question}</legend>
        <div className="quiz-options">
          {quiz.options.map((option, index) => (
            <label className={selected === index ? "is-selected" : ""} key={option}>
              <input
                type="radio"
                name={`${lessonId}-quiz`}
                value={index}
                checked={selected === index}
                onChange={() => {
                  setSelected(index);
                  setSubmitted(false);
                }}
              />
              <span>{String.fromCharCode(65 + index)}</span>
              <strong>{option}</strong>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="quiz-actions">
        <button type="button" className="check-answer" disabled={selected === null} onClick={() => setSubmitted(true)}>
          检查答案
        </button>
        {submitted ? (
          <button type="button" className="reset-answer" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            再答一次
          </button>
        ) : null}
      </div>

      <div className={`quiz-feedback ${submitted ? "is-visible" : ""} ${isCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
        {submitted ? (
          <>
            {isCorrect ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
            <div>
              <strong>{isCorrect ? "答对了" : "再想一步"}</strong>
              <p>{quiz.explanation}</p>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
