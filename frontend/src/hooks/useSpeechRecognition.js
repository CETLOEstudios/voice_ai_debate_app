import { useCallback, useRef, useState } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const instanceIdRef = useRef(0);
  
  // This is the source of truth - all confirmed text
  const confirmedTextRef = useRef("");
  // Current interim text (not yet confirmed)
  const interimTextRef = useRef("");

  const getSpeechRecognition = () => {
    return window.SpeechRecognition || window.webkitSpeechRecognition;
  };

  const updateDisplay = useCallback(() => {
    const display = (confirmedTextRef.current + interimTextRef.current).trim();
    setTranscript(display);
  }, []);

  const startRecognitionSession = useCallback((instanceId) => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition || !shouldListenRef.current) return;
    if (instanceId !== instanceIdRef.current) return;

    // Stop any existing
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    // Track what's been finalized in THIS session only
    let thisSessionFinals = "";

    recognition.onresult = (event) => {
      if (instanceId !== instanceIdRef.current) return;

      // Process only the latest results
      let newFinals = "";
      let currentInterim = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinals += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      // Update session finals if we got new ones
      if (newFinals) {
        thisSessionFinals = newFinals;
      }

      // Update interim
      interimTextRef.current = currentInterim;

      // Display = confirmed (from all prev sessions) + this session's finals + current interim
      const display = (confirmedTextRef.current + thisSessionFinals + " " + currentInterim).trim();
      setTranscript(display);
    };

    recognition.onend = () => {
      if (instanceId !== instanceIdRef.current) return;

      // IMPORTANT: Save this session's finals to confirmed text BEFORE restarting
      if (thisSessionFinals.trim()) {
        confirmedTextRef.current += thisSessionFinals + " ";
      }
      // Clear interim since session ended
      interimTextRef.current = "";

      // Restart if we should still be listening
      if (shouldListenRef.current && instanceId === instanceIdRef.current) {
        // Use setTimeout to avoid "already started" errors
        setTimeout(() => {
          if (shouldListenRef.current && instanceId === instanceIdRef.current) {
            startRecognitionSession(instanceId);
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech error:", event.error);
      // Let onend handle the restart
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      // Try again after a short delay
      setTimeout(() => {
        if (shouldListenRef.current && instanceId === instanceIdRef.current) {
          try { recognition.start(); } catch (e2) {}
        }
      }, 150);
    }
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Please use Chrome or Edge.");
      return;
    }

    // Stop any existing
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    // Reset all state
    setError("");
    setTranscript("");
    confirmedTextRef.current = "";
    interimTextRef.current = "";
    shouldListenRef.current = true;
    instanceIdRef.current++;
    setIsListening(true);

    // Start new session
    startRecognitionSession(instanceIdRef.current);
  }, [startRecognitionSession]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    instanceIdRef.current++;
    setIsListening(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    // Stop everything
    shouldListenRef.current = false;
    instanceIdRef.current++;
    
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }

    // Clear all text
    setTranscript("");
    confirmedTextRef.current = "";
    interimTextRef.current = "";

    // Start fresh after browser has time to clean up
    const newInstanceId = instanceIdRef.current;
    setTimeout(() => {
      if (newInstanceId === instanceIdRef.current) {
        shouldListenRef.current = true;
        setIsListening(true);
        startRecognitionSession(newInstanceId);
      }
    }, 200);
  }, [startRecognitionSession]);

  return { isListening, transcript, error, start, stop, reset };
}
