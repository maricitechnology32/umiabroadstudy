import { useEffect, useRef, useId } from 'react';

/**
 * AdBanner Component - Displays Adsterra advertisement banners
 * 
 * @param {string} adKey - Adsterra ad unit key
 * @param {number} width - Ad width (default: 728)
 * @param {number} height - Ad height (default: 90)
 * @param {string} className - Additional CSS classes
 */
const AdBanner = ({
    adKey = '56e9dabb44efce88731345b0c91490dd',
    width = 728,
    height = 90,
    className = ''
}) => {
    const containerRef = useRef(null);
    const uniqueId = useId().replace(/:/g, '_');
    const hasLoaded = useRef(false);

    useEffect(() => {
        // Only load ads in production
        if (import.meta.env.DEV) {
            return;
        }

        if (hasLoaded.current || !containerRef.current) {
            return;
        }

        hasLoaded.current = true;
        const container = containerRef.current;

        // Clear any existing content
        container.innerHTML = '';

        // Create inline script for atOptions
        const script1 = document.createElement('script');
        script1.type = 'text/javascript';
        script1.innerHTML = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
            };
        `;

        // Create external script
        const script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
        script2.async = true;

        // Append in sequence
        container.appendChild(script1);
        container.appendChild(script2);

        return () => {
            hasLoaded.current = false;
        };
    }, [adKey, width, height]);

    // Show placeholder in development mode
    if (import.meta.env.DEV) {
        return (
            <div
                className={`flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
                style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
            >
                <div className="text-center">
                    <p className="text-gray-500 text-sm font-medium">Ad Placeholder</p>
                    <p className="text-gray-400 text-xs">{width}x{height}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            id={`ad-${uniqueId}`}
            ref={containerRef}
            className={`ad-banner ${className}`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                maxWidth: '100%',
                overflow: 'hidden',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
            }}
        >
            {/* Ad will be injected here */}
        </div>
    );
};

export default AdBanner;
