import React from 'react';
import { formatMoneyNoSymbol, numberToWords, formatDisplayDate } from '../shared/statementHelpers';

/**
 * Reusable Account Summary Component
 * Bordered account info box for statements
 */
export const AccountSummary = ({ template, formData }) => {
    if (!template.statement.accountInfo.boxed) return null;

    return (
        <div style={{ border: '1px solid #000', padding: '12px', marginBottom: '20px', fontSize: '9pt' }}>
            <div style={{ marginBottom: ' 6px' }}>
                <strong>Account Name:</strong> {formData.accountName}
                <span style={{ float: 'right' }}><strong>A/C No:</strong> {formData.accountNo}</span>
            </div>
            <div style={{ marginBottom: '6px', clear: 'both' }}>
                <strong>Address:</strong> {formData.accountAddress}
            </div>
            <div style={{ marginBottom: '6px' }}>
                <strong>Statement From:</strong> {formatDisplayDate(new Date(formData.startDate))}
                <span style={{ float: 'right' }}><strong>To:</strong> {formatDisplayDate(new Date(formData.endDate))}</span>
            </div>
            <div style={{ clear: 'both' }}>
                <strong>Currency:</strong> NPR
            </div>
        </div>
    );
};
