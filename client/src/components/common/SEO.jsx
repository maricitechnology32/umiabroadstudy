import { Helmet } from 'react-helmet-async';

export default function SEO({
    title,
    description = "Leading consultancy for Japan Visa services. Powered by UMI Abroad Study.",
    keywords = "Japan Visa, UMI Abroad Study, Student Visa, Work Visa, Consultancy, Nepal",
    image = "/logo.png",
    url = window.location.href
}) {
    const siteTitle = "UMI Abroad  Study";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
}
