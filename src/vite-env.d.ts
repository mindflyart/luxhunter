/// <reference types="vite/client" />

interface Window {
  Calendly?: {
    initInlineWidget: (options: { url: string; parentElement: HTMLElement | null }) => void;
  };
}
