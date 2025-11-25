import React, { useRef, useState } from "react";
import { UploadIcon } from "./Icons";

const ACCEPTED_INPUTS = ".pdf,.docx,.pptx,.txt";

const AI_MODELS = [
  { id: "gemini", name: "Gemini AI", description: "Google's Gemini with text-to-speech" },
  { id: "elevenlabs", name: "ElevenLabs", description: "Conversational AI with natural voice" },
];

export function UploadPanel({ onFileSelected, status, error, selectedModel, onModelChange }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file) onFileSelected(file);
  };

  const disabled = status === "uploading";

  return (
    <div className="card upload-card">
      {/* Model Selector */}
      <div className="model-selector">
        <p className="model-label">Select AI Model</p>
        <div className="model-options">
          {AI_MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              className={`model-option ${selectedModel === model.id ? "selected" : ""}`}
              onClick={() => onModelChange(model.id)}
              disabled={disabled}
            >
              <span className="model-name">{model.name}</span>
              <span className="model-desc">{model.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* File Upload */}
      <div
        className={`dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer?.files?.[0]);
        }}
      >
        <div className="upload-icon">
          <UploadIcon />
        </div>
        <h2>Upload your assignment</h2>
        <p className="hint">PDF, DOCX, PPTX, or TXT up to 8 MB</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {status === "uploading" ? "Uploading..." : "Select file"}
        </button>
        <p className="hint-small">or drag and drop</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_INPUTS}
          style={{ display: "none" }}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
