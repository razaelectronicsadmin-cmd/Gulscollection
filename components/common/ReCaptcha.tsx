'use client';

import React, { useEffect, useRef, useState, useId } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          theme?: 'light' | 'dark';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      ready: (callback: () => void) => void;
    };
    onGoogleReCaptchaLoad?: () => void;
  }
}

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  className?: string;
}

export default function ReCaptcha({
  onVerify,
  onExpire,
  theme = 'light',
  className = '',
}: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const uniqueId = useId().replace(/:/g, '');
  const containerId = `recaptcha-widget-${uniqueId}`;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LdtCg0uAAAAACLitSUhzuuT6I1IdPqBekXKq8Lq';

  useEffect(() => {
    // If siteKey is missing, return
    if (!siteKey) return;

    const renderWidget = () => {
      if (
        typeof window.grecaptcha?.render === 'function' &&
        containerRef.current &&
        widgetIdRef.current === null
      ) {
        try {
          const id = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            callback: (token: string) => {
              onVerify(token);
            },
            'expired-callback': () => {
              onExpire?.();
            },
            'error-callback': () => {
              onExpire?.();
            },
          });
          widgetIdRef.current = id;
          setIsLoaded(true);
        } catch (e) {
          console.warn('[ReCaptcha render error]', e);
        }
      }
    };

    // Check if script is already present
    if (typeof window.grecaptcha?.render === 'function') {
      renderWidget();
    } else {
      const existingScript = document.getElementById('google-recaptcha-script');
      if (!existingScript) {
        window.onGoogleReCaptchaLoad = () => {
          renderWidget();
        };
        const script = document.createElement('script');
        script.id = 'google-recaptcha-script';
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onGoogleReCaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        // Script already injecting, poll briefly until ready
        const interval = setInterval(() => {
          if (typeof window.grecaptcha?.render === 'function') {
            clearInterval(interval);
            renderWidget();
          }
        }, 150);
        return () => clearInterval(interval);
      }
    }
  }, [siteKey, theme, onVerify, onExpire]);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div id={containerId} ref={containerRef} className="min-h-[78px] flex items-center" />
      {!isLoaded && (
        <span className="text-[11px] text-gray-400 font-sans tracking-wide">
          Loading security verification...
        </span>
      )}
    </div>
  );
}
