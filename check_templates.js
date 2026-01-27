
import { BANK_TEMPLATES } from './client/src/config/bankTemplates.js';

console.log("Checking templates...");
let found = false;
Object.values(BANK_TEMPLATES).forEach(t => {
    t.transactionDescriptions.deposits.forEach(d => {
        if (d.toUpperCase() === 'CASH DEPOSIT' || d.toUpperCase() === 'CASH WITHDRAWAL') {
            console.log(`FOUND BARE DEPOSIT IN [${t.id}]: "${d}"`);
            found = true;
        }
    });
    t.transactionDescriptions.withdrawals.forEach(w => {
        if (w.toUpperCase() === 'CASH DEPOSIT' || w.toUpperCase() === 'CASH WITHDRAWAL') {
            console.log(`FOUND BARE WITHDRAWAL IN [${t.id}]: "${w}"`);
            found = true;
        }
    });
});

if (!found) console.log("No bare descriptions found.");
