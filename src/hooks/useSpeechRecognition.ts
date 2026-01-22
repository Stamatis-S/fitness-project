import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

interface UseSpeechRecognitionProps {
  onResult: (value: number) => void;
  language?: string;
}

export function useSpeechRecognition({ onResult, language = 'el-GR' }: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognition result:', transcript);
      
      // Extract number from speech - handle various formats
      // Support both Greek and English numbers, decimals with comma or dot
      const normalizedTranscript = transcript
        .toLowerCase()
        .replace(/,/g, '.') // Replace comma with dot for decimals
        .replace(/και μισό/g, '.5') // "και μισό" = ".5"
        .replace(/μισό/g, '0.5') // "μισό" = "0.5"
        .replace(/ένα/g, '1')
        .replace(/δύο|δυο/g, '2')
        .replace(/τρία|τρια/g, '3')
        .replace(/τέσσερα|τεσσερα/g, '4')
        .replace(/πέντε|πεντε/g, '5')
        .replace(/έξι|εξι/g, '6')
        .replace(/επτά|εφτά|εφτα|επτα/g, '7')
        .replace(/οκτώ|οχτώ|οκτω|οχτω/g, '8')
        .replace(/εννιά|εννέα|εννια|εννεα/g, '9')
        .replace(/δέκα|δεκα/g, '10')
        .replace(/έντεκα|εντεκα/g, '11')
        .replace(/δώδεκα|δωδεκα/g, '12');
      
      // Find numbers in the transcript
      const numberMatch = normalizedTranscript.match(/[\d.]+/);
      
      if (numberMatch) {
        const value = parseFloat(numberMatch[0]);
        if (!isNaN(value)) {
          onResult(value);
          toast.success(`Καταχωρήθηκε: ${value}`);
        } else {
          toast.error('Δεν αναγνωρίστηκε αριθμός');
        }
      } else {
        toast.error('Δεν αναγνωρίστηκε αριθμός');
      }
      
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Δεν έχει δοθεί άδεια για το μικρόφωνο');
      } else if (event.error === 'no-speech') {
        toast.error('Δεν ακούστηκε ομιλία');
      } else {
        toast.error('Σφάλμα αναγνώρισης φωνής');
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, language, onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Η αναγνώριση φωνής δεν υποστηρίζεται σε αυτόν τον browser');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Σφάλμα εκκίνησης αναγνώρισης φωνής');
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
}
