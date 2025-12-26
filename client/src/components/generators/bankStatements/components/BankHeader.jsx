import React from 'react';

/**
 * Reusable Bank Header Component
 * Conditional header bar based on template configuration
 */
export const BankHeader = ({ template, formData }) => {
    if (!template.design.header.enabled) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #8B9DC3 0%, #DFE3EE 100%)',
            padding: '15px 20px',
            borderBottom: '2px solid #6B7FA1'
        }}>
            {/* Registration Number - Left */}
            {template.design.header.showRegistration && template.contact.registration && (
                <div style={{ fontSize: '8pt', color: '#333', marginBottom: '8px' }}>
                    {template.contact.registration}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Logo Space (empty for manual logo placement) */}
                <div style={{ width: '70px', height: '70px', flexShrink: 0 }}>
                    {/* Empty space for logo */}
                </div>

                {/* Company Name and Address */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
                        {formData.bankName || template.name}
                    </div>
                    <div style={{ fontSize: '10pt', color: '#333', marginBottom: '2px' }}>
                        {formData.branch || template.location}
                    </div>
                    <div style={{ fontSize: '9pt', color: '#555' }}>
                        Ph. No.: {template.contact.phone}
                    </div>
                </div>

                {/* Right space for symmetry */}
                <div style={{ width: '70px', flexShrink: 0 }}></div>
            </div>
        </div>
    );
};
