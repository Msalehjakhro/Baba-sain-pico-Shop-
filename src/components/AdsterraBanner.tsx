import React, { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
  label?: string;
}

/**
 * Responsive, isolated Adsterra 320x50 Banner component.
 * Uses an iframe sandbox/container to prevent document.write issues
 * and React re-render conflicts.
 */
export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  className = '',
  label = 'Advertisement',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create an iframe to safely isolate the Adsterra script execution
    const iframe = document.createElement('iframe');
    iframe.width = '320';
    iframe.height = '50';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.title = 'Sponsor Ad';
    iframe.loading = 'lazy';
    iframe.className = 'mx-auto block shadow-xs rounded-xs';

    container.innerHTML = '';
    container.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '2059aad8324473e6c81a88b38a879b14',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://bauval.org/22/2059aad8324473e6c81a88b38a879b14"></script>
          </body>
        </html>
      `);
      doc.close();
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`w-full py-4 flex flex-col items-center justify-center no-print ${className}`}>
      {label && (
        <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-400 mb-1.5 select-none">
          {label}
        </span>
      )}
      <div
        ref={containerRef}
        className="w-[320px] min-h-[50px] flex items-center justify-center bg-neutral-50/50 rounded-xs overflow-hidden"
      />
    </div>
  );
};
