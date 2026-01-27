import React from 'react';

/**
 * Reusable Bank Footer Component
 * Conditional footer bar based on template configuration
 */
export const BankFooter = ({ template }) => {
    if (!template.design.footer.enabled) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            background: 'linear-gradient(135deg, #8B9DC3 0%, #DFE3EE 100%)',
            height: '30px',
            borderTop: '2px solid #6B7FA1'
        }}>
        </div>
    );
};
