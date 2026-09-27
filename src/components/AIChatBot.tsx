import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, MessageSquare, Loader2, Volume2, Square, Send } from 'lucide-react';

interface AIChatBotProps {
  user: any;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatBot({ user }: AIChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!textInput.trim() || isLoading) return;
    sendMessage(textInput.trim());
    setTextInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const base64Str = base64data.split(',')[1];
            const mimeType = base64data.split(';')[0].split(':')[1];
            
            sendMessage(null, base64Str, mimeType);
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
        stopSpeaking();
      } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Microphone access is needed for voice chat.");
      }
    }
  };

  const sendMessage = async (text: string | null, audioBase64: string | null = null, mimeType: string | null = null) => {
    setIsLoading(true);
    
    // Add temporary user message if it's text
    const newMessages = [...messages];
    if (text) {
      newMessages.push({ role: 'user', text });
      setMessages(newMessages);
    } else if (audioBase64) {
      newMessages.push({ role: 'user', text: '🎤 (Voice Message)' });
      setMessages(newMessages);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          audioBase64,
          mimeType,
          history: messages,
          user
        })
      });
      const data = await response.json();
      
      if (data.text) {
        setMessages([...newMessages, { role: 'model', text: data.text }]);
        speakText(data.text);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterChips = [
    "What should I eat to boost my iron levels?",
    "Can I swap lentils for tofu or paneer?",
    "How does my caloric deficit affect energy?",
    "Best snacks before evening workout?"
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 cursor-pointer border border-emerald-400/30"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Ask Nutrition Coach</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 max-h-[580px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm">NutriAI Health Coach</h3>
                <p className="text-emerald-200 text-[11px]">Text & Voice Multi-Lingual</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                stopSpeaking();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/70 min-h-[280px] max-h-[360px] space-y-3.5 custom-scrollbar">
            {messages.length === 0 && (
              <div className="space-y-4 my-2">
                <div className="text-center text-slate-500 text-xs">
                  <p className="font-bold text-slate-700 text-sm mb-1">How can I assist your nutrition?</p>
                  <p className="text-[11px] text-slate-400">Ask about meal substitutions, iron absorption, or recipes</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-1">Suggested questions</p>
                  {starterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(chip)}
                      className="w-full text-left text-xs p-2.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 rounded-xl transition-all shadow-2xs cursor-pointer block"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs font-medium' 
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-2xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-xs p-3 text-xs flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span className="text-slate-500">Consulting clinical nutrition engine...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-3.5 bg-white border-t border-slate-100 flex flex-col gap-2">
            {isSpeaking && (
              <button 
                onClick={stopSpeaking}
                className="self-center text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold bg-rose-50 px-3 py-1 rounded-full mb-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" /> Stop Audio
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask or use voice..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-full px-4 py-2.5 text-xs text-slate-800 focus:outline-none transition-colors"
                disabled={isRecording || isLoading}
              />
              
              {textInput.trim() ? (
                <button
                  onClick={handleTextSubmit}
                  disabled={isLoading}
                  className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={toggleRecording}
                  disabled={isLoading}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-200' 
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            {isRecording && (
              <p className="text-[11px] text-rose-600 font-medium text-center mt-0.5 animate-pulse">
                Listening... Tap square to stop & send
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
