import React, { useRef, useEffect } from "react";
import Orb from "./Orb";
import { CheckIcon, SpeakerIcon, RetryIcon } from "./Icons";

export function GeminiPanel({
  questionNumber,
  currentQuestion,
  transcript,
  isListening,
  isSpeaking,
  isProcessing,
  micError,
  conversation,
  onFinishAnswer,
  onRepeatQuestion,
  onRetryAnswer,
  onCancel,
}) {
  const feedRef = useRef(null);
  
  const hasAnswer = transcript.trim().length > 0;
  const canFinish = hasAnswer && isListening && !isSpeaking && !isProcessing;
  const canRepeat = !isSpeaking && !isProcessing && currentQuestion;
  const canRetry = hasAnswer && isListening && !isSpeaking && !isProcessing;

  // Auto-scroll conversation
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [conversation, transcript]);

  const getOrbState = () => {
    if (isProcessing) return "processing";
    if (isSpeaking) return "speaking";
    if (isListening) return "listening";
    return "idle";
  };

  const getQuestionProgress = () => {
    if (questionNumber === 0) return "Ready";
    if (questionNumber === 1) return "Question 1/3";
    if (questionNumber === 2) return "Question 2/3";
    if (questionNumber === 3) return "Question 3/3";
    return "In progress";
  };

  return (
    <div className="card elevenlabs-custom-card gemini-panel">
      <div className="elevenlabs-custom-header">
        <h2>Voice Q&A</h2>
        <span className="question-counter">
          <span className="live-badge">● {getQuestionProgress()}</span>
        </span>
      </div>

      <div className="elevenlabs-orb-section">
        <Orb state={getOrbState()} />
        {isSpeaking && (
          <p className="orb-hint">AI is speaking...</p>
        )}
        {isListening && !isSpeaking && (
          <p className="orb-hint">Listening... speak now</p>
        )}
        {isProcessing && (
          <p className="orb-hint">Processing your answer...</p>
        )}
      </div>

      {/* Current Question Display */}
      {currentQuestion && (
        <div className="gemini-question-box">
          <div className="question-box-header">
            <span className="question-box-label">Current Question</span>
            <button
              type="button"
              className="btn-icon repeat-btn"
              onClick={onRepeatQuestion}
              disabled={!canRepeat}
              title="Repeat question"
            >
              <SpeakerIcon size={16} />
            </button>
          </div>
          <p className="question-box-text">{currentQuestion}</p>
        </div>
      )}

      {micError && (
        <div className="elevenlabs-error-banner">
          <p>{micError}</p>
        </div>
      )}

      <div className="elevenlabs-transcript-section">
        <div className="transcript-header">
          <h3>Conversation</h3>
          {isListening && !isSpeaking && (
            <span className="live-indicator">● Live</span>
          )}
        </div>
        
        <div className="transcript-feed" ref={feedRef}>
          {conversation.length === 0 && !transcript && (
            <p className="transcript-placeholder">
              The conversation will appear here...
            </p>
          )}
          
          {conversation.map((msg, i) => (
            <div key={i} className={`transcript-message ${msg.role === "ai" ? "ai" : "user"}`}>
              <span className="message-role">
                {msg.role === "ai" ? "AI" : "You"}
              </span>
              <p>{msg.text}</p>
            </div>
          ))}
          
          {transcript && isListening && (
            <div className="transcript-message user live">
              <span className="message-role">You (speaking...)</span>
              <p>{transcript}</p>
            </div>
          )}
        </div>
      </div>

      <div className="gemini-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        
        <button
          type="button"
          className="btn btn-retry-small"
          onClick={onRetryAnswer}
          disabled={!canRetry}
          title="Clear and retry your answer"
        >
          <RetryIcon size={16} />
          Retry
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onFinishAnswer}
          disabled={!canFinish}
        >
          <CheckIcon size={16} />
          Submit Answer
        </button>
      </div>
    </div>
  );
}

