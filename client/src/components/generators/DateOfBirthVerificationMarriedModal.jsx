import { Calendar, Download, FileText, Printer, X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        logoSize: 80,

        // Header (Dynamic from student)
        headerTitle: 'Machhapuchhre Rural Municipality',
        headerSubtitle: '4 No. Ward Office',
        headerAddress: 'Lahachok, Kaski, Gandaki Province, Nepal',

        // Footer info
        footerEmail: 'machhapuchhrereward4@gmail.com',
        footerPhone: '+977-9856017304',

        // Meta
        refNo: '2082/083',
        disNo: '322',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

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
                headerTitle: municipality,
                headerSubtitle: `${wardNo} No. Ward Office`,
                headerAddress: `${tole}, ${district}, ${province}, Nepal`,
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
    const generateWordDoc = () => {
        const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Date of Birth Verification (Married)</title>
        <style>
          @page { margin: 0.4in 0.5in; size: A4; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; }
          p { margin-bottom: 8pt; text-align: justify; }
          .doc-title { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; margin-top: 8pt; margin-bottom: 5pt; }
          .doc-subtitle { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin-bottom: 15pt; }
          .signature-block { text-align: right; margin-top: 40pt; }
        </style>
      </head>
      <body>
        
        ${formData.includeHeader ? `
        <table style="width: 100%; margin-bottom: 5pt;">
          <tr>
            <td style="width: 18%; vertical-align: top; padding-left: 3pt;">
               <img src="${window.location.origin}/nepal_coat_of_arms.png" width="70" height="auto" />
            </td>
            <td style="width: 64%; text-align: center; vertical-align: middle;">
              <div style="font-size: 16pt; font-weight: bold; color: #DC2626;">${formData.headerTitle}</div>
              <div style="font-size: 13pt; font-weight: bold; color: #DC2626;">${formData.headerSubtitle}</div>
              <div style="font-size: 10pt; font-weight: bold; color: #DC2626;">${formData.headerAddress}</div>
            </td>
            <td style="width: 18%;"></td>
          </tr>
        </table>

        <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 10pt; margin-bottom: 10pt; border-bottom: 2pt solid #DC2626; padding-bottom: 5pt;">
          <tr>
              <td style="text-align: left;">
                  <div>Ref. No.: ${formData.refNo}</div>
                  <div>Dis. No.: ${formData.disNo}</div>
              </td>
              <td style="text-align: right; vertical-align: bottom;">
                  Date: ${formData.date}
              </td>
          </tr>
        </table>
        ` : ''}

        <div class="doc-title">Date of Birth Verification Certificate</div>
        <div class="doc-subtitle">To Whom It May Concern</div>

        <p>
            This is to certify that <strong>${formData.applicantName}</strong> daughter of 
            <strong>${formData.fatherName}</strong> and <strong>${formData.motherName}</strong> 
            daughter-in-law of <strong>${formData.fatherInLawName}</strong> and 
            <strong>${formData.motherInLawName}</strong> wife of <strong>${formData.husbandName}</strong> 
            permanent resident of <strong>${formData.addressLine}</strong> was born on 
            <strong>B.S. ${formData.dobBS} (${formData.dobAD} A.D.)</strong>.
        </p>

        <p>
            This birth verification certificate is issued in accordance with the Local Government Operation Act 
            B.S. 2074 (2017 A.D.), Chapter 3, Section 12, Sub-section 2, Clause E (7).
        </p>

        <div class="signature-block">
            <div style="margin-bottom: 5pt;">........................................</div>
            <strong>${formData.signatoryName}</strong><br>
            ${formData.signatoryDesignation}
        </div>

        ${formData.includeFooter ? `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; text-align: center; padding: 5pt 0; border-top: 2pt solid #DC2626; background: white;">
          <span style="font-size: 9pt; color: #DC2626; font-weight: bold;">Phone No.: ${formData.footerPhone} | E-mail: ${formData.footerEmail}</span>
        </div>
        ` : ''}

      </body>
      </html>
    `;

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Birth_Verify_Married_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        padding: 10mm;
                        box-sizing: border-box;
                    }
                    @page { size: A4; margin: 0; }
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
                        <div className="bg-gray-200 p-6 overflow-auto flex-1 flex justify-center">
                            <div
                                id="printable-certificate"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                spellCheck={false}
                                className="print-area bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] px-14 py-8 text-[11px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            >
                                {/* Conditional Header - Red Theme */}
                                {formData.includeHeader && (
                                    <>
                                        <div className="flex items-center justify-between pb-2 mb-1">
                                            <div className="w-32">
                                                <img src="/nepal_coat_of_arms.png" alt="Logo" style={{ width: `${formData.logoSize}px`, height: 'auto', transform: 'scaleX(1.15)' }} />
                                            </div>
                                            <div className="text-center flex-1">
                                                <div className="text-xl font-bold text-red-600">{formData.headerTitle}</div>
                                                <div className="text-lg font-bold text-red-600">{formData.headerSubtitle}</div>
                                                <div className="text-sm font-bold text-red-600">{formData.headerAddress}</div>
                                            </div>
                                            <div className="w-32"></div>
                                        </div>

                                        <div className="flex justify-between text-xs font-bold text-red-600 mb-1">
                                            <div>
                                                <div>Ref. No.: {formData.refNo}</div>
                                                <div>Dis. No.: {formData.disNo}</div>
                                            </div>
                                            <div className="self-end">
                                                Date: {formData.date}
                                            </div>
                                        </div>

                                        <div className="border-b-2 border-red-600 mb-4"></div>
                                    </>
                                )}

                                <div className="text-center font-bold underline text-[14px]">
                                    Date of Birth Verification Certificate
                                </div>

                                <div className="text-center font-bold underline text-[12px] mt-1 mb-4">
                                    To Whom It May Concern
                                </div>

                                <p className="mb-4 text-[11pt]">
                                    This is to certify that <strong>{formData.applicantName}</strong> daughter of
                                    <strong> {formData.fatherName}</strong> and <strong>{formData.motherName}</strong>
                                    {' '}daughter-in-law of <strong>{formData.fatherInLawName}</strong> and
                                    <strong> {formData.motherInLawName}</strong> wife of <strong>{formData.husbandName}</strong>
                                    {' '}permanent resident of <strong>{formData.addressLine}</strong> was born on
                                    <strong> B.S. {formData.dobBS} ({formData.dobAD} A.D.)</strong>.
                                </p>

                                <p className="text-[11pt]">
                                    This birth verification certificate is issued in accordance with the Local Government Operation Act
                                    B.S. 2074 (2017 A.D.), Chapter 3, Section 12, Sub-section 2, Clause E (7).
                                </p>

                                {/* SIGNATURE */}
                                <div className="mt-16 text-right">
                                    <div>............................................</div>
                                    <div className="font-bold">{formData.signatoryName}</div>
                                    <div>{formData.signatoryDesignation}</div>
                                </div>

                                {/* Conditional Footer - Red Theme */}
                                {formData.includeFooter && (
                                    <div className="absolute bottom-4 left-0 right-0 text-center pt-2 border-t-2 border-red-600 mx-8">
                                        <span className="text-[9px] font-bold text-red-600">Phone No.: {formData.footerPhone} | E-mail: {formData.footerEmail}</span>
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
                                        max="120"
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
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                                            <input name="headerAddress" value={formData.headerAddress} onChange={handleChange}
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
