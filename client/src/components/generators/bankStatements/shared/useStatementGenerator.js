import { formatDisplayDate, toSimpleDateString } from './statementHelpers';

/**
 * Custom Hook for Bank Statement Generation
 * Encapsulates all transaction generation logic
 */
export const useStatementGenerator = (template, allHolidays) => {

    const generateStatement = (formData) => {
        let currentBal = parseFloat(formData.openingBalance) || 0;
        let start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const targetBal = parseFloat(formData.targetBalance) || 0;
        const intRate = parseFloat(formData.interestRate) || 0;
        const taxRate = parseFloat(formData.taxRate) || 0;
        const targetTxnCount = parseInt(formData.targetTxnCount) || 40;
        const minTxn = parseFloat(formData.minTxn.toString().replace(/,/g, '')) || 1000;
        const maxTxn = parseFloat(formData.maxTxn.toString().replace(/,/g, '')) || 50000;

        const rows = [];
        let totalDebit = 0;
        let totalCredit = 0;

        // Initial Row
        rows.push({
            date: formatDisplayDate(start),
            desc: "Balance B/F",
            ref: "TRANSFER",
            debit: "",
            credit: "",
            balance: currentBal
        });

        // Interest Dates (Quarterly Endings)
        const qtrEnds = ["10-17", "01-14", "04-14", "07-16"];
        const isInterestDate = (d) => {
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return qtrEnds.includes(`${m}-${day}`);
        };

        const isHoliday = (d) => {
            if (d.getDay() === 6) return true;
            const dStr = toSimpleDateString(d);
            return allHolidays.includes(dStr);
        };

        // Generate Random Transactions
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const generatedTxns = [];
        for (let i = 0; i < targetTxnCount; i++) {
            const randDay = Math.floor(Math.random() * totalDays);
            const txDate = new Date(start);
            txDate.setDate(txDate.getDate() + randDay);
            if (isHoliday(txDate) || isInterestDate(txDate)) continue;

            let isDeposit = Math.random() > 0.4;
            let amount = Math.floor(Math.random() * (maxTxn - minTxn) + minTxn);
            amount = Math.ceil(amount / 100) * 100;
            if (amount < minTxn) amount = Math.ceil(minTxn / 100) * 100;

            const depositDescs = template.transactionDescriptions.deposits;
            const withdrawDescs = template.transactionDescriptions.withdrawals;
            const desc = isDeposit
                ? depositDescs[Math.floor(Math.random() * depositDescs.length)]
                : withdrawDescs[Math.floor(Math.random() * withdrawDescs.length)];

            generatedTxns.push({
                date: txDate,
                dateStr: toSimpleDateString(txDate),
                isDeposit,
                amount,
                desc,
                ref: Math.floor(Math.random() * 9000000 + 1000000).toString()
            });
        }
        generatedTxns.sort((a, b) => a.date - b.date);

        // Time Walk (Day by Day)
        let cursorDate = new Date(start);
        cursorDate.setDate(cursorDate.getDate() + 1);
        let dailyProductSum = 0;
        let lastBalanceInQuarter = currentBal;

        while (cursorDate <= end) {
            const todayPending = generatedTxns.filter(tx => tx.dateStr === toSimpleDateString(cursorDate));
            for (const tx of todayPending) {
                if (tx.isDeposit) {
                    currentBal += tx.amount;
                    totalCredit += tx.amount;
                    rows.push({
                        date: formatDisplayDate(cursorDate),
                        desc: tx.desc,
                        ref: tx.ref,
                        debit: "",
                        credit: tx.amount,
                        balance: currentBal
                    });
                } else {
                    currentBal -= tx.amount;
                    totalDebit += tx.amount;
                    rows.push({
                        date: formatDisplayDate(cursorDate),
                        desc: tx.desc,
                        ref: tx.ref,
                        debit: tx.amount,
                        credit: "",
                        balance: currentBal
                    });
                }
                lastBalanceInQuarter = currentBal;
            }

            dailyProductSum += currentBal;

            if (isInterestDate(cursorDate)) {
                const interestAccrued = (dailyProductSum * intRate) / (36500);
                if (interestAccrued > 0) {
                    const taxAmt = interestAccrued * (taxRate / 100);

                    currentBal += interestAccrued;
                    totalCredit += interestAccrued;
                    rows.push({
                        date: formatDisplayDate(cursorDate),
                        desc: template.transactionDescriptions.interest,
                        ref: "INTEREST",
                        debit: "",
                        credit: interestAccrued,
                        balance: currentBal
                    });

                    currentBal -= taxAmt;
                    totalDebit += taxAmt;
                    rows.push({
                        date: formatDisplayDate(cursorDate),
                        desc: template.transactionDescriptions.tax,
                        ref: "TAX",
                        debit: taxAmt,
                        credit: "",
                        balance: currentBal
                    });

                    dailyProductSum = 0;
                }
            }

            cursorDate.setDate(cursorDate.getDate() + 1);
        }

        return {
            transactions: rows,
            totals: { debit: totalDebit, credit: totalCredit, balance: currentBal }
        };
    };

    return { generateStatement };
};
