import React, { useEffect, useRef, useState, useCallback } from "react";
import Orb from "./Orb";

const ELEVENLABS_AGENT_ID = "agent_9501kashe10zf1g8bdzz96aef9z6";

export function ElevenLabsPanel({ assignmentText, fileName, onComplete, onRestart }) {
  const [conversationState, setConversationState] = useState("idle");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  
  const conversationRef = useRef(null);
  const feedRef = useRef(null);
  const isStartingRef = useRef(false);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  const startConversation = useCallback(async () => {
    if (isStartingRef.current || conversationRef.current) {
      console.log("Already starting or connected");
      return;
    }
    
    isStartingRef.current = true;
    
    try {
      setConversationState("connecting");
      setError("");
      setMessages([{ role: "system", text: "Requesting microphone access..." }]);

      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      
      setMessages([{ role: "system", text: "Connecting to AI coach..." }]);

      const { Conversation } = await import("@elevenlabs/client");

      // Prepare assignment context
      const assignmentTitle = fileName ? fileName.replace(/\.[^/.]+$/, "") : "your assignment";
      const assignmentExcerpt = assignmentText ? assignmentText.substring(0, 2500) : "No assignment content provided.";

      console.log("=== OVERRIDE DEBUG ===");
      console.log("Assignment title:", assignmentTitle);
      console.log("Assignment text length:", assignmentExcerpt.length);

      // Build the system prompt with assignment context
      const systemPrompt = `You are a calm, inquisitive AI coach that validates whether a student truly understands the assignment they submitted.

ASSIGNMENT TITLE: ${assignmentTitle}

ASSIGNMENT CONTENT:
${assignmentExcerpt}

YOUR TASK:
1. Greet the student and mention the assignment title.
2. Ask exactly three questions, one at a time, waiting for a full answer before moving on.
   - Q1: Ask them to summarize the overall goal and conclusion.
   - Q2: Ask about a specific detail, example, or evidence from their work.
   - Q3: Ask about a key concept or term they used and why.
3. After the third answer, summarize how well their answers matched the submission, note any gaps, and assign an integrity score from 30-100.
4. Keep the tone supportive and professional.
5. If the student gives short answers, politely ask for more detail.`;

      const firstMsg = `Hello! I have just reviewed your assignment "${assignmentTitle}". I will ask you three quick questions to make sure the work reflects your own understanding. Ready?`;

      console.log("System prompt preview:", systemPrompt.substring(0, 200));
      console.log("First message:", firstMsg);
      console.log("=== END DEBUG ===");

      // Use overrides with camelCase as per docs
      const conversation = await Conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        overrides: {
          agent: {
            prompt: {
              prompt: systemPrompt
            },
            firstMessage: firstMsg
          }
        },
        onConnect: () => {
          console.log("Connected to ElevenLabs");
          setIsConnected(true);
          setConversationState("listening");
          setMessages([{ role: "system", text: "Connected! The AI coach will greet you..." }]);
          isStartingRef.current = false;
        },
        onDisconnect: () => {
          console.log("Disconnected from ElevenLabs");
          setIsConnected(false);
          setConversationState("idle");
          isStartingRef.current = false;
        },
        onError: (err) => {
          console.error("ElevenLabs error:", err);
          setError("Connection error: " + (err.message || "Please try again."));
          setConversationState("idle");
          isStartingRef.current = false;
        },
        onModeChange: (modeInfo) => {
          console.log("Mode changed:", modeInfo);
          const mode = modeInfo?.mode || modeInfo;
          if (mode === "speaking") {
            setConversationState("speaking");
          } else if (mode === "listening") {
            setConversationState("listening");
          }
        },
        onMessage: (message) => {
          console.log("Message:", message);
          if (message) {
            const text = message.message || message.text || message.content;
            const source = message.source || message.role || "unknown";
            if (text) {
              if (source === "ai" || source === "agent" || source === "assistant") {
                setMessages(prev => [...prev.filter(m => m.role !== "system"), { role: "ai", text }]);
                setQuestionCount(prev => prev + 1);
              } else if (source === "user" || source === "human") {
                setMessages(prev => [...prev, { role: "user", text }]);
                setCurrentTranscript("");
              }
            }
          }
        },
        onStatusChange: (status) => {
          console.log("Status:", status);
        },
      });

      console.log("Conversation started:", conversation);
      conversationRef.current = conversation;

    } catch (err) {
      console.error("Failed to start:", err);
      isStartingRef.current = false;
      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone and refresh.");
      } else {
        setError("Failed to connect: " + (err.message || "Please try again."));
      }
      setConversationState("idle");
    }
  }, [assignmentText, fileName]);

  const endConversation = useCallback(async () => {
    isStartingRef.current = false;
    if (conversationRef.current) {
      try { await conversationRef.current.endSession(); } catch (e) {}
      conversationRef.current = null;
    }
    setIsConnected(false);
    setConversationState("idle");
  }, []);

  const handleOrbClick = useCallback(() => {
    if (conversationState === "idle" && !isStartingRef.current) {
      startConversation();
    }
  }, [conversationState, startConversation]);

  const handleFinish = useCallback(() => {
    endConversation();
    onComplete({ score: 75, messages });
  }, [endConversation, onComplete, messages]);

  const handleCancel = useCallback(() => {
    endConversation();
    onRestart();
  }, [endConversation, onRestart]);

  useEffect(() => {
    return () => {
      isStartingRef.current = false;
      if (conversationRef.current) {
        conversationRef.current.endSession().catch(() => {});
        conversationRef.current = null;
      }
    };
  }, []);

  const getOrbState = () => {
    if (conversationState === "connecting") return "processing";
    if (conversationState === "speaking") return "speaking";
    if (conversationState === "listening") return "listening";
    return "idle";
  };

  return (
    <div className="card elevenlabs-custom-card">
      <div className="elevenlabs-custom-header">
        <h2>Voice Q&A</h2>
        <span className="question-counter">
          {isConnected ? (
            <span className="live-badge">Connected</span>
          ) : (
            questionCount > 0 ? "Question " + Math.min(questionCount, 3) + "/3" : "Ready to start"
          )}
        </span>
      </div>
      <div className="elevenlabs-orb-section" onClick={handleOrbClick}>
        <Orb state={getOrbState()} size={180} />
        {conversationState === "idle" && !error && <p className="orb-hint">Click to start conversation</p>}
        {conversationState === "connecting" && <p className="orb-hint">Connecting...</p>}
        {conversationState === "speaking" && <p className="orb-hint">AI is speaking...</p>}
        {conversationState === "listening" && <p className="orb-hint">Listening to you...</p>}
      </div>
      {error && (
        <div className="elevenlabs-error-banner">
          <p>{error}</p>
          <button className="btn btn-secondary btn-small" onClick={() => { setError(""); setConversationState("idle"); isStartingRef.current = false; }}>Dismiss</button>
        </div>
      )}
      <div className="elevenlabs-transcript-section">
        <div className="transcript-header"><h3>Conversation</h3></div>
        <div className="transcript-feed" ref={feedRef}>
          {messages.length === 0 && !currentTranscript && <p className="transcript-placeholder">Click the orb above to start</p>}
          {messages.map((msg, i) => (
            <div key={i} className={"transcript-message " + msg.role}>
              <span className="message-role">{msg.role === "ai" ? "Coach" : msg.role === "user" ? "You" : "System"}</span>
              <p>{msg.text}</p>
            </div>
          ))}
          {currentTranscript && (
            <div className="transcript-message user live">
              <span className="message-role">You (speaking)</span>
              <p>{currentTranscript}</p>
            </div>
          )}
        </div>
      </div>
      <div className="elevenlabs-actions">
        <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={handleFinish} disabled={!isConnected && messages.length < 2}>Finish</button>
      </div>
    </div>
  );
}
