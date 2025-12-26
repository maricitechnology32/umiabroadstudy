import { Download, FileText, Printer, Users, X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RelationshipVerificationMarriedModal({ isOpen, onClose, student }) {
    if (!isOpen || !student) return null;

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

        refNo: '2082/083',
        disNo: '323',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

        applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

        signatoryName: 'Lob Bahadur Shahi',
        signatoryDesignation: 'Ward Chairperson',

        relatives: []
    });

    // Reset/Auto-fill when student changes
    useEffect(() => {
        if (student) {
            const applicantFullName = `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`;

            const municipality = student.address?.municipality || 'Machhapuchhre Rural Municipality';
            const wardNo = student.address?.wardNo || '4';
            const tole = student.address?.tole || 'Lahachok';
            const district = student.address?.district || 'Kaski';
            const province = student.address?.province || 'Gandaki Province';

            const initialRelatives = [
                { name: `Mr. ${student.familyInfo?.fatherName || ''}`, relation: "Applicant's Father" },
                { name: `Mrs. ${student.familyInfo?.motherName || ''}`, relation: "Applicant's Mother" },
                { name: applicantFullName, relation: "Applicant" },
                { name: `Mr. ${student.familyInfo?.fatherInLawName || ''}`, relation: "Father-in-Law" },
                { name: `Mrs. ${student.familyInfo?.motherInLawName || ''}`, relation: "Mother-in-Law" },
                { name: `Mr./Mrs. ${student.familyInfo?.spouseName || ''}`, relation: "Applicant's Husband/Wife" }
            ];

            setFormData(prev => ({
                ...prev,
                // Dynamic Header
                headerTitle: municipality,
                headerSubtitle: `${wardNo} No. Ward Office`,
                headerAddress: `${tole}, ${district}, ${province}, Nepal`,
                // Core fields
                applicantName: applicantFullName,
                addressLine: `${municipality} Ward No. ${wardNo}, ${district}, ${province}, Nepal`,
                relatives: initialRelatives
            }));
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRelativeChange = (index, field, value) => {
        const updatedRelatives = [...formData.relatives];
        updatedRelatives[index][field] = value;
        setFormData({ ...formData, relatives: updatedRelatives });
    };

    const addRelative = () => {
        setFormData({
            ...formData,
            relatives: [...formData.relatives, { name: '', relation: '' }]
        });
    };

    const removeRelative = (index) => {
        const updated = formData.relatives.filter((_, i) => i !== index);
        setFormData({ ...formData, relatives: updated });
    };

    const handlePrint = () => {
        window.print();
    };

    // Word Document Generator - Compact Format with Logo
    const generateWordDoc = () => {
        const tableRows = formData.relatives.map((rel, index) => `
    <tr style="line-height: 1.2;">
        <td style="border: 1pt solid black; padding: 3pt; text-align: center; width: 8%;">${index + 1}</td>
        <td style="border: 1pt solid black; padding: 3pt; width: 50%;">${rel.name}</td>
        <td style="border: 1pt solid black; padding: 3pt; width: 42%;">${rel.relation}</td>
    </tr>
`).join('');

        // Generate Photo Grid Cells
        const photoCells = formData.relatives.map(rel => `
        <td style="text-align: center; vertical-align: top; padding: 5pt 2pt; width: 33%;">
            <div style="width: 80pt; height: 90pt; border: 1pt solid #000; margin: 0 auto; display: block;"></div>
            <div style="margin-top: 2pt; font-weight: bold; font-size: 9pt;">${rel.name}</div>
            <div style="font-size: 8pt;">(${rel.relation})</div>
        </td>
    `);

        // Split photos into rows of 3
        const photoRows = [];
        for (let i = 0; i < photoCells.length; i += 3) {
            photoRows.push(`<tr>${photoCells.slice(i, i + 3).join('')}</tr>`);
        }

        const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Relationship Verification (Married)</title>
        <style>
          @page { margin: 0.4in 0.5in; size: A4; }
          body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; }
          p { margin-bottom: 6pt; text-align: justify; }
          .doc-title { text-align: center; font-size: 13pt; font-weight: bold; text-decoration: underline; margin-top: 5pt; margin-bottom: 3pt; }
          .doc-subtitle { text-align: center; font-size: 11pt; font-weight: bold; text-decoration: underline; margin-bottom: 10pt; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 8pt; font-size: 10pt; }
          .data-table td, .data-table th { border: 1pt solid black; padding: 3pt; vertical-align: middle; }
          .photo-table { width: 100%; border: none; margin-top: 5pt; }
          .signature-block { text-align: right; margin-top: 15pt; }
        </style>
      </head>
      <body>
        
        ${formData.includeHeader ? `
        <table style="width: 100%; margin-bottom: 3pt;">
          <tr>
            <td style="width: 18%; vertical-align: top; padding-left: 3pt;">
               <img src="${window.location.origin}/nepal_coat_of_arms.png" width="70" height="auto" />
            </td>
            <td style="width: 64%; text-align: center; vertical-align: middle;">
              <div style="font-size: 15pt; font-weight: bold; color: #DC2626;">${formData.headerTitle}</div>
              <div style="font-size: 12pt; font-weight: bold; color: #DC2626;">${formData.headerSubtitle}</div>
              <div style="font-size: 10pt; font-weight: bold; color: #DC2626;">${formData.headerAddress}</div>
            </td>
            <td style="width: 18%;"></td>
          </tr>
        </table>

        <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 9pt; margin-bottom: 8pt; border-bottom: 1.5pt solid #DC2626; padding-bottom: 3pt;">
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

        <div class="doc-title">Relationship Verification Certificate</div>
        <div class="doc-subtitle">To Whom It May Concern</div>

        <p>
            This is to certify that <strong>${formData.applicantName}</strong> the permanent resident of 
            <strong>${formData.addressLine}</strong> has the following relationship with the following family members.
        </p>
        <p style="font-size: 10pt;">
            This relationship verification certificate is issued in accordance with the Local Government Operation 
            Act B.S. 2074 (2017 A.D.), Chapter 3, Section 12, Sub-section 2, Clause E (1).
        </p>

        <table class="data-table">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="width: 8%; text-align: center;">S.N.</th>
                    <th style="width: 50%;">Name</th>
                    <th style="width: 42%;">Relationship</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>

        <p style="font-size: 10pt; margin-bottom: 5pt;">The photographs of the persons mentioned above are attached below.</p>

        <table class="photo-table">
            ${photoRows.join('')}
        </table>

        <div class="signature-block">
            <div style="margin-bottom: 3pt;">.................................................</div>
            <strong>${formData.signatoryName}</strong><br>
            ${formData.signatoryDesignation}
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
        link.download = `Relationship_Married_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
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
                        <Users className="text-red-600" size={20} /> Relationship Verification (Married)
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
                                className="print-area bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] px-14 py-8 text-[10px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-red-500/20"
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

                                <div className="text-center font-bold underline text-[13px]">
                                    Relationship Verification Certificate
                                </div>

                                <div className="text-center font-bold underline text-[11px] mt-1 mb-3">
                                    To Whom It May Concern
                                </div>

                                <p className="mb-2 text-[10pt]">
                                    This is to certify that <strong>{formData.applicantName}</strong> the permanent resident of
                                    <strong> {formData.addressLine}</strong> has the following relationship with the following family members.
                                </p>

                                <p className="mb-2 text-[9pt]">
                                    This relationship verification certificate is issued in accordance with the Local Government Operation
                                    Act B.S. 2074 (2017 A.D.), Chapter 3, Section 12, Sub-section 2, Clause E (1).
                                </p>

                                {/* Table Preview */}
                                <table className="w-full border-collapse border border-black mb-2 text-left text-[9pt]">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-black p-1 text-center w-8">S.N.</th>
                                            <th className="border border-black p-1">Name</th>
                                            <th className="border border-black p-1">Relationship</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.relatives.map((rel, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-1 text-center">{idx + 1}</td>
                                                <td className="border border-black p-1 font-bold">{rel.name}</td>
                                                <td className="border border-black p-1">{rel.relation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <p className="mb-1 text-[9pt]">The photographs of the persons mentioned above are attached below.</p>

                                {/* Photo Grid Preview */}
                                <div className="grid grid-cols-3 gap-1 justify-center mb-2">
                                    {formData.relatives.map((rel, idx) => (
                                        <div key={idx} className="text-center">
                                            <div className="h-16 w-14 mx-auto border border-black bg-gray-50 mb-1"></div>
                                            <p className="font-bold leading-tight text-[8px]">{rel.name}</p>
                                            <p className="text-[7px] text-gray-500">({rel.relation})</p>
                                        </div>
                                    ))}
                                </div>

                                {/* SIGNATURE */}
                                <div className="mt-16 text-right">
                                    <div>......................................</div>
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

                        {/* Address */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Applicant</h4>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Permanent Address</label>
                                <textarea name="addressLine" value={formData.addressLine} onChange={handleChange}
                                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all h-14 resize-none" />
                            </div>
                        </div>

                        {/* Family Members Table */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Family Members</h4>
                                <button onClick={addRelative} className="text-xs bg-gray-100 border px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                                    <Plus size={12} /> Add
                                </button>
                            </div>

                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {formData.relatives.map((rel, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border border-gray-200 relative">
                                        <div className="w-5 text-center text-xs font-bold text-gray-400">{idx + 1}</div>
                                        <div className="flex-1 grid grid-cols-2 gap-1">
                                            <input
                                                value={rel.name}
                                                onChange={(e) => handleRelativeChange(idx, 'name', e.target.value)}
                                                className="w-full border rounded p-1 text-xs font-semibold"
                                                placeholder="Name"
                                            />
                                            <input
                                                value={rel.relation}
                                                onChange={(e) => handleRelativeChange(idx, 'relation', e.target.value)}
                                                className="w-full border rounded p-1 text-xs"
                                                placeholder="Relation"
                                            />
                                        </div>
                                        <button onClick={() => removeRelative(idx)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
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
