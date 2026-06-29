"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";

interface AIChatProps {
  onSubmit: (input: string) => Promise<any>;
  loading: boolean;
}

const suggestions = [
  "Prepare for my job interview tomorrow at 3pm",
  "Complete the assignment due this Friday",
  "Pay electricity bill before month end",
  "Finish project presentation by next Monday",
];

export const AIChat = ({ onSubmit, loading }: AIChatProps) => {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const listeningRef = useRef(false);
  const transcriptRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  const createRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        transcriptRef.current = transcriptRef.current + " " + final;
        setTranscript(transcriptRef.current.trim());
        setInput(transcriptRef.current.trim());
      } else {
        setInput((transcriptRef.current + " " + interim).trim());
      }
    };

    recognition.onend = () => {
      // Auto restart if still in listening mode
      if (listeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Create fresh instance if restart fails
          const newRecognition = createRecognition();
          if (newRecognition) {
            recognitionRef.current = newRecognition;
            try { newRecognition.start(); } catch (e2) { console.error(e2); }
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return; // ignore silence
      if (event.error === "aborted") return; // ignore manual stop
      console.error("Speech error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access in your browser settings.");
        listeningRef.current = false;
        setListening(false);
      }
    };

    return recognition;
  };

  const startVoice = () => {
    if (!voiceSupported) {
      alert("Voice input not supported. Please use Chrome!");
      return;
    }
    transcriptRef.current = "";
    setTranscript("");
    listeningRef.current = true;
    setListening(true);

    const recognition = createRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopVoice = () => {
    listeningRef.current = false;
    setListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    if (listening) stopVoice();
    const value = input.trim();
    setInput("");
    setTranscript("");
    transcriptRef.current = "";
    await onSubmit(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      {!loading && !listening && (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="text-xs text-gray-500 hover:text-gray-300 bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {listening && (
        <div className="flex items-center gap-2 px-2">
          <div className="flex gap-0.5 items-end h-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 12 + 4}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          <p className="text-xs text-red-400 animate-pulse">
            🔴 Listening... speak clearly, click 🎤 to stop
          </p>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            listening
              ? "🎤 Listening... speak now"
              : "Tell Clutch what you need to do... or use voice 🎤"
          }
          className={`flex-1 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none min-h-[48px] max-h-[120px] transition-all ${
            listening
              ? "bg-red-950 border-red-700 focus:border-red-500"
              : "bg-gray-800 border-gray-700 focus:border-gray-500"
          }`}
          rows={1}
          disabled={loading}
        />

        {voiceSupported && (
          <button
            onClick={listening ? stopVoice : startVoice}
            disabled={loading}
            title={listening ? "Click to stop recording" : "Click to start voice input"}
            className={`px-3 py-3 rounded-xl text-lg transition-all flex-shrink-0 ${
              listening
                ? "bg-red-600 text-white shadow-lg shadow-red-900 scale-110"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
            }`}
          >
            🎤
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="bg-white text-black px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          {loading ? "⏳" : "⚡ Clutch it"}
        </button>
      </div>

      {loading && (
        <p className="text-xs text-gray-500 text-center animate-pulse">
          🧠 Clutch is planning your task...
        </p>
      )}
    </div>
  );
};