import { useEffect, useRef } from 'react';

/**
 * InContentAd Component - Injects ads into blog content every N paragraphs
 * 
 * This component takes HTML content and inserts ad banners after every specified
 * number of paragraphs for maximum ad revenue.
 * 
 * @param {string} content - The HTML content to render with ads
 * @param {string} adKey - Adsterra ad unit key
 * @param {number} paragraphInterval - Insert ad every N paragraphs (default: 3)
 */
const InContentAd = ({
    content,
    adKey = '012f82fd8efee1c8aa29d03593d4de8c',
    paragraphInterval = 3
}) => {
    const contentRef = useRef(null);
    const adsInjected = useRef(false);

    useEffect(() => {
        if (!contentRef.current || adsInjected.current) return;

        // Only inject ads in production
        if (import.meta.env.DEV) {
            // In dev mode, just add visual placeholders
            const paragraphs = contentRef.current.querySelectorAll('p, h2, h3');
            let paragraphCount = 0;

            paragraphs.forEach((p, index) => {
                if (p.tagName === 'P') {
                    paragraphCount++;
                }

                // Insert ad placeholder after every N paragraphs
                if (paragraphCount > 0 && paragraphCount % paragraphInterval === 0 && p.tagName === 'P') {
                    const adPlaceholder = document.createElement('div');
                    adPlaceholder.className = 'my-8 py-4 flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 rounded-xl';
                    adPlaceholder.style.height = '250px';
                    adPlaceholder.innerHTML = '<span class="text-gray-500 text-sm">In-Content Ad (300x250)</span>';

                    // Insert after this paragraph
                    if (p.nextSibling) {
                        p.parentNode.insertBefore(adPlaceholder, p.nextSibling);
                    } else {
                        p.parentNode.appendChild(adPlaceholder);
                    }

                    paragraphCount = 0; // Reset counter
                }
            });

            adsInjected.current = true;
            return;
        }

        // Production: Inject actual Adsterra ads
        const paragraphs = contentRef.current.querySelectorAll('p');
        let paragraphCount = 0;

        paragraphs.forEach((p) => {
            paragraphCount++;

            // Insert ad after every N paragraphs
            if (paragraphCount % paragraphInterval === 0) {
                const adContainer = document.createElement('div');
                adContainer.className = 'my-8 flex items-center justify-center';
                adContainer.style.minHeight = '250px';

                // Create ad scripts
                const optionsScript = document.createElement('script');
                optionsScript.type = 'text/javascript';
                optionsScript.text = `
                    atOptions = {
                        'key' : '${adKey}',
                        'format' : 'iframe',
                        'height' : 250,
                        'width' : 300,
                        'params' : {}
                    };
                `;

                const invokeScript = document.createElement('script');
                invokeScript.type = 'text/javascript';
                invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
                invokeScript.async = true;

                adContainer.appendChild(optionsScript);
                adContainer.appendChild(invokeScript);

                // Insert after this paragraph
                if (p.nextSibling) {
                    p.parentNode.insertBefore(adContainer, p.nextSibling);
                } else {
                    p.parentNode.appendChild(adContainer);
                }
            }
        });

        adsInjected.current = true;
    }, [content, adKey, paragraphInterval]);

    return (
        <div
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default InContentAd;
