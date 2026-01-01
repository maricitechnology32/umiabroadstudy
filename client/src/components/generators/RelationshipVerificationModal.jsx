import { Download, FileText, Plus, Printer, Trash2, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RelationshipVerificationModal({ isOpen, onClose, student }) {
    if (!isOpen || !student) return null;

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
        logoSize: 80, // Logo size in pixels (adjustable)

        // Header info
        headerTitle: 'Machhapuchhre Rural Municipality',
        headerSubtitle: '4 No. Ward Office',
        headerAddress: 'Lahachok, Kaski, Gandaki Province, Nepal',

        // Ref & Date
        refNo: '2081/082',
        disNo: '101',
        issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

        // Footer info
        footerEmail: 'machhapuchhrenreward4@gmail.com',

        applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

        signatoryName: 'Lob Bahadur Shahi',
        signatoryDesignation: 'Ward Chairperson',
        signatoryPhone: '+977-9856017304',

        // Dynamic Relatives List
        relatives: []
    });

    // State to track which relative type is selected for the first row
    const [primaryRelativeType, setPrimaryRelativeType] = useState('father');

    // Optimized 'Add Relative' Logic (Additive)
    const addRelativeByType = (type) => {
        const applicantFullName = `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`;

        let newRelative = null;

        if (type === 'father') {
            newRelative = {
                name: `Mr. ${student.familyInfo?.fatherName || ''}`,
                relation: "Applicant's Father",
                photoUrl: ''
            };
        } else if (type === 'mother') {
            newRelative = {
                name: `Mrs. ${student.familyInfo?.motherName || ''}`,
                relation: "Applicant's Mother",
                photoUrl: ''
            };
        } else if (type === 'spouse') {
            newRelative = {
                name: `Mrs./Mr. ${student.familyInfo?.spouseName || ''}`,
                relation: "Applicant's Spouse",
                photoUrl: ''
            };
        } else if (type === 'grandfather') {
            newRelative = {
                name: `Mr. ${student.familyInfo?.grandfatherName || ''}`,
                relation: "Applicant's Grandfather",
                photoUrl: ''
            };
        }

        if (newRelative) {
            // Check if already exists to avoid duplicates (optional, but good UX)
            const exists = formData.relatives.some(r => r.relation === newRelative.relation);
            if (!exists) {
                setFormData(prev => ({
                    ...prev,
                    relatives: [newRelative, ...prev.relatives]
                }));
            }
        }
    };

    // Toggle Relative Logic (Add/Remove)
    const toggleRelativeByType = (type) => {
        let relationLabel = "";
        if (type === 'father') relationLabel = "Applicant's Father";
        else if (type === 'mother') relationLabel = "Applicant's Mother";
        else if (type === 'spouse') relationLabel = "Applicant's Spouse";
        else if (type === 'grandfather') relationLabel = "Applicant's Grandfather";

        const existsIndex = formData.relatives.findIndex(r => r.relation === relationLabel);

        if (existsIndex !== -1) {
            const updated = formData.relatives.filter((_, i) => i !== existsIndex);
            setFormData(prev => ({ ...prev, relatives: updated }));
        } else {
            let newRelative = null;
            if (type === 'father') {
                newRelative = { name: `Mr. ${student.familyInfo?.fatherName || ''}`, relation: "Applicant's Father", photoUrl: '' };
            } else if (type === 'mother') {
                newRelative = { name: `Mrs. ${student.familyInfo?.motherName || ''}`, relation: "Applicant's Mother", photoUrl: '' };
            } else if (type === 'spouse') {
                newRelative = { name: `Mrs./Mr. ${student.familyInfo?.spouseName || ''}`, relation: "Applicant's Spouse", photoUrl: '' };
            } else if (type === 'grandfather') {
                newRelative = { name: `Mr. ${student.familyInfo?.grandfatherName || ''}`, relation: "Applicant's Grandfather", photoUrl: '' };
            }
            if (newRelative) {
                setFormData(prev => ({ ...prev, relatives: [newRelative, ...prev.relatives] }));
            }
        }
    };

    // Helper to check if type is selected
    const isSelected = (type) => {
        let relationLabel = "";
        if (type === 'father') relationLabel = "Applicant's Father";
        else if (type === 'mother') relationLabel = "Applicant's Mother";
        else if (type === 'spouse') relationLabel = "Applicant's Spouse";
        else if (type === 'grandfather') relationLabel = "Applicant's Grandfather";
        return formData.relatives.some(r => r.relation === relationLabel);
    };

    // Initialize Header and Default Relatives
    useEffect(() => {
        if (student) {
            // 1. Populate Header from Student Address
            setFormData(prev => ({
                ...prev,
                headerTitle: student.address?.municipality || 'Machhapuchhre Rural Municipality',
                headerSubtitle: student.address?.wardNo ? `${student.address.wardNo} No. Ward Office` : '4 No. Ward Office',
                headerAddress: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,

                applicantName: `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
                addressLine: `${student.address?.municipality || ''} Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''}, Nepal`,
            }));

            // 2. Initialize with Father + Applicant by default if list is empty
            if (formData.relatives.length === 0) {
                const applicantFullName = `${student.personalInfo?.title || ''} ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`;
                const initial = [
                    {
                        name: `Mr. ${student.familyInfo?.fatherName || ''}`,
                        relation: "Applicant's Father",
                        photoUrl: ''
                    },
                    {
                        name: applicantFullName,
                        relation: "Applicant",
                        photoUrl: student.personalInfo?.photoUrl || ''
                    }
                ];
                setFormData(prev => ({ ...prev, relatives: initial }));
            }
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Dynamic Relative Handlers ---
    const handleRelativeChange = (index, field, value) => {
        const updatedRelatives = [...formData.relatives];
        updatedRelatives[index][field] = value;
        setFormData({ ...formData, relatives: updatedRelatives });
    };

    const addRelative = () => {
        setFormData({
            ...formData,
            relatives: [...formData.relatives, { name: '', relation: '', photoUrl: '' }]
        });
    };

    const removeRelative = (index) => {
        const updatedRelatives = formData.relatives.filter((_, i) => i !== index);
        setFormData({ ...formData, relatives: updatedRelatives });
    };

    // 2. Word Document Generator Logic
    const generateWordDoc = () => {
        // Generate Rows HTML
        const tableRows = formData.relatives.map((rel, index) => `
        <tr>
            <td style="padding: 2pt; border: 1pt solid black; text-align: center;">${index + 1}</td>
            <td style="padding: 2pt; border: 1pt solid black;">${rel.name}</td>
            <td style="padding: 2pt; border: 1pt solid black;">${rel.relation}</td>
        </tr>
    `).join('');

        // Generate Photo Grid HTML (FOR WORD DOC)
        // We use table cells <td> to ensure they stay in one row
        const photoCells = formData.relatives.map(rel => `
        <td style="text-align: center; vertical-align: top; padding: 2pt;">
            <!-- The Empty Photo Box -->
            <div style="width: 80pt; height: 100pt; border: 1pt solid black; margin: 0 auto; display: block;"></div>
            <!-- Caption -->
            <div style="margin-top: 3pt; font-weight: bold; font-size: 9pt;">${rel.name}</div>
            <div style="font-size: 9pt;">(${rel.relation})</div>
        </td>
    `).join('');

        const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Relationship Verification</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11pt; }
          
          /* LAYOUT SPACERS */
          .header-space { height: 15pt; } 
          .footer-space { height: 15pt; }
          
          /* CONTENT STYLES */
          p { margin-bottom: 6pt; line-height: 1.2; text-align: justify; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 5pt; font-weight: bold; }
          .meta-left { text-align: left; vertical-align: top; }
          .meta-right { text-align: right; vertical-align: bottom; }
          
          .doc-title { text-align: center; font-size: 14pt; font-weight: bold; text-decoration: underline; text-transform: capitalize; margin-top: 5pt; margin-bottom: 5pt; }
          .doc-subtitle { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin-top: 5pt; margin-bottom: 10pt; }

          /* DATA TABLE */
          .data-table { width: 100%; border-collapse: collapse; margin-top: 5pt; margin-bottom: 5pt; }
          .data-table th, .data-table td { border: 1pt solid black; padding: 2pt; text-align: left; vertical-align: middle; }
          
          /* PHOTO TABLE (Ensures horizontal layout) */
          .photo-table { width: 100%; border: none; margin-top: 5pt; page-break-inside: avoid; }
          
          /* SIGNATURE BLOCK */
          .signature-table { width: 100%; margin-top: 15pt; border: none; }
          .sig-td-left { width: 60%; }
          .sig-td-right { width: 40%; text-align: right; vertical-align: bottom; }
          
          .signatory-name { font-weight: bold; font-size: 11pt; margin: 0; padding-bottom: 2pt; }
          .signatory-title { font-size: 10pt; margin: 0; }
        </style>
      </head>
      <body>
        
        ${formData.includeHeader ? `
        <table style="width: 100%; margin-bottom: 5pt;">
          <tr>
            <td style="width: 20%; vertical-align: top; padding-top: 5pt; padding-left: 5pt;">
               <img src="${logoBase64}" width="110" height="auto" />
            </td>
            <td style="width: 60%; text-align: center; padding-bottom: 5pt;">
              <div style="font-size: 16pt; font-weight: bold; color: #DC2626;">${formData.headerTitle}</div>
              <div style="font-size: 14pt; font-weight: bold; color: #DC2626;">${formData.headerSubtitle}</div>
              <div style="font-size: 12pt; font-weight: bold; color: #DC2626;">${formData.headerAddress}</div>
            </td>
            <td style="width: 20%;"></td>
          </tr>
        </table>
  
        <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 11pt; margin-bottom: 20pt; border-bottom: 2pt solid #DC2626;">
          <tr>
              <td style="text-align: left; padding-bottom: 5pt;">
                  <div>Ref. No.: ${formData.refNo}</div>
                  <div>Dis. No.: ${formData.disNo}</div>
              </td>
              <td style="text-align: right; vertical-align: bottom; padding-bottom: 5pt;">
                  Date: ${formData.issueDate}
              </td>
          </tr>
        </table>
        ` : `<div class="header-space"></div>`}

        <div class="doc-title">Relationship Verification Certificate</div>
        <div class="doc-subtitle">To Whom It May Concern</div>

        <p>
          This is to certify that <strong>${formData.applicantName}</strong> a permanent resident of 
          <strong>${formData.addressLine}</strong> has the following relationship with the following family members.
        </p>
        <p>
          This relationship verification certificate is issued in accordance with the Local Government Operation Act 
          B.S. 2074 (2017 A.D.) Chapter 3, Section 12, Sub-section 2, Clause E (1).
        </p>

        <!-- RELATIONSHIP TABLE -->
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 50px; text-align: center;">S.N.</th>
                    <th>Name</th>
                    <th>Relationship</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <p>The photographs of the persons mentioned above are attached below.</p>

        <!-- PHOTO GRID (TABLE LAYOUT FOR WORD) -->
        <table class="photo-table">
            <tr>
                ${photoCells}
            </tr>
        </table>

                        <!-- SIGNATURE BLOCK -->
        <table class="signature-table">
            <tr>
                <td class="sig-td-left"></td>
                <td class="sig-td-right">
                    <div style="height: 15pt;">&nbsp;</div>
                    <div style="text-align: right;">......................................</div>
                    <p class="signatory-name">${formData.signatoryName}</p>
                    <p class="signatory-title">${formData.signatoryDesignation}</p>
                </td>
            </tr>
        </table>

        ${formData.includeFooter ? `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; text-align: center; padding: 5pt 0; border-top: 2pt solid #DC2626; background: #f8fafc;">
          <span style="font-size: 9pt; color: #DC2626; font-weight: bold;">E-mail: ${formData.footerEmail}</span>
        </div>
        ` : `<div class="footer-space"></div>`}

      </body>
      </html>
    `;

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Relationship_Verification_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        `}
            </style>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

                {/* Header */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gray-50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-green-600" size={18} /> Relationship Verification Generator
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
                            <div className="bg-gray-200 p-4 sm:p-8 flex justify-center overflow-auto h-[400px] sm:h-[500px] lg:h-[700px] rounded-b-lg">
                                <div
                                    id="printable-certificate"
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    spellCheck={false}
                                    className="bg-white shadow-2xl p-[0.5in] sm:p-[1in] w-full sm:w-[210mm] min-h-[297mm] font-serif text-[10pt] sm:text-[12pt] leading-[1.6] text-justify relative outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    style={{ fontFamily: "Times New Roman, serif" }}
                                >

                                    {/* Conditional Header */}
                                    {formData.includeHeader && (
                                        <>
                                            <div className="flex items-center justify-between pb-2 mb-1">
                                                <div className="w-32">
                                                    <img src="/nepal_coat_of_arms.png" alt="Logo" style={{ width: `${formData.logoSize}px`, height: 'auto' }} />
                                                </div>
                                                <div className="text-center flex-1">
                                                    <div className="text-xl font-bold text-red-600">{formData.headerTitle}</div>
                                                    <div className="text-lg font-bold text-red-600">{formData.headerSubtitle}</div>
                                                    <div className="text-sm font-bold text-red-600">{formData.headerAddress}</div>
                                                </div>
                                                <div className="w-32"></div> {/* Spacer for balance */}
                                            </div>

                                            <div className="flex justify-between text-xs font-bold text-red-600 mb-1">
                                                <div>
                                                    <div>Ref. No.: {formData.refNo}</div>
                                                    <div>Dis. No.: {formData.disNo}</div>
                                                </div>
                                                <div className="self-end">
                                                    Date: {formData.issueDate}
                                                </div>
                                            </div>

                                            <div className="border-b-2 border-red-600 mb-6"></div>
                                        </>
                                    )}

                                    <div className="text-center font-bold underline text-[16px]">
                                        RELATIONSHIP VERIFICATION CERTIFICATE
                                    </div>

                                    <div className="text-center font-bold underline text-[14px] mt-1 mb-6">
                                        To Whom It May Concern
                                    </div>

                                    <p className="mb-4">
                                        This is to certify that <strong>{formData.applicantName}</strong> a permanent resident of
                                        <strong> {formData.addressLine}</strong> has the following relationship with the following family members.
                                    </p>
                                    <p className="mt-2 mb-4">
                                        This relationship verification certificate is issued in accordance with the
                                        Local Government Operation Act B.S. 2074 (2017 A.D.) Chapter 3,
                                        Section 12, Sub-section 2, Clause E (1).
                                    </p>

                                    {/* TABLE PREVIEW - Compressed */}
                                    <table className="w-full border-collapse border border-black mb-3 text-left text-[11pt]">
                                        <thead>
                                            <tr className="">
                                                <th className="border border-black px-1 py-0.5 text-center w-8">S.N.</th>
                                                <th className="border border-black px-2 py-0.5">Name</th>
                                                <th className="border border-black px-2 py-0.5">Relationship</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.relatives.map((rel, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                                                    <td className="border border-black px-2 py-0.5 font-bold">{rel.name}</td>
                                                    <td className="border border-black px-2 py-0.5">{rel.relation}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <p className="mb-3">The photographs of the persons mentioned above are attached below.</p>

                                    {/* PHOTO PLACEHOLDER GRID - Empty boxes for pasting physical photos */}
                                    <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center">
                                        {formData.relatives.map((rel, idx) => (
                                            <div key={idx} className="text-center w-24">
                                                {/* Empty placeholder box with dashed border */}
                                                <div className="h-28 w-20 mx-auto border-2 border-dashed border-gray-400 bg-white mb-1 flex items-center justify-center">
                                                    <span className="text-[8pt] text-gray-300">Photo</span>
                                                </div>
                                                <p className="font-bold leading-tight text-[9pt]">{rel.name}</p>
                                                <p className="text-[8pt] text-gray-500">({rel.relation})</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-16 text-right">
                                        <div>......................................</div>
                                        <div className="font-bold">{formData.signatoryName}</div>
                                        <div>{formData.signatoryDesignation}</div>
                                    </div>

                                    {/* Conditional Footer */}
                                    {formData.includeFooter && (
                                        <div className="absolute bottom-4 left-0 right-0 text-center pt-2 border-t-2 border-red-600 mx-8">
                                            <span className="text-[10px] font-bold text-red-600">E-mail: {formData.footerEmail}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: EDITABLE FIELDS */}
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
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                                                    <input name="headerAddress" value={formData.headerAddress} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all" />
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

                                {/* PRIMARY GUARDIAN */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <Users size={14} /> Quick Add Relatives
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {['father', 'mother', 'spouse', 'grandfather'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => toggleRelativeByType(type)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1 border
                                                ${isSelected(type)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                                            >
                                                <Plus size={12} className={isSelected(type) ? 'rotate-45 transition-transform' : 'transition-transform'} />
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Permanent Address</label>
                                        <input name="addressLine" value={formData.addressLine} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm transition-all" />
                                    </div>
                                </div>


                                {/* MEMBERS TABLE */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Members</h4>
                                        <button onClick={addRelative} className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1 transition-all">
                                            <Plus size={12} /> Add Row
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.relatives.map((rel, idx) => (
                                            <div key={idx} className="flex gap-2 items-start bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm relative group">
                                                <div className="w-6 pt-2 text-center text-xs font-bold text-gray-400">{idx + 1}</div>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Name</label>
                                                        <input
                                                            value={rel.name}
                                                            onChange={(e) => handleRelativeChange(idx, 'name', e.target.value)}
                                                            className="w-full border-gray-200 rounded p-1.5 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 uppercase font-bold">Relationship</label>
                                                        <input
                                                            value={rel.relation}
                                                            onChange={(e) => handleRelativeChange(idx, 'relation', e.target.value)}
                                                            className="w-full border-gray-200 rounded p-1.5 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <button onClick={() => removeRelative(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SIGNATORY CARD */}
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <FileText size={14} /> Signatory
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                                            <input name="signatoryName" value={formData.signatoryName} onChange={handleChange}
                                                className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Designation</label>
                                            <input name="signatoryDesignation" value={formData.signatoryDesignation} onChange={handleChange}
                                                className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                                            <input name="signatoryPhone" value={formData.signatoryPhone} onChange={handleChange}
                                                className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700" />
                                        </div>
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
                        <Download size={16} /> Download .DOC Word File
                    </button>
                </div>

            </div>
        </div>
    );
}