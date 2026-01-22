import { Download, FileText, Printer, UserPen, X, Plus, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, RemoveFormatting } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFormattedDate, getOrdinalSuffix, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

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
    logoSize: 136, // Logo size in pixels (adjustable)

    // Header info
    headerTitle: 'Bheemdatta Municipality',
    headerSubtitle: '10 No. Ward Office',
    headerAddress1: 'Jinmawala Khanpur, Sudurpaschim',
    headerAddress2: 'Nepal',

    // Footer info
    footerEmail: 'bhi.na.pa.10jimuwa@gmail.com',
    footerPhone: '+977-9856017304',

    refNo: '2082/083',
    disNo: '404',
    date: getFormattedDate(),

    // Body Variables
    applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
    relation: getRelation(student),
    fatherName: student.familyInfo?.fatherName || '',
    motherName: student.familyInfo?.motherName || '',

    // Smart Surname Detection
    fatherSurname: student.familyInfo?.fatherName?.trim().split(' ').pop() || '',
    motherSurname: student.familyInfo?.motherName?.trim().split(' ').pop() || '',
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
        headerAddress1: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}`,
        headerAddress2: `${student.address?.province || ''}, Nepal`,

        applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        relation: getRelation(student),
        fatherName: student.familyInfo?.fatherName || '',
        motherName: student.familyInfo?.motherName || '',
        fatherSurname: student.familyInfo?.fatherName?.trim().split(' ').pop() || '',
        motherSurname: student.familyInfo?.motherName?.trim().split(' ').pop() || '',
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

  // Word Document Generator - Matches PDF exactly
  const generateWordDoc = () => {
    const content = `
     <!DOCTYPE html>
     <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
     <head>
         <meta charset="utf-8">
         <title>Surname Verification Certificate</title>
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
                 font-size: 24pt;
                 font-weight: bold;
                 color: #DC2626;
                 line-height: 1;
                 margin-bottom: 3pt;
                 text-align: center;
                 font-family: 'Times New Roman', serif;
             }
             
             .ward-office {
                 font-size: 18pt;
                 font-weight: bold;
                 color: #DC2626;
                 line-height: 1;
                 margin-bottom: 3pt;
                 text-align: center;
                 font-family: 'Times New Roman', serif;
             }
             
             .address-line {
                 font-size: 16pt;
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
         
         <!-- Reference and Date -->
         <div class="ref-date-row">
             <div style="text-align: left;">
                 <span class="text-red">Ref. No.:</span> 
                 <span class="text-black">${formData.refNo}</span><br>
                 <span class="text-red">Dis. No.:</span> 
                 <span class="text-black">${formData.disNo}</span>
             </div>
             <div style="text-align: right;">
                 <span class="text-red">Date:</span> 
                 <span class="text-black">${addSuperscriptToDateString(formData.date)}</span>
             </div>
         </div>
         
         <!-- Red Line -->
         <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 4pt; margin-bottom: 12pt; mso-margin-top-alt: 4pt; margin-bottom: 12pt;">&nbsp;</p>
     </div>
     ` : ''}
     
     <!-- MAIN CONTENT -->
     <div class="main-title">Surname Verification Certificate</div>
     <div class="sub-title">To Whom It May Concern</div>
     
     ${formData.fatherSurname.toLowerCase() !== formData.motherSurname.toLowerCase() ? `
     <p class="content-text">
         This is to certify that <strong>${formData.applicantName}</strong> ${formData.relation} 
         <strong>Mr. ${formData.fatherName}</strong> and 
         <strong>Mrs. ${formData.motherName}</strong>. The father uses the surname 
         <strong>"${formData.fatherSurname}"</strong> and the mother uses the surname 
         <strong>"${formData.motherSurname}"</strong>, while the applicant uses 
         <strong>"${formData.applicantSurname}"</strong> as surname.
         Despite these variations, <strong>"${formData.fatherSurname}"</strong>, <strong>"${formData.motherSurname}"</strong> &amp; <strong>"${formData.applicantSurname}"</strong>
         belong to the same family and these differences are due to personal 
         or cultural naming preferences. This should not be considered a discrepancy in official relationships.
     </p>
     ` : `
     <p class="content-text">
         This is to certify that <strong>${formData.applicantName}</strong> ${formData.relation} 
         <strong>Mr. ${formData.fatherName}</strong> and 
         <strong>Mrs. ${formData.motherName}</strong>, despite the use of 
         <strong>"${formData.fatherSurname}"</strong> as the parents' surname.
         <strong>"${formData.applicantSurname}"</strong> is the Applicant's surname.
         <strong>"${formData.fatherSurname}"</strong> &amp; <strong>"${formData.applicantSurname}"</strong>
         belong to the same family name and both are the same surname. This difference is due to personal 
         or cultural naming preferences and should not be considered a discrepancy in official relationships.
     </p>
     `}
     
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
                     <td width="50%" align="left">
                         <p style="margin: 0; line-height: 1.0;">
                             <span style="font-size: 9.0pt; font-family: 'Times New Roman',serif; color: #DC2626; font-weight: bold;">Phone No.: ${formData.footerPhone || '+977-9856017304'}</span>
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

    // Create and download the Word document
    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Surname_Verification_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
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

                      {/* Full Width Red Line */}
                      <div className="border-b-[3px] border-red-600 mb-2 -mx-[0.5in] sm:-mx-[1in] mt-1"></div>
                    </>
                  )}

                  <div className="text-center font-bold underline mb-1" style={{ fontSize: '16pt' }}>
                    Surname Verification Certificate
                  </div>

                  <div className="text-center font-bold underline mb-6" style={{ fontSize: '16pt' }}>
                    To Whom It May Concern
                  </div>

                  {formData.fatherSurname.toLowerCase() !== formData.motherSurname.toLowerCase() ? (
                    <p className="text-justify leading-relaxed mb-4" style={{ fontSize: '12pt' }}>
                      This is to certify that <strong>{formData.applicantName}</strong> {formData.relation}
                      <strong> Mr. {formData.fatherName}</strong> and <strong>Mrs. {formData.motherName}</strong>. The father uses the surname
                      <strong> "{formData.fatherSurname}"</strong> and the mother uses the surname
                      <strong> "{formData.motherSurname}"</strong>, while the applicant uses
                      <strong> "{formData.applicantSurname}"</strong> as surname.
                      Despite these variations, <strong>"{formData.fatherSurname}"</strong>, <strong>"{formData.motherSurname}"</strong> & <strong>"{formData.applicantSurname}"</strong>
                      belong to the same family and these differences are due to personal
                      or cultural naming preferences. This should not be considered a discrepancy in official relationships.
                    </p>
                  ) : (
                    <p className="text-justify leading-relaxed mb-4" style={{ fontSize: '12pt' }}>
                      This is to certify that <strong>{formData.applicantName}</strong> {formData.relation}
                      <strong> Mr. {formData.fatherName}</strong> and <strong>Mrs. {formData.motherName}</strong>, despite the use of
                      <strong> "{formData.fatherSurname}"</strong> as the parents' surname.
                      <strong> "{formData.applicantSurname}"</strong> is the Applicant's surname.
                      <strong> "{formData.fatherSurname}"</strong> & <strong>"{formData.applicantSurname}"</strong>
                      belong to the same family name and both are the same surname. This difference is due to personal
                      or cultural naming preferences and should not be considered a discrepancy in official relationships.
                    </p>
                  )}

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
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Father's Surname</label>
                      <input name="fatherSurname" value={formData.fatherSurname} onChange={handleChange} className="w-full border-yellow-200 bg-yellow-50/50 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-yellow-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mother's Surname</label>
                      <input name="motherSurname" value={formData.motherSurname} onChange={handleChange} className="w-full border-purple-200 bg-purple-50/50 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 transition-all" />
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
