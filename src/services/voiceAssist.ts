// Web Speech API Voice Assist Service for StockStar
// Provides Text-to-Speech (TTS) narration and Speech-to-Text (STT) voice queries

export interface VoiceAssistState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  rate: number;
}

type SpeechCallback = () => void;
type ErrorCallback = (error: string) => void;

class VoiceAssistService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListening = false;
  private rate = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  // Speak text with text-to-speech
  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: SpeechCallback;
      onEnd?: SpeechCallback;
      onError?: ErrorCallback;
    }
  ): boolean {
    if (!this.synth) return false;

    // Stop any ongoing speech
    this.stop();

    if (!text || !text.trim()) return false;

    // Clean markdown or unwanted tokens for natural pronunciation
    const cleanText = text
      .replace(/[#*_`~]/g, '')
      .replace(/₹/g, 'Rupees ')
      .replace(/\$/g, 'Dollars ')
      .replace(/%/g, ' percent')
      .replace(/P\/E/g, 'P to E')
      .replace(/P\/B/g, 'P to B')
      .replace(/EV\/EBITDA/g, 'EV to EBITDA')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate || this.rate;
    utterance.pitch = options?.pitch || 1.0;
    utterance.lang = 'en-US';

    // Pick natural sounding voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      v =>
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Premium')))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options?.onError?.(e.error || 'Speech synthesis failed');
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  public pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking);
  }

  public isPaused(): boolean {
    return !!(this.synth && this.synth.paused);
  }

  public setRate(newRate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
  }

  public getRate(): number {
    return this.rate;
  }

  // Voice recognition (Speech to text)
  public startListening(
    onResult: (transcript: string) => void,
    options?: {
      onStart?: SpeechCallback;
      onEnd?: SpeechCallback;
      onError?: ErrorCallback;
    }
  ): boolean {
    if (!this.isSTTSupported()) {
      options?.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        options?.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onResult(transcript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        options?.onError?.(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options?.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      options?.onError?.(err?.message || 'Could not start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignored
      }
    }
    this.isListening = false;
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export const voiceAssist = new VoiceAssistService();
