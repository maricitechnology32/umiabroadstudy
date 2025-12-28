import { useEffect, useRef } from 'react';

/**
 * 728x90 Banner Ad Component
 * Loads ad script dynamically and displays banner ad
 */
export default function BannerAd({ className = '' }) {
    const adContainerRef = useRef(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        // Prevent duplicate script loading
        if (scriptLoadedRef.current) return;

        // Create ad container div
        const adDiv = document.createElement('div');
        adDiv.id = `banner-ad-${Date.now()}`;

        if (adContainerRef.current) {
            adContainerRef.current.appendChild(adDiv);
        }

        // Create and inject configuration script
        const configScript = document.createElement('script');
        configScript.type = 'text/javascript';
        configScript.innerHTML = `
            atOptions = {
                'key' : '57576333892dd374fa5a96f56b280fa3',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
            };
        `;

        // Create and inject ad invoke script
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = 'https://www.highperformanceformat.com/57576333892dd374fa5a96f56b280fa3/invoke.js';
        invokeScript.async = true;

        // Append scripts to the ad container
        if (adContainerRef.current) {
            adContainerRef.current.appendChild(configScript);
            adContainerRef.current.appendChild(invokeScript);
            scriptLoadedRef.current = true;
        }

        // Cleanup function
        return () => {
            if (adContainerRef.current) {
                adContainerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div
            ref={adContainerRef}
            className={`flex justify-center items-center w-full my-6 ${className}`}
            style={{ minHeight: '90px' }}
        />
    );
}
