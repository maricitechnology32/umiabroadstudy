

import { Download, FileText, Printer, Plus, Trash2, X, DollarSign, UserPen, Calendar, RefreshCw, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, RemoveFormatting } from 'lucide-react';
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

    // Word Document Generator - UPDATED to match PDF exactly
    const generateWordDoc = () => {
        // Parse fiscal year dates
        const formatFiscalDate = (dateObj) => {
            const parts = parseFiscalDateParts(dateObj);
            return `${parts.day}<sup>${parts.suffix}</sup> ${parts.month}, ${parts.year} A.D.`;
        };

        // Format exchange rate date
        const formatExchangeDate = () => {
            const parts = parseExchangeRateParts(exchangeRateInfo.date);
            return `${parts.day}<sup>${parts.suffix}</sup> ${parts.month} ${parts.year}`;
        };

        // Format current date with superscript
        const formatCurrentDate = () => {
            const parts = parseDateParts(formData.date);
            return `${parts.day}<sup>${parts.suffix}</sup> ${parts.month}, ${parts.year}`;
        };

        // Generate table rows
        const tableRows = formData.incomeData.map((row, index) => `
            <tr style="mso-height-alt: 15.6pt; height: 14.0pt;">
                <td width="35" style="width: 26.25pt; border: solid windowtext 1.0pt; border-top: none; mso-border-top-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 1.4pt 0cm 1.4pt; height: 14.0pt; mso-height-rule: exactly;">
                    <p align="center" style="text-align: center; mso-yfti-cnfc: 68;"><span style="font-size: 12.0pt; mso-bidi-font-size: 11.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">${index + 1}</span></p>
                </td>
                <td width="288" style="width: 216.0pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 1.4pt 0cm 1.4pt; height: 14.0pt; mso-height-rule: exactly;">
                    <p style="mso-yfti-cnfc: 4;"><span style="font-size: 12.0pt; mso-bidi-font-size: 11.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">${row.source}</span></p>
                </td>
                <td width="90" style="width: 67.5pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 1.4pt 0cm 1.4pt; height: 14.0pt; mso-height-rule: exactly;">
                    <p align="right" style="text-align: right; mso-yfti-cnfc: 4;"><span style="font-size: 12.0pt; mso-bidi-font-size: 11.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">${formatCurrency(row.amount1)}</span></p>
                </td>
                <td width="90" style="width: 67.5pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 1.4pt 0cm 1.4pt; height: 14.0pt; mso-height-rule: exactly;">
                    <p align="right" style="text-align: right; mso-yfti-cnfc: 4;"><span style="font-size: 12.0pt; mso-bidi-font-size: 11.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">${formatCurrency(row.amount2)}</span></p>
                </td>
                <td width="90" style="width: 67.5pt; border-top: none; border-left: none; border-bottom: solid windowtext 1.0pt; border-right: solid windowtext 1.0pt; mso-border-top-alt: solid windowtext .5pt; mso-border-left-alt: solid windowtext .5pt; mso-border-alt: solid windowtext .5pt; padding: 0cm 1.4pt 0cm 1.4pt; height: 14.0pt; mso-height-rule: exactly;">
                    <p align="right" style="text-align: right; mso-yfti-cnfc: 4;"><span style="font-size: 12.0pt; mso-bidi-font-size: 11.0pt; font-family: 'Times New Roman',serif; mso-fareast-font-family: 'Times New Roman';">${formatCurrency(row.amount3)}</span></p>
                </td>
            </tr>
        `).join('');

        const content = `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<meta name="Originator" content="Microsoft Word 15">
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
    <w:ValidateAgainstSchemas/>
    <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid>
    <w:IgnoreMixedContent>false</w:IgnoreMixedContent>
    <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText>
    <w:Compatibility>
      <w:BreakWrappedTables/>
      <w:SnapToGridInCell/>
      <w:WrapTextWithPunct/>
      <w:UseAsianBreakRules/>
      <w:DontGrowAutofit/>
      <w:SplitPgBreakAndParaMark/>
      <w:EnableOpenTypeKerning/>
      <w:DontFlipMirrorIndents/>
      <w:OverrideTableStyleHps/>
    </w:Compatibility>
  </w:WordDocument>
</xml>
<style>
<!--
 /* Font Definitions */
 @font-face
	{font-family:Wingdings;
	panose-1:5 0 0 0 0 0 0 0 0 0;
	mso-font-charset:2;
	mso-generic-font-family:auto;
	mso-font-pitch:variable;
	mso-font-signature:0 268435456 0 0 -2147483648 0;}
@font-face
	{font-family:"Cambria Math";
	panose-1:2 4 5 3 5 4 6 3 2 4;
	mso-font-charset:0;
	mso-generic-font-family:roman;
	mso-font-pitch:variable;
	mso-font-signature:3 0 0 0 1 0;}
@font-face
	{font-family:Calibri;
	panose-1:2 15 5 2 2 2 4 3 2 4;
	mso-font-charset:0;
	mso-generic-font-family:swiss;
	mso-font-pitch:variable;
	mso-font-signature:-469750017 -1073732485 9 0 511 0;}
@font-face
	{font-family:"Times New Roman";
	panose-1:2 2 6 3 5 4 5 2 3 4;
	mso-font-charset:0;
	mso-generic-font-family:roman;
	mso-font-pitch:variable;
	mso-font-signature:-536859905 -1073711037 9 0 511 0;}
 /* Style Definitions */
 p.MsoNormal, li.MsoNormal, div.MsoNormal
	{mso-style-unhide:no;
	mso-style-qformat:yes;
	mso-style-parent:"";
	margin-top:0in;
	margin-right:0in;
	margin-bottom:8.0pt;
	margin-left:0in;
	line-height:107%;
	mso-pagination:widow-orphan;
	font-size:12.0pt;
	font-family:"Times New Roman",serif;
	mso-fareast-font-family:"Times New Roman";
	mso-bidi-font-family:"Times New Roman";}
.MsoChpDefault
	{mso-style-type:export-only;
	mso-default-props:yes;
	font-family:"Calibri",sans-serif;
	mso-ascii-font-family:Calibri;
	mso-fareast-font-family:Calibri;
	mso-hansi-font-family:Calibri;}
@page WordSection1
	{size:210.0mm 297.0mm;
	margin:0.4in 0.5in 0.4in 0.5in;
	mso-header-margin:.2in;
	mso-footer-margin:.2in;
	mso-footer:f1;
	mso-paper-source:0;}
div.WordSection1
	{page:WordSection1;}
p.MsoFooter, li.MsoFooter, div.MsoFooter
	{mso-style-priority:99;
	margin:0in;
	mso-pagination:widow-orphan;
	tab-stops:center 3.0in right 6.0in;
	font-size:9.0pt;
	font-family:"Times New Roman",serif;}
-->
</style>
</head>
<body lang="EN-US" link="#0563C1" vlink="#954F72" style="word-wrap:break-word">
${formData.includeHeader ? `
<!-- HEADER SECTION -->
<!-- HEADER SECTION - ABSOLUTE POSITIONING -->
    <!-- HEADER SECTION -->
    <div>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
            <tr>
                <td width="20%" valign="top" style="vertical-align: top;">
                    <img width="${formData.logoSize}" height="${(formData.logoSize * 1.3) / 1.42}" src="${window.location.origin}/nepal_coat_of_arms.png" alt="Logo" style="height:auto; mso-position-horizontal:left; mso-position-vertical:top;">
                </td>
                <td width="60%" style="text-align: center; vertical-align: top;">
                    <p style="margin: 0; line-height: 1.0;"><span style="font-size: 28.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">${formData.headerTitle}</span></p>
                    <p style="margin: 0; line-height: 1.0;"><span style="font-size: 20.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">${formData.headerSubtitle}</span></p>
                    <p style="margin: 0; line-height: 1.0;"><span style="font-size: 18.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">${formData.headerAddress1}</span></p>
                    <p style="margin: 0; line-height: 1.0;"><span style="font-size: 18.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">${formData.headerAddress2}</span></p>
                </td>
                <td width="20%"></td>
            </tr>
        </table>
    
    <!-- Reference and Date - Robust 2x2 Table Alignment -->
    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 2pt; margin-bottom: 0px; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
        <tr>
            <td width="50%" align="left" valign="top" style="padding: 0;">
                <p style="margin: 0; line-height: 1.0; mso-line-height-rule: exactly;">
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">Ref. No.:</span> 
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${formData.refNo}</span>
                </p>
            </td>
            <td width="50%" align="right" valign="top" style="padding: 0;"></td>
        </tr>
        <tr>
            <td width="50%" align="left" valign="top" style="padding: 0;">
                <p style="margin: 0; line-height: 1.0; mso-line-height-rule: exactly;">
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">Dis. No.:</span> 
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${formData.disNo}</span>
                </p>
            </td>
            <td width="50%" align="right" valign="top" style="padding: 0; text-align: right;">
                <p style="margin: 0; line-height: 1.0; mso-line-height-rule: exactly;">
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold;">Date:</span> 
                    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${formatCurrentDate()}</span>
                </p>
            </td>
        </tr>
    </table>
    
    <!-- Red Line -->
    <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #CC0000; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 2pt; margin-bottom: 8pt; mso-margin-top-alt: 2pt; mso-margin-bottom-alt: 8pt;">&nbsp;</p>
</div>
` : ''}

<!-- MAIN TITLE -->
<p align="center" style="margin: 0; margin-bottom: 2pt; text-align: center; line-height: 1.0;">
    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; text-decoration: underline;">Annual Income Verification Certificate</span>
</p>

<!-- SUBTITLE -->
<p align="center" style="margin: 0; margin-bottom: 12pt; text-align: center; line-height: 1.0;">
    <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; text-decoration: underline;">To Whom It May Concern</span>
</p>

<!-- INTRO PARAGRAPH -->
<p style="text-align: justify; margin: 0; margin-bottom: 12pt; line-height: 1.15; mso-line-height-rule: exactly;">
    <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">
        This is to certify that <strong>${formData.parentName}</strong> ${formData.relation} of 
        <strong>${formData.studentName}</strong> the permanent resident of 
        <strong>${formData.addressLine}</strong> has submitted an application to this office for the verification of an annual income. 
        Annual income is calculated of last 3 years from fiscal year are mentioned below:
    </span>
</p>

<!-- INCOME TABLE -->
<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; border: solid windowtext 1.0pt; mso-border-alt: solid windowtext .5pt; mso-padding-alt: 0cm 1.4pt 0cm 1.4pt;">
    <tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes;height:26.65pt">
        <td width="35" rowspan="2" style="width:26.25pt;border:solid windowtext 1.0pt;border-right:none;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-bottom-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:26.65pt;mso-height-rule:exactly;">
            <p align="center" style="text-align:center;mso-yfti-cnfc:68;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">S.N.</span></b></p>
        </td>
        <td width="288" rowspan="2" style="width:216.0pt;border-top:solid windowtext 1.0pt;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:26.65pt;mso-height-rule:exactly;">
            <p align="center" style="text-align:center;mso-yfti-cnfc:64;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">Income Headings</span></b></p>
        </td>
        <td width="270" colspan="3" style="width:202.5pt;border:solid windowtext 1.0pt;border-left:none;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:26.65pt;mso-height-rule:exactly;">
            <p align="center" style="text-align:center;mso-yfti-cnfc:64;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">Annual Income Per Mentioned Fiscal Year In NPR</span></b></p>
        </td>
    </tr>
    <tr style="mso-yfti-irow:1;height:14.0pt">
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="center" style="text-align:center;mso-yfti-cnfc:64;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${fiscalYearLabels[0]}</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="center" style="text-align:center;mso-yfti-cnfc:64;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${fiscalYearLabels[1]}</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="center" style="text-align:center;mso-yfti-cnfc:64;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${fiscalYearLabels[2]}</span></b></p>
        </td>
    </tr>
    
    <!-- INCOME ROWS -->
    ${tableRows}
    
    <!-- TOTAL NPR -->
    <tr style="mso-yfti-irow:${formData.incomeData.length + 2};height:14.0pt">
        <td width="35" colspan="2" style="width:26.25pt;border:solid windowtext 1.0pt;border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">Total Amount (NPR)</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${formatCurrency(totals.totalNPR[0])}</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${formatCurrency(totals.totalNPR[1])}</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${formatCurrency(totals.totalNPR[2])}</span></b></p>
        </td>
    </tr>
    
    <!-- TOTAL USD -->
    <tr style="mso-yfti-irow:${formData.incomeData.length + 3};mso-yfti-lastrow:yes;height:14.0pt">
        <td width="35" colspan="2" style="width:26.25pt;border:solid windowtext 1.0pt;border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">Total Amount (US$)</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${formatCurrency(totals.totalUSD[0])}</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${formatCurrency(totals.totalUSD[1])}</span></b></p>
        </td>
        <td width="90" style="width:67.5pt;border-top:none;border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;padding:0cm 1.4pt 0cm 1.4pt;height:14.0pt;mso-height-rule:exactly;">
            <p align="right" style="text-align:right;mso-yfti-cnfc:4;"><b><span style="font-size:12.0pt;mso-bidi-font-size:11.0pt;font-family:'Times New Roman',serif;mso-fareast-font-family:'Times New Roman';">${formatCurrency(totals.totalUSD[2])}</span></b></p>
        </td>
    </tr>
</table>

<!-- EXCHANGE RATE INFO -->
<p style="margin: 0; margin-top: 12pt; margin-bottom: 6pt; line-height: 1.15; mso-line-height-rule: exactly;">
    <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">
        <strong>For Information:</strong> 1 US $ = ${formData.exchangeRate} NPR 
        (Source: Nepal Rastra Bank - Selling Rate for ${formatExchangeDate()}).
    </span>
</p>

<!-- NOTE PARAGRAPH -->
<p style="text-align: justify; margin: 0; margin-bottom: 6pt; line-height: 1.15; mso-line-height-rule: exactly;">
    <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">
        <strong>Note:</strong> The annual incomes have been calculated and verified according to the Nepalese fiscal year and 
        Income Tax Act 2058 B.S. (2002 A.D.) rules. The Nepalese fiscal year starts from the 1<sup>st</sup> day of Shrawan 
        (Roughly falls in Mid-July) and ends on the final day of Ashadh of the following year (Roughly falls in Mid-July of the following year). 
        The details about the fiscal year period are mentioned below:
    </span>
</p>

<!-- FISCAL YEAR LIST -->
<ol style="margin-top: 0; margin-bottom: 12pt; margin-left: 36pt; padding: 0; line-height: 1.15;">
    <li style="margin-bottom: 4pt; mso-list:l0 level1 lfo1; tab-stops:list 36.0pt;">
        <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">
            Fiscal Year ${fiscalYearLabels[0]} (For the period of ${formatFiscalDate(fiscalYearData[0].startDateObj)} to ${formatFiscalDate(fiscalYearData[0].endDateObj)}).
        </span>
    </li>
    <li style="margin-bottom: 4pt; mso-list:l0 level1 lfo1; tab-stops:list 36.0pt;">
        <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">
            Fiscal Year ${fiscalYearLabels[1]} (For the period of ${formatFiscalDate(fiscalYearData[1].startDateObj)} to ${formatFiscalDate(fiscalYearData[1].endDateObj)}).
        </span>
    </li>
    <li style="mso-list:l0 level1 lfo1; tab-stops:list 36.0pt;">
        <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">
            Fiscal Year ${fiscalYearLabels[2]} (For the period of ${formatFiscalDate(fiscalYearData[2].startDateObj)} to ${formatFiscalDate(fiscalYearData[2].endDateObj)}).
        </span>
    </li>
</ol>

<!-- SIGNATURE -->
<table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 30pt; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
    <tr>
        <td align="right">
            <p style="margin: 0; line-height: 1.0; margin-bottom: 4pt;">
                <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif;">......................................</span>
            </p>
            <p style="margin: 0; line-height: 1.0; margin-bottom: 2pt;">
                <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; font-weight: bold;">${formData.signatoryName}</span>
            </p>
            <p style="margin: 0; line-height: 1.0;">
                <span style="font-size: 12.0pt; font-family: 'Times New Roman',serif; font-weight: bold;">${formData.signatoryDesignation}</span>
            </p>
        </td>
    </tr>
</table>

${formData.includeFooter ? `
<div style="mso-element:footer" id="f1">
    <div class="MsoFooter">
        <!-- Red Line (matching header style) -->
        <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #CC0000; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 0pt; margin-bottom: 4pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 4pt;">&nbsp;</p>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
            <tr>
                <td width="40%" align="left">
                    <p style="margin: 0; line-height: 1.0;">
                        <span style="font-size: 14.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold; white-space: nowrap;">Phone No.: ${formData.footerPhone}</span>
                    </p>
                </td>
                <td width="60%" align="right">
                    <p style="margin: 0; line-height: 1.0; text-align: right;">
                        <span style="font-size: 14.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold; white-space: nowrap;">E-mail: ${formData.footerEmail}</span>
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
</html>`;

        const blob = new Blob(["\ufeff", content], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Annual_Income_Verification_${formData.studentName.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
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
                                <button onClick={() => document.execCommand('bold')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Bold"><Bold size={14} /></button>
                                <button onClick={() => document.execCommand('italic')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Italic"><Italic size={14} /></button>
                                <button onClick={() => document.execCommand('underline')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Underline"><Underline size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Alignment */}
                                <button onClick={() => document.execCommand('justifyLeft')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Align Left"><AlignLeft size={14} /></button>
                                <button onClick={() => document.execCommand('justifyCenter')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Align Center"><AlignCenter size={14} /></button>
                                <button onClick={() => document.execCommand('justifyRight')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Align Right"><AlignRight size={14} /></button>
                                <button onClick={() => document.execCommand('justifyFull')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Justify"><AlignJustify size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Undo/Redo */}
                                <button onClick={() => document.execCommand('undo')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Undo"><Undo size={14} /></button>
                                <button onClick={() => document.execCommand('redo')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200" title="Redo"><Redo size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Clear Formatting */}
                                <button onClick={() => document.execCommand('removeFormat')} className="px-2 h-7 flex items-center justify-center rounded hover:bg-red-50 text-xs border border-gray-200 text-red-600" title="Clear Formatting"><RemoveFormatting size={14} /></button>
                            </div>

                            {/* Preview Container */}
                            <div className="bg-gray-200 p-2 sm:p-6 overflow-auto flex-1 flex justify-center items-start">
                                <div
                                    id="printable-certificate"
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    spellCheck={false}
                                    className="bg-white w-[210mm] min-w-[210mm] min-h-[297mm] px-[0.5in] sm:px-[1in] pb-[0.5in] sm:pb-[1in] pt-[0.25in] sm:pt-[0.25in] text-[10px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-blue-500/20 mx-auto"
                                    style={{ fontFamily: 'Times New Roman, serif' }}
                                >

                                    {/* Conditional Header - Red Theme with Logo - ABSOLUTE POSITIONING FIX */}
                                    {formData.includeHeader && (
                                        <>
                                            <div className="relative mb-2 min-h-[120px]">
                                                {/* Logo - Absolute Left */}
                                                <div className="absolute -left-6 top-0">
                                                    <img src="/nepal_coat_of_arms.png" alt="Logo" style={{ width: `${formData.logoSize}px`, height: `${(formData.logoSize * 1.3) / 1.42}px` }} />
                                                </div>

                                                {/* Text - Centered (Full Width) */}
                                                <div className="text-center w-full px-4">
                                                    <div className="font-bold text-[#CC0000]" style={{ fontSize: '28pt', lineHeight: '1.0', marginBottom: '2px' }}>{formData.headerTitle}</div>
                                                    <div className="font-bold text-[#CC0000]" style={{ fontSize: '20pt', lineHeight: '1.0', marginBottom: '2px' }}>{formData.headerSubtitle}</div>
                                                    <div className="font-bold text-[#CC0000]" style={{ fontSize: '18pt', lineHeight: '1.0', marginBottom: '2px' }}>{formData.headerAddress1}</div>
                                                    <div className="font-bold text-[#CC0000]" style={{ fontSize: '18pt', lineHeight: '1.0' }}>{formData.headerAddress2}</div>
                                                </div>
                                            </div>

                                            {/* Reference and Date - Robust 2x2 Table Arrangement (PDF Preview) */}
                                            <table className="w-full border-collapse mb-0 font-bold" style={{ fontSize: '16pt', color: '#CC0000', lineHeight: '1.0' }}>
                                                <tbody>
                                                    <tr>
                                                        <td className="text-left p-0" style={{ width: '50%' }}>
                                                            Ref. No.: <span className="text-black font-bold">{formData.refNo}</span>
                                                        </td>
                                                        <td className="text-right p-0" style={{ width: '50%' }}></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-left p-0" style={{ width: '50%' }}>
                                                            Dis. No.: <span className="text-black font-bold">{formData.disNo}</span>
                                                        </td>
                                                        <td className="text-right p-0" style={{ width: '50%', verticalAlign: 'bottom' }}>
                                                            Date: <span className="text-black font-bold">{(() => {
                                                                const d = parseDateParts(formData.date);
                                                                return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year}</>;
                                                            })()}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div className="border-b-[3px] border-[#CC0000] mb-2 -mx-[0.5in] sm:-mx-[1in] mt-0.5"></div>
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
                                        <strong>For Information:</strong> 1 US $ = {formData.exchangeRate} NPR (Source: Nepal Rastra Bank -for {(() => { const d = parseExchangeRateParts(exchangeRateInfo.date); return <>{d.day}<sup>{d.suffix}</sup> {d.month} {d.year}</>; })()}).
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
                                        <div className="absolute bottom-4 left-0 right-0 pt-2 border-t-[3px] border-[#CC0000] px-[0.5in] sm:px-[1in] flex justify-between items-center bg-white">
                                            <span className="font-bold text-[#CC0000]" style={{ fontSize: '14pt' }}>Phone No.: {formData.footerPhone}</span>
                                            <span className="font-bold text-[#CC0000]" style={{ fontSize: '14pt' }}>E-mail: {formData.footerEmail}</span>
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
                                                    {/* <span className="text-red-600 font-bold"> Selling Rate</span> */}
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