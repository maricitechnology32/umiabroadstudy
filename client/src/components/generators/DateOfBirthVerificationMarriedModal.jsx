import { Calendar, Download, FileText, Printer, X, Plus, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, RemoveFormatting } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFormattedDate, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

export default function DateOfBirthVerificationMarriedModal({ isOpen, onClose, student }) {
    if (!isOpen || !student) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = date.getDate();
        const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3) ? 0 : (day % 100 - day % 10 != 10) * day % 10];
        return `${day}${suffix} ${date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;
    };

    // 1. Initial State
    const [formData, setFormData] = useState({
        // Document options
        includeHeader: true,
        includeFooter: true,
        logoSize: 174,

        // Header (Dynamic from student)
        // Header (Dynamic from student)
        headerTitle: 'Machhapuchhre Rural Municipality',
        headerSubtitle: '4 No. Ward Office',
        headerAddress1: 'Lahachok, Kaski',
        headerAddress2: 'Gandaki Province, Nepal',

        // Footer info
        footerEmail: 'machhapuchhrereward4@gmail.com',
        footerPhone: '+977-9856017304',

        // Meta
        refNo: '2082/083',
        disNo: '322',
        date: getFormattedDate(),

        // Applicant Details
        applicantName: `Mrs. ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,

        // Relations
        fatherName: `Mr. ${student.familyInfo?.fatherName || ''}`,
        motherName: `Mrs. ${student.familyInfo?.motherName || ''}`,
        fatherInLawName: `Mr. ${student.familyInfo?.fatherInLawName || ''}`,
        motherInLawName: `Mrs. ${student.familyInfo?.motherInLawName || ''}`,
        husbandName: `Mr. ${student.familyInfo?.spouseName || ''}`,

        // Location & Dates
        addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,
        dobBS: student.personalInfo?.dobBS || '2058/04/16',
        dobAD: formatDate(student.personalInfo?.dobAD) || '31st July 2001',

        // Signatory
        signatoryName: 'Lob Bahadur Shahi',
        signatoryDesignation: 'Ward Chairperson'
    });

    // Sync with Student Data + Dynamic Header
    useEffect(() => {
        if (student) {
            const municipality = student.address?.municipality || 'Machhapuchhre Rural Municipality';
            const wardNo = student.address?.wardNo || '4';
            const tole = student.address?.tole || 'Lahachok';
            const district = student.address?.district || 'Kaski';
            const province = student.address?.province || 'Gandaki Province';

            setFormData(prev => ({
                ...prev,
                // Dynamic Header
                // Dynamic Header
                headerTitle: municipality,
                headerSubtitle: `${wardNo} No. Ward Office`,
                headerAddress1: `${tole}, ${district}`,
                headerAddress2: `${province}, Nepal`,
                // Core fields
                applicantName: `Mrs. ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
                fatherName: `Mr. ${student.familyInfo?.fatherName || ''}`,
                motherName: `Mrs. ${student.familyInfo?.motherName || ''}`,
                fatherInLawName: `Mr. ${student.familyInfo?.fatherInLawName || ''}`,
                motherInLawName: `Mrs. ${student.familyInfo?.motherInLawName || ''}`,
                husbandName: `Mr. ${student.familyInfo?.spouseName || ''}`,
                dobBS: student.personalInfo?.dobBS || prev.dobBS,
                dobAD: formatDate(student.personalInfo?.dobAD) || prev.dobAD,
                addressLine: `${municipality} Ward No. ${wardNo}, ${district}, ${province}, Nepal`
            }));
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrint = () => {
        window.print();
    };

    // Word Document Generator - Compact Format
    // Word Document Generator - Matches PDF exactly
    const generateWordDoc = () => {
        const content = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset="utf-8">
        <title>Date of Birth Verification Certificate</title>
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
            font-size:14.0pt;
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
                margin-bottom: 0pt;
                text-align: center;
                font-family: 'Times New Roman', serif;
            }
            
            .ward-office {
                font-size: 20pt;
                font-weight: bold;
                color: #DC2626;
                line-height: 1;
                margin-bottom: 0pt;
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
                margin-top: 2pt;
                margin-bottom: 0pt;
                font-weight: bold;
                font-size: 16pt;
            }
            
            .red-line {
                border-bottom: 1.5pt solid #DC2626;
                margin: 2pt -0.75in 8pt -0.75in;
            }
            
            /* Main Content */
            .main-title {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                text-decoration: underline;
                margin: 10pt 0 4pt 0;
                font-family: 'Times New Roman', serif;
            }
            
            .sub-title {
                font-size: 16pt;
                font-weight: bold;
                text-align: center;
                text-decoration: underline;
                margin-bottom: 12pt;
                font-family: 'Times New Roman', serif;
            }
            
            .content-text {
                font-size: 12pt;
                text-align: justify;
                line-height: 1.5;
                margin-bottom: 12pt;
                font-family: 'Times New Roman', serif;
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
                font-size: 14pt;
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
                <td style="width: 60%; text-align: center; vertical-align: top; padding: 0 10pt;">
                    <div class="municipality-title">${formData.headerTitle}</div>
                    <div class="ward-office">${formData.headerSubtitle}</div>
                    <div class="address-line">${formData.headerAddress1}</div>
                    <div class="address-line">${formData.headerAddress2}</div>
                </td>
                <td style="width: 20%;"></td>
            </tr>
        </table>
        
        <!-- Reference and Date - Robust 2x2 Table Arrangement -->
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
                        <span style="font-size: 16.0pt; font-family: 'Times New Roman',serif; font-weight: bold; color: black;">${addSuperscriptToDateString(formData.date)}</span>
                    </p>
                </td>
            </tr>
        </table>
        
        <!-- Red Line -->
        <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 2pt; margin-bottom: 8pt; mso-margin-top-alt: 2pt; mso-margin-bottom-alt: 8pt;">&nbsp;</p>
    </div>
    ` : ''}
    
    <!-- MAIN CONTENT -->
    <div class="main-title">Date of Birth Verification Certificate</div>
    <div class="sub-title">To Whom It May Concern</div>
    
    <p class="content-text">
        This is to certify that <strong>${formData.applicantName}</strong> daughter of 
        <strong>${formData.fatherName}</strong> and <strong>${formData.motherName}</strong> 
        daughter-in-law of <strong>${formData.fatherInLawName}</strong> and 
        <strong>${formData.motherInLawName}</strong> wife of <strong>${formData.husbandName}</strong> 
        permanent resident of <strong>${formData.addressLine}</strong> was born on 
        <strong>B.S. ${formData.dobBS} (${formData.dobAD} A.D.)</strong>.
    </p>

    <p class="content-text">
        This birth verification certificate is issued in accordance with the 
        Local Government Operation Act B.S. 2074 (2017 A.D.), Chapter 3, 
        Section 12, Sub-section 2, Clause E (7).
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
                            <span style="font-size: 14.0pt; font-family: 'Times New Roman',serif; color: #CC0000; font-weight: bold; white-space: nowrap;">Phone No.: ${formData.footerPhone || '+977-9856017304'}</span>
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
    </html>
    `;

        // Create and download the Word document
        const blob = new Blob(['\ufeff', content], {
            type: 'application/msword;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Birth_Verify_Married_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
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
            {/* Print Styles */}
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
                        <FileText className="text-red-600" size={20} /> DOB Verification (Married)
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
                                className="print-area bg-white w-[210mm] min-w-[210mm] min-h-[297mm] px-[0.5in] sm:px-[1in] pb-[0.5in] sm:pb-[1in] pt-[0.25in] sm:pt-[0.25in] text-[12px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-red-500/20 mx-auto"
                                style={{ fontFamily: 'Times New Roman, serif' }}
                            >
                                {/* Conditional Header - Red Theme */}
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
                                    Date of Birth Verification Certificate
                                </div>

                                <div className="text-center font-bold underline mb-3" style={{ fontSize: '16pt' }}>
                                    To Whom It May Concern
                                </div>

                                <p className="mb-2 text-justify leading-snug" style={{ fontSize: '12pt' }}>
                                    This is to certify that <strong>{formData.applicantName}</strong> daughter of
                                    <strong> {formData.fatherName}</strong> and <strong>{formData.motherName}</strong>
                                    {' '}daughter-in-law of <strong>{formData.fatherInLawName}</strong> and
                                    <strong> {formData.motherInLawName}</strong> wife of <strong>{formData.husbandName}</strong>
                                    {' '}permanent resident of <strong>{formData.addressLine}</strong> was born on
                                    <strong> B.S. {formData.dobBS} ({formData.dobAD} A.D.)</strong>.
                                </p>

                                <p className="text-justify leading-snug" style={{ fontSize: '12pt' }}>
                                    This birth verification certificate is issued in accordance with the Local Government Operation Act
                                    B.S. 2074 (2017 A.D.), Chapter 3, Section 12, Sub-section 2, Clause E (7).
                                </p>

                                {/* SIGNATURE */}
                                <div className="mt-8 text-right" style={{ fontSize: '12pt' }}>
                                    <div className="font-bold">............................................</div>
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

                        {/* Family Details */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Family Details</h4>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Applicant Name</label>
                                <input name="applicantName" value={formData.applicantName} onChange={handleChange}
                                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Father</label>
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mother</label>
                                    <input name="motherName" value={formData.motherName} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Father-in-Law</label>
                                    <input name="fatherInLawName" value={formData.fatherInLawName} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mother-in-Law</label>
                                    <input name="motherInLawName" value={formData.motherInLawName} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Husband</label>
                                <input name="husbandName" value={formData.husbandName} onChange={handleChange}
                                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                            </div>
                        </div>

                        {/* Birth Details */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Birth Details</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">DOB (BS)</label>
                                    <input name="dobBS" value={formData.dobBS} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">DOB (AD)</label>
                                    <input name="dobAD" value={formData.dobAD} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                                <textarea name="addressLine" value={formData.addressLine} onChange={handleChange}
                                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all h-16 resize-none" />
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
