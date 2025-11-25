import React from "react";
import { CheckIcon } from "./Icons";

export function ReadyPanel({ fileName, onStart, modelName = "AI" }) {
  return (
    <div className="card ready-card">
      <div className="ready-icon">
        <CheckIcon size={28} />
      </div>
      <h2>Ready to begin</h2>
      <p className="file-badge">{fileName}</p>
      <p className="model-badge">Using {modelName}</p>
      <p className="hint">
        The AI will ask 3 questions about your work. Speak naturally and answer each question.
      </p>
      <button type="button" className="btn btn-primary btn-large" onClick={onStart}>
        Start Q&A
      </button>
    </div>
  );
}
