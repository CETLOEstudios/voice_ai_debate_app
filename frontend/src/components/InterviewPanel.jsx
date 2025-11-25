import React from "react";
import { CheckIcon, SpeakerIcon, RetryIcon } from "./Icons";

export function InterviewPanel({
  questionNumber,
  currentQuestion,
  transcript,
  isListening,
  isSpeaking,
  isProcessing,
  micError,
  onFinishAnswer,
  onRepeatQuestion,
  onRetryAnswer,
}) {
  const hasAnswer = transcript.trim().length > 0;
  const canFinish = hasAnswer && isListening && !isSpeaking && !isProcessing;
  const canRepeat = !isSpeaking && !isProcessing;
  const canRetry = hasAnswer && isListening && !isSpeaking && !isProcessing;

  return (
    <div className="card interview-card">
      <div className="question-header">
        <span className="question-badge">Question {questionNumber}/3</span>
        {isSpeaking && <span className="status-badge speaking">AI Speaking</span>}
        {isListening && !isSpeaking && <span className="status-badge listening">Listening</span>}
        {isProcessing && <span className="status-badge processing">Processing</span>}
      </div>

      {currentQuestion && (
        <div className="current-question">
          <p className="question-text">{currentQuestion}</p>
          <button
            type="button"
            className="btn-icon repeat-btn"
            onClick={onRepeatQuestion}
            disabled={!canRepeat}
            title="Repeat question"
          >
            <SpeakerIcon size={18} />
          </button>
        </div>
      )}

      <div className="transcript-area">
        <p className="transcript-label">Your answer</p>
        <div className="transcript-content">
          {transcript || (isListening ? "Start speaking..." : "Waiting for AI...")}
        </div>
      </div>

      <div className="action-buttons">
        <button
          type="button"
          className="btn btn-finish"
          onClick={onFinishAnswer}
          disabled={!canFinish}
        >
          <CheckIcon />
          Done
        </button>

        <button
          type="button"
          className="btn btn-retry"
          onClick={onRetryAnswer}
          disabled={!canRetry}
        >
          <RetryIcon />
          Retry Answer
        </button>
      </div>

      {micError && <p className="error">{micError}</p>}
    </div>
  );
}
