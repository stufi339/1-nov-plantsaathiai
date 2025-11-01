import { X, Send, Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import { geminiAIService } from "@/lib/geminiAIService";
import { useToast } from "@/hooks/use-toast";

// Type declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface AIAdvisorChatProps {
  onClose: () => void;
}

export const AIAdvisorChat = ({ onClose }: AIAdvisorChatProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: t('how_can_i_help'),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Gemini AI service with user context
    const initializeAI = async () => {
      try {
        await geminiAIService.loadUserContext(language);
        const quickSuggestions = geminiAIService.getQuickSuggestions();
        setSuggestions(quickSuggestions);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        toast({
          title: "AI Initialization",
          description: "AI assistant is ready, but some features may be limited.",
          variant: "default",
        });
        setIsInitialized(true);
      }
    };

    initializeAI();

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      // Set language based on user preference
      const langMap: { [key: string]: string } = {
        hi: 'hi-IN',
        bn: 'bn-IN',
        en: 'en-IN',
      };
      recognitionRef.current.lang = langMap[language] || 'hi-IN';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setInput(speechToText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage = { role: "user" as const, content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send to Gemini AI
      const response = await geminiAIService.sendMessage(textToSend);
      
      // Add AI response
      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: response,
        },
      ]);

      // Update suggestions
      const newSuggestions = geminiAIService.getQuickSuggestions();
      setSuggestions(newSuggestions);
    } catch (error: any) {
      console.error('AI response error:', error);
      
      let errorMessage = "Sorry, I couldn't process your request. ";
      
      if (error.message.includes('API key')) {
        errorMessage = "⚠️ Gemini API key not configured. Please add your API key in settings to use the AI assistant.";
      } else if (error.message.includes('quota')) {
        errorMessage = "API quota exceeded. Please try again later or check your API key.";
      } else {
        errorMessage += "Please try again or rephrase your question.";
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant" as const,
          content: errorMessage,
        },
      ]);

      toast({
        title: "AI Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please use text input.",
        variant: "default",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Speech recognition start error:', error);
        toast({
          title: "Voice Input Error",
          description: "Could not start voice input. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-accent">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            🤖
          </div>
          <div>
            <h2 className="font-semibold text-white">{t('ai_advisor')}</h2>
            <p className="text-xs text-white/80">Powered by Gemini</p>
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">Krishi Saathi</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3 border border-border">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        {!isLoading && messages.length <= 2 && suggestions.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground font-medium px-2">Quick Questions:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left text-sm p-3 rounded-lg bg-card border border-border hover:bg-accent hover:border-primary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('ask_farming_question')}
            className="flex-1"
            disabled={isLoading || !isInitialized}
          />
          <Button
            onClick={toggleSpeechRecognition}
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            disabled={isLoading || !isInitialized}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button 
            onClick={() => handleSend()} 
            size="icon" 
            className="bg-gradient-primary"
            disabled={isLoading || !input.trim() || !isInitialized}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {isListening ? "🎤 Listening..." : isInitialized ? "Powered by Gemini AI" : "Initializing..."}
          </p>
          {isInitialized && (
            <button
              onClick={() => {
                geminiAIService.clearHistory();
                setMessages([{ role: "assistant", content: t('how_can_i_help') }]);
                toast({
                  title: "Chat Cleared",
                  description: "Conversation history has been reset.",
                });
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
