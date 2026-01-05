import { Download, FileText, Printer, Plus, Trash2, X, DollarSign, UserPen, Calendar, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getThreeConsecutiveFiscalYears, getFiscalYearLabels, getDefaultStartYear, parseFiscalDateParts } from '../../utils/nepaliFiscalYear';
import { fetchNRBExchangeRate, formatExchangeRateDate, formatExchangeRateDateWithSuperscript, parseExchangeRateParts } from '../../utils/nrbExchangeRate';
import { getFormattedDate, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

export default function AnnualIncomeVerificationModal({ isOpen, onClose, student }) {
    if (!isOpen || !student) return null;

    // Helper: Format Number to Currency (e.g. 1,00,000.00)
    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
    };

    // Fiscal Year Calculation - Fixed to show 2022/2023, 2023/2024, 2024/2025
    const [startYear, setStartYear] = useState(2022);
    const fiscalYearData = getThreeConsecutiveFiscalYears(startYear);

    // 1. Initial State
    const [formData, setFormData] = useState({
        // Document options
        includeHeader: true,
        includeFooter: true,
        logoSize: 136,

        // Header info (will be dynamically set from student)
        headerTitle: 'Machhapuchhre Rural Municipality',
        headerSubtitle: '4 No. Ward Office',
        headerAddress1: 'Lahachok, Kaski',
        headerAddress2: 'Gandaki Province, Nepal',

        // Footer info
        footerEmail: 'machhapuchhrereward4@gmail.com',
        footerPhone: '+977-9856017304',

        refNo: '2082/083',
        disNo: '402',
        date: getFormattedDate(),

        parentName: `Mr. ${student.familyInfo?.fatherName || 'Parent Name'}`,
        relation: 'father',
        studentName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

        // Financial Data
        exchangeRate: student.financialInfo?.exchangeRate || 142.36,

        // Income Sources (Dynamic Rows)
        incomeData: [],

        // Signatory
        signatoryName: 'Lob Bahadur Shahi',
        signatoryDesignation: 'Ward Chairperson'
    });

    // Calculated Totals State
    const [totals, setTotals] = useState({
        totalNPR: [0, 0, 0],
        totalUSD: [0, 0, 0]
    });

    // NRB Exchange Rate State
    const [exchangeRateInfo, setExchangeRateInfo] = useState({
        rate: formData.exchangeRate,
        date: new Date().toISOString().split('T')[0],
        source: 'Loading...',
        isLoading: true
    });

    // Fetch NRB Exchange Rate on modal open
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
            // Update form data with fetched rate
            setFormData(prev => ({ ...prev, exchangeRate: rateData.rate }));
        };
        loadExchangeRate();
    }, []);

    // Reset/Auto-fill with student data
    useEffect(() => {
        if (student) {
            // Transform database structure to UI structure
            let initialIncomeData = student.financialInfo?.incomeSources?.map(src => ({
                source: src.sourceName,
                amount1: src.amounts[0] || 0,
                amount2: src.amounts[1] || 0,
                amount3: src.amounts[2] || 0
            })) || [];

            if (initialIncomeData.length === 0) {
                initialIncomeData = [
                    { source: "Agriculture Products (Maize & Mustard)", amount1: 958000, amount2: 973000, amount3: 995500 },
                    { source: "Animal Husbandry (Goat & Buffalo)", amount1: 675000, amount2: 712500, amount3: 857000 },
                    { source: "Vegetable Products (Potato & Cabbage)", amount1: 764600, amount2: 845500, amount3: 947000 }
                ];
            }

            setFormData(prev => ({
                ...prev,
                // DYNAMIC HEADER FROM STUDENT PROFILE
                headerTitle: student.address?.municipality || 'Machhapuchhre Rural Municipality',
                headerSubtitle: student.address?.wardNo ? `${student.address.wardNo} No. Ward Office` : '4 No. Ward Office',
                headerAddress1: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}`,
                headerAddress2: `${student.address?.province || ''}, Nepal`,

                parentName: `Mr. ${student.familyInfo?.fatherName || ''}`,
                relation: 'father',
                studentName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
                addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,
                incomeData: initialIncomeData,
                exchangeRate: student.financialInfo?.exchangeRate || 142.36
            }));
        }
    }, [student]);

    // Auto-Calculate Totals whenever incomeData or exchangeRate changes
    useEffect(() => {
        const sum1 = formData.incomeData.reduce((acc, row) => acc + Number(row.amount1 || 0), 0);
        const sum2 = formData.incomeData.reduce((acc, row) => acc + Number(row.amount2 || 0), 0);
        const sum3 = formData.incomeData.reduce((acc, row) => acc + Number(row.amount3 || 0), 0);

        const rate = Number(formData.exchangeRate) || 1;

        setTotals({
            totalNPR: [sum1, sum2, sum3],
            totalUSD: [sum1 / rate, sum2 / rate, sum3 / rate]
        });
    }, [formData.incomeData, formData.exchangeRate]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Dynamic Table Handlers ---
    const handleIncomeChange = (index, field, value) => {
        const updated = [...formData.incomeData];
        updated[index][field] = value;
        setFormData({ ...formData, incomeData: updated });
    };

    const addIncomeRow = () => {
        setFormData({
            ...formData,
            incomeData: [...formData.incomeData, { source: "", amount1: 0, amount2: 0, amount3: 0 }]
        });
    };

    const removeIncomeRow = (index) => {
        const updated = formData.incomeData.filter((_, i) => i !== index);
        setFormData({ ...formData, incomeData: updated });
    };

    // Print handler
    const handlePrint = () => {
        window.print();
    };

    // Get fiscal year labels for display
    const fiscalYearLabels = getFiscalYearLabels(startYear);

    // Word Document Generator
    const generateWordDoc = () => {
        // Generate Rows HTML - compact padding
        const tableRows = formData.incomeData.map((row, index) => `
        <tr>
            <td style="padding: 2pt 3pt; border: 1pt solid black; text-align: center; font-size: 9pt;">${index + 1}</td>
            <td style="padding: 2pt 3pt; border: 1pt solid black; font-size: 9pt;">${row.source}</td>
            <td style="padding: 2pt 3pt; border: 1pt solid black; text-align: right; font-size: 9pt;">${formatCurrency(row.amount1)}</td>
            <td style="padding: 2pt 3pt; border: 1pt solid black; text-align: right; font-size: 9pt;">${formatCurrency(row.amount2)}</td>
            <td style="padding: 2pt 3pt; border: 1pt solid black; text-align: right; font-size: 9pt;">${formatCurrency(row.amount3)}</td>
        </tr>
    `).join('');

        const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Annual Income Verification</title>
        <style>
          @page { margin: 0.4in 0.5in; size: A4; }
          body { font-family: 'Times New Roman', serif; font-size: 10pt; line-height: 1.2; }
          p { margin-bottom: 4pt; text-align: justify; }
          .doc-title { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin-top: 5pt; margin-bottom: 3pt; }
          .doc-subtitle { text-align: center; font-size: 10pt; font-weight: bold; text-decoration: underline; margin-bottom: 8pt; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 3pt; margin-bottom: 6pt; font-size: 9pt; }
          .data-table th, .data-table td { border: 1pt solid black; padding: 2pt 3pt; }
          .data-table th { text-align: center; font-weight: bold; font-size: 8pt; }
          .signature-block { text-align: right; margin-top: 20pt; font-size: 10pt; }
        </style>
      </head>
      <body>
        
        ${formData.includeHeader ? `
        <table style="width: 100%; margin-bottom: 3pt;">
          <tr>
            <td style="width: 20%; vertical-align: top; padding-left: 3pt;">
               <img src="${window.location.origin}/nepal_coat_of_arms.png" width="90" height="auto" />
            </td>
            <td style="width: 60%; text-align: center; vertical-align: middle;">
              <div style="font-size: 20pt; font-weight: bold; color: #b91c1c;">${formData.headerTitle}</div>
              <div style="font-size: 16pt; font-weight: bold; color: #b91c1c;">${formData.headerSubtitle}</div>
              <div style="font-size: 12pt; font-weight: bold; color: #b91c1c;">${formData.headerAddress1}</div>
              <div style="font-size: 12pt; font-weight: bold; color: #b91c1c;">${formData.headerAddress2}</div>
            </td>
            <td style="width: 20%;"></td>
          </tr>
        </table>

        <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 9pt; margin-bottom: 8pt; border-bottom: 1.5pt solid #DC2626; padding-bottom: 3pt;">
          <tr>
              <td style="text-align: left;">
                  <div><span style="color: #DC2626;">Ref. No.:</span> <span style="color: black;">${formData.refNo}</span></div>
                  <div><span style="color: #DC2626;">Dis. No.:</span> <span style="color: black;">${formData.disNo}</span></div>
              </td>
              <td style="text-align: right; vertical-align: bottom;">
                  <span style="color: #DC2626;">Date:</span> <span style="color: black;">${addSuperscriptToDateString(formData.date)}</span>
              </td>
          </tr>
        </table>
        ` : ''}

        <div class="doc-title" style="text-transform: none;">Annual Income Verification Certificate</div>
        <div class="doc-subtitle">To Whom It May Concern</div>

        <p style="font-size: 10pt;">
          This is to certify that <strong>${formData.parentName}</strong> ${formData.relation} of 
          <strong>${formData.studentName}</strong> the permanent resident of 
          <strong>${formData.addressLine}</strong> has submitted an application to this office for the verification of an annual income. 
          Annual income is calculated of last 3 years from fiscal year are mentioned below:
        </p>

        <div style="text-align: center; font-weight: bold; margin-bottom: 3pt; font-size: 10pt; text-decoration: underline;">Annual Income Per Mentioned Fiscal Year In NPR</div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;">S.N.</th>
                    <th>Income Headings</th>
                    <th style="width: 75px;">${fiscalYearLabels[0]}</th>
                    <th style="width: 75px;">${fiscalYearLabels[1]}</th>
                    <th style="width: 75px;">${fiscalYearLabels[2]}</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
                <tr style="font-weight: bold;">
                    <td colspan="2" style="text-align: right; padding-right: 3pt; border: 1pt solid black; font-size: 9pt;">Total Amount (NPR)</td>
                    <td style="text-align: right; border: 1pt solid black; font-size: 9pt;">${formatCurrency(totals.totalNPR[0])}</td>
                    <td style="text-align: right; border: 1pt solid black; font-size: 9pt;">${formatCurrency(totals.totalNPR[1])}</td>
                    <td style="text-align: right; border: 1pt solid black; font-size: 9pt;">${formatCurrency(totals.totalNPR[2])}</td>
                </tr>
                <tr style="font-weight: bold;">
                    <td colspan="2" style="text-align: right; padding-right: 3pt; border: 1pt solid black; font-size: 9pt;">Total Amount (US$)</td>
                    <td style="text-align: right; border: 1pt solid black; font-size: 9pt;">${formatCurrency(totals.totalUSD[0])}</td>
                    <td style="text-align: right; border: 1pt solid black; font-size: 9pt;">${formatCurrency(totals.totalUSD[1])}</td>
                    <td style="text-align: right; border: 1pt solid black; font-size: 9pt;">${formatCurrency(totals.totalUSD[2])}</td>
                </tr>
            </tbody>
        </table>

        <p style="font-size: 9pt; margin-bottom: 3pt;"><strong>For Information:</strong> 1 US $ = ${formData.exchangeRate} NPR (Source: Nepal Rastra Bank - Selling Rate for ${formatExchangeRateDateWithSuperscript(exchangeRateInfo.date)}).</p>
        
        <p style="font-size: 8pt; text-align: justify; margin-bottom: 2pt;">
            <strong>Note:</strong> The annual incomes have been calculated and verified according to the Nepalese fiscal year and
            Income Tax Act 2058 B.S. (2002 A.D.) rules. The Nepalese fiscal year starts from the 1st day of Shrawan
            (Roughly falls in Mid-July) and ends on the final day of Ashadh of the following year.
        </p>
        <ol style="font-size: 8pt; margin-top: 2pt; margin-bottom: 8pt; padding-left: 15pt;">
            <li>Fiscal Year ${fiscalYearLabels[0]} (${fiscalYearData[0].startDateSup} to ${fiscalYearData[0].endDateSup}).</li>
            <li>Fiscal Year ${fiscalYearLabels[1]} (${fiscalYearData[1].startDateSup} to ${fiscalYearData[1].endDateSup}).</li>
            <li>Fiscal Year ${fiscalYearLabels[2]} (${fiscalYearData[2].startDateSup} to ${fiscalYearData[2].endDateSup}).</li>
        </ol>

        <div class="signature-block">
            <div style="margin-bottom: 5pt;">........................................</div>
            <strong>${formData.signatoryName}</strong><br>
            <strong>${formData.signatoryDesignation}</strong>
        </div>

        ${formData.includeFooter ? `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; text-align: center; padding: 3pt 0; border-top: 1.5pt solid #DC2626; background: white;">
          <span style="font-size: 8pt; color: #DC2626; font-weight: bold;">Phone No.: ${formData.footerPhone} | E-mail: ${formData.footerEmail}</span>
        </div>
        ` : ''}

      </body>
      </html>
    `;

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Annual_Income_${formData.studentName.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { margin: 0; padding: 0; background: white; }
                        body * { visibility: hidden; }
                        
                        #printable-certificate, #printable-certificate * { visibility: visible; }
                        
                        #printable-certificate {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 210mm;
                            height: 296mm;
                            margin: 0;
                            padding: 6mm 25mm 25mm 25mm !important;
                            background: white;
                            z-index: 9999;
                            overflow: hidden !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-hidden { display: none !important; }
                    }
                    
                    #printable-certificate sup {
                        vertical-align: super;
                        font-size: 0.6em;
                        line-height: 0;
                    }
                `}
            </style>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-green-600" size={20} /> Annual Income Verification Generator
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <div className="p-3 sm:p-6 overflow-y-auto">

                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">

                        {/* LEFT: LIVE PREVIEW (2/3 width) */}
                        <div className="flex-1 lg:flex-[2] flex flex-col">

                            {/* RICH TEXT TOOLBAR */}
                            <div className="bg-white border border-gray-200 rounded-t-lg p-2 flex flex-wrap gap-2 items-center print-hidden shadow-sm">
                                {/* Font Family */}
                                <select
                                    onChange={(e) => document.execCommand('fontName', false, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50"
                                    defaultValue="Times New Roman"
                                >
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Tahoma">Tahoma</option>
                                </select>

                                {/* Font Size */}
                                <select
                                    onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white hover:bg-gray-50"
                                    defaultValue="3"
                                >
                                    <option value="1">8pt</option>
                                    <option value="2">10pt</option>
                                    <option value="3">12pt</option>
                                    <option value="4">14pt</option>
                                    <option value="5">18pt</option>
                                    <option value="6">24pt</option>
                                    <option value="7">36pt</option>
                                </select>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Bold, Italic, Underline */}
                                <button onClick={() => document.execCommand('bold')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 font-bold text-sm border border-gray-200" title="Bold">B</button>
                                <button onClick={() => document.execCommand('italic')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 italic text-sm border border-gray-200" title="Italic">I</button>
                                <button onClick={() => document.execCommand('underline')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 underline text-sm border border-gray-200" title="Underline">U</button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Alignment */}
                                <button onClick={() => document.execCommand('justifyLeft')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200" title="Align Left">⬅</button>
                                <button onClick={() => document.execCommand('justifyCenter')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200" title="Align Center">⬌</button>
                                <button onClick={() => document.execCommand('justifyRight')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200" title="Align Right">➡</button>
                                <button onClick={() => document.execCommand('justifyFull')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200" title="Justify">☰</button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Undo/Redo */}
                                <button onClick={() => document.execCommand('undo')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200" title="Undo">↩</button>
                                <button onClick={() => document.execCommand('redo')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200" title="Redo">↪</button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Clear Formatting */}
                                <button onClick={() => document.execCommand('removeFormat')} className="px-2 h-7 flex items-center justify-center rounded hover:bg-red-50 text-xs border border-gray-200 text-red-600" title="Clear Formatting">Clear</button>
                            </div>

                            {/* Preview Container */}
                            <div className="bg-gray-200 p-2 sm:p-6 overflow-auto flex-1 flex justify-center items-start">
                                <div
                                    id="printable-certificate"
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    spellCheck={false}
                                    className="bg-white shadow-lg w-[210mm] min-w-[210mm] min-h-[297mm] px-[0.5in] sm:px-[1in] pb-[0.5in] sm:pb-[1in] pt-[0.25in] sm:pt-[0.25in] text-[10px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-blue-500/20 mx-auto"
                                    style={{ fontFamily: 'Times New Roman, serif' }}
                                >

                                    {/* Conditional Header - Red Theme with Logo */}
                                    {formData.includeHeader && (
                                        <>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="w-32">
                                                    <img src="/nepal_coat_of_arms.png" alt="Logo" style={{ width: `${formData.logoSize}px`, height: `${(formData.logoSize * 1.3) / 1.42}px` }} />
                                                </div>
                                                <div className="text-center flex-1">
                                                    <div className="font-bold text-red-700" style={{ fontSize: '24pt', lineHeight: '0.9', marginBottom: '4px' }}>{formData.headerTitle}</div>
                                                    <div className="font-bold text-red-700" style={{ fontSize: '18pt', lineHeight: '0.9', marginBottom: '4px' }}>{formData.headerSubtitle}</div>
                                                    <div className="font-bold text-red-700" style={{ fontSize: '16pt', lineHeight: '0.9', marginBottom: '4px' }}>{formData.headerAddress1}</div>
                                                    <div className="font-bold text-red-700" style={{ fontSize: '16pt', lineHeight: '0.9' }}>{formData.headerAddress2}</div>
                                                </div>
                                                <div className="w-32"></div>
                                            </div>

                                            <div className="flex justify-between font-bold mb-1" style={{ fontSize: '16pt', lineHeight: '1.1' }}>
                                                <div className="text-red-600">
                                                    <div style={{ marginBottom: '2px' }}>Ref. No.: <span className="text-black">{formData.refNo}</span></div>
                                                    <div>Dis. No.: <span className="text-black">{formData.disNo}</span></div>
                                                </div>
                                                <div className="self-end text-red-600">
                                                    Date: <span className="text-black">{(() => {
                                                        const d = parseDateParts(formData.date);
                                                        return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year}</>;
                                                    })()}</span>
                                                </div>
                                            </div>

                                            <div className="border-b-[3px] border-red-600 mb-2 -mx-[0.5in] sm:-mx-[1in] mt-1"></div>
                                        </>
                                    )}

                                    <div className="text-center font-bold underline mb-1" style={{ fontSize: '16pt' }}>
                                        Annual Income Verification Certificate
                                    </div>

                                    <div className="text-center font-bold underline mb-6" style={{ fontSize: '16pt' }}>
                                        To Whom It May Concern
                                    </div>

                                    <p className="mb-4 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                                        This is to certify that <strong>{formData.parentName}</strong> {formData.relation} of
                                        <strong> {formData.studentName}</strong> the permanent resident of
                                        <strong> {formData.addressLine}</strong> has submitted an application to this office for the verification of an annual income.
                                        Annual income is calculated of last 3 years from fiscal year are mentioned below:
                                    </p>

                                    {/* TABLE PREVIEW */}
                                    <table className="w-full border-collapse border border-black mb-1 text-right leading-none" style={{ fontSize: '12pt' }}>
                                        <thead>
                                            <tr className="text-center font-bold">
                                                <th rowSpan="2" className="border border-black px-1 py-[1px] w-8">S.N.</th>
                                                <th rowSpan="2" className="border border-black px-1 py-[1px] text-left">Income Headings</th>
                                                <th colSpan="3" className="border border-black px-1 py-[1px]">Annual Income Per Mentioned Fiscal Year In NPR</th>
                                            </tr>
                                            <tr className="text-center">
                                                <th className="border border-black px-1 py-[1px]">{fiscalYearLabels[0]}</th>
                                                <th className="border border-black px-1 py-[1px]">{fiscalYearLabels[1]}</th>
                                                <th className="border border-black px-1 py-[1px]">{fiscalYearLabels[2]}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.incomeData.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-black px-1 py-[1px] text-center">{idx + 1}</td>
                                                    <td className="border border-black px-1 py-[1px] text-left">{row.source}</td>
                                                    <td className="border border-black px-1 py-[1px]">{formatCurrency(row.amount1)}</td>
                                                    <td className="border border-black px-1 py-[1px]">{formatCurrency(row.amount2)}</td>
                                                    <td className="border border-black px-1 py-[1px]">{formatCurrency(row.amount3)}</td>
                                                </tr>
                                            ))}
                                            {/* TOTALS */}
                                            <tr className="font-bold">
                                                <td colSpan="2" className="border border-black px-1 py-[1px] text-right">Total Amount (NPR)</td>
                                                <td className="border border-black px-1 py-[1px]">{formatCurrency(totals.totalNPR[0])}</td>
                                                <td className="border border-black px-1 py-[1px]">{formatCurrency(totals.totalNPR[1])}</td>
                                                <td className="border border-black px-1 py-[1px]">{formatCurrency(totals.totalNPR[2])}</td>
                                            </tr>
                                            <tr className="font-bold">
                                                <td colSpan="2" className="border border-black px-1 py-[1px] text-right">Total Amount (US$)</td>
                                                <td className="border border-black px-1 py-[1px]">{formatCurrency(totals.totalUSD[0])}</td>
                                                <td className="border border-black px-1 py-[1px]">{formatCurrency(totals.totalUSD[1])}</td>
                                                <td className="border border-black px-1 py-[1px]">{formatCurrency(totals.totalUSD[2])}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <p className="mb-2" style={{ fontSize: '12pt' }}>
                                        <strong>For Information:</strong> 1 US $ = {formData.exchangeRate} NPR (Source: Nepal Rastra Bank - Selling Rate for {(() => { const d = parseExchangeRateParts(exchangeRateInfo.date); return <>{d.day}<sup>{d.suffix}</sup> {d.month} {d.year}</>; })()}).
                                    </p>

                                    <p className="mb-1" style={{ fontSize: '12pt' }}>
                                        <strong>Note:</strong> The annual incomes have been calculated and verified according to the Nepalese fiscal year and Income Tax Act 2058 B.S. (2002 A.D.) rules.
                                        The Nepalese fiscal year starts from the 1st day of Shrawan (Roughly falls in Mid-July) and ends on the final day of Ashadh of the following year (Roughly falls in Mid-July of the following year). The details about the fiscal year period are mentioned below:
                                    </p>
                                    <ol className="list-decimal list-inside mb-4" style={{ fontSize: '12pt' }}>
                                        <li>Fiscal Year {fiscalYearLabels[0]} (For the period of {(() => { const d = parseFiscalDateParts(fiscalYearData[0].startDateObj); return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year} A.D.</>; })()} to {(() => { const d = parseFiscalDateParts(fiscalYearData[0].endDateObj); return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year} A.D.</>; })()}).</li>
                                        <li>Fiscal Year {fiscalYearLabels[1]} (For the period of {(() => { const d = parseFiscalDateParts(fiscalYearData[1].startDateObj); return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year} A.D.</>; })()} to {(() => { const d = parseFiscalDateParts(fiscalYearData[1].endDateObj); return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year} A.D.</>; })()}).</li>
                                        <li>Fiscal Year {fiscalYearLabels[2]} (For the period of {(() => { const d = parseFiscalDateParts(fiscalYearData[2].startDateObj); return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year} A.D.</>; })()} to {(() => { const d = parseFiscalDateParts(fiscalYearData[2].endDateObj); return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year} A.D.</>; })()}).</li>
                                    </ol>

                                    {/* SIGNATURE */}
                                    <div className="mt-16 text-right" style={{ fontSize: '12pt' }}>
                                        <div className="font-bold">......................................</div>
                                        <div className="font-bold">{formData.signatoryName}</div>
                                        <div className="font-bold">{formData.signatoryDesignation}</div>
                                    </div>

                                    {/* Conditional Footer - Standardized Full Width */}
                                    {formData.includeFooter && (
                                        <div className="absolute bottom-4 left-0 right-0 pt-2 border-t-[3px] border-red-600 px-[0.5in] sm:px-[1in] flex justify-between items-center bg-white">
                                            <span className="font-bold text-red-600" style={{ fontSize: '14pt' }}>Phone No.: {formData.footerPhone}</span>
                                            <span className="font-bold text-red-600" style={{ fontSize: '14pt' }}>E-mail: {formData.footerEmail}</span>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                        {/* RIGHT: EDITABLE FIELDS (1/3 width) */}
                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[750px]">

                            {/* SETTINGS CARD */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                {/* Toggles */}
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.includeHeader ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                                        <span className="text-sm font-medium text-gray-700">Letterhead</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.includeHeader}
                                            onChange={(e) => setFormData({ ...formData, includeHeader: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </label>
                                    <label className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.includeFooter ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                                        <span className="text-sm font-medium text-gray-700">Footer</span>
                                        <input
                                            type="checkbox"
                                            checked={formData.includeFooter}
                                            onChange={(e) => setFormData({ ...formData, includeFooter: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </label>
                                </div>

                                {/* Ref & Date Inputs */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ref. No.</label>
                                        <input name="refNo" value={formData.refNo} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-red-600 bg-red-50/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Dis. No.</label>
                                        <input name="disNo" value={formData.disNo} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-red-600 bg-red-50/30" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                                        <input name="date" value={formData.date} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* FISCAL YEAR SELECTOR */}
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 mb-2">
                                    <Calendar size={14} /> Fiscal Years
                                </h4>
                                <div className="text-sm font-bold text-amber-900 bg-amber-100/50 px-3 py-2 rounded-lg border border-amber-200">
                                    {fiscalYearLabels[0]}, {fiscalYearLabels[1]}, {fiscalYearLabels[2]}
                                </div>
                                <p className="text-[10px] text-amber-700 mt-2 font-medium">
                                    *Fixed range as per requirements.
                                </p>
                            </div>

                            {/* HEADER DETAILS CARD */}
                            {formData.includeHeader && (
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Municipality Details</h4>

                                    {/* Logo Size Slider */}
                                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                        <label className="text-xs font-bold text-blue-700 whitespace-nowrap">Logo Size:</label>
                                        <input
                                            type="range"
                                            min="60"
                                            max="200"
                                            value={formData.logoSize}
                                            onChange={(e) => setFormData({ ...formData, logoSize: parseInt(e.target.value) })}
                                            className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-blue-600 w-10">{formData.logoSize}px</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Municipality Name</label>
                                            <input name="headerTitle" value={formData.headerTitle} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Ward Office</label>
                                                <input name="headerSubtitle" value={formData.headerSubtitle} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
                                                <input name="headerAddress1" value={formData.headerAddress1} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
                                                <input name="headerAddress2" value={formData.headerAddress2} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* EXCHANGE RATE - NRB Live Rate */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <label className="block text-xs font-bold text-green-800 uppercase flex items-center gap-2">
                                            <DollarSign size={14} /> Exchange Rate (1 USD = NPR)
                                        </label>
                                        <div className="text-[10px] text-green-600 mt-0.5">
                                            {exchangeRateInfo.isLoading ? (
                                                <span className="animate-pulse">Fetching from Nepal Rastra Bank...</span>
                                            ) : (
                                                <span>
                                                    Source: <strong>{exchangeRateInfo.source}</strong> |
                                                    Date: {formatExchangeRateDate(exchangeRateInfo.date)} |
                                                    <span className="text-red-600 font-bold"> Selling Rate</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setExchangeRateInfo(prev => ({ ...prev, isLoading: true }));
                                            const rateData = await fetchNRBExchangeRate();
                                            setExchangeRateInfo({
                                                rate: rateData.rate,
                                                date: rateData.date,
                                                source: rateData.source,
                                                isLoading: false,
                                                error: rateData.error
                                            });
                                            setFormData(prev => ({ ...prev, exchangeRate: rateData.rate }));
                                        }}
                                        disabled={exchangeRateInfo.isLoading}
                                        className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-all disabled:opacity-50"
                                        title="Refresh NRB Rate"
                                    >
                                        <RefreshCw size={14} className={exchangeRateInfo.isLoading ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            name="exchangeRate"
                                            step="0.01"
                                            value={formData.exchangeRate}
                                            onChange={handleChange}
                                            className="border border-green-300 p-2 w-28 rounded-lg text-sm font-bold text-green-800 bg-white"
                                        />
                                        <span className="text-sm font-bold text-green-700">NPR</span>
                                    </div>
                                    <div className="flex-1 text-right">
                                        <div className="text-[10px] text-green-600">Auto-Calculated Total (Year 3)</div>
                                        <div className="text-lg font-bold text-green-800">USD {formatCurrency(totals.totalUSD[2])}</div>
                                    </div>
                                </div>
                                {exchangeRateInfo.error && (
                                    <div className="text-[10px] text-amber-600 mt-2 bg-amber-50 p-1.5 rounded">
                                        ⚠️ Using fallback rate. NRB API: {exchangeRateInfo.error}
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Income Table */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Income Sources</h4>
                                    <button onClick={addIncomeRow} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">
                                        <Plus size={12} /> Add Source
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {formData.incomeData.map((row, idx) => (
                                        <div key={idx} className="bg-white p-2 rounded border border-gray-200 shadow-sm relative">
                                            <div className="mb-1 pr-6">
                                                <input
                                                    placeholder="Income Source Name"
                                                    value={row.source}
                                                    onChange={(e) => handleIncomeChange(idx, 'source', e.target.value)}
                                                    className="w-full border-b border-gray-300 p-1 text-xs font-semibold focus:outline-none focus:border-green-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                                <input type="number" placeholder="Year 1" value={row.amount1} onChange={(e) => handleIncomeChange(idx, 'amount1', e.target.value)} className="border p-1 rounded text-xs text-right" />
                                                <input type="number" placeholder="Year 2" value={row.amount2} onChange={(e) => handleIncomeChange(idx, 'amount2', e.target.value)} className="border p-1 rounded text-xs text-right" />
                                                <input type="number" placeholder="Year 3" value={row.amount3} onChange={(e) => handleIncomeChange(idx, 'amount3', e.target.value)} className="border p-1 rounded text-xs text-right" />
                                            </div>
                                            <button onClick={() => removeIncomeRow(idx)} className="absolute top-1 right-1 text-red-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Basic Details */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant Details</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Parent Name</label>
                                        <input name="parentName" value={formData.parentName} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                                        <select name="relation" value={formData.relation} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm">
                                            <option value="father">father</option>
                                            <option value="mother">mother</option>
                                            <option value="guardian">guardian</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                                    <input name="addressLine" value={formData.addressLine} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm" />
                                </div>
                            </div>

                            {/* SIGNATORY CARD */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserPen size={14} /> Signatory
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                        <input name="signatoryName" value={formData.signatoryName} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                                        <input name="signatoryDesignation" value={formData.signatoryDesignation} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER EMAIL CARD */}
                            {formData.includeFooter && (
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Footer Details</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                            <input name="footerPhone" value={formData.footerPhone} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                            <input name="footerEmail" value={formData.footerEmail} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 print-hidden">
                    <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition order-last sm:order-first">
                        Cancel
                    </button>
                    <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-bold shadow-md active:scale-95 transition">
                        <Printer size={16} /> Print / Save PDF
                    </button>
                    <button onClick={generateWordDoc} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 transition">
                        <Download size={16} /> Download .DOC
                    </button>
                </div>

            </div>
        </div>
    );
}