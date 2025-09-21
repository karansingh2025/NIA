interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: "audiostart", listener: (ev: Event) => any): void;
  addEventListener(type: "soundstart", listener: (ev: Event) => any): void;
  addEventListener(type: "speechstart", listener: (ev: Event) => any): void;
  addEventListener(type: "speechend", listener: (ev: Event) => any): void;
  addEventListener(type: "soundend", listener: (ev: Event) => any): void;
  addEventListener(type: "audioend", listener: (ev: Event) => any): void;
  addEventListener(
    type: "result",
    listener: (ev: SpeechRecognitionEvent) => any
  ): void;
  addEventListener(
    type: "nomatch",
    listener: (ev: SpeechRecognitionEvent) => any
  ): void;
  addEventListener(
    type: "error",
    listener: (ev: SpeechRecognitionErrorEvent) => any
  ): void;
  addEventListener(type: "start", listener: (ev: Event) => any): void;
  addEventListener(type: "end", listener: (ev: Event) => any): void;
  onresult: (ev: SpeechRecognitionEvent) => any;
  onerror: (ev: SpeechRecognitionErrorEvent) => any;
  onend: (ev: Event) => any;
  onstart: (ev: Event) => any;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof webkitSpeechRecognition;
}
