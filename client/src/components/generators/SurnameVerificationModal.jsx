import { Download, FileText, Printer, UserPen, X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SurnameVerificationModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  // Helper to determine relation based on gender/title
  const getRelation = (s) => {
    const gender = s?.personalInfo?.gender;
    const title = s?.personalInfo?.title;

    if (gender === 'Male' || title === 'Mr.') return 'son of';
    if (gender === 'Female' || title === 'Ms.' || title === 'Mrs.') return 'daughter of';
    return 'son/daughter of';
  };

  // 1. Initial State
  const [formData, setFormData] = useState({
    // Document options
    includeHeader: true,
    includeFooter: true,
    logoSize: 110, // Logo size in pixels (adjustable)

    // Header info
    headerTitle: 'Bheemdatta Municipality',
    headerSubtitle: '10 No. Ward Office',
    headerAddress: 'Jinmawala Khanpur, Sudurpaschim, Nepal',

    // Footer info
    footerEmail: 'bhi.na.pa.10jimuwa@gmail.com',

    refNo: '2082/083',
    disNo: '404',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

    // Body Variables
    applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
    relation: getRelation(student),
    fatherName: student.familyInfo?.fatherName || '',
    motherName: student.familyInfo?.motherName || '',

    // Smart Surname Detection
    parentSurname: student.familyInfo?.fatherName?.trim().split(' ').pop() || '',
    applicantSurname: student.personalInfo?.lastName || '',

    // Signatory Defaults
    signatoryName: 'Lob Bahadur Shahi',
    signatoryDesignation: 'Ward Chairperson'
  });

  // Reset when student changes - Use actual student address for header
  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        // DYNAMIC HEADER FROM STUDENT PROFILE
        headerTitle: student.address?.municipality || 'Bheemdatta Municipality',
        headerSubtitle: student.address?.wardNo ? `${student.address.wardNo} No. Ward Office` : '10 No. Ward Office',
        headerAddress: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

        applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        relation: getRelation(student),
        fatherName: student.familyInfo?.fatherName || '',
        motherName: student.familyInfo?.motherName || '',
        parentSurname: student.familyInfo?.fatherName?.trim().split(' ').pop() || '',
        applicantSurname: student.personalInfo?.lastName || '',
      }));
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  // 2. Word Document Generator Logic
  const generateWordDoc = () => {
    const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
    <meta charset="utf-8">
    <style>
      @page {
          margin: 0.5in;
      }
      body {
        font-family: 'Times New Roman', serif;
        font-size: 11pt;
        line-height: 1.4;
        text-align: justify;
      }
      
      /* LAYOUT SPACERS */
      .header-space { height: 15pt; } 
      .footer-space { height: 15pt; }

      .title {
        text-align: center;
        font-size: 14pt;
        font-weight: bold;
        text-decoration: underline;
        margin-top: 10pt;
      }

      .subtitle {
        text-align: center;
        font-size: 12pt;
        font-weight: bold;
        text-decoration: underline;
        margin-top: 5pt;
        margin-bottom: 20pt;
      }

      p {
        margin-bottom: 8pt;
      }

      .signature-block {
        margin-top: 40pt;
        text-align: right;
        font-size: 11pt;
      }
    </style>
    </head>
    
    <body>
    
      ${formData.includeHeader ? `
      <!-- Header with Logo and Municipality Details - Red Theme -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 5pt;">
        <tr>
          <td style="width: 80px; vertical-align: top;">
            <img src="${window.location.origin}/nepal_coat_of_arms.png" alt="Logo" style="width: 70px; height: auto;" />
          </td>
          <td style="text-align: center; vertical-align: middle;">
            <div style="font-size: 18pt; font-weight: bold; color: #dc2626;">${formData.headerTitle}</div>
            <div style="font-size: 14pt; font-weight: bold; color: #dc2626;">${formData.headerSubtitle}</div>
            <div style="font-size: 10pt; font-weight: bold; color: #dc2626;">${formData.headerAddress}</div>
          </td>
          <td style="width: 80px;"></td>
        </tr>
      </table>
      ` : `<div class="header-space"></div>`}

      <table style="width: 100%; color: #dc2626; font-weight: bold; font-size: 11pt; margin-bottom: 20pt; border-bottom: 2pt solid #dc2626;">
        <tr>
          <td style="text-align: left; padding-bottom: 5pt;">
            <div>Ref. No.: ${formData.refNo}</div>
            <div>Dis. No.: ${formData.disNo}</div>
          </td>
          <td style="text-align: right; vertical-align: bottom; padding-bottom: 5pt;">
            Date: ${formData.date}
          </td>
        </tr>
      </table>

      <!-- CERTIFICATE TITLES -->
      <div class="title">SURNAME VERIFICATION CERTIFICATE</div>
      <div class="subtitle">To Whom It May Concern</div>

      <!-- BODY -->
      <p>
        This is to certify that <strong>${formData.applicantName}</strong> ${formData.relation} 
        <strong>Mr. ${formData.fatherName}</strong> and 
        <strong>Mrs. ${formData.motherName}</strong>, despite the use of 
        <strong>"${formData.parentSurname}"</strong> as the parent's surname.
        <strong>"${formData.applicantSurname}"</strong> is the Applicant's surname.
        <strong>"${formData.parentSurname}"</strong> & <strong>"${formData.applicantSurname}"</strong>
        belong to the same family name and both are the same surname. This difference is due to personal 
        or cultural naming preferences and should not be considered a discrepancy in official relationships.
      </p>

      <!-- SIGNATURE -->
      <div class="signature-block">
        <div>......................................</div>
        <strong>${formData.signatoryName}</strong><br>
        ${formData.signatoryDesignation}
      </div>

      ${formData.includeFooter ? `
      <div style="position: fixed; bottom: 0; left: 0; right: 0; text-align: center; padding: 5pt 0; border-top: 2pt solid #dc2626; background: white;">
        <span style="font-size: 9pt; color: #dc2626; font-weight: bold;">E-mail: ${formData.footerEmail}</span>
      </div>
      ` : `<div class="footer-space"></div>`}

    </body>
    </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Surname_Verification_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Print Styles - Same as DOB/Relationship/Occupation modals */}
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
        `}
      </style>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gray-50">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-green-600" size={20} /> Surname Verification Generator
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
              <div className="bg-gray-200 p-4 sm:p-8 flex justify-center overflow-auto h-[400px] sm:h-[500px] lg:h-[700px] rounded-b-lg">
                <div
                  id="printable-certificate"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  spellCheck={false}
                  className="bg-white shadow-2xl p-[0.5in] sm:p-[1in] w-full sm:w-[210mm] min-h-[297mm] font-serif text-[10pt] sm:text-[12pt] leading-[1.6] text-justify relative outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >

                  {/* Conditional Header - Red Theme with Logo */}
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

                      <div className="border-b-2 border-red-600 mb-6"></div>
                    </>
                  )}

                  <div className="text-center font-bold underline text-[16px]">
                    SURNAME VERIFICATION CERTIFICATE
                  </div>

                  <div className="text-center font-bold underline text-[14px] mt-1 mb-6">
                    To Whom It May Concern
                  </div>

                  <p>
                    This is to certify that <strong>{formData.applicantName}</strong> {formData.relation}
                    <strong> Mr. {formData.fatherName}</strong> and <strong>Mrs. {formData.motherName}</strong>, despite the use of
                    <strong> "{formData.parentSurname}"</strong> as the parent's surname.
                    <strong> "{formData.applicantSurname}"</strong> is the Applicant's surname.
                    <strong> "{formData.parentSurname}"</strong> & <strong>"{formData.applicantSurname}"</strong>
                    belong to the same family name and both are the same surname. This difference is due to personal
                    or cultural naming preferences and should not be considered a discrepancy in official relationships.
                  </p>

                  {/* SIGNATURE */}
                                    <div className="mt-16 text-right">
                    <div>......................................</div>
                    <div className="font-bold">{formData.signatoryName}</div>
                    <div>{formData.signatoryDesignation}</div>
                  </div>

                  {/* Conditional Footer - Red Theme */}
                  {formData.includeFooter && (
                    <div className="absolute bottom-4 left-0 right-0 text-center pt-2 border-t-2 border-red-600 mx-8">
                      <span className="text-[10px] font-bold text-red-600">E-mail: {formData.footerEmail}</span>
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
                        max="120"
                        value={formData.logoSize}
                        onChange={(e) => setFormData({ ...formData, logoSize: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs font-bold text-blue-600 w-10">{formData.logoSize}px</span>
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
                          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                          <input name="headerAddress" value={formData.headerAddress} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VERIFICATION DETAILS CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant Details</h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Applicant Name</label>
                    <input name="applicantName" value={formData.applicantName} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Father's Name</label>
                      <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mother's Name</label>
                      <input name="motherName" value={formData.motherName} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
                    </div>
                  </div>
                </div>

                {/* SURNAME LOGIC CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Surname Logic</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Parent's Surname (Conflict)</label>
                      <input name="parentSurname" value={formData.parentSurname} onChange={handleChange} className="w-full border-yellow-200 bg-yellow-50/50 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-yellow-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Applicant's Surname</label>
                      <input name="applicantSurname" value={formData.applicantSurname} onChange={handleChange} className="w-full border-green-200 bg-green-50/50 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-green-500/20 transition-all" />
                    </div>
                  </div>
                </div>

                {/* SIGNATORY CARD */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <UserPen size={14} /> Signatory
                  </h4>
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