"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Send,
  HelpCircle,
  CheckCircle2,
  Radio,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Language } from "@/lib/i18n";

interface VoiceAssistantProps {
  lang?: Language;
}

interface CommandResult {
  title: string;
  spokenText: string;
  bullets: string[];
  actionRoute?: string;
  actionLabel?: string;
  topic: string;
}

function VoiceAssistantInner({ lang = "ur" }: VoiceAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [currentLang, setCurrentLang] = useState<"ur" | "en">(lang === "ur" ? "ur" : "en");

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isUrdu = currentLang === "ur";
  const ArrowIcon = isUrdu ? ArrowLeft : ArrowRight;

  const quickPrompts = [
    { label: "ویب سائٹ کے تمام فیچرز بتائیں", query: "تمام فیچرز کا تعارف" },
    { label: "اگلی فصل کون سی لگائیں؟", query: "اگلی فصل کون سی لگائیں؟" },
    { label: "ٹماٹر کا مشورہ اور ریٹ", query: "ٹماٹر کا کیا ریٹ ہے اور کب بیچوں؟" },
    { label: "بغیر آڑھتی خریدار کہاں ہیں؟", query: "بغیر آڑھتی کے خریدار تلاش کریں" },
    { label: "آڑھتی واچ ڈاگ کیا ہے؟", query: "آڑھتی واچ ڈاگ اور کٹوتی مانیٹر کیا ہے؟" },
    { label: "منصفانہ سودا روم کیسے کام کرتا ہے؟", query: "سودا روم میں بولی کیسے لگائیں؟" },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = currentLang === "ur" ? "ur-PK" : "en-US";

        reco.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);
        };

        reco.onerror = (event: any) => {
          console.warn("Speech recognition notice:", event.error);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
          setTranscript((curr) => {
            if (curr.trim().length > 1) {
              handleProcessCommand(curr.trim());
            }
            return curr;
          });
        };

        recognitionRef.current = reco;
      }
    }

    return () => {
      stopAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [currentLang]);

  // Update speech recognition language when currentLang changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = currentLang === "ur" ? "ur-PK" : "en-US";
    }
  }, [currentLang]);

  // Stop current audio playback
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Play audio response in Urdu
  const playAudio = (textToSpeak: string) => {
    stopAudio();
    if (!textToSpeak.trim()) return;

    setIsPlayingAudio(true);

    try {
      const audioUrl = `/api/voice?lang=${currentLang}&text=${encodeURIComponent(textToSpeak)}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        fallbackSpeak(textToSpeak);
      };

      audio.play().catch(() => {
        fallbackSpeak(textToSpeak);
      });
    } catch {
      fallbackSpeak(textToSpeak);
    }
  };

  const fallbackSpeak = (textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = currentLang === "ur" ? "ur-PK" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Listening
  const startListening = () => {
    stopAudio();
    setTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech recognition start failed:", err);
        setIsListening(false);
      }
    }
  };

  // Stop Voice Listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Submit and process the voice command
  const handleProcessCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    setIsProcessing(true);
    stopAudio();

    try {
      const res = await fetch("/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmdText,
          lang: currentLang,
          currentRoute: pathname,
        }),
      });

      if (res.ok) {
        const data: CommandResult = await res.json();
        setResult(data);
        // Play Urdu voice answer aloud automatically
        if (data.spokenText) {
          playAudio(data.spokenText);
        }
      }
    } catch (err) {
      console.error("Voice command processing failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim()) {
      setTranscript(typedInput);
      handleProcessCommand(typedInput);
      setTypedInput("");
    }
  };

  const handleNavigate = (route: string) => {
    stopAudio();
    setIsOpen(false);
    router.push(route);
  };

  const handleReset = () => {
    stopAudio();
    setResult(null);
    setTranscript("");
    startListening();
  };

  return (
    <>
      {/* Floating Omnipresent Voice Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
        <button
          id="floating-voice-assistant-btn"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => {
              startListening();
            }, 300);
          }}
          className="flex items-center gap-2.5 bg-[#0F3E2E] hover:bg-[#144E3A] text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-[#0A2D21] active:scale-95 group cursor-pointer"
          title="صوتی معاون سے بول کر پوچھیں (Voice Assistant)"
        >
          {/* Animated Pulsing Mic Icon */}
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FBBF24] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FBBF24] text-[#0F3E2E] items-center justify-center">
              <Mic className="w-2.5 h-2.5" />
            </span>
          </span>

          <span className="font-urdu font-black text-sm tracking-wide text-white">
            بول کر پوچھیں (صوتی معاون)
          </span>
        </button>
      </div>

      {/* Interactive Voice Assistant Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-xl bg-[#FAF7F2] rounded-3xl border border-[#EAE4D8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
              isUrdu ? "font-urdu" : ""
            }`}
            dir={isUrdu ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className="bg-[#FEFDFB] px-5 sm:px-6 py-4 border-b border-[#EAE4D8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F3EC] text-[#0F3E2E] flex items-center justify-center border border-[#BDE0CB] shadow-2xs">
                  <Sparkles className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-black text-[#14231B] text-base sm:text-lg">
                    {isUrdu ? "قومی منڈی صوتی معاون" : "Mandi Voice Command Assistant"}
                  </h3>
                  <p className="text-xs text-[#55695C] font-semibold">
                    {isUrdu
                      ? "اردو میں بولیں اور ویب سائٹ کے ہر فیچر کا فوری جواب سنیں"
                      : "Speak in Urdu or English to query any website feature"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switch */}
                <button
                  type="button"
                  onClick={() => setCurrentLang(currentLang === "ur" ? "en" : "ur")}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#EAE4D8] bg-[#FAF8F3] text-[#2A3B30] hover:bg-[#EBE2D3]"
                >
                  {currentLang === "ur" ? "English" : "اردو"}
                </button>

                <button
                  onClick={() => {
                    stopAudio();
                    stopListening();
                    setIsOpen(false);
                  }}
                  className="p-2 text-[#55695C] hover:text-[#14231B] hover:bg-[#FAF8F3] rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* If an Answer Result exists, display the Answer Card Front and Center! */}
              {result ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Query Bubble */}
                  <div className="flex items-center justify-between bg-[#FAF8F3] p-3 rounded-2xl border border-[#EAE4D8]">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#14231B]">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      <span>{isUrdu ? "آپ کا سوال:" : "Your Query:"}</span>
                      <span className="text-[#0F3E2E] font-bold">&quot;{transcript}&quot;</span>
                    </div>

                    <button
                      onClick={handleReset}
                      className="text-xs font-bold text-[#55695C] hover:text-[#0F3E2E] flex items-center gap-1 bg-[#FEFDFB] px-2.5 py-1 rounded-xl border border-[#EAE4D8]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isUrdu ? "نیا سوال" : "New Query"}</span>
                    </button>
                  </div>

                  {/* Primary Spoken Answer Card */}
                  <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-5 sm:p-6 shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                        <h4 className="font-black text-[#14231B] text-base sm:text-lg">
                          {result.title}
                        </h4>
                      </div>

                      {/* Listen / Stop Audio Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isPlayingAudio) {
                              stopAudio();
                            } else {
                              playAudio(result.spokenText);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isPlayingAudio
                              ? "bg-rose-600 text-white shadow-xs animate-pulse"
                              : "bg-[#0F3E2E] hover:bg-[#144E3A] text-white shadow-2xs"
                          }`}
                        >
                          {isPlayingAudio ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>{isUrdu ? "روکیں" : "Stop"}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-[#FBBF24]" />
                              <span>{isUrdu ? "سنیں (Urdu)" : "Listen"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Spoken Text (Large, Legible Nastaliq-friendly) */}
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE4D8]">
                      <p className="text-sm sm:text-base text-[#14231B] leading-relaxed font-bold">
                        {result.spokenText}
                      </p>
                    </div>

                    {/* Bullet Highlights */}
                    {result.bullets && result.bullets.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {result.bullets.map((b, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF8F3] border border-[#EBE4D6] text-xs sm:text-sm font-semibold text-[#2A3B30]"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Route Button */}
                    {result.actionRoute && (
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          onClick={() => handleNavigate(result.actionRoute!)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F3E2E] hover:bg-[#144E3A] text-white text-xs sm:text-sm font-black rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer border border-[#0A2D21]"
                        >
                          <span>{result.actionLabel || (isUrdu ? "متعلقہ صفحہ کھولیں" : "Open Page")}</span>
                          <ArrowIcon className="w-4 h-4 text-[#FBBF24]" />
                        </button>

                        <button
                          onClick={handleReset}
                          className="text-xs font-bold text-[#55695C] hover:text-[#0F3E2E]"
                        >
                          {isUrdu ? "کوئی دوسرا سوال پوچھیں" : "Ask another question"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Central Voice Listening Wave Card */
                <div className="bg-[#FEFDFB] rounded-3xl border border-[#EAE4D8] p-6 text-center shadow-xs">
                  {/* Visual Microphone Circle */}
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isListening
                          ? "bg-rose-600 text-white shadow-lg ring-8 ring-rose-100 scale-105"
                          : isProcessing
                          ? "bg-[#D97706] text-white shadow-md ring-8 ring-amber-100 animate-pulse"
                          : "bg-[#0F3E2E] hover:bg-[#144E3A] text-white shadow-md ring-4 ring-emerald-100"
                      }`}
                    >
                      {isListening ? (
                        <Radio className="w-8 h-8 animate-spin" />
                      ) : isProcessing ? (
                        <span className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </button>
                  </div>

                  {/* Status Message */}
                  <div className="space-y-1">
                    <div className="font-extrabold text-[#14231B] text-base sm:text-lg">
                      {isListening
                        ? isUrdu
                          ? "سن رہا ہے... اپنا سوال بولیں"
                          : "Listening... Speak your question now"
                        : isProcessing
                        ? isUrdu
                          ? "تجزیہ کیا جا رہا ہے..."
                          : "Processing your voice command..."
                        : isUrdu
                        ? "بولنے کے لیے مائیک دبائیں"
                        : "Tap mic to ask with your voice"}
                    </div>
                    <p className="text-xs text-[#55695C] font-medium">
                      {isUrdu
                        ? "مثال: اگلی فصل کون سی لگائیں؟ • ٹماٹر کا کیا ریٹ ہے؟ • آڑھتی واچ ڈاگ کیا ہے؟"
                        : "e.g. What crop to plant? • Tomato rate today • How does watchdog work?"}
                    </p>
                  </div>

                  {/* Live Transcript Bubble */}
                  {transcript && (
                    <div className="mt-4 p-3.5 bg-[#FAF8F3] rounded-2xl border border-[#EAE4D8] text-xs sm:text-sm font-bold text-[#14231B] inline-block max-w-full">
                      &quot;{transcript}&quot;
                    </div>
                  )}
                </div>
              )}

              {/* Quick Inquiry Buttons for Illiterate or Non-Typing Farmers */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#66786D] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isUrdu ? "فوری اہم سوالات (ایک کلک پر جواب سنیں):" : "One-Click Quick Voice Queries:"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      data-idx={idx}
                      onClick={() => {
                        setTranscript(p.query);
                        handleProcessCommand(p.query);
                      }}
                      className="quick-voice-btn p-3 rounded-2xl border border-[#EAE4D8] bg-[#FAF8F3] hover:bg-[#F2ECE1] hover:border-[#0F3E2E] text-xs font-bold text-[#14231B] text-right sm:text-right transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="line-clamp-1">{p.label}</span>
                      <Mic className="w-3.5 h-3.5 text-[#7B8C80] group-hover:text-[#0F3E2E] shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Query Input Fallback */}
              <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder={isUrdu ? "یا اپنا سوال یہاں لکھ کر پوچھیں..." : "Or type your inquiry here..."}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-[#DCD3C3] bg-[#FEFDFB] text-xs sm:text-sm text-[#14231B] placeholder-[#8A9B8F] focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="px-5 py-2.5 bg-[#0F3E2E] hover:bg-[#144E3A] disabled:opacity-40 text-white rounded-2xl text-xs font-bold shrink-0 transition-all shadow-2xs cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#FBBF24]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function VoiceAssistant(props: VoiceAssistantProps) {
  return (
    <Suspense fallback={null}>
      <VoiceAssistantInner {...props} />
    </Suspense>
  );
}
