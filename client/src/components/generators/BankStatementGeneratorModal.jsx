import { Download, FileText, X, Landmark, Calendar as CalendarIcon } from 'lucide-react';
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getHolidays } from '../../features/holidays/holidaySlice';
import { getTemplate, getTemplateList } from '../../config/bankTemplates';
import { fetchNRBExchangeRate, formatExchangeRateDate } from '../../utils/nrbExchangeRate';

export default function BankStatementGeneratorModal({ isOpen, onClose, student }) {
    if (!isOpen || !student) return null;

    const dispatch = useDispatch();
    const { holidays: globalHolidays } = useSelector((state) => state.holidays) || { holidays: [] };

    // Template System
    const [selectedTemplate, setSelectedTemplate] = useState('sarbeshwor');
    const template = getTemplate(selectedTemplate);
    const templateList = getTemplateList();

    // State
    const [formData, setFormData] = useState({
        // Document options
        includeHeader: true,
        includeFooter: true,

        // Bank Details
        bankName: template.name,
        branch: template.location,
        accountName: `Mr. ${student.familyInfo?.fatherName || ''}`,
        accountNo: "0210017502882",
        accountAddress: `${student.address?.municipality || 'Sainamaina'}-${student.address?.wardNo || '3'}, ${student.address?.district || 'Rupandehi'}, ${student.address?.province || 'Lumbini Province'}, Nepal`,

        // Generation Config
        startDate: "2024-07-28",
        endDate: new Date().toISOString().split('T')[0],
        openingBalance: 2319840.90,
        targetBalance: 3600000.00,
        minTxn: 5000,
        maxTxn: 80000,
        targetTxnCount: 45,
        interestRate: '6',
        taxRate: '5',

        // Certificate Details
        accountType: 'Saving Account',
        accountOpeningDate: '24th July 2019',
        exchangeRate: '140.60',
        managerName: 'Authorized Signature',

        // Ref & Date
        refNo: '2082/083/15',
        issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    });

    // Holidays
    const [localHolidays, setLocalHolidays] = useState([]);
    const [manualDate, setManualDate] = useState('');
    const allHolidays = [...(globalHolidays || []), ...localHolidays];

    // Transactions & Totals
    const [transactions, setTransactions] = useState([]);
    const [totals, setTotals] = useState({ debit: 0, credit: 0, balance: 0 });

    // Exchange Rate State (NRB API)
    const [exchangeRateInfo, setExchangeRateInfo] = useState({
        rate: formData.exchangeRate, // Initialize with form default
        date: new Date().toISOString().split('T')[0],
        source: 'Loading...',
        isLoading: true,
        error: null
    });

    // Fetch NRB Rate on Mount
    useEffect(() => {
        const loadExchangeRate = async () => {
            setExchangeRateInfo(prev => ({ ...prev, isLoading: true }));
            const rateData = await fetchNRBExchangeRate();

            setExchangeRateInfo({
                rate: rateData.rate,
                date: rateData.date,
                source: rateData.source,
                isLoading: false,
                error: rateData.error
            });

            // Update formData with the fetched rate automatically
            setFormData(prev => ({ ...prev, exchangeRate: rateData.rate.toString() }));
        };

        loadExchangeRate();
    }, []);

    // UI State
    const [showHolidayCalendar, setShowHolidayCalendar] = useState(false);

    // Fetch holidays on mount
    useEffect(() => {
        dispatch(getHolidays());
    }, [dispatch]);

    // Helper Functions
    const formatDisplayDate = (dateObj) => {
        if (!dateObj) return '';
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = new Date(dateObj);
        return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    const formatMoneyNoSymbol = (amount) => {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    const toSimpleDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const numberToWords = (n) => {
        if (n < 0) return "Minus " + numberToWords(-n);
        if (n === 0) return "Zero";
        const parts = n.toString().split('.');
        const integerPart = parseInt(parts[0]);
        const decimalPart = parts[1] ? parts[1].substring(0, 2) : "00";
        const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        function convert(num) {
            if (num === 0) return "";
            if (num < 20) return units[num] + " ";
            if (num < 100) return tens[Math.floor(num / 10)] + " " + convert(num % 10);
            if (num < 1000) return units[Math.floor(num / 100)] + " Hundred " + convert(num % 100);
            if (num < 1000000) return convert(Math.floor(num / 1000)) + "Thousand " + convert(num % 1000);
            if (num < 1000000000) return convert(Math.floor(num / 1000000)) + "Million " + convert(num % 1000000);
            return "";
        }
        let words = convert(integerPart).trim();
        if (decimalPart && parseInt(decimalPart) > 0) {
            return `${words} And ${decimalPart}/100 Only`;
        }
        return `${words} Only`;
    };

    // Form Change Handler
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Holiday Management
    const handleDateClick = (date) => {
        const dateStr = toSimpleDateString(date);
        if (localHolidays.includes(dateStr)) {
            setLocalHolidays(localHolidays.filter(h => h !== dateStr));
        } else {
            setLocalHolidays([...localHolidays, dateStr]);
        }
    };

    const addManualHoliday = () => {
        if (manualDate && !localHolidays.includes(manualDate)) {
            setLocalHolidays([...localHolidays, manualDate]);
            setManualDate('');
        }
    };

    const removeLocalHoliday = (date) => {
        setLocalHolidays(localHolidays.filter(h => h !== date));
    };

    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return null;
        const dateStr = toSimpleDateString(date);
        if (allHolidays.includes(dateStr)) return 'bg-red-100 text-red-700 font-bold';
        if (date.getDay() === 6) return 'bg-red-50';
        return null;
    };

    // GENERATOR ALGORITHM: CONVERGENCE & 90-DAY INTEREST CYCLES
    const generateStatement = () => {
        // 1. Gather Inputs
        const initialBal = parseFloat(formData.openingBalance) || 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const targetBal = parseFloat(formData.targetBalance) || 0;
        const intRate = parseFloat(formData.interestRate) || 0;
        const taxRate = parseFloat(formData.taxRate) || 0;
        const targetTxnCount = parseInt(formData.targetTxnCount) || 40;
        const minTxn = parseFloat(formData.minTxn.toString().replace(/,/g, '')) || 1000;
        const maxTxn = parseFloat(formData.maxTxn.toString().replace(/,/g, '')) || 50000;

        // 2. Identify Interest Calculation Dates (Every 90 days from Start Date)
        const interestDates = [];
        let intDateCursor = new Date(start);
        intDateCursor.setDate(intDateCursor.getDate() + 90);
        while (intDateCursor <= end) {
            interestDates.push(toSimpleDateString(intDateCursor));
            intDateCursor.setDate(intDateCursor.getDate() + 90);
        }

        const isHoliday = (d) => {
            if (d.getDay() === 6) return true; // Saturday
            const dStr = toSimpleDateString(d);
            return allHolidays.includes(dStr);
        };

        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // 3. Generate Initial Random Transactions (Exactly targetTxnCount)
        let generatedTxns = [];
        for (let i = 0; i < targetTxnCount; i++) {
            const randDay = Math.floor(Math.random() * totalDays);
            const txDate = new Date(start);
            txDate.setDate(txDate.getDate() + randDay);

            // If holiday or interest date, try to find next available day
            // Simplified: just accept it might fall on a widely distributed date, 
            // but ideally we check isHoliday.
            // Let's retry date generation if it hits a holiday to be polite, but prevent infinite loop.
            let validDate = txDate;
            let checks = 0;
            while ((isHoliday(validDate) || interestDates.includes(toSimpleDateString(validDate))) && checks < 30) {
                validDate.setDate(validDate.getDate() + 1);
                if (validDate > end) validDate = new Date(start); // Wrap around if overshot
                checks++;
            }

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
                date: validDate,
                dateStr: toSimpleDateString(validDate),
                isDeposit,
                amount,
                desc,
                ref: Math.floor(Math.random() * 9000000 + 1000000).toString(),
                isGenerated: true // Mark as adjustable
            });
        }

        // Sort by date
        generatedTxns.sort((a, b) => a.date - b.date);


        // 4. SIMULATION FUNCTION
        // Runs the timeline, calculates interest/taxes, returns rows and final balance.
        const runSimulation = (txns) => {
            const simRows = [];
            let simBal = initialBal;
            let simTotalDebit = 0;
            let simTotalCredit = 0;

            // Initial Row
            simRows.push({
                date: formatDisplayDate(start),
                desc: "Balance B/F",
                ref: "TRANSFER",
                debit: "",
                credit: "",
                balance: simBal
            });

            // Time Walk
            let cursorDate = new Date(start);
            cursorDate.setDate(cursorDate.getDate() + 1);
            let dailyProductSum = 0;

            while (cursorDate <= end) {
                const dateStr = toSimpleDateString(cursorDate);

                // Process Transactions for this day
                const todaysTxns = txns.filter(t => t.dateStr === dateStr);

                // Note: In bank logic, balance for interest is usually EOD. 
                // We process transactions FIRST, then add to product sum.
                for (const tx of todaysTxns) {
                    if (tx.isDeposit) {
                        simBal += tx.amount;
                        simTotalCredit += tx.amount;
                        simRows.push({
                            date: formatDisplayDate(cursorDate),
                            desc: tx.desc,
                            ref: tx.ref,
                            debit: "",
                            credit: tx.amount,
                            balance: simBal
                        });
                    } else {
                        simBal -= tx.amount;
                        simTotalDebit += tx.amount;
                        simRows.push({
                            date: formatDisplayDate(cursorDate),
                            desc: tx.desc,
                            ref: tx.ref,
                            debit: tx.amount,
                            credit: "",
                            balance: simBal
                        });
                    }
                }

                // Add to Daily Product (Calculated on EOD balance)
                dailyProductSum += simBal;

                // Check for Interest Payout Date
                if (interestDates.includes(dateStr)) {
                    // Interest = Sum of Daily Balances * Rate / (365 * 100)
                    // If dailyProductSum accumulates every day, the formula is (Product * Rate) / 36500
                    // Note: 90 days cycle means we should probably reset sum? 
                    // Usually banks calculate quarterly on the minimum monthly balance or avg daily balance.
                    // Here we use simple daily product method.
                    // User asked for "exact every 90 days". We assume clearing sum after payout.

                    const interestAccrued = (dailyProductSum * intRate) / 36500;
                    if (interestAccrued > 0) {
                        const taxAmt = interestAccrued * (taxRate / 100);

                        // Credit Interest
                        simBal += interestAccrued;
                        simTotalCredit += interestAccrued;
                        simRows.push({
                            date: formatDisplayDate(cursorDate),
                            desc: template.transactionDescriptions.interest,
                            ref: "INTEREST",
                            debit: "",
                            credit: interestAccrued,
                            balance: simBal
                        });

                        // Debit Tax
                        simBal -= taxAmt;
                        simTotalDebit += taxAmt;
                        simRows.push({
                            date: formatDisplayDate(cursorDate),
                            desc: template.transactionDescriptions.tax,
                            ref: "TAX",
                            debit: taxAmt,
                            credit: "",
                            balance: simBal
                        });
                    }
                    // Reset product sum for next cycle?
                    // "exact every 90 days" implies independent cycles.
                    dailyProductSum = 0;
                }

                cursorDate.setDate(cursorDate.getDate() + 1);
            }

            return { rows: simRows, finalBal: simBal, totalDebit: simTotalDebit, totalCredit: simTotalCredit };
        };


        // 5. CONVERGENCE LOOP
        // We modify the *last generated transaction* (non-interest) to gap-fill.
        // If there are no transactions, we can't adjust much except expecting initial balance adjustment (not scope here).

        let bestResult = null;
        const maxIterations = 10;

        if (generatedTxns.length > 0) {
            // Find the last adjustable transaction (safest to adjust late in period to minimize impact on interest product sum, 
            // although adjusting ANY transaction affects subsequent daily products).
            // Actually, adjusting the LAST transaction has the LEAST effect on product sum (only affect days after it).
            const lastTxIndex = generatedTxns.length - 1;

            for (let i = 0; i < maxIterations; i++) {
                const simResult = runSimulation(generatedTxns);
                const currentGap = targetBal - simResult.finalBal;

                // Check if close enough (within 0.01)
                if (Math.abs(currentGap) < 0.01) {
                    bestResult = simResult;
                    break;
                }

                // Adjust
                // If gap is positive (Need more money), Increase deposit or Decrease withdrawal
                // generatedTxns[lastTxIndex] is the knob.
                const tx = generatedTxns[lastTxIndex];

                if (tx.isDeposit) {
                    // Deposit: Add gap to amount
                    tx.amount += currentGap;
                } else {
                    // Withdrawal: Subtract gap from amount (Less withdrawal = more balance)
                    tx.amount -= currentGap;
                }

                // If amount becomes negative, flip transaction type?
                // For stability, just ensure min amount. If it goes weird, we stop.
                if (tx.amount < 0) {
                    // Flip type
                    tx.isDeposit = !tx.isDeposit;
                    tx.amount = Math.abs(tx.amount);
                    // Update description to match new type
                    const depositDescs = template.transactionDescriptions.deposits;
                    const withdrawDescs = template.transactionDescriptions.withdrawals;
                    tx.desc = tx.isDeposit
                        ? depositDescs[Math.floor(Math.random() * depositDescs.length)]
                        : withdrawDescs[Math.floor(Math.random() * withdrawDescs.length)];
                }

                // Update array
                generatedTxns[lastTxIndex] = tx;

                bestResult = simResult; // Keep latest
            }
        } else {
            // No transactions to adjust, just run once
            bestResult = runSimulation([]);
        }

        // Final set
        setTransactions(bestResult.rows);
        setTotals({
            debit: bestResult.totalDebit,
            credit: bestResult.totalCredit,
            balance: bestResult.finalBal
        });
        toast.success(`Generated ${generatedTxns.length} transactions with target convergence!`);
    };

    // Print/Save PDF


    // Download Word Doc - Uses Word's automatic page numbering
    const generateWordDoc = () => {
        const printDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const statementPeriod = `${formatDisplayDate(new Date(formData.startDate))} to ${formatDisplayDate(new Date(formData.endDate))}`;

        let html = `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Bank Statement</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {
    size: 210mm 297mm;
    margin: 0.75in 0.75in 1in 0.75in;
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
    mso-footer: f1;
}
div.Section1 { page: Section1; }
body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }
table { border-collapse: collapse; }
p { margin: 6pt 0; }
</style>
</head>
<body>
<div class="Section1">`;

        // ================== PAGE 1: BALANCE CERTIFICATE ==================
        // Header section - either show header or leave space for letterpad
        if (formData.includeHeader) {
            html += `
<p style="font-size:9pt;margin:0">Regd. No. 2296/065/066</p>
<p align="center" style="margin:6pt 0">
<span style="color:#1e40af;font-size:18pt;font-weight:bold;font-style:italic">${formData.bankName}</span><br>
<span style="font-size:11pt">${formData.branch}</span><br>
<span style="font-size:10pt">Ph. No.: 01-5219644</span>
</p>
${template.id !== 'devipur' && template.id !== 'prabhabkari' ? '<hr style="border:none;border-top:1px solid #333">' : ''}
`;
        } else {
            // Leave space for original letterhead (about 70pt)
            html += `<div style="height:70pt">&nbsp;</div>`;
        }

        // Balance Certificate content - different layouts per template
        if (template.id === 'prabhabkari') {
            // Prabhabkari style - name/address in intro, no subtitle
            html += `
<table width="100%" style="margin:15pt 0">
<tr>
<td width="50%" style="font-size:10pt">Ref. No.: ${formData.refNo}</td>
<td width="50%" align="right" style="font-size:10pt">Date: ${formData.issueDate}</td>
</tr>
</table>

<p align="center" style="margin:15pt 0 12pt 0"><span style="font-size:14pt;font-weight:bold">Balance Certificate</span></p>

<p style="margin:12pt 0">This is to certify that the balance in the credit of the Account Holder is mentioned below.</p>
<p style="margin:0 0 12pt 0">Name of Account Holder <b>${formData.accountName}</b> the permanent resident of <b>${formData.accountAddress}</b>.</p>

<div style="border:1px solid #000;padding:10pt;margin:10pt 0">
<table width="100%" style="font-size:10pt">
<tr><td width="25%">A/C No.</td><td width="3%">:</td><td>${formData.accountNo}</td></tr>
<tr><td>Interest Rate</td><td>:</td><td>${formData.interestRate}%</td></tr>
<tr><td>Tax Rate</td><td>:</td><td>${formData.taxRate}%</td></tr>
<tr><td>Account Type</td><td>:</td><td>${formData.accountType}</td></tr>
<tr><td>Currency</td><td>:</td><td>NPR</td></tr>
<tr><td>Balance of NPR</td><td>:</td><td><b>${formatMoneyNoSymbol(totals.balance)}</b></td></tr>
</table>
<p style="margin:6pt 0 0 0;font-size:10pt">(In Words, NPR ${numberToWords(parseFloat(totals.balance))})</p>
<p style="margin:0;font-size:10pt">Equivalent to US$ ${formatMoneyNoSymbol(totals.balance / parseFloat(formData.exchangeRate))}</p>
<p style="margin:0;font-size:10pt">(In Words, ${numberToWords((totals.balance / parseFloat(formData.exchangeRate)).toFixed(2))})</p>
<p style="margin:6pt 0 0 0;font-size:10pt">Note: Conversion has been made @US$ 1= ${formData.exchangeRate} NPR</p>
</div>

<p style="margin:15pt 0">This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.</p>

<table width="100%"><tr><td align="left" style="padding-top:30pt">
.......................................<br><b>Manager</b><br><b>${template.statement?.signature?.name || 'Binod Adhikari'}</b>
</td></tr></table>
`;
        } else if (template.id === 'durwasha') {
            // Durwasha style - name/address in intro paragraph, NO box around details, left signature
            html += `
<table width="100%" style="margin:15pt 0">
<tr>
<td width="50%" style="font-size:10pt">Ref. No.: ${formData.refNo}</td>
<td width="50%" align="right" style="font-size:10pt">Date: ${formData.issueDate}</td>
</tr>
</table>

<p align="center" style="margin:15pt 0 12pt 0"><span style="font-size:14pt;font-weight:bold">Balance Certificate</span></p>

<p style="margin:12pt 0">This is to certify that <b>${formData.accountName}</b> the permanent resident of the <b>${formData.accountAddress}</b>.</p>

<table width="100%" style="font-size:10pt;margin:10pt 0">
<tr><td width="25%">A/C No.</td><td width="3%">:</td><td>${formData.accountNo}</td></tr>
<tr><td>Account Type</td><td>:</td><td>${formData.accountType}</td></tr>
<tr><td>Currency</td><td>:</td><td>NPR</td></tr>
<tr><td>Balance of NPR</td><td>:</td><td><b>${formatMoneyNoSymbol(totals.balance)}</b></td></tr>
</table>

<p style="margin:6pt 0">(In Words, NPR ${numberToWords(parseFloat(totals.balance))})</p>
<p style="margin:0">Equivalent to US$ ${formatMoneyNoSymbol(totals.balance / parseFloat(formData.exchangeRate))}</p>
<p style="margin:0;font-size:10pt">(In Words, ${numberToWords((totals.balance / parseFloat(formData.exchangeRate)).toFixed(2))})</p>
<p style="margin:6pt 0;font-size:10pt">Note: Conversion has been made @US$ 1= ${formData.exchangeRate} NPR</p>

<p style="margin:15pt 0">This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.</p>

<table width="100%"><tr><td align="left" style="padding-top:30pt">
.......................................<br><b>${template.statement?.signature?.name || 'Hari Prasad Khatri'}</b><br>${template.statement?.signature?.title || 'Authorized Signature'}
</td></tr></table>
`;
        } else if (template.id === 'dhaulagiri') {
            // Dhaulagiri style - shows Interest Rate, Tax Rate, Account Opening, left signature
            html += `
<table width="100%" style="margin:15pt 0">
<tr>
<td width="50%" style="font-size:10pt">Ref No.: ${formData.refNo}</td>
<td width="50%" align="right" style="font-size:10pt">Date: ${formData.issueDate}</td>
</tr>
</table>

<p align="center" style="margin:15pt 0 12pt 0"><span style="font-size:14pt;font-weight:bold">Balance Certificate</span></p>

<p style="margin:12pt 0">${template.certificate?.text?.intro || 'This is to certify that the balance in the credit of the Account Holder is mentioned below.'}</p>

<table width="100%" style="font-size:10pt;margin:10pt 0">
<tr><td width="30%">Name of Account Holder</td><td width="3%">:</td><td>${formData.accountName}</td></tr>
<tr><td>Address of Account Holder</td><td>:</td><td>${formData.accountAddress}</td></tr>
<tr><td>&nbsp;</td><td></td><td></td></tr>
<tr><td>A/C No.</td><td>:</td><td>${formData.accountNo}</td></tr>
<tr><td>Interest Rate</td><td>:</td><td>${formData.interestRate}%</td></tr>
<tr><td>Tax Rate</td><td>:</td><td>${formData.taxRate}%</td></tr>
<tr><td>Account Opening</td><td>:</td><td>${formData.accountOpeningDate || '24th July 2019'}</td></tr>
<tr><td>Account Type</td><td>:</td><td>${formData.accountType}</td></tr>
<tr><td>Currency</td><td>:</td><td>NPR</td></tr>
<tr><td>Balance of NPR</td><td>:</td><td><b>${formatMoneyNoSymbol(totals.balance)}</b></td></tr>
</table>

<p style="margin:6pt 0">(In Words, NPR ${numberToWords(parseFloat(totals.balance))})</p>
<p style="margin:0">Equivalent to US$ ${formatMoneyNoSymbol(totals.balance / parseFloat(formData.exchangeRate))}</p>
<p style="margin:0;font-size:10pt">(In Words, ${numberToWords((totals.balance / parseFloat(formData.exchangeRate)).toFixed(2))})</p>
<p style="margin:6pt 0;font-size:10pt">Note: Conversion has been made @US$ 1= ${formData.exchangeRate} NPR</p>

<p style="margin:15pt 0">${template.certificate?.text?.disclaimer || 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'}</p>

<table width="100%"><tr><td align="left" style="padding-top:30pt">
.......................................<br><b>${template.statement?.signature?.name || 'Sapana Khanal'}</b><br>${template.statement?.signature?.title || 'Manager'}
</td></tr></table>
`;
        } else if (template.id === 'nilratna') {
            // Nilratna style - Nepali reference fields with blank spaces for handwriting
            html += `
<table width="100%" style="margin:15pt 0">
<tr>
<td width="50%" style="font-size:10pt">प.सं. <br>चा.नं.</td>
<td width="50%" align="right" style="font-size:10pt">मिति: ____________________</td>
</tr>
</table>

<p align="center" style="margin:15pt 0 6pt 0"><span style="font-size:14pt;font-weight:bold;text-decoration:underline;color:${template.design?.colors?.titleColor || '#DC2626'}">Balance Certificate</span></p>
<p align="center" style="margin:0 0 15pt 0"><span style="font-size:12pt;font-weight:bold;text-decoration:underline;color:${template.design?.colors?.titleColor || '#DC2626'}">To Whom It May Concern</span></p>

<p style="margin:12pt 0">${template.certificate?.text?.intro || 'This is to certify that the balance in the credit of the Account Holder is mentioned below:'}</p>

<table width="100%" style="margin:10pt 0">
<tr><td width="35%">Name of Account Holder</td><td width="3%">:</td><td><b>${formData.accountName}</b></td></tr>
<tr><td>Address of Account Holder</td><td>:</td><td><b>${formData.accountAddress}</b></td></tr>
<tr><td>&nbsp;</td><td></td><td></td></tr>
<tr><td>A/C No.</td><td>:</td><td><b>${formData.accountNo}</b></td></tr>
<tr><td>Account Type</td><td>:</td><td><b>${formData.accountType}</b></td></tr>
<tr><td>Currency</td><td>:</td><td><b>NPR</b></td></tr>
<tr><td>Balance of NPR</td><td>:</td><td><b style="font-size:12pt">${formatMoneyNoSymbol(totals.balance)}</b></td></tr>
</table>

<p>(In Words, NPR ${numberToWords(parseFloat(totals.balance))})</p>

<p>Equivalent to US$ ${formatMoneyNoSymbol(totals.balance / parseFloat(formData.exchangeRate))}</p>
<p style="font-size:10pt">(In Words, ${numberToWords((totals.balance / parseFloat(formData.exchangeRate)).toFixed(2))})</p>

<p style="margin:6pt 0;font-size:10pt">Note: Conversion has been made @US$ 1= ${formData.exchangeRate} NPR</p>

<p style="margin:15pt 0">${template.certificate?.text?.disclaimer || 'This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.'}</p>

<table width="100%"><tr><td align="right" style="padding-top:30pt">
.......................................<br><b>Bishnu B C</b><br>Authorized Signature
</td></tr></table>
`;
        } else {
            // Default layout (Sarbeshwor, Devipur, etc.)
            html += `
<table width="100%" style="margin:15pt 0">
<tr>
<td width="50%" style="font-size:10pt">Ref. No.: ${formData.refNo}<br>Dis. No.: ${template.id === 'devipur' ? '78' : '29'}</td>
<td width="50%" align="right" style="font-size:10pt">Date: ${formData.issueDate}</td>
</tr>
</table>

<p align="center" style="margin:15pt 0 6pt 0"><span style="font-size:14pt;font-weight:bold;text-decoration:underline;color:${template.design?.colors?.titleColor || '#000000'}">${template.certificate?.title || 'Balance Certificate'}</span></p>
${template.certificate?.subtitle !== null ? `<p align="center" style="margin:0 0 15pt 0"><span style="font-size:12pt;font-weight:bold;text-decoration:underline;color:${template.design?.colors?.titleColor || '#000000'}">${template.certificate?.subtitle || 'To Whom It May Concern'}</span></p>` : ''}

<p style="margin:12pt 0">${template.certificate?.text?.intro || 'This is to certify that the balance in the credit of the Account Holder is mentioned below:'}</p>

<table width="100%" style="margin:10pt 0">
<tr><td width="35%">Name of Account Holder</td><td width="3%">:</td><td><b>${formData.accountName}</b></td></tr>
<tr><td>Address of Account Holder</td><td>:</td><td><b>${formData.accountAddress}</b></td></tr>
<tr><td>&nbsp;</td><td></td><td></td></tr>
<tr><td>A/C No.</td><td>:</td><td><b>${formData.accountNo}</b></td></tr>
${template.certificate?.fields?.showAccountOpening ? `<tr><td>A/C Opening Date</td><td>:</td><td><b>${formData.accountOpeningDate || '27th July 2019'}</b></td></tr>` : ''}
<tr><td>Account Type</td><td>:</td><td><b>${formData.accountType}</b></td></tr>
<tr><td>Currency</td><td>:</td><td><b>NPR</b></td></tr>
${template.certificate?.fields?.showInterestRate ? `<tr><td>Interest Rate</td><td>:</td><td><b>${formData.interestRate}%</b></td></tr>` : ''}
${template.certificate?.fields?.showTaxRate ? `<tr><td>Tax Rate</td><td>:</td><td><b>${formData.taxRate}%</b></td></tr>` : ''}
<tr><td>Balance of NPR</td><td>:</td><td><b style="font-size:12pt">${formatMoneyNoSymbol(totals.balance)}</b></td></tr>
</table>

<p>(In Words, NPR ${numberToWords(parseFloat(totals.balance))})</p>

<p>Equivalent to US$ ${formatMoneyNoSymbol(totals.balance / parseFloat(formData.exchangeRate))}</p>
<p style="font-size:10pt">(In Words, ${numberToWords((totals.balance / parseFloat(formData.exchangeRate)).toFixed(2))})</p>

<p style="font-size:10pt">Note: Conversion has been made @US$ 1= ${formData.exchangeRate} NPR</p>

<p style="margin:15pt 0"><b>This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.</b></p>

<table width="100%"><tr><td align="${template.certificate?.layout?.signaturePosition === 'left' ? 'left' : 'right'}" style="padding-top:30pt">
.......................................<br><b>${template.statement?.signature?.showName && template.statement?.signature?.name ? template.statement.signature.name : 'Authorized Signature'}</b>${template.statement?.signature?.showTitle && template.statement?.signature?.title ? `<br>${template.statement.signature.title}` : ''}
</td></tr></table>
`;
        }

        html += `
<br clear="all" style="mso-special-character:line-break;page-break-before:always">
`;

        // ================== PAGE 2+: STATEMENT OF ACCOUNT (Continuous flow - Word handles pagination) ==================
        // Header section - conditional
        if (formData.includeHeader) {
            html += `
<p style="font-size:9pt;margin:0">Regd. No. 2296/065/066</p>
<p align="center" style="margin:6pt 0">
<span style="color:#1e40af;font-size:18pt;font-weight:bold;font-style:italic">${formData.bankName}</span><br>
<span style="font-size:11pt">${formData.branch}</span><br>
<span style="font-size:10pt">Ph. No.: 01-5219644</span>
</p>
${template.id !== 'devipur' && template.id !== 'prabhabkari' ? '<hr style="border:none;border-top:1px solid #333">' : ''}
`;
        } else {
            // Leave space for original letterhead
            html += `<div style="height:70pt">&nbsp;</div>`;
        }

        // Statement title - underline is conditional per template
        const titleUnderline = (template.id === 'siddhapaluwa' || template.id === 'durwasha' || template.id === 'dhaulagiri' || template.id === 'aarati' || template.id === 'aarogya' || template.id === 'nilratna') ? '' : 'text-decoration:underline;';
        html += `
<p align="center" style="margin:12pt 0"><span style="font-size:14pt;font-weight:bold;${titleUnderline}">${template.statement?.title || 'Statement of Account'}</span></p>
`;

        // Account info section - different layouts per template
        if (template.id === 'siddhapaluwa') {
            // Siddha Paluwa style - specific row structure matching sample
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<table width="100%" style="font-size:10pt;margin-bottom:8pt">
<tr>
<td colspan="2">Name of Account Holder: ${formData.accountName}</td>
</tr>
<tr>
<td colspan="2">A/C No.: ${formData.accountNo}</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Interest Rate: ${formData.interestRate}%</td>
<td align="right">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td>Account Type: ${formData.accountType}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Statement From: ${startDateFormatted} to ${endDateFormatted}</p>
`;
        } else if (template.id === 'durwasha') {
            // Durwasha style - specific row order matching sample
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<table width="100%" style="font-size:10pt;margin-bottom:8pt">
<tr>
<td colspan="2">Name of Account Holder: ${formData.accountName}</td>
</tr>
<tr>
<td colspan="2">A/C No.: ${formData.accountNo}</td>
</tr>
<tr>
<td>Interest Rate: ${formData.interestRate}%</td>
<td align="right">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Account Type: ${formData.accountType}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Date: ${startDateFormatted} to ${endDateFormatted}</p>
`;
        } else if (template.id === 'agnijwala') {
            // Agnijwala style - similar to Durwasha but uses default title underline
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<table width="100%" style="font-size:10pt;margin-bottom:8pt">
<tr>
<td>Name of Account Holder: ${formData.accountName}</td>
<td align="right">Interest Rate: ${formData.interestRate}%</td>
</tr>
<tr>
<td>A/C No.: ${formData.accountNo}</td>
<td align="right">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Account Type: ${formData.accountType}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Date: ${startDateFormatted} to ${endDateFormatted}</p>
`;
        } else if (template.id === 'dhaulagiri') {
            // Dhaulagiri style - unique layout: Name (row1), A/C No | Account Type (row2), Address (row3), Interest/Tax | Print Date (row4), Statement Date (row5)
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<table width="100%" style="font-size:10pt;margin-bottom:8pt">
<tr>
<td colspan="2">Name of Account Holder: ${formData.accountName}</td>
</tr>
<tr>
<td>A/C No.: ${formData.accountNo}</td>
<td align="right">Account Type: ${formData.accountType}</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Interest Rate: ${formData.interestRate}% Tax Rate: ${formData.taxRate}%</td>
<td align="right">Print Date:${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Statement Date: ${startDateFormatted} to ${endDateFormatted}</p>
`;
        } else if (template.id === 'aarati') {
            // Aarati style - similar layout to default inline
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<table width="100%" style="font-size:10pt;margin-bottom:8pt">
<tr>
<td colspan="2">Name of Account Holder: ${formData.accountName}</td>
</tr>
<tr>
<td>A/C No.: ${formData.accountNo}</td>
<td align="right">Interest Rate: ${formData.interestRate}%</td>
</tr>
<tr>
<td></td>
<td align="right">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Account Type: ${formData.accountType}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Date: ${startDateFormatted} to ${endDateFormatted}</p>
`;
        } else if (template.id === 'aarogya') {
            // Aarogya style - unique layout with Statement from/to row, simple outer box
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<div style="border:1pt solid #000;padding:8pt;margin-bottom:12pt">
<table width="100%" style="font-size:10pt">
<tr>
<td colspan="3">Name of Account Holder: ${formData.accountName}</td>
</tr>
<tr>
<td colspan="3">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>A/C No.: ${formData.accountNo}</td>
<td align="right">Interest: ${formData.interestRate}%</td>
</tr>
<tr>
<td>Type: ${formData.accountType}</td>
<td align="right">Tax: ${formData.taxRate}%</td>
</tr>
<tr>
<td>Statement from: ${startDateFormatted}</td>
<td>Statement to: ${endDateFormatted}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
</div>
`;
        } else if (template.id === 'nilratna') {
            // Nilratna style - boxed account info layout
            const startDateFormatted = formatDisplayDate(new Date(formData.startDate));
            const endDateFormatted = formatDisplayDate(new Date(formData.endDate));
            html += `
<div style="border:1pt solid #000;padding:8pt;margin-bottom:12pt">
<table width="100%" style="font-size:10pt">
<tr>
<td>Name of Account Holder: ${formData.accountName}</td>
<td align="right">Interest Rate: ${formData.interestRate}%</td>
</tr>
<tr>
<td>A/C No.: ${formData.accountNo}</td>
<td align="right">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td colspan="2">Account Type: ${formData.accountType}</td>
</tr>
</table>
</div>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Date: ${startDateFormatted} to ${endDateFormatted}</p>
`;
        } else if (template.statement?.accountInfo?.layout === 'inline') {
            // Devipur style - simple inline text without bordered table
            html += `
<table width="100%" style="font-size:10pt;margin-bottom:8pt">
<tr>
<td>Name of Account Holder: ${formData.accountName}</td>
<td align="right">Interest Rate: ${formData.interestRate}%</td>
</tr>
<tr>
<td>A/C No.: ${formData.accountNo}</td>
<td align="right">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td colspan="2">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Account Type: ${formData.accountType}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Date: ${statementPeriod}</p>
`;
        } else if (template.statement?.accountInfo?.layout === 'prabhabkari') {
            // Prabhabkari style - bordered box with specific layout
            html += `
<table border="1" cellpadding="2" cellspacing="0" style="border-collapse:collapse;font-size:9pt;margin-bottom:12pt;mso-table-lspace:0pt;mso-table-rspace:0pt">
<tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes">
<td style="border:1px solid #000;padding:3pt">Name of Account Holder: ${formData.accountName}</td>
<td style="border:1px solid #000;padding:3pt">Account Type: ${formData.accountType}</td>
</tr>
<tr style="mso-yfti-irow:1">
<td style="border:1px solid #000;padding:3pt">A/C No.: ${formData.accountNo}</td>
<td style="border:1px solid #000;padding:3pt"></td>
</tr>
<tr style="mso-yfti-irow:2">
<td colspan="2" style="border:1px solid #000;padding:3pt">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr style="mso-yfti-irow:3">
<td style="border:1px solid #000;padding:3pt">Statement From: ${formatDisplayDate(new Date(formData.startDate))}</td>
<td style="border:1px solid #000;padding:3pt">Statement To: ${formatDisplayDate(new Date(formData.endDate))}</td>
</tr>
<tr style="mso-yfti-irow:4;mso-yfti-lastrow:yes">
<td style="border:1px solid #000;padding:3pt">Tax Rate: ${formData.taxRate}% Interest Rate: ${formData.interestRate}%</td>
<td style="border:1px solid #000;padding:3pt">Print Date: ${printDate}</td>
</tr>
</table>
`;
        } else {
            // Sarbeshwor style - bordered table with different layout
            html += `
<table width="100%" border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;font-size:10pt;margin-bottom:12pt">
<tr>
<td style="border-bottom:1px solid #ccc">Name of Account Holder: ${formData.accountName}</td>
<td align="right" style="border-bottom:1px solid #ccc">Interest Rate: ${formData.interestRate}%</td>
</tr>
<tr>
<td style="border-bottom:1px solid #ccc">A/C No.: ${formData.accountNo}</td>
<td align="right" style="border-bottom:1px solid #ccc">Tax Rate: ${formData.taxRate}%</td>
</tr>
<tr>
<td colspan="2" style="border-bottom:1px solid #ccc">Address of Account Holder: ${formData.accountAddress}</td>
</tr>
<tr>
<td>Account Type: ${formData.accountType}</td>
<td align="right">Print Date: ${printDate}</td>
</tr>
</table>
<p align="center" style="font-size:10pt;margin:0 0 12pt 0">Date: ${statementPeriod}</p>
`;
        }

        // Transaction table header - different styling per template
        if (template.id === 'devipur' || template.id === 'prabhabkari' || template.id === 'siddhapaluwa' || template.id === 'durwasha' || template.id === 'agnijwala' || template.id === 'dhaulagiri' || template.id === 'aarati' || template.id === 'aarogya' || template.id === 'nilratna') {
            // Devipur/Prabhabkari/Siddha Paluwa/Durwasha/Agnijwala/Dhaulagiri/Aarati/Aarogya/Nilratna - simpler headers without border or underline
            const descColumn = (template.id === 'prabhabkari' || template.id === 'aarogya') ? 'Particulars' : 'Description';
            html += `
<table width="100%" cellpadding="3" cellspacing="0" style="font-size:10pt">
<tr>
<td width="14%" style="font-weight:bold">Date</td>
<td width="38%" style="font-weight:bold">${descColumn}</td>
<td width="16%" align="right" style="font-weight:bold">Debit</td>
<td width="16%" align="right" style="font-weight:bold">Credit</td>
<td width="16%" align="right" style="font-weight:bold">Balance</td>
</tr>`;
        } else {
            // Sarbeshwor - border bottom on header row
            html += `
<table width="100%" cellpadding="3" cellspacing="0" style="font-size:10pt">
<tr style="border-bottom:1pt solid #000">
<td width="14%" style="font-weight:bold;border-bottom:1pt solid #000">Date</td>
<td width="38%" style="font-weight:bold;border-bottom:1pt solid #000">Description</td>
<td width="16%" align="right" style="font-weight:bold;border-bottom:1pt solid #000">Debit</td>
<td width="16%" align="right" style="font-weight:bold;border-bottom:1pt solid #000">Credit</td>
<td width="16%" align="right" style="font-weight:bold;border-bottom:1pt solid #000">Balance</td>
</tr>`;
        }

        // All transactions - Word handles page breaks automatically
        transactions.forEach((t) => {
            html += `
<tr>
<td>${t.date}</td>
<td>${t.desc}</td>
<td align="right">${t.debit ? formatMoneyNoSymbol(parseFloat(t.debit)) : ''}</td>
<td align="right">${t.credit ? formatMoneyNoSymbol(parseFloat(t.credit)) : ''}</td>
<td align="right">${formatMoneyNoSymbol(t.balance)}</td>
</tr>`;
        });

        // Dhaulagiri - add inline summary as last row in transaction table
        if (template.id === 'dhaulagiri') {
            html += `
<tr>
<td colspan="2" style="font-weight:bold;padding-top:8pt">Statement Summary</td>
<td align="right" style="font-weight:bold">${formatMoneyNoSymbol(totals.debit)}</td>
<td align="right" style="font-weight:bold">${formatMoneyNoSymbol(totals.credit)}</td>
<td align="right" style="font-weight:bold">${formatMoneyNoSymbol(totals.balance)}</td>
</tr>`;
        }

        html += `</table>`;

        // Summary section - different layouts per template
        // Dhaulagiri has inline summary in transaction table, so skip separate summary
        if (template.id === 'dhaulagiri') {
            // No separate summary - already inline in table
        } else if (template.statement?.summary?.format === 'stacked') {
            // Prabhabkari style - left-aligned stacked format
            html += `
<p style="margin:30pt 0 6pt 0"><b>Debit Amount: ${formatMoneyNoSymbol(totals.debit)}</b></p>
<p style="margin:0 0 6pt 0"><b>Credit Amount: ${formatMoneyNoSymbol(totals.credit)}</b></p>
<p style="margin:0 0 12pt 0"><b>Last Balance: ${formatMoneyNoSymbol(totals.balance)}</b></p>
`;
        } else if (template.id === 'durwasha' || template.id === 'agnijwala') {
            // Durwasha/Agnijwala style - stacked format with Statement Summary title, Opening Balance included
            html += `
<p align="center" style="margin:30pt 0 12pt 0"><b>Statement Summary</b></p>
<table width="50%" style="font-size:10pt">
<tr><td width="50%">Debit Amount</td><td align="right">${formatMoneyNoSymbol(totals.debit)}</td></tr>
<tr><td>Credit Amount</td><td align="right">${formatMoneyNoSymbol(totals.credit)}</td></tr>
<tr><td>Opening Balance</td><td align="right">${formatMoneyNoSymbol(parseFloat(formData.openingBalance))}</td></tr>
<tr><td>Current Balance</td><td align="right"><b>${formatMoneyNoSymbol(totals.balance)}</b></td></tr>
</table>
`;
        } else {
            // Default centered table format
            html += `
<p align="center" style="margin:30pt 0 12pt 0"><b><u>Statement Summary</u></b></p>
<table width="70%" align="center" style="font-size:11pt">
<tr>
<td><b>Debit Amount</b></td>
<td align="center">${formatMoneyNoSymbol(totals.debit)}</td>
<td align="right"><b>Current Balance</b></td>
</tr>
<tr>
<td><b>Credit Amount</b></td>
<td align="center">${formatMoneyNoSymbol(totals.credit)}</td>
<td align="right" style="font-size:12pt"><b>${formatMoneyNoSymbol(totals.balance)}</b></td>
</tr>
</table>
`;
        }

        // Signature - different positioning per template
        const sigAlign = template.statement?.signature?.position === 'left' ? 'left' : 'right';
        let sigContent = '';
        if (template.statement?.signature?.showName && template.statement?.signature?.name) {
            // Show name first, then title if applicable
            sigContent = `<b>${template.statement.signature.name}</b>`;
            if (template.statement?.signature?.showTitle && template.statement?.signature?.title) {
                sigContent += `<br>${template.statement.signature.title}`;
            }
        } else {
            // No name, just show title or default
            sigContent = `<b>${template.statement?.signature?.title || 'Authorized Signature'}</b>`;
        }

        html += `
<table width="100%"><tr><td align="${sigAlign}" style="padding-top:40pt">
.......................................<br>${sigContent}
</td></tr></table>

</div>`;

        // Footer with page number - only if footer enabled
        if (formData.includeFooter) {
            html += `
<div style="mso-element:footer" id="f1">
<p align="center" style="font-size:10pt;margin:0">Page <!--[if supportFields]><span style="mso-element:field-begin"></span> PAGE <span style="mso-element:field-end"></span><![endif]--></p>
</div>`;
        }

        html += `
</body></html>`;

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });
        saveAs(blob, `Statement_${formData.accountName.replace(/\s+/g, '_')}.doc`);
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <style>
                {`
    @media print {
        @page {
            size: A4 portrait;
            margin: 20mm 15mm;
        }
                    
                    body {
            margin: 0;
            padding: 0;
            background: white;
        }

        body * {
            visibility: hidden;
        }

        #printable - statement,
            #printable - statement * {
                visibility: visible;
            }

        #printable - statement {
            position: absolute;
            left: 0;
            top: 0;
                    /* Force proper printing flow */
                    .print - page {
                width: 100 % !important;
                max - width: none!important;
                min - height: 0!important;
                margin: 0!important;
                padding: 0!important;
                box - shadow: none!important;
                page -break-after: always!important;
                display: block!important;
            }

                    .print - page: last - child {
                page -break-after: auto!important;
            }

                    /* Hide print buttons */
                    .print - hidden {
                display: none!important;
                visibility: hidden!important;
            }
        }
        `}
            </style>

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-green-600" size={20} /> Bank Statement Generator
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body: 2-Column Layout */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* LEFT: PREVIEW (2/3) */}
                        <div className="flex-1 lg:flex-[2] flex flex-col">
                            {/* Action Buttons */}
                            <div className="flex gap-3 mb-4 print-hidden">

                                <button
                                    onClick={generateWordDoc}
                                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-md"
                                >
                                    <Download size={18} /> Download .DOC
                                </button>
                            </div>

                            {/* Preview Area: ContentEditable */}
                            <div
                                id="printable-statement"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-inner overflow-auto"
                                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.5', minHeight: '600px' }}
                            >
                                {transactions.length === 0 ? (
                                    <div className="text-center text-gray-400 py-20">
                                        <Landmark size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No statement generated yet.</p>
                                        <p className="text-sm mt-2">Configure settings and click Generate.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* PAGE 1: BALANCE CERTIFICATE - Visible A4 Box */}
                                        <div className="print-page" style={{
                                            width: '210mm',
                                            minHeight: '297mm',
                                            margin: '0 auto 20px auto',
                                            padding: '20mm',
                                            background: 'white',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                                        }}>
                                            {/* HEADER BAR (Conditional based on Document Options) */}
                                            {formData.includeHeader ? (
                                                <div style={{ background: 'linear-gradient(135deg, #8B9DC3 0%, #DFE3EE 100%)', padding: '15px 20px', borderBottom: '2px solid #6B7FA1' }}>
                                                    {/* Registration Number - Left */}
                                                    <div style={{ fontSize: '8pt', color: '#333', marginBottom: '8px' }}>
                                                        Regd. No. 2236/063/5/06
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                        {/* Logo Space (empty for manual logo placement) */}
                                                        <div style={{ width: '70px', height: '70px', flexShrink: 0 }}>
                                                            {/* Empty space for logo */}
                                                        </div>

                                                        {/* Company Name and Address */}
                                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                                            <div style={{ fontSize: '16pt', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
                                                                {formData.bankName}
                                                            </div>
                                                            <div style={{ fontSize: '10pt', color: '#333', marginBottom: '2px' }}>
                                                                {formData.branch}
                                                            </div>
                                                            <div style={{ fontSize: '9pt', color: '#555' }}>
                                                                Ph. No.: 01-5219644
                                                            </div>
                                                        </div>

                                                        {/* Right space for symmetry */}
                                                        <div style={{ width: '70px', flexShrink: 0 }}></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Empty space for letterhead when header is disabled */
                                                <div style={{ height: '100px', borderBottom: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ color: '#999', fontSize: '10pt', fontStyle: 'italic' }}>Letterhead Space</span>
                                                </div>
                                            )}

                                            {/* MAIN CONTENT */}
                                            <div style={{ padding: '30px 40px' }}>
                                                {/* Ref/Dis No and Date */}
                                                <div style={{ marginBottom: '30px', overflow: 'hidden' }}>
                                                    {/* Left: Ref and Dis */}
                                                    <div style={{ float: 'left', fontSize: '9pt' }}>
                                                        <div>Ref. No.: {formData.refNo}</div>
                                                        <div style={{ marginTop: '4px' }}>Dis. No.: 29</div>
                                                    </div>

                                                    {/* Right: Date */}
                                                    <div style={{ float: 'right', fontSize: '9pt', textAlign: 'right' }}>
                                                        Date: {formData.issueDate}
                                                    </div>
                                                </div>

                                                {/* Titles with Underlines */}
                                                <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '20px' }}>
                                                    <h1 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '8px', textDecoration: 'underline' }}>
                                                        Balance Certificate
                                                    </h1>
                                                    <h2 style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline' }}>
                                                        To Whom It May Concern
                                                    </h2>
                                                </div>

                                                {/* Intro Text */}
                                                <p style={{ marginBottom: '20px', textAlign: 'justify', fontSize: '10pt' }}>
                                                    This is to certify that the balance in the credit of the Account Holder is mentioned below:
                                                </p>

                                                {/* Account Details Table */}
                                                <table style={{ width: '100%', marginBottom: '20px', fontSize: '10pt', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ padding: '5px 0', width: '37%' }}>Name of Account Holder</td>
                                                            <td style={{ padding: '5px 8px', width: '2%' }}>:</td>
                                                            <td style={{ padding: '5px 0', fontWeight: '600' }}>{formData.accountName}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '5px 0' }}>Address of Account Holder</td>
                                                            <td style={{ padding: '5px 8px' }}>:</td>
                                                            <td style={{ padding: '5px 0', fontWeight: '600' }}>{formData.accountAddress}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '5px 0' }}>A/C No.</td>
                                                            <td style={{ padding: '5px 8px' }}>:</td>
                                                            <td style={{ padding: '5px 0', fontWeight: '600' }}>{formData.accountNo}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '5px 0' }}>Account Type</td>
                                                            <td style={{ padding: '5px 8px' }}>:</td>
                                                            <td style={{ padding: '5px 0', fontWeight: '600' }}>{formData.accountType}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '5px 0' }}>Currency</td>
                                                            <td style={{ padding: '5px 8px' }}>:</td>
                                                            <td style={{ padding: '5px 0', fontWeight: '600' }}>NPR</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '5px 0' }}>Balance of NPR</td>
                                                            <td style={{ padding: '5px 8px' }}>:</td>
                                                            <td style={{ padding: '5px 0', fontWeight: 'bold', fontSize: '11pt' }}>{formatMoneyNoSymbol(totals.balance)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                {/* Amount in Words */}
                                                <p style={{ marginBottom: '15px', fontSize: '10pt' }}>
                                                    (In Words, NPR {numberToWords(parseFloat(totals.balance))})
                                                </p>

                                                {/* USD Equivalent */}
                                                <div style={{ marginBottom: '15px', fontSize: '10pt' }}>
                                                    <div>Equivalent to US$ {formatMoneyNoSymbol(totals.balance / parseFloat(formData.exchangeRate))}</div>
                                                    <div style={{ fontSize: '9pt', marginTop: '4px' }}>
                                                        (In Words, {numberToWords((totals.balance / parseFloat(formData.exchangeRate)).toFixed(2))})
                                                    </div>
                                                </div>

                                                {/* Note */}
                                                <p style={{ fontSize: '9pt', marginBottom: '20px' }}>
                                                    Note: Conversion has been made @US$ 1= {formData.exchangeRate} NPR
                                                </p>

                                                {/* Disclaimer - Bold */}
                                                <p style={{ marginTop: '30px', marginBottom: '50px', fontSize: '9pt', fontWeight: 'bold', lineHeight: '1.5' }}>
                                                    This certificate has been issued as per the request of the account holder without any obligation on the part of this Co-operative.
                                                </p>

                                                {/* Signature Section */}
                                                <div style={{ textAlign: 'right', marginTop: '60px', paddingBottom: '50px' }}>
                                                    <div style={{ display: 'inline-block', textAlign: 'center' }}>
                                                        <div style={{ marginBottom: '5px', fontStyle: 'italic' }}>
                                                            .............................
                                                        </div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>
                                                            Authorized Signature
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FOOTER BAR (Optional based on template) */}
                                            {template.design.footer.enabled && (
                                                <div style={{ marginTop: '40px', background: 'linear-gradient(135deg, #8B9DC3 0%, #DFE3EE 100%)', height: '30px', borderTop: '2px solid #6B7FA1' }}>
                                                </div>
                                            )}
                                        </div>

                                        {/* PAGE 2+: STATEMENT OF ACCOUNT (Dynamic Pagination) */}
                                        {(() => {
                                            // PAGINATION LOGIC
                                            const itemsPerPage = 22; // Safe limit for A4
                                            const chunks = [];
                                            for (let i = 0; i < transactions.length; i += itemsPerPage) {
                                                chunks.push(transactions.slice(i, i + itemsPerPage));
                                            }

                                            // Handle empty case (if no transactions but we want to show structure)
                                            if (chunks.length === 0) chunks.push([]);

                                            return chunks.map((chunk, pageIndex) => (
                                                <div key={pageIndex} className="print-page" style={{
                                                    width: '210mm',
                                                    minHeight: '296mm',
                                                    margin: '0 auto 20px auto',
                                                    padding: '20mm',
                                                    background: 'white',
                                                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                                                    pageBreakAfter: pageIndex === chunks.length - 1 ? 'auto' : 'always',
                                                    position: 'relative'
                                                }}>
                                                    {/* Header Repeated on Statement Pages - Conditional */}
                                                    {formData.includeHeader ? (
                                                        <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                                            <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>{formData.bankName}</div>
                                                            <div style={{ fontSize: '9pt' }}>{formData.branch}</div>
                                                        </div>
                                                    ) : (
                                                        /* Letterhead space when header disabled */
                                                        <div style={{ height: '60px', borderBottom: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                                                            <span style={{ color: '#999', fontSize: '9pt', fontStyle: 'italic' }}>Letterhead Space</span>
                                                        </div>
                                                    )}

                                                    <h2 style={{ textAlign: 'center', fontSize: '14pt', fontWeight: 'bold', marginBottom: '24px', textTransform: 'uppercase' }}>
                                                        {template.statement?.title || 'STATEMENT OF ACCOUNT'}
                                                    </h2>

                                                    {/* Account Info - ONLY ON FIRST STATEMENT PAGE */}
                                                    {pageIndex === 0 && (
                                                        template.statement?.accountInfo?.layout === 'inline' ? (
                                                            /* Devipur style - simple inline text */
                                                            <div style={{ marginBottom: '15px', fontSize: '9pt' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                    <span>Name of Account Holder: {formData.accountName}</span>
                                                                    <span>Interest Rate: {formData.interestRate}%</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                    <span>A/C No.: {formData.accountNo}</span>
                                                                    <span>Tax Rate: {formData.taxRate}%</span>
                                                                </div>
                                                                <div style={{ marginBottom: '4px' }}>
                                                                    Address of Account Holder: {formData.accountAddress}
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Account Type: {formData.accountType}</span>
                                                                    <span>Print Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                </div>
                                                                <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: '500' }}>
                                                                    Date: {formatDisplayDate(new Date(formData.startDate))} to {formatDisplayDate(new Date(formData.endDate))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            /* Sarbeshwor style - bordered box */
                                                            <div style={{ border: '1px solid #000', padding: '10px', marginBottom: '15px', fontSize: '9pt' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                                                                    <span>Name of Account Holder: {formData.accountName}</span>
                                                                    <span>Interest Rate: {formData.interestRate}%</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                                                                    <span>A/C No.: {formData.accountNo}</span>
                                                                    <span>Tax Rate: {formData.taxRate}%</span>
                                                                </div>
                                                                <div style={{ marginBottom: '4px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                                                                    Address of Account Holder: {formData.accountAddress}
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span>Account Type: {formData.accountType}</span>
                                                                    <span>Print Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                                </div>
                                                                <div style={{ textAlign: 'center', marginTop: '8px', fontWeight: '500' }}>
                                                                    Date: {formatDisplayDate(new Date(formData.startDate))} to {formatDisplayDate(new Date(formData.endDate))}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}

                                                    {/* Transaction Table - 5 columns matching sample */}
                                                    <div style={{ marginBottom: '24px', fontSize: '9pt', flex: 1 }}>
                                                        {/* Table Header */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '12% 42% 15% 15% 16%', gap: '4px', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '6px', fontWeight: 'bold' }}>
                                                            <div>Date</div>
                                                            <div>Description</div>
                                                            <div style={{ textAlign: 'right' }}>Debit</div>
                                                            <div style={{ textAlign: 'right' }}>Credit</div>
                                                            <div style={{ textAlign: 'right' }}>Balance</div>
                                                        </div>

                                                        {/* Rows */}
                                                        {chunk.map((t, idx) => (
                                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '12% 42% 15% 15% 16%', gap: '4px', padding: '3px 0' }}>
                                                                <div>{t.date}</div>
                                                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.desc}</div>
                                                                <div style={{ textAlign: 'right' }}>{t.debit ? formatMoneyNoSymbol(parseFloat(t.debit)) : ''}</div>
                                                                <div style={{ textAlign: 'right' }}>{t.credit ? formatMoneyNoSymbol(parseFloat(t.credit)) : ''}</div>
                                                                <div style={{ textAlign: 'right' }}>{formatMoneyNoSymbol(t.balance)}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Footer Info - ONLY ON LAST PAGE */}
                                                    {pageIndex === chunks.length - 1 && (
                                                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                                            {/* Statement Summary - Matching Sample Layout */}
                                                            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                                                <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '15px' }}>Statement Summary</div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: '10pt' }}>
                                                                    <div style={{ textAlign: 'left' }}>
                                                                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Debit Amount</div>
                                                                        <div style={{ fontWeight: '600' }}>Credit Amount</div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'center' }}>
                                                                        <div style={{ marginBottom: '8px' }}>{formatMoneyNoSymbol(totals.debit)}</div>
                                                                        <div>{formatMoneyNoSymbol(totals.credit)}</div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <div style={{ fontWeight: '600', marginBottom: '8px' }}>Current Balance</div>
                                                                        <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>{formatMoneyNoSymbol(totals.balance)}</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Signature */}
                                                            <div style={{ textAlign: 'right', marginTop: '50px' }}>
                                                                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                                                                    <div style={{ marginBottom: '5px' }}>...............................</div>
                                                                    <div style={{ fontWeight: 'bold' }}>Authorized Signature</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Page Numbering - Conditional */}
                                                    {formData.includeFooter && (
                                                        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '9pt' }}>
                                                            {pageIndex + 1}
                                                        </div>
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: FORM (1/3) */}
                        <div className="lg:flex-1 flex flex-col gap-6 print-hidden">
                            {/* Bank Template Selector */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
                                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-blue-600" />
                                    Select Bank Template
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => {
                                        const newTemplate = e.target.value;
                                        setSelectedTemplate(newTemplate);
                                        const tmpl = getTemplate(newTemplate);
                                        setFormData(prev => ({
                                            ...prev,
                                            bankName: tmpl.name,
                                            branch: tmpl.location
                                        }));
                                    }}
                                    className="w-full border-2 border-blue-300 p-2 rounded-lg text-sm font-semibold focus:border-blue-500"
                                >
                                    {templateList.map(tmpl => (
                                        <option key={tmpl.value} value={tmpl.value}>{tmpl.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Document Options */}
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-bold text-sm mb-3 text-gray-700">Document Options</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.includeHeader}
                                            onChange={(e) => setFormData(prev => ({ ...prev, includeHeader: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm">Include Header</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.includeFooter}
                                            onChange={(e) => setFormData(prev => ({ ...prev, includeFooter: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm">Include Footer (Page Numbers)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Account Configuration */}
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-bold text-sm mb-3 text-gray-700">Account Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Account Name</label>
                                        <input name="accountName" value={formData.accountName} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Account No</label>
                                        <input name="accountNo" value={formData.accountNo} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Address</label>
                                        <input name="accountAddress" value={formData.accountAddress} onChange={handleChange} className="w-full border p-2 rounded text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* Generation Settings */}
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-bold text-sm mb-3 text-gray-700">Statement Configuration</h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Start Date</label>
                                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">End Date</label>
                                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Opening Balance</label>
                                            <input type="number" name="openingBalance" value={formData.openingBalance} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-green-600">Target Balance</label>
                                            <input type="number" name="targetBalance" value={formData.targetBalance} onChange={handleChange} className="w-full border-2 border-green-200 p-2 rounded text-xs font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Min Transaction</label>
                                            <input type="number" name="minTxn" value={formData.minTxn} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Max Transaction</label>
                                            <input type="number" name="maxTxn" value={formData.maxTxn} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-purple-600">Transaction Count</label>
                                        <input type="number" name="targetTxnCount" value={formData.targetTxnCount} onChange={handleChange} className="w-full border-2 border-purple-200 p-2 rounded text-xs" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Interest Rate %</label>
                                            <input name="interestRate" value={formData.interestRate} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Tax Rate %</label>
                                            <input name="taxRate" value={formData.taxRate} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Holiday Management */}
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-bold text-sm mb-3 text-gray-700 flex items-center gap-2">
                                    <CalendarIcon size={16} /> Holidays
                                </h4>
                                <button
                                    onClick={() => setShowHolidayCalendar(!showHolidayCalendar)}
                                    className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs font-semibold hover:bg-gray-200"
                                >
                                    {showHolidayCalendar ? 'Hide' : 'Manage'} Holidays ({allHolidays.length})
                                </button>
                                {showHolidayCalendar && (
                                    <div className="mt-3">
                                        <Calendar
                                            onClickDay={handleDateClick}
                                            tileClassName={tileClassName}
                                            className="w-full text-xs"
                                        />
                                        <div className="mt-2 space-y-1">
                                            {localHolidays.map(date => (
                                                <div key={date} className="flex justify-between items-center text-xs bg-red-50 p-2 rounded">
                                                    <span>{date}</span>
                                                    <button onClick={() => removeLocalHoliday(date)} className="text-red-600 hover:text-red-800">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Certificate Details */}
                            <div className="bg-white border rounded-lg p-4">
                                <h4 className="font-bold text-sm mb-3 text-gray-700">Certificate Details</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Exchange Rate (1 USD)</label>
                                        <div className="flex gap-2">
                                            <input
                                                name="exchangeRate"
                                                value={formData.exchangeRate}
                                                onChange={handleChange}
                                                className="w-full border p-2 rounded text-xs"
                                            />
                                            <button
                                                onClick={async () => {
                                                    setExchangeRateInfo(prev => ({ ...prev, isLoading: true }));
                                                    // Prioritize Issue Date, then End Date, then Today
                                                    const targetDate = formData.issueDate || formData.endDate || new Date().toISOString().split('T')[0];

                                                    const rateData = await fetchNRBExchangeRate(targetDate);

                                                    setExchangeRateInfo({
                                                        rate: rateData.rate,
                                                        date: rateData.date,
                                                        source: rateData.source,
                                                        isLoading: false,
                                                        error: rateData.error
                                                    });

                                                    setFormData(prev => ({ ...prev, exchangeRate: rateData.rate.toString() }));
                                                    toast.success(`Updated rate for ${rateData.date}`);
                                                }}
                                                disabled={exchangeRateInfo.isLoading}
                                                className="px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded border border-blue-200"
                                                title={`Fetch Rate for ${formData.issueDate || formData.endDate || 'Today'}`}
                                            >
                                                {exchangeRateInfo.isLoading ? '...' : '↻'}
                                            </button>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1 truncate">
                                            {exchangeRateInfo.isLoading ? 'Loading...' : `${exchangeRateInfo.source} (${formatExchangeRateDate(exchangeRateInfo.date)})`}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Manager Name</label>
                                        <input name="managerName" value={formData.managerName} onChange={handleChange} className="w-full border p-2 rounded text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={generateStatement}
                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
                            >
                                Generate Statement
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
