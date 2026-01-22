import { Download, FileText, Plus, Printer, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFormattedDate, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

export default function OccupationVerificationModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  // 1. Initial State
  const [formData, setFormData] = useState({
    // Document options
    includeHeader: true,
    includeFooter: true,
    logoSize: 136,

    // Header info
    headerTitle: 'Bheemdatta Municipality',
    headerSubtitle: '10 No. Ward Office',
    headerAddress1: 'Jinmawala Khanpur, Sudurpaschim',
    headerAddress2: 'Nepal',

    // Footer info
    footerEmail: 'bhi.na.pa.10jimuwa@gmail.com',
    footerPhone: '+977-9856017304',

    refNo: '2082/083',
    disNo: '401',
    date: getFormattedDate(),

    // Body Variables
    parentName: `Mr. ${student?.familyInfo?.fatherName || 'Parent Name'}`,
    relation: 'father', // father/mother
    studentName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
    addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

    // Occupation List (Default to empty or pull from Financial Info)
    occupations: [],

    // Signatory
    signatoryName: 'Lob Bahadur Shahi',
    signatoryDesignation: 'Ward Chairperson'
  });

  // Reset/Auto-fill when student changes
  useEffect(() => {
    if (student) {
      // Try to pull occupations from financial info if available, else defaults
      let initialOccupations = student.financialInfo?.incomeSources?.map(src => src.sourceName) || [];
      if (initialOccupations.length === 0) {
        initialOccupations = [
          "Agriculture Products (Maize & Mustard)",
          "Animal Husbandry (Goat & Buffalo)",
          "Vegetable Products (Potato & Cabbage)"
        ];
      }

      setFormData(prev => ({
        ...prev,
        // Dynamic Header from Student Address
        headerTitle: student.address?.municipality || 'Bheemdatta Municipality',
        headerSubtitle: student.address?.wardNo ? `${student.address.wardNo} No. Ward Office` : '10 No. Ward Office',
        headerAddress1: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}`,
        headerAddress2: `${student.address?.province || ''}, Nepal`,
        // Body data
        parentName: `Mr. ${student.familyInfo?.fatherName || ''}`,
        studentName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,
        occupations: initialOccupations
      }));
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for relation change - update parentName accordingly
    if (name === 'relation') {
      let parentName = '';
      if (value === 'father') {
        parentName = `Mr. ${student?.familyInfo?.fatherName || 'Parent Name'}`;
      } else if (value === 'mother') {
        parentName = `Mrs. ${student?.familyInfo?.motherName || 'Parent Name'}`;
      }
      setFormData({ ...formData, relation: value, parentName });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Dynamic Occupation Handlers ---
  const handleOccupationChange = (index, value) => {
    const updated = [...formData.occupations];
    updated[index] = value;
    setFormData({ ...formData, occupations: updated });
  };

  const addOccupation = () => {
    setFormData({
      ...formData,
      occupations: [...formData.occupations, ""]
    });
  };

  const removeOccupation = (index) => {
    const updated = formData.occupations.filter((_, i) => i !== index);
    setFormData({ ...formData, occupations: updated });
  };

  // --- 2. Word Document Generator Logic (Standardized) ---
  const generateWordDoc = () => {
    // Generate Rows HTML
    const tableRows = formData.occupations.map((occ, index) => `
        <tr style="height: 20pt;">
            <td style="border: 0.75pt solid black; padding: 1pt 5pt; text-align: center; font-family: 'Times New Roman', serif;">${index + 1}</td>
            <td style="border: 0.75pt solid black; padding: 1pt 5pt; text-align: left; font-family: 'Times New Roman', serif;">${occ}</td>
        </tr>
    `).join('');

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Occupation Verification</title>
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
            }
            
            /* Header Styles */
            .header-container { width: 100%; margin-bottom: 5pt; }
            .municipality-title { font-size: 24pt; font-weight: bold; color: #DC2626; line-height: 1; margin-bottom: 3pt; text-align: center; }
            .ward-office { font-size: 18pt; font-weight: bold; color: #DC2626; line-height: 1; margin-bottom: 3pt; text-align: center; }
            .address-line { font-size: 16pt; font-weight: bold; color: #DC2626; line-height: 1; text-align: center; }
            
            .ref-date-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 8pt; margin-bottom: 4pt; font-weight: bold; }
            .red-line { border-bottom: 1.5pt solid #DC2626; margin: 4pt -0.75in 10pt -0.75in; }
            
            /* Main Content */
            .main-title { font-size: 16pt; font-weight: bold; text-align: center; text-decoration: underline; margin: 10pt 0 4pt 0; text-transform: uppercase; }
            .sub-title { font-size: 16pt; font-weight: bold; text-align: center; text-decoration: underline; margin-bottom: 12pt; }
            
            .content-text { font-size: 12pt; text-align: justify; line-height: 1.5; margin-bottom: 8pt; }
            
            /* Table Styles */
            .data-table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 12pt; }
            .data-table th { border: 0.75pt solid black; padding: 2pt 5pt; text-align: center; font-weight: bold; background-color: white; }
            .data-table td { border: 0.75pt solid black; padding: 2pt 5pt; }
            
            /* Signature */
            .signature-block { margin-top: 40pt; text-align: right; font-size: 12pt; line-height: 1.15; }
            
            
            /* Utils */
            .text-red { color: #DC2626; }
            .text-black { color: black; }
            sup { vertical-align: super; font-size: 0.7em; line-height: 0; }
            
        </style>
      </head>
      <body>
        
        ${formData.includeHeader ? `
        <!-- HEADER SECTION -->
        <div class="header-container">
            <table style="width: 100%; margin-bottom: 0;">
                <tr>
                    <td style="width: 20%; vertical-align: top; padding-left: 0;">
                        <img src="${window.location.origin}/nepal_coat_of_arms.png" width="${formData.logoSize}" height="${(formData.logoSize * 1.3) / 1.42}" style="width: ${formData.logoSize}px; height: auto; display: block;" />
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
            
            <div class="ref-date-row">
                <div style="text-align: left;">
                    <span class="text-red">Ref. No.:</span> <span class="text-black">${formData.refNo}</span><br>
                    <span class="text-red">Dis. No.:</span> <span class="text-black">${formData.disNo}</span>
                </div>
                <div style="text-align: right;">
                    <span class="text-red">Date:</span> <span class="text-black">${addSuperscriptToDateString(formData.date)}</span>
                </div>
            </div>
            
            <!-- Red Line -->
            <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 4pt; margin-bottom: 12pt; mso-margin-top-alt: 4pt; mso-margin-bottom-alt: 12pt;">&nbsp;</p>
        </div>
        ` : ''}

        <!-- MAIN CONTENT -->
        <div class="sub-title">Occupation Verification Certificate</div>
        <div class="sub-title">To Whom It May Concern</div>

        <p class="content-text">
            This is to certify that <strong>${formData.parentName}</strong> ${formData.relation} of 
            <strong>${formData.studentName}</strong> the permanent resident of 
            <strong>${formData.addressLine}</strong> is found to be engaged in the following occupations as the means to generate income.
        </p>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 50px; text-align: left;">S.N.</th>
                    <th style="text-align: left;">Occupation</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <p class="content-text" style="font-size: 11pt; margin-top: 10pt;">
            Note: According to the Government of Nepal, taxes are exempted for the income from Agriculture. So, it is not necessary to register on PAN. Therefore, <strong>${formData.parentName}</strong> isn't registered on PAN.
        </p>

        <!-- SIGNATURE -->
        <div class="signature-block">
            <div style="font-weight: bold; margin-bottom: 40pt;">&nbsp;</div>
            <div style="font-weight: bold;">...................................</div>
            <div style="font-weight: bold; margin-top: 5pt;">${formData.signatoryName}</div>
            <div style="font-weight: bold;">${formData.signatoryDesignation}</div>
        </div>

        ${formData.includeFooter ? `
        <div style="mso-element:footer" id="f1">
            <div class="MsoFooter">
                <!-- Red Line (matching header style) -->
                <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 0pt; margin-bottom: 4pt; mso-margin-top-alt: 0pt; mso-margin-bottom-alt: 4pt;">&nbsp;</p>
                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;">
                    <tr>
                        <td width="50%" align="left">
                            <p style="margin: 0; line-height: 1.0;">
                                <span style="font-size: 9.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold;">Phone No.: ${formData.footerPhone}</span>
                            </p>
                        </td>
                        <td width="50%" align="right">
                            <p style="margin: 0; line-height: 1.0; text-align: right;">
                                <span style="font-size: 9.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold;">E-mail: ${formData.footerEmail}</span>
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

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Occupation_Verification_${formData.studentName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Print Styles - Same as DOB/Relationship modals */}
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
                    padding: 15mm !important;
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
            <FileText className="text-green-600" size={20} /> Occupation Verification Generator
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition">
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
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
              <div className="bg-gray-200 p-4 sm:p-8 flex justify-center overflow-auto h-[400px] sm:h-[500px] lg:h-[700px] rounded-b-lg">
                <div
                  id="printable-certificate"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  spellCheck={false}
                  className="print-area bg-white w-full sm:w-[210mm] min-h-[297mm] px-[0.5in] sm:px-[1in] pb-[0.5in] sm:pb-[1in] pt-[0.25in] sm:pt-[0.25in] font-serif text-[10pt] sm:text-[12pt] leading-[1.6] text-justify relative outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                  style={{ fontFamily: "Times New Roman, serif" }}
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

                      {/* <div className="border-b-[3px] border-red-600 mb-2 -mx-[0.5in] sm:-mx-[1in] mt-1"></div> */}

                      <div className="border-b-[3px] border-red-600 mb-6 -mx-[0.5in] sm:-mx-[1in] mt-1"></div>
                    </>
                  )}

                  <div className="text-center font-bold underline mb-1" style={{ fontSize: '16pt' }}>
                    Occupation Verification Certificate
                  </div>

                  <div className="text-center font-bold underline mb-6" style={{ fontSize: '16pt' }}>
                    To Whom It May Concern
                  </div>

                  <p className="mb-4 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                    This is to certify that <strong>{formData.parentName}</strong> {formData.relation} of
                    <strong> {formData.studentName}</strong> the permanent resident of
                    <strong> {formData.addressLine}</strong> is found to be engaged in the following occupations as the means to generate income.
                  </p>

                  {/* TABLE PREVIEW */}
                  <table className="w-full border-collapse border border-black mb-1 text-left leading-none" style={{ fontSize: '12pt' }}>
                    <thead>
                      <tr className="">
                        <th className="border border-black px-1 py-0.5 text-center w-12">S.N.</th>
                        <th className="border border-black px-2 py-0.5">Occupation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.occupations.map((occ, idx) => (
                        <tr key={idx}>
                          <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                          <td className="border border-black px-2 py-0.5">{occ}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="mt-4 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                    Note: According to the Government of Nepal, taxes are exempted for the income from Agriculture. So, it is not necessary to register on PAN. Therefore, <strong>{formData.parentName}</strong> isn't registered on PAN.
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
                      <span className="font-bold text-red-600" style={{ fontSize: '14pt' }}>Phone No.: +977-9856017304</span>
                      <span className="font-bold text-red-600" style={{ fontSize: '14pt' }}>E-mail: {formData.footerEmail}</span>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* RIGHT: EDITABLE FIELDS (1/3 width) */}
            <div className="flex-1 space-y-6">

              <div className="space-y-6">

                {/* SETTINGS CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">

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
                      <span className="text-sm font-medium text-gray-700">Footer Email</span>
                      <input
                        type="checkbox"
                        checked={formData.includeFooter}
                        onChange={(e) => setFormData({ ...formData, includeFooter: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  {/* Ref & Date Inputs */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Ref. No.</label>
                      <input name="refNo" value={formData.refNo} onChange={handleChange}
                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-red-600 bg-red-50/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Dis. No.</label>
                      <input name="disNo" value={formData.disNo} onChange={handleChange}
                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-red-600 bg-red-50/30" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Issue Date</label>
                      <input name="date" value={formData.date} onChange={handleChange}
                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                  </div>
                </div>

                {/* HEADER DETAILS CARD */}
                {formData.includeHeader && (
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Municipality Details</h4>

                    {/* Logo Size Slider */}
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <label className="text-xs font-bold text-blue-700 whitespace-nowrap">Logo Size:</label>
                      <input
                        type="range"
                        min="40"
                        max="200"
                        value={formData.logoSize || 80}
                        onChange={(e) => setFormData({ ...formData, logoSize: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs font-bold text-blue-600 w-10">{formData.logoSize || 80}px</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Municipality Name</label>
                        <input name="headerTitle" value={formData.headerTitle} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
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

                {/* VERIFICATION DETAILS CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Details</h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Parent Name</label>
                    <input name="parentName" value={formData.parentName} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Relation</label>
                      <select name="relation" value={formData.relation} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 transition-all">
                        <option value="father">father</option>
                        <option value="mother">mother</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Student Name</label>
                      <input name="studentName" value={formData.studentName} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                    <input name="addressLine" value={formData.addressLine} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                </div>

                {/* OCCUPATIONS CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Occupations List</h4>
                    <button onClick={addOccupation} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 flex items-center gap-1 font-medium transition-all">
                      <Plus size={14} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.occupations.map((occ, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="w-6 text-center text-xs font-bold text-gray-400">{idx + 1}</span>
                        <input
                          value={occ}
                          onChange={(e) => handleOccupationChange(idx, e.target.value)}
                          className="flex-1 border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="e.g. Agriculture Products"
                        />
                        <button onClick={() => removeOccupation(idx)} className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SIGNATORY CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signatory</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input name="signatoryName" value={formData.signatoryName} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                      <input name="signatoryDesignation" value={formData.signatoryDesignation} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    </div>
                  </div>
                </div>

                {/* FOOTER EMAIL CARD */}
                {formData.includeFooter && (
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Footer Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                      <input name="footerEmail" value={formData.footerEmail} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="email@example.com" />
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 print-hidden">
          <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition order-last sm:order-first">
            Cancel
          </button>
          <button onClick={handlePrint} className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 transition">
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