import { Download, FileText, Plus, Printer, Trash2, Users, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, IndentIncrease, IndentDecrease, Undo, Redo, RemoveFormatting } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFormattedDate, addSuperscriptToDateString, parseDateParts } from '../../utils/dateFormat';

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
        logoSize: 136, // Logo size in pixels (adjustable)

        // Header info
        // Header info
        headerTitle: 'Machhapuchhre Rural Municipality',
        headerSubtitle: '4 No. Ward Office',
        headerAddress1: 'Lahachok, Kaski',
        headerAddress2: 'Gandaki Province, Nepal',

        // Ref & Date
        refNo: '2081/082',
        disNo: '101',
        issueDate: getFormattedDate(),

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
                headerAddress1: `${student.address?.tole ? student.address.tole + ', ' : ''}${student.address?.district || ''}`,
                headerAddress2: `${student.address?.province || ''}, Nepal`,

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

    // Word Document Generator - Matches PDF exactly
    const generateWordDoc = () => {
        const tableRows = formData.relatives.map((rel, index) => `
     <tr style="height: 20pt; background-color:white;">
         <td style="border: 0.75pt solid black; padding: 1pt 2pt; text-align: center; font-size: 11pt; font-family: 'Times New Roman', serif;">${index + 1}</td>
         <td style="border: 0.75pt solid black; padding: 1pt 4pt; text-align: left; font-size: 11pt; font-family: 'Times New Roman', serif;">${rel.name}</td>
         <td style="border: 0.75pt solid black; padding: 1pt 4pt; text-align: center; font-size: 11pt; font-family: 'Times New Roman', serif;">${rel.relation}</td>
     </tr>
 `).join('');

        // Generate Photo Grid Cells
        const photoCells = formData.relatives.map(rel => `
         <td style="text-align: center; vertical-align: top; padding: 5pt 2pt; width: 33%;">
             <div style="width: 80pt; height: 90pt; border: 0.75pt solid #000; margin: 0 auto; display: block;"></div>
             <div style="margin-top: 4pt; font-weight: bold; font-size: 10pt; font-family: 'Times New Roman', serif;">${rel.name}</div>
             <div style="font-size: 9pt; font-family: 'Times New Roman', serif;">(${rel.relation})</div>
         </td>
     `);

        // Split photos into rows of 3
        const photoRows = [];
        for (let i = 0; i < photoCells.length; i += 3) {
            photoRows.push(`<tr>${photoCells.slice(i, i + 3).join('')}</tr>`);
        }

        const content = `
     <!DOCTYPE html>
     <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
     <head>
         <meta charset="utf-8">
         <title>Relationship Verification Certificate</title>
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
                 line-height: 1.15;
                 margin-bottom: 6pt;
                 font-family: 'Times New Roman', serif;
             }
             
             /* Table Styles - Match PDF */
             .income-table {
                 width: 100%;
                 border-collapse: collapse;
                 margin: 6pt 0 6pt 0;
                 font-family: 'Times New Roman', serif;
                 font-size: 11pt;
             }
             
             .income-table th {
                 border: 0.75pt solid black;
                 padding: 2pt 3pt;
                 text-align: center;
                 font-weight: bold;
                 vertical-align: middle;
                 background-color: #f8f8f8;
             }
             
             .income-table td {
                 border: 0.75pt solid black;
                 padding: 1pt 4pt;
                 vertical-align: middle;
             }
 
             .photo-table { 
                 width: 100%; 
                 border: none; 
                 margin-top: 10pt;
                 border-collapse: separate;
                 border-spacing: 0 10pt;
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
                 <span class="text-black">${addSuperscriptToDateString(formData.issueDate)}</span>
             </div>
         </div>
         
         <!-- Red Line -->
         <p style="margin-left: -70.0pt; margin-right: -70.0pt; border-bottom: 3.0pt solid #DC2626; font-size: 1pt; line-height: 1pt; mso-line-height-rule: exactly; margin-top: 4pt; margin-bottom: 12pt; mso-margin-top-alt: 4pt; mso-margin-bottom-alt: 12pt;">&nbsp;</p>
     </div>
     ` : ''}
     
     <!-- MAIN CONTENT -->
     <div class="main-title">Relationship Verification Certificate</div>
     <div class="sub-title">To Whom It May Concern</div>
     
     <p class="content-text">
         This is to certify that <strong>${formData.applicantName}</strong> a permanent resident of 
         <strong>${formData.addressLine}</strong> has the following relationship with the following family members.
     </p>
 
     <p class="content-text" style="font-size: 10pt;">
         This relationship verification certificate is issued in accordance with the Local Government Operation 
         Act B.S. 2074 (2017 A.D.), Chapter 3, Section 12, Sub-section 2, Clause E (1).
     </p>
     
     <!-- RELATIONSHIP TABLE -->
     <table class="income-table">
         <thead>
             <tr style="background-color:white;">
                 <th style="width: 8%; text-align: center; background-color:white;">S.N.</th>
                 <th style="width: 50%; background-color:white;">Name</th>
                 <th style="width: 42%; background-color:white;">Relationship</th>
             </tr>
         </thead>
         <tbody>
             ${tableRows}
         </tbody>
     </table>
 
     <p class="content-text" style="margin-bottom: 5pt; margin-top: 10pt;">The photographs of the persons mentioned above are attached below.</p>
 
     <table class="photo-table">
         ${photoRows.join('')}
     </table>
     
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
        link.download = `Relationship_Verification_${formData.applicantName.replace(/\s+/g, '_')}.doc`;
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
                    padding: 6mm 25mm 25mm 25mm !important; /* Reduced padding to fit more content safely */
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
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Bold (Ctrl+B)"
                                ><Bold size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('italic')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Italic (Ctrl+I)"
                                ><Italic size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('underline')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Underline (Ctrl+U)"
                                ><Underline size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Alignment */}
                                <button
                                    onClick={() => document.execCommand('justifyLeft')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Align Left"
                                ><AlignLeft size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('justifyCenter')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Align Center"
                                ><AlignCenter size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('justifyRight')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Align Right"
                                ><AlignRight size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('justifyFull')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Justify"
                                ><AlignJustify size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Lists */}
                                <button
                                    onClick={() => document.execCommand('insertUnorderedList')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Bullet List"
                                ><List size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('insertOrderedList')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Numbered List"
                                ><ListOrdered size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Indent */}
                                <button
                                    onClick={() => document.execCommand('outdent')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Decrease Indent"
                                ><IndentDecrease size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('indent')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Increase Indent"
                                ><IndentIncrease size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Undo/Redo */}
                                <button
                                    onClick={() => document.execCommand('undo')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Undo (Ctrl+Z)"
                                ><Undo size={14} /></button>
                                <button
                                    onClick={() => document.execCommand('redo')}
                                    className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 border border-gray-200"
                                    title="Redo (Ctrl+Y)"
                                ><Redo size={14} /></button>

                                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                                {/* Clear Formatting */}
                                <button
                                    onClick={() => document.execCommand('removeFormat')}
                                    className="px-2 h-7 flex items-center justify-center rounded hover:bg-red-50 text-xs border border-gray-200 text-red-600"
                                    title="Clear Formatting"
                                ><RemoveFormatting size={14} /></button>
                            </div>

                            {/* Preview Container */}
                            <div className="bg-gray-200 p-2 sm:p-6 overflow-auto flex-1 flex justify-center items-start">
                                <div
                                    id="printable-certificate"
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    spellCheck={false}
                                    className="bg-white w-[210mm] min-w-[210mm] min-h-[297mm] px-[0.5in] sm:px-[1in] pb-[0.5in] sm:pb-[1in] pt-[0.25in] sm:pt-[0.25in] text-[10px] font-serif leading-relaxed text-justify relative focus:outline-none focus:ring-2 focus:ring-red-500/20 mx-auto"
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

                                            <div className="flex justify-between font-bold mb-1" style={{ fontSize: '16pt', lineHeight: '1.1' }}>
                                                <div className="text-red-800">
                                                    <div style={{ marginBottom: '2px' }}>Ref. No.: <span className="text-black">{formData.refNo}</span></div>
                                                    <div>Dis. No.: <span className="text-black">{formData.disNo}</span></div>
                                                </div>
                                                <div className="self-end text-red-800">
                                                    Date: <span className="text-black">{(() => {
                                                        const d = parseDateParts(formData.issueDate);
                                                        return <>{d.day}<sup>{d.suffix}</sup> {d.month}, {d.year}</>;
                                                    })()}</span>
                                                </div>
                                            </div>

                                            <div className="border-b-[3px] border-red-800 mb-2 -mx-[0.5in] sm:-mx-[1in] mt-1"></div>
                                        </>
                                    )}

                                    <div className="text-center font-bold underline mb-1" style={{ fontSize: '16pt' }}>
                                        Relationship Verification Certificate
                                    </div>

                                    <div className="text-center font-bold underline mb-6" style={{ fontSize: '16pt' }}>
                                        To Whom It May Concern
                                    </div>

                                    <p className="mb-4 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                                        This is to certify that <strong>{formData.applicantName}</strong> a permanent resident of
                                        <strong> {formData.addressLine}</strong> has the following relationship with the following family members.
                                    </p>
                                    <p className="mt-2 mb-4 text-justify leading-relaxed" style={{ fontSize: '12pt' }}>
                                        This relationship verification certificate is issued in accordance with the
                                        Local Government Operation Act B.S. 2074 (2017 A.D.) Chapter 3,
                                        Section 12, Sub-section 2, Clause E (1).
                                    </p>

                                    {/* TABLE PREVIEW - Compressed */}
                                    <table className="w-full border-collapse border border-black mb-1 text-left leading-none" style={{ fontSize: '12pt' }}>
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

                                    <p className="mb-3" style={{ fontSize: '12pt' }}>The photographs of the persons mentioned above are attached below.</p>

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

                                    <div className="mt-16 text-right" style={{ fontSize: '12pt' }}>
                                        <div className="font-bold">......................................</div>
                                        <div className="font-bold">{formData.signatoryName}</div>
                                        <div className="font-bold">{formData.signatoryDesignation}</div>
                                    </div>

                                    {/* Conditional Footer */}
                                    {/* Conditional Footer */}
                                    {formData.includeFooter && (
                                        <div className="absolute bottom-4 left-0 right-0 pt-2 border-t-[3px] border-red-600 px-[0.5in] sm:px-[1in] flex justify-between items-center bg-white">
                                            <span className="font-bold text-red-600 whitespace-nowrap" style={{ fontSize: '14pt' }}>Phone No.: +977-9856017304</span>
                                            <span className="font-bold text-red-600 whitespace-nowrap" style={{ fontSize: '14pt' }}>E-mail: {formData.footerEmail}</span>
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