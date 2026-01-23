import { Download, FileText, Printer, Plus, Trash2, X, Calendar, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getThreeConsecutiveFiscalYears, getFiscalYearLabels, getDefaultStartYear } from '../../utils/nepaliFiscalYear';
import { getFormattedDate, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

export default function TaxClearanceVerificationModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  // Helper: Format Number to Currency (e.g. 1,00,000.00)
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
  };

  // Fiscal Year Calculation
  const [startYear, setStartYear] = useState(getDefaultStartYear());
  const fiscalYearData = getThreeConsecutiveFiscalYears(startYear);

  // 1. Initial State
  const [formData, setFormData] = useState({
    // Document options
    includeHeader: true,
    includeFooter: true,
    logoSize: 174,

    // Header info (will be dynamically set from student)
    headerTitle: 'Machhapuchhre Rural Municipality',
    headerSubtitle: '4 No. Ward Office',
    headerAddress1: 'Lahachok, Kaski',
    headerAddress2: 'Gandaki Province, Nepal',

    // Footer info
    footerEmail: 'machhapuchhrereward4@gmail.com',
    footerPhone: '+977-9856017304',

    refNo: '2082/083',
    disNo: '403',
    date: getFormattedDate(),

    parentName: `Mr. ${student.familyInfo?.fatherName || 'Parent Name'}`,
    relation: 'father',
    studentName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
    addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

    // Income Sources (Dynamic Rows)
    incomeData: [],

    // Signatory
    signatoryName: 'Lob Bahadur Shahi',
    signatoryDesignation: 'Ward Chairperson'
  });

  // Calculated Totals State
  const [totals, setTotals] = useState({
    totalNPR: [0, 0, 0]
  });

  // Reset/Auto-fill with student data
  useEffect(() => {
    if (student) {
      // Initialize income data from student or use defaults
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

      // Dynamic header from student address
      const municipality = student.address?.municipality || 'Machhapuchhre Rural Municipality';
      const wardNo = student.address?.wardNo || '4';
      const tole = student.address?.tole || 'Lahachok';
      const district = student.address?.district || 'Kaski';
      const province = student.address?.province || 'Gandaki Province';

      setFormData(prev => ({
        ...prev,
        headerTitle: municipality,
        headerSubtitle: `${wardNo} No. Ward Office`,
        headerAddress1: `${tole}, ${district}`,
        headerAddress2: `${province}, Nepal`,
        parentName: `Mr. ${student.familyInfo?.fatherName || ''}`,
        relation: 'father',
        studentName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
        addressLine: `${municipality} Ward No. ${wardNo}, ${district}, ${province}, Nepal`,
        incomeData: initialIncomeData
      }));
    }
  }, [student]);

  // Auto-calculate totals when income data changes
  useEffect(() => {
    const sum1 = formData.incomeData.reduce((acc, row) => acc + Number(row.amount1 || 0), 0);
    const sum2 = formData.incomeData.reduce((acc, row) => acc + Number(row.amount2 || 0), 0);
    const sum3 = formData.incomeData.reduce((acc, row) => acc + Number(row.amount3 || 0), 0);

    setTotals({
      totalNPR: [sum1, sum2, sum3]
    });
  }, [formData.incomeData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  // Word Document Generator - Matches PDF exactly
  const generateWordDoc = () => {
    // Parse fiscal year dates with superscript
    const getFormattedFiscalDate = (dateObj) => {
      const parts = parseDateParts(dateObj.toDateString()); // Reusing existing util if compatible or just formatting explicitly
      // Note: TaxClearance imports parseDateParts but not parseFiscalDateParts? 
      // Let's implement inline or use imports if available. 
      // checking imports... TaxClearance imports { getThreeConsecutiveFiscalYears, getFiscalYearLabels, getDefaultStartYear } from '../../utils/nepaliFiscalYear';
      // It does NOT import parseFiscalDateParts. I should verify if I can import it or just manually format.
      // For now, I'll use a local formatter if needed or assume the dateObj is a Date.
      // Actually, fiscalYearData objects have startDateObj as Date.
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString('default', { month: 'long' });
      const year = dateObj.getFullYear();
      let suffix = 'th';
      if (day % 10 === 1 && day !== 11) suffix = 'st';
      else if (day % 10 === 2 && day !== 12) suffix = 'nd';
      else if (day % 10 === 3 && day !== 13) suffix = 'rd';
      return `${day}<sup>${suffix}</sup> ${month}, ${year} A.D.`;
    };

    // Generate table rows with exact PDF styling
    const tableRows = formData.incomeData.map((row, index) => `
        <tr style="height: 12pt;">
            <td style="border: 0.75pt solid black; padding: 0pt 2pt; text-align: center; font-size: 12pt; font-family: 'Times New Roman', serif;">${index + 1}</td>
            <td style="border: 0.75pt solid black; padding: 0pt 4pt; text-align: left; font-size: 12pt; font-family: 'Times New Roman', serif;">${row.source}</td>
            <td style="border: 0.75pt solid black; padding: 0pt 4pt; text-align: right; font-size: 12pt; font-family: 'Times New Roman', serif;">${formatCurrency(row.amount1)}</td>
            <td style="border: 0.75pt solid black; padding: 0pt 4pt; text-align: right; font-size: 12pt; font-family: 'Times New Roman', serif;">${formatCurrency(row.amount2)}</td>
            <td style="border: 0.75pt solid black; padding: 0pt 4pt; text-align: right; font-size: 12pt; font-family: 'Times New Roman', serif;">${formatCurrency(row.amount3)}</td>
        </tr>
    `).join('');

    const content = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset="utf-8">
        <title>Tax Clearance Verification Certificate</title>
        <meta name=ProgId content=Word.Document>
        <meta name=Generator content="Microsoft Word 15">
        <meta name=Originator content="Microsoft Word 15">
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
            /* PAGE SETUP - Match PDF exactly */
            @page WordSection1
            {
                size: 210.0mm 297.0mm;
                margin: 0.4in 0.5in 0.4in 0.5in;
                mso-header-margin: .2in;
                mso-footer-margin: .2in;
                mso-footer: f1;
                mso-paper-source: 0;
            }
            div.WordSection1 { page: WordSection1; }
            p.MsoFooter, li.MsoFooter, div.MsoFooter
            {mso-style-priority:99;
            margin:0in;
            mso-pagination:widow-orphan;
            tab-stops:center 3.0in right 6.0in;
            font-size:9.0pt;
            font-family:"Times New Roman",serif;}
            
            body {
                margin: 0;
                padding: 0;
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.15;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            /* Header Styles - Match PDF */
            .header-container {
                width: 100%;
                margin-bottom: 5pt;
            }
            
            .municipality-title {
                font-size: 28pt;
                font-weight: bold;
                color: #DC2626;
                line-height: 1;
                margin-bottom: 3pt;
                text-align: center;
                font-family: 'Times New Roman', serif;
            }
            
            .ward-office {
                font-size: 20pt;
                font-weight: bold;
                color: #DC2626;
                line-height: 1;
                margin-bottom: 3pt;
                text-align: center;
                font-family: 'Times New Roman', serif;
            }
            
            .address-line {
                font-size: 18pt;
                font-weight: bold;
                color: #DC2626;
                line-height: 1;
                text-align: center;
                font-family: 'Times New Roman', serif;
            }
            
            .ref-date-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 8pt;
                margin-bottom: 4pt;
                font-weight: bold;
                font-size: 16pt;
            }
            
            .red-line {
                border-bottom: 1.5pt solid #DC2626;
                margin: 4pt -0.75in 10pt -0.75in;
            }
            
            /* Main Content */
            .main-title {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                text-decoration: underline;
                margin: 4pt 0 2pt 0;
                font-family: 'Times New Roman', serif;
            }
            
            .sub-title {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                text-decoration: underline;
                margin-bottom: 8pt;
                font-family: 'Times New Roman', serif;
            }
            
            .content-text {
                font-size: 12pt;
                text-align: justify;
                line-height: 1.1;
                margin-bottom: 4pt;
                font-family: 'Times New Roman', serif;
            }
            
            /* Table Styles - Match PDF */
            .income-table {
                width: 100%;
                border-collapse: collapse;
                margin: 6pt 0 6pt 0;
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
            }
            
            .income-table th {
                border: 0.75pt solid black;
                padding: 0.5pt 3pt;
                text-align: center;
                font-weight: bold;
                vertical-align: middle;
            }
            
            .income-table td {
                border: 0.75pt solid black;
                padding: 0pt 4pt;
                vertical-align: middle;
            }
            
            .total-row {
                font-weight: bold;
            }
            
            /* Lists */
            ol {
                margin: 2pt 0 8pt 25pt;
                padding: 0;
                font-size: 12pt;
                line-height: 1.15;
            }
            
            li {
                margin-bottom: 2pt;
            }
            
            /* Signature */
            .signature-block {
                margin-top: 30pt;
                text-align: right;
                font-size: 12pt;
                line-height: 1.15;
            }
            
            /* Footer */
            .footer-container {
                position: fixed;
                bottom: 0;
                left: 0.75in;
                right: 0.75in;
                padding-top: 6pt;
                border-top: 1.5pt solid #DC2626;
                background: white;
            }
            
            .footer-content {
                display: flex;
                justify-content: space-between;
                font-size: 9pt;
                color: #DC2626;
                font-weight: bold;
                font-family: 'Times New Roman', serif;
            }
            
            /* Superscript styling */
            sup {
                vertical-align: super;
                font-size: 0.7em;
                line-height: 0;
            }
            
            /* Utility */
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            .text-left {
                text-align: left;
            }
            
            .text-red {
                color: #DC2626;
            }
            
            .text-black {
                color: black;
            }
            
            .font-bold {
                font-weight: bold;
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0;">
    
    ${formData.includeHeader ? `
    <!-- HEADER SECTION -->
    <div class="header-container">
        <table style="width: 100%; margin-bottom: 0;">
            <tr>
                <td style="width: 20%; vertical-align: top; padding-left: 0;">
                    <img src="${window.location.origin}/nepal_coat_of_arms.png" 
                         width="${formData.logoSize}" 
                         height="${(formData.logoSize * 1.3) / 1.42}"
                         style="width: ${formData.logoSize}px; height: auto; display: block;" />
                </td>
                <td style="width: 60%; text-align: center; vertical-align: top; padding: 0 12pt;">
                    <div class="municipality-title">${formData.headerTitle}</div>
                    <div class="ward-office">${formData.headerSubtitle}</div>
                    <div class="address-line">${formData.headerAddress1}</div>
                    <div class="address-line">${formData.headerAddress2}</div>
                </td>
                <td style="width: 20%;"></td>
            </tr>
        </table>
        
        <!-- Reference and Date -->
    <!-- Reference and Date -->
    <!-- Reference and Date - Robust 2x2 Table Arrangement -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 2pt; margin-bottom: 0px; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
        <tr>
            <td width="50%" align="left" valign="top" style="padding: 0;">
                <p style="margin: 0; line-height: 1.0; mso-line-height-rule: exactly;">
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold;">Ref. No.:</span> 
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${formData.refNo}</span>
                </p>
            </td>
            <td width="50%" align="right" valign="top" style="padding: 0;"></td>
        </tr>
        <tr>
            <td width="50%" align="left" valign="top" style="padding: 0;">
                <p style="margin: 0; line-height: 1.0; mso-line-height-rule: exactly;">
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold;">Dis. No.:</span> 
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${formData.disNo}</span>
                </p>
            </td>
            <td width="50%" align="right" valign="top" style="padding: 0; text-align: right;">
                <p style="margin: 0; line-height: 1.0; mso-line-height-rule: exactly;">
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold;">Date:</span> 
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${addSuperscriptToDateString(formData.date)}</span>
                </p>
            </td>
        </tr>
    </table>
        
        <!-- Red Line -->
        <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 2pt; margin-bottom: 6pt; mso-margin-top-alt: 2pt; mso-margin-bottom-alt: 6pt;">&nbsp;</p>
    </div>
    ` : ''}
    
    <!-- MAIN CONTENT -->
    <p align="center" style="margin: 0; margin-bottom: 2pt; text-align: center; line-height: 1.0;">
        <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; text-decoration: underline;">Tax Clearance Verification Certificate</span>
    </p>

    <p align="center" style="margin: 0; margin-bottom: 12pt; text-align: center; line-height: 1.0;">
        <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; text-decoration: underline;">To Whom It May Concern</span>
    </p>
    
    <p class="content-text">
        This is to certify that <strong>${formData.parentName}</strong> ${formData.relation} of 
        <strong> ${formData.studentName}</strong> the permanent resident of 
        <strong>${formData.addressLine}</strong>, has been regularly paying all the government taxes up to fiscal year ${fiscalYearLabels[2]} as per government rules and regulation. 
        The tax status is given below:
    </p>
    
    <!-- INCOME TABLE -->
    <table class="income-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 40px;">S.N.</th>
                <th rowspan="2">Income Headings</th>
                <th colspan="3">Annual Income Per Mentioned Fiscal Year In NPR</th>
            </tr>
            <tr>
                <th style="width: 90px;">${fiscalYearLabels[0]}</th>
                <th style="width: 90px;">${fiscalYearLabels[1]}</th>
                <th style="width: 90px;">${fiscalYearLabels[2]}</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
            <!-- Total Row - NPR -->
            <tr class="total-row" style="height: 12pt;">
                <td colspan="2" style="text-align: right; padding-right: 8pt; font-weight: bold;">Total Amount (NPR)</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totals.totalNPR[0])}</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totals.totalNPR[1])}</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totals.totalNPR[2])}</td>
            </tr>
             <!-- Tax Rows -->
             <tr style="height: 12pt;">
                <td colspan="2" style="text-align: right; padding-right: 8pt; font-weight: bold;">Tax Amount</td>
                <td class="text-center" style="font-weight: bold;">Nil</td>
                <td class="text-center" style="font-weight: bold;">Nil</td>
                <td class="text-center" style="font-weight: bold;">Nil</td>
            </tr>
            <tr style="height: 12pt;">
                <td colspan="2" style="text-align: right; padding-right: 8pt; font-weight: bold;">Income after Tax</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totals.totalNPR[0])}</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totals.totalNPR[1])}</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(totals.totalNPR[2])}</td>
            </tr>
            <tr style="height: 12pt;">
                <td colspan="2" style="text-align: right; padding-right: 8pt; font-weight: bold;">Status</td>
                <td class="text-center" style="font-weight: bold;">Tax Cleared</td>
                <td class="text-center" style="font-weight: bold;">Tax Cleared</td>
                <td class="text-center" style="font-weight: bold;">Tax Cleared</td>
            </tr>
        </tbody>
    </table>
    
    <p class="content-text" style="font-size: 12pt;">
        <strong>Note:</strong> We also state that Government Tax is exemptions for agriculture income according to the Income Tax
        Act 2058 B.S. (2002 A.D.), Chapter 4 (11) (1). (Source: www.lawcommission.gov.np, www.ird.gov.np).
        Therefore, no tax has been issued for their agriculture income.
    </p>
    
    <!-- SIGNATURE -->
    <div class="signature-block">
        <div style="margin-bottom: 4pt;">......................................</div>
        <div class="font-bold">${formData.signatoryName}</div>
        <div class="font-bold">${formData.signatoryDesignation}</div>
    </div>
    
    ${formData.includeFooter ? `
    <div style="mso-element:footer" id="f1">
        <div class="MsoFooter">
            <!-- Red Line (matching header style) -->
            <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 0pt; margin-bottom: 4pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 4pt;">&nbsp;</p>
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                <tr>
                    <td width="40%" align="left">
                        <p style="margin: 0; line-height: 1.0;">
                            <span style="font-size: 14.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold; white-space: nowrap;">Phone No.: ${formData.footerPhone}</span>
                        </p>
                    </td>
                    <td width="60%" align="right">
                        <p style="margin: 0; line-height: 1.0; text-align: right;">
                            <span style="font-size: 14.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold; white-space: nowrap;">E-mail: ${formData.footerEmail}</span>
                        </p>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    ` : ''}
    
    <div style="mso-element:section-pr" id="sec1">
        <p class="MsoNormal">&nbsp;</p>
    </div>
    </body>
    </html>
    `;

    // Create and download the Word document
    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tax_Clearance_${formData.studentName.replace(/\s+/g, '_')}.doc`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { 
                        position: fixed; 
                        left: 0; 
                        top: 0; 
                        width: 210mm; 
                        height: 297mm; 
                        margin: 0;
                        padding: 6mm 25mm 25mm 25mm;
                        box-sizing: border-box;
                    }
                    @page { size: A4; margin: 0; }
                }
                
                .print-area sup {
                    vertical-align: super;
                    font-size: 0.6em;
                    line-height: 0;
                }
            `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gradient-to-r from-red-50 to-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-red-600" size={20} /> Tax Clearance Verification Generator
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handlePrint} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition">
              <Printer size={16} /> Print / Save PDF
            </button>
            <button onClick={generateWordDoc} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-bold shadow-md active:scale-95 transition">
              <Download size={16} /> Download .DOC
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: PREVIEW (2/3 width) */}
          <div className="w-2/3 flex flex-col">
            {/* RICH TEXT TOOLBAR */}
            <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-2 items-center print:hidden shadow-sm">
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
                className="print-area bg-white shadow-lg w-[210mm] min-w-[210mm] min-h-[297mm] px-[0.5in] sm:px-[1in] pb-[0.5in] sm:pb-[1in] pt-[0.25in] sm:pt-[0.25in] text-[10px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-blue-500/20 mx-auto"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >

                {/* Conditional Header - Red Theme */}
                {formData.includeHeader && (
                  <>
                    <div className="relative mb-4 min-h-[140px]">
                      {/* Logo - Absolute Left */}
                      <div className="absolute -left-6 top-0">
                        <img src="/nepal_coat_of_arms.png" alt="Logo" style={{ width: `${formData.logoSize}px`, height: `${(formData.logoSize * 1.3) / 1.42}px` }} />
                      </div>

                      {/* Text - Centered (Full Width) */}
                      <div className="text-center w-full px-4">
                        <div className="font-bold text-[#DC2626]" style={{ fontSize: '28pt', lineHeight: '1.0', marginBottom: '6px' }}>{formData.headerTitle}</div>
                        <div className="font-bold text-[#DC2626]" style={{ fontSize: '20pt', lineHeight: '1.0', marginBottom: '4px' }}>{formData.headerSubtitle}</div>
                        <div className="font-bold text-[#DC2626]" style={{ fontSize: '18pt', lineHeight: '1.0', marginBottom: '4px' }}>{formData.headerAddress1}</div>
                        <div className="font-bold text-[#DC2626]" style={{ fontSize: '18pt', lineHeight: '1.0' }}>{formData.headerAddress2}</div>
                      </div>
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

                    <div className="border-b-[3px] border-red-600 mb-1 -mx-[0.5in] sm:-mx-[1in] mt-1"></div>
                  </>
                )}

                <div className="text-center font-bold underline mb-1" style={{ fontSize: '16pt' }}>
                  Tax Clearance Verification Certificate
                </div>

                <div className="text-center font-bold underline mb-4" style={{ fontSize: '16pt' }}>
                  To Whom It May Concern
                </div>

                <p className="mb-2 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                  This is to certify that <strong>{formData.parentName}</strong> {formData.relation} of
                  <strong>   {formData.studentName}</strong> the permanent resident of
                  <strong> {formData.addressLine}</strong>,  has been regularly paying all the government taxes up to fiscal year {fiscalYearLabels[2]} as per government rules and regulation.
                  The tax status is given below:
                </p>

                {/* TABLE PREVIEW */}
                <table className="w-full border-collapse border border-black mb-1 text-right leading-none" style={{ fontSize: '12pt' }}>
                  <thead>
                    <tr className="text-center">
                      <th rowSpan="2" className="border border-black px-1 py-0 w-8">S.N.</th>
                      <th rowSpan="2" className="border border-black px-1 py-0 text-left">Income Headings</th>
                      <th colSpan="3" className="border border-black px-1 py-0">Annual Income Per Mentioned Fiscal Year In NPR</th>
                    </tr>
                    <tr className="text-center">
                      <th className="border border-black px-1 py-0">{fiscalYearLabels[0]}</th>
                      <th className="border border-black px-1 py-0">{fiscalYearLabels[1]}</th>
                      <th className="border border-black px-1 py-0">{fiscalYearLabels[2]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.incomeData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-1 py-0 text-center">{idx + 1}</td>
                        <td className="border border-black px-1 py-0 text-left">{row.source}</td>
                        <td className="border border-black px-1 py-0">{formatCurrency(row.amount1)}</td>
                        <td className="border border-black px-1 py-0">{formatCurrency(row.amount2)}</td>
                        <td className="border border-black px-1 py-0">{formatCurrency(row.amount3)}</td>
                      </tr>
                    ))}
                    {/* TOTALS */}
                    <tr className="font-bold">
                      <td colSpan="2" className="border border-black px-1 py-0 text-right">Total Amount (NPR)</td>
                      <td className="border border-black px-1 py-0 font-bold">{formatCurrency(totals.totalNPR[0])}</td>
                      <td className="border border-black px-1 py-0 font-bold">{formatCurrency(totals.totalNPR[1])}</td>
                      <td className="border border-black px-1 py-0 font-bold">{formatCurrency(totals.totalNPR[2])}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan="2" className="border border-black px-1 py-0 text-right">Tax Amount</td>
                      <td className="border border-black px-1 py-0 text-center font-bold">Nil</td>
                      <td className="border border-black px-1 py-0 text-center font-bold">Nil</td>
                      <td className="border border-black px-1 py-0 text-center font-bold">Nil</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan="2" className="border border-black px-1 py-0 text-right">Income after Tax</td>
                      <td className="border border-black px-1 py-0 font-bold">{formatCurrency(totals.totalNPR[0])}</td>
                      <td className="border border-black px-1 py-0 font-bold">{formatCurrency(totals.totalNPR[1])}</td>
                      <td className="border border-black px-1 py-0 font-bold">{formatCurrency(totals.totalNPR[2])}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan="2" className="border border-black px-1 py-0 text-right">Status</td>
                      <td className="border border-black px-1 py-0 text-center font-bold">Tax Cleared</td>
                      <td className="border border-black px-1 py-0 text-center font-bold">Tax Cleared</td>
                      <td className="border border-black px-1 py-0 text-center font-bold">Tax Cleared</td>
                    </tr>
                  </tbody>
                </table>

                <p className="mt-4 text-justify leading-relaxed mb-4" style={{ fontSize: '12pt' }}>
                  <strong>Note:</strong> We also state that Government Tax is exemptions for agriculture income according to the Income Tax
                  Act 2058 B.S. (2002 A.D.), Chapter 4 (11) (1). (Source: www.lawcommission.gov.np, www.ird.gov.np).
                  Therefore, no tax has been issued for their agriculture income.
                </p>

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
          <div className="w-1/3 p-6 space-y-4 overflow-y-auto bg-gray-50">

            {/* SETTINGS CARD */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              {/* Toggles */}
              <div className="flex gap-4 items-center flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.includeHeader} onChange={(e) => setFormData({ ...formData, includeHeader: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  Show Header
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.includeFooter} onChange={(e) => setFormData({ ...formData, includeFooter: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  Show Footer
                </label>
              </div>

              {/* Ref/Dis/Date */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ref. No.</label>
                  <input name="refNo" value={formData.refNo} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Dis. No.</label>
                  <input name="disNo" value={formData.disNo} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                  <input name="date" value={formData.date} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
              </div>
            </div>

            {/* FISCAL YEAR SELECTOR */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Calendar size={14} /> Fiscal Year Start
              </h4>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="flex-1 border-amber-300 bg-white rounded-lg px-3 py-2 text-sm font-bold text-amber-800 focus:ring-2 focus:ring-amber-500/20"
                >
                  {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="text-xs text-amber-700">
                  → {fiscalYearLabels[0]}, {fiscalYearLabels[1]}, {fiscalYearLabels[2]}
                </div>
              </div>
            </div>

            {/* HEADER DETAILS CARD */}
            {formData.includeHeader && (
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Municipality Details</h4>

                {/* Logo Size Slider */}
                <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                  <label className="text-xs font-bold text-red-700 whitespace-nowrap">Logo Size:</label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={formData.logoSize}
                    onChange={(e) => setFormData({ ...formData, logoSize: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <span className="text-xs font-bold text-red-800 w-10 text-right">{formData.logoSize}px</span>
                </div>

                <div className="grid gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Municipality Name</label>
                    <input name="headerTitle" value={formData.headerTitle} onChange={handleChange}
                      className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ward Office</label>
                      <input name="headerSubtitle" value={formData.headerSubtitle} onChange={handleChange}
                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address Line 1</label>
                      <input name="headerAddress1" value={formData.headerAddress1} onChange={handleChange}
                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address Line 2</label>
                      <input name="headerAddress2" value={formData.headerAddress2} onChange={handleChange}
                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        className="w-full border-b border-gray-300 p-1 text-sm font-semibold focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <input type="number" placeholder="Y1" value={row.amount1} onChange={(e) => handleIncomeChange(idx, 'amount1', e.target.value)} className="border p-1 rounded text-xs text-right" />
                      <input type="number" placeholder="Y2" value={row.amount2} onChange={(e) => handleIncomeChange(idx, 'amount2', e.target.value)} className="border p-1 rounded text-xs text-right" />
                      <input type="number" placeholder="Y3" value={row.amount3} onChange={(e) => handleIncomeChange(idx, 'amount3', e.target.value)} className="border p-1 rounded text-xs text-right" />
                    </div>
                    <button onClick={() => removeIncomeRow(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PARENT & ADDRESS */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Parent Name</label>
                  <input name="parentName" value={formData.parentName} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Relation</label>
                  <select name="relation" value={formData.relation} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all">
                    <option value="father">father</option>
                    <option value="mother">mother</option>
                    <option value="guardian">guardian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                <input name="addressLine" value={formData.addressLine} onChange={handleChange}
                  className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
              </div>
            </div>

            {/* SIGNATORY */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signatory</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                  <input name="signatoryName" value={formData.signatoryName} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Designation</label>
                  <input name="signatoryDesignation" value={formData.signatoryDesignation} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </div>
              </div>
            </div>

            {/* FOOTER (if enabled) */}
            {formData.includeFooter && (
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Footer Contact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                    <input name="footerPhone" value={formData.footerPhone} onChange={handleChange}
                      className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Email</label>
                    <input name="footerEmail" value={formData.footerEmail} onChange={handleChange}
                      className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}