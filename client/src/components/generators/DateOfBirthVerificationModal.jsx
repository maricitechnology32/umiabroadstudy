import { Download, FileText, Printer, UserPen, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getFormattedDate, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

export default function DateOfBirthVerificationModal({
  isOpen,
  onClose,
  student,
}) {
  if (!isOpen || !student) return null;

  const getRelation = (s) => {
    const gender = s?.personalInfo?.gender;
    const title = s?.personalInfo?.title;
    if (gender === "Male" || title === "Mr.") return "son of";
    if (gender === "Female" || title === "Ms." || title === "Mrs.")
      return "daughter of";
    return "son/daughter of";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // 1. Initial State
  const [logoBase64, setLogoBase64] = useState("");

  useEffect(() => {
    // Convert logo to Base64 for embedding in the Word doc
    const fetchImage = async () => {
      try {
        const response = await fetch('/nepal_coat_of_arms.png');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Failed to load logo", e);
      }
    };
    fetchImage();
  }, []);

  const [formData, setFormData] = useState({
    // Document options
    includeHeader: true,
    includeFooter: true,
    logoSize: 136, // Logo size in pixels (1.42 inch approx)

    // Header info
    headerTitle: 'Machhapuchhre Rural Municipality',
    headerSubtitle: '4 No. Ward Office',
    headerAddress1: 'Lahachok, Kaski',
    headerAddress2: 'Gandaki Province, Nepal',

    // Reference & Date
    refNo: '2081/082',
    disNo: '101',
    issueDate: getFormattedDate(),

    // Footer info
    footerEmail: 'machhapuchhrereward4@gmail.com',

    applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
    relation: getRelation(student),
    fatherName: student.familyInfo?.fatherName || '',
    motherName: student.familyInfo?.motherName || '',

    addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

    dobBS: student.personalInfo?.dobBS || "",
    dobAD: formatDate(student.personalInfo?.dobAD),

    signatoryName: "Lob Bahadur Shahi",
    signatoryDesignation: "Ward Chairperson",
  });

  useEffect(() => {
    if (student) {
      setFormData((prev) => ({
        ...prev,
        // DYNAMIC HEADER FROM STUDENT PROFILE
        headerTitle: student.address?.municipality || 'Machhapuchhre Rural Municipality',
        headerSubtitle: student.address?.wardNo ? `${student.address.wardNo} No. Ward Office` : '4 No. Ward Office',
        headerAddress1: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}`,
        headerAddress2: `${student.address?.province || ''}, Nepal`,

        applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        relation: getRelation(student),
        fatherName: student.familyInfo?.fatherName || '',
        motherName: student.familyInfo?.motherName || '',
        addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,
        dobBS: student.personalInfo?.dobBS || "",
        dobAD: formatDate(student.personalInfo?.dobAD),
      }));
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // FINAL UPDATED GENERATOR WITH PERFECT FONT + SPACING
  const handlePrint = () => {
    window.print();
  };

  const generateWordDoc = () => {
    const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          margin: 0.5in; /* Compressed margin */
        }

        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt; /* Slightly smaller font */
          line-height: 1.4; /* Tighter line height */
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
          margin-top: 5pt;
          margin-bottom: 5pt;
        }

        .subtitle {
          text-align: center;
          font-size: 12pt;
          font-weight: bold;
          text-decoration: underline;
          margin-top: 5pt;
          margin-bottom: 15pt;
        }

        p {
          margin: 0;
          padding: 0;
          margin-bottom: 8pt;
        }

        .signature-block {
          text-align: right;
          margin-top: 40pt;
          font-size: 11pt;
        }
      </style>
    </head>

    <body>

      ${formData.includeHeader ? `
      <table style="width: 100%; margin-bottom: 3pt;">
        <tr>
          <td style="width: 20%; vertical-align: top; padding-left: 3pt;">
             <img src="${logoBase64}" width="90" height="auto" />
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

      <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 10pt; margin-bottom: 8pt; border-bottom: 1.5pt solid #DC2626; padding-bottom: 3pt;">
        <tr>
            <td style="text-align: left;">
                <div><span style="color: #DC2626;">Ref. No.:</span> <span style="color: black;">${formData.refNo}</span></div>
                <div><span style="color: #DC2626;">Dis. No.:</span> <span style="color: black;">${formData.disNo}</span></div>
            </td>
            <td style="text-align: right; vertical-align: bottom;">
                <span style="color: #DC2626;">Date:</span> <span style="color: black;">${addSuperscriptToDateString(formData.issueDate)}</span>
            </td>
        </tr>
      </table>
      <div style="border-bottom: 3px solid #DC2626; margin-left: -0.5in; margin-right: -0.5in; margin-top: 5pt; margin-bottom: 15pt;"></div>

      ` : `<div class="header-space"></div>`}

      <div class="title" style="text-decoration: underline; text-transform: none;">Date of Birth Verification Certificate</div>
      <div class="subtitle" style="text-decoration: underline;">To Whom It May Concern</div>

      <p style="text-align: justify; line-height: 1.5;">
        This is to certify that <strong>${formData.applicantName}</strong>
        ${formData.relation}
        <strong>Mr. ${formData.fatherName}</strong> and
        <strong>Mrs. ${formData.motherName}</strong>, the permanent resident of
        <strong>${formData.addressLine}</strong>, was born on
        <strong>B.S. ${formData.dobBS} (${formData.dobAD} A.D.)</strong>.
      </p>

      <p style="text-align: justify; line-height: 1.5;">
        This birth verification certificate is issued in accordance with the
        Local Government Operation Act B.S. 2074 (2017 A.D.) Chapter 3,
        Section 12, Sub-section 2, Clause E (7).
      </p>

      <div class="signature-block">
        <div style="margin-bottom: 5pt;".....................................

</div>
        <strong>${formData.signatoryName}</strong><br>
        <strong>${formData.signatoryDesignation}</strong>
      </div>

      ${formData.includeFooter ? `
      <div style="position: fixed; bottom: 0; left: 0; right: 0; margin-left: -0.5in; margin-right: -0.5in; padding: 5pt 0.5in; border-top: 3px solid #DC2626; background: white;">
        <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 9pt;">
          <tr>
            <td style="text-align: left;">Phone No.: +977-9856017304</td>
            <td style="text-align: right;">E-mail: ${formData.footerEmail}</td>
          </tr>
        </table>
      </div>
      ` : `<div class="footer-space"></div>`}

    </body>
    </html>
    `;

    const blob = new Blob(["\ufeff", content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `DOB_Verification_${formData.applicantName}.doc`.replace(
      /\s+/g,
      "_"
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
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
                    height: 296mm; /* Strictly force single page height */
                    margin: 0;
                    padding: 15mm !important; /* Reduced padding to fit more content safely */
                    background: white;
                    z-index: 9999;
                    overflow: hidden !important; /* Prevent 2nd page spillover */
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

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gradient-to-r from-red-50 to-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-red-600" size={18} /> DOB Verification Generator
          </h3>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handlePrint} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition">
              <Printer size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Print / Save PDF</span><span className="sm:hidden">Print</span>
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition">
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-3 sm:p-6 overflow-y-auto">

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">

            {/* LIVE PREVIEW (Now on LEFT, 2/3 width) */}
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
                <button
                  onClick={() => document.execCommand('bold')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 font-bold text-sm border border-gray-200"
                  title="Bold (Ctrl+B)"
                >B</button>
                <button
                  onClick={() => document.execCommand('italic')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 italic text-sm border border-gray-200"
                  title="Italic (Ctrl+I)"
                >I</button>
                <button
                  onClick={() => document.execCommand('underline')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 underline text-sm border border-gray-200"
                  title="Underline (Ctrl+U)"
                >U</button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Alignment */}
                <button
                  onClick={() => document.execCommand('justifyLeft')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Align Left"
                >⬅</button>
                <button
                  onClick={() => document.execCommand('justifyCenter')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Align Center"
                >⬌</button>
                <button
                  onClick={() => document.execCommand('justifyRight')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Align Right"
                >➡</button>
                <button
                  onClick={() => document.execCommand('justifyFull')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Justify"
                >☰</button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Lists */}
                <button
                  onClick={() => document.execCommand('insertUnorderedList')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Bullet List"
                >•</button>
                <button
                  onClick={() => document.execCommand('insertOrderedList')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Numbered List"
                >1.</button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Indent */}
                <button
                  onClick={() => document.execCommand('outdent')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-xs border border-gray-200"
                  title="Decrease Indent"
                >⇤</button>
                <button
                  onClick={() => document.execCommand('indent')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-xs border border-gray-200"
                  title="Increase Indent"
                >⇥</button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Undo/Redo */}
                <button
                  onClick={() => document.execCommand('undo')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Undo (Ctrl+Z)"
                >↩</button>
                <button
                  onClick={() => document.execCommand('redo')}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border border-gray-200"
                  title="Redo (Ctrl+Y)"
                >↪</button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Clear Formatting */}
                <button
                  onClick={() => document.execCommand('removeFormat')}
                  className="px-2 h-7 flex items-center justify-center rounded hover:bg-red-50 text-xs border border-gray-200 text-red-600"
                  title="Clear Formatting"
                >Clear</button>
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

                  {/* Conditional Header */}
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
                        <div className="w-32"></div> {/* Spacer for balance */}
                      </div>

                      <div className="flex justify-between font-bold mb-1 text-red-600 relative z-10" style={{ fontSize: '16pt', lineHeight: '1.1' }}>
                        <div>
                          <div style={{ marginBottom: '2px' }}>Ref. No.: <span className="text-black">{formData.refNo}</span></div>
                          <div>Dis. No.: <span className="text-black">{formData.disNo}</span></div>
                        </div>
                        <div className="self-end">
                          Date: <span className="text-black">{(() => {
                            const d = parseDateParts(formData.issueDate);
                            return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year}</>;
                          })()}</span>
                        </div>
                      </div>

                      {/* Full Width Red Line - Spans edge to edge */}
                      <div className="border-b-[3px] border-red-600 mb-2 -mx-[0.5in] sm:-mx-[1in] mt-1"></div>
                    </>
                  )}

                  <div className="text-center font-bold underline mb-1" style={{ fontSize: '16pt' }}>
                    Date of Birth Verification Certificate
                  </div>

                  <div className="text-center font-bold underline mb-6" style={{ fontSize: '16pt' }}>
                    To Whom It May Concern
                  </div>

                  <p className="mb-4 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                    This is to certify that <strong>{formData.applicantName}</strong>{" "}
                    {formData.relation} <strong>Mr. {formData.fatherName}</strong>{" "}
                    and <strong>Mrs. {formData.motherName}</strong>, permanent resident of{" "}
                    <strong>{formData.addressLine}</strong>, was born on{" "}
                    <strong>
                      B.S. {formData.dobBS} ({formData.dobAD} A.D.)
                    </strong>
                    .
                  </p>

                  <p className="text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                    This birth verification certificate is issued in accordance with the
                    Local Government Operation Act B.S. 2074 (2017 A.D.) Chapter 3,
                    Section 12, Sub-section 2, Clause E (7).
                  </p>

                  <div className="mt-16 text-right" style={{ fontSize: '12pt' }}>
                    <div className="mb-2 font-bold">.................................</div>
                    <div className="font-bold">{formData.signatoryName}</div>
                    <div className="font-bold">{formData.signatoryDesignation}</div>
                  </div>

                  {/* Conditional Footer */}
                  {formData.includeFooter && (
                    <div className="absolute bottom-4 left-0 right-0 pt-2 border-t-[3px] border-red-600 px-[0.5in] sm:px-[1in] flex justify-between items-center bg-white">
                      <span className="font-bold text-red-600" style={{ fontSize: '14pt' }}>Phone No.: +977-9856017304</span>
                      <span className="font-bold text-red-600" style={{ fontSize: '14pt' }}>E-mail: {formData.footerEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* EDITABLE FIELDS (Now on RIGHT) */}
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
                      <input name="issueDate" value={formData.issueDate} onChange={handleChange}
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

                {/* FOOTER EMAIL */}
                {formData.includeFooter && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Footer Email</label>
                    <input name="footerEmail" value={formData.footerEmail} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="email@example.com" />
                  </div>
                )}

              </div>

              {/* VERIFICATION DETAILS CARD */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Data</h4>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Permanent Address</label>
                  <input name="addressLine" value={formData.addressLine} onChange={handleChange}
                    className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Date of Birth (B.S.)</label>
                    <input name="dobBS" value={formData.dobBS} onChange={handleChange}
                      className="w-full border-green-200 bg-green-50/50 rounded-lg px-3 py-2 text-sm font-bold text-green-700 focus:ring-2 focus:ring-green-500/20 transition-all" placeholder="2056/10/03" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Date of Birth (A.D.)</label>
                    <input name="dobAD" value={formData.dobAD} onChange={handleChange}
                      className="w-full border-green-200 bg-green-50/50 rounded-lg px-3 py-2 text-sm font-bold text-green-700 focus:ring-2 focus:ring-green-500/20 transition-all" placeholder="17 January 2000" />
                  </div>
                </div>
              </div>

              {/* SIGNATORY CARD */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <UserPen size={14} /> Signatory
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                    <input name="signatoryName" value={formData.signatoryName} onChange={handleChange}
                      className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Designation</label>
                    <input name="signatoryDesignation" value={formData.signatoryDesignation} onChange={handleChange}
                      className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition order-last sm:order-first"
          >
            Cancel
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 transition"
          >
            <Printer size={16} /> Print / Save PDF
          </button>

          <button
            onClick={generateWordDoc}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 transition"
          >
            <Download size={16} /> Download .DOC
          </button>
        </div>
      </div>
    </div>
  );
}
