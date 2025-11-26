import React, { useEffect, useRef, useState } from "react";

export default function Orb({ state = "idle" }) {
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  // Set up audio analysis for voice reactivity
  useEffect(() => {
    let mounted = true;

    const setupAudio = async () => {
      if (state === "listening") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.9; // More smoothing for less jitter
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateLevel = () => {
            if (!mounted) return;
            analyser.getByteFrequencyData(dataArray);
            // Get average of lower frequencies (voice range)
            const voiceRange = dataArray.slice(0, 32);
            const average = voiceRange.reduce((a, b) => a + b, 0) / voiceRange.length;
            // More aggressive normalization - reduce sensitivity
            const normalized = Math.min(average / 180, 1) * 0.6; // Cap at 0.6 max
            setAudioLevel(normalized);
            animationRef.current = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        } catch (err) {
          console.log("Audio access not available for visualization");
        }
      } else if (state === "speaking") {
        // Simulate audio levels for AI speaking - more subtle
        const simulateAudio = () => {
          if (!mounted) return;
          const time = Date.now() / 1000;
          // Gentler speech patterns
          const base = 0.25;
          const variation = Math.sin(time * 5) * 0.1 + Math.sin(time * 8) * 0.08;
          setAudioLevel(Math.max(0, Math.min(0.5, base + variation)));
          animationRef.current = requestAnimationFrame(simulateAudio);
        };
        simulateAudio();
      } else {
        setAudioLevel(0);
      }
    };

    setupAudio();

    return () => {
      mounted = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [state]);

  const getColors = () => {
    switch (state) {
      case "listening":
        return {
          primary: "#22c55e",
          secondary: "#4ade80",
          tertiary: "#86efac",
          glow: "rgba(34, 197, 94, 0.4)",
          innerGlow: "rgba(74, 222, 128, 0.5)",
        };
      case "speaking":
        return {
          primary: "#3b82f6",
          secondary: "#60a5fa",
          tertiary: "#93c5fd",
          glow: "rgba(59, 130, 246, 0.4)",
          innerGlow: "rgba(96, 165, 250, 0.5)",
        };
      case "processing":
        return {
          primary: "#f59e0b",
          secondary: "#fbbf24",
          tertiary: "#fcd34d",
          glow: "rgba(245, 158, 11, 0.4)",
          innerGlow: "rgba(251, 191, 36, 0.5)",
        };
      default:
        return {
          primary: "#18181b",
          secondary: "#3f3f46",
          tertiary: "#52525b",
          glow: "rgba(63, 63, 70, 0.3)",
          innerGlow: "rgba(82, 82, 91, 0.4)",
        };
    }
  };

  const colors = getColors();
  const isActive = state === "listening" || state === "speaking" || state === "processing";
  
  // Subtle audio-reactive scaling
  const coreScale = 1 + audioLevel * 0.08; // Reduced from 0.15
  const glowIntensity = 0.5 + audioLevel * 0.3; // Reduced range

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "200px",
        height: "200px",
        position: "relative",
        cursor: "pointer",
      }}
    >
      {/* Ambient glow - subtle reaction */}
      <div
        style={{
          position: "absolute",
          width: `${170 + audioLevel * 15}px`,
          height: `${170 + audioLevel * 15}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: "blur(20px)",
          opacity: glowIntensity,
          transition: "all 0.2s ease-out",
        }}
      />

      {/* Outer ethereal ring */}
      <div
        style={{
          position: "absolute",
          width: "165px",
          height: "165px",
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, transparent, ${colors.primary}25, transparent, ${colors.secondary}20, transparent)`,
          animation: isActive ? "spin 10s linear infinite" : "spin 20s linear infinite",
        }}
      />

      {/* Middle gradient ring */}
      <div
        style={{
          position: "absolute",
          width: "138px",
          height: "138px",
          borderRadius: "50%",
          background: `conic-gradient(from 180deg, ${colors.primary}30, transparent, ${colors.secondary}25, transparent, ${colors.primary}30)`,
          animation: isActive ? "spin 8s linear infinite reverse" : "spin 15s linear infinite reverse",
        }}
      />

      {/* Inner accent ring */}
      <div
        style={{
          position: "absolute",
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          background: `conic-gradient(from 90deg, ${colors.secondary}35, transparent 30%, ${colors.primary}30, transparent 60%, ${colors.secondary}35)`,
          animation: isActive ? "spin 6s linear infinite" : "spin 12s linear infinite",
        }}
      />

      {/* Glass morphism outer shell */}
      <div
        style={{
          position: "absolute",
          width: `${92 + audioLevel * 4}px`,
          height: `${92 + audioLevel * 4}px`,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(8px)",
          border: `1px solid rgba(255, 255, 255, 0.12)`,
          boxShadow: `
            inset 0 0 25px ${colors.innerGlow},
            0 0 30px ${colors.glow}
          `,
          transition: "all 0.2s ease-out",
        }}
      />

      {/* Core sphere */}
      <div
        style={{
          width: "75px",
          height: "75px",
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 30% 30%, ${colors.tertiary}, ${colors.secondary} 40%, ${colors.primary} 70%, #0a0a0a 100%)
          `,
          boxShadow: `
            inset -8px -8px 20px rgba(0, 0, 0, 0.6),
            inset 5px 5px 15px ${colors.innerGlow},
            0 0 ${40 + audioLevel * 20}px ${colors.glow}
          `,
          zIndex: 10,
          transform: `scale(${coreScale})`,
          transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
        }}
      >
        {/* Highlight reflection */}
        <div
          style={{
            position: "relative",
            top: "12px",
            left: "18px",
            width: "22px",
            height: "14px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.35)",
            filter: "blur(4px)",
            transform: "rotate(-30deg)",
          }}
        />
      </div>

      {/* Orbiting particles - only when active */}
      {isActive && (
        <>
          <div
            style={{
              position: "absolute",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: colors.tertiary,
              boxShadow: `0 0 8px ${colors.primary}`,
              animation: "orbit1 4s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: colors.secondary,
              boxShadow: `0 0 6px ${colors.tertiary}`,
              animation: "orbit2 5s linear infinite",
            }}
          />
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit1 {
          0% { transform: rotate(0deg) translateX(85px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(85px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          0% { transform: rotate(180deg) translateX(70px) rotate(-180deg); }
          100% { transform: rotate(540deg) translateX(70px) rotate(-540deg); }
        }
      `}</style>
    </div>
  );
}
