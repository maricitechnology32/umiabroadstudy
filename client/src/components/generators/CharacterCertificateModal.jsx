import { Download, FileText, Printer, UserPen, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CharacterCertificateModal({
    isOpen,
    onClose,
    student,
}) {
    if (!isOpen || !student) return null;

    const getGenderPrefix = (s) => {
        const gender = s?.personalInfo?.gender;
        const title = s?.personalInfo?.title;
        if (gender === "Male" || title === "Mr.") return "Mr.";
        if (title === "Ms.") return "Ms.";
        if (title === "Mrs.") return "Mrs.";
        return "Miss";
    };

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

    // Document templates
    const documentTemplates = [
        {
            id: "standard",
            name: "Standard Character Certificate",
            content: (data) => `
        <p class="mb-4">
          This letter is issued to verify that <strong>${data.genderPrefix} ${data.applicantName}</strong> ${data.relation}
          <strong>Mr. ${data.fatherName}</strong> an inhabitant of
          <strong>${data.addressLine}</strong> is a regular student of this campus. He/She has
          been admitted for the academic year <strong>${data.academicYear}</strong> in
          <strong>${data.program}</strong> level.
        </p>
        <p class="mb-4">
          Now he/she is studying ${data.program} in ${data.currentYear} year. According to campus records, his/her Campus
          Roll No. is <strong>${data.rollNumber}</strong> and date of birth is <strong>B.S. ${data.dobBS} (${data.dobAD} A.D.)</strong>.
        </p>
        <p>
          He/She is well behaved, disciplined and sincere at his studentship period. I know nothing
          against his moral character. I strongly recommended for his further studies. We
          wish him for success in every step of his life.
        </p>
      `
        },
        {
            id: "formal",
            name: "Formal Student Verification",
            content: (data) => `
        <p class="mb-4">
          This is to certify that <strong>${data.genderPrefix} ${data.applicantName}</strong> ${data.relation} the
          <strong>Mr. ${data.fatherName}</strong> an inhabitant of
          <strong>${data.addressLine}</strong> is a regular student of
          (B.Ed.) ${data.currentYear} Year (Bachelor of Education) in the academic year ${data.academicYear}.
        </p>
        <p class="mb-4">
          According to campus record his/her date of birth is <strong>B.S. ${data.dobBS} (${data.dobAD} A.D.)</strong>.
        </p>
        <p>
          He/She is a well-motivating student among teachers and students on this campus. I found him/her a very
          helpful, and ambitious student.
        </p>
        <p>
          I wish all the best for his/her future life.
        </p>
      `
        },
        {
            id: "detailed",
            name: "Detailed Character Reference",
            content: (data) => `
        <p class="mb-4">
          This is to certify that <strong>${data.genderPrefix} ${data.applicantName}</strong> ${data.relation}
          <strong>Mr. ${data.fatherName}</strong> is a regular student of Campus.
          He/She has been admitted in <strong>${data.program}</strong> in the academic year (${data.academicYear}).
          Now he/she is studying in the ${data.program} ${data.currentYear} year. The medium of instruction in Campus is English.
        </p>
        <p class="mb-4">
          His/Her date of birth is <strong>${data.dobBS} B.S. (${data.dobAD} A.D.)</strong>. His/Her Tribhuvan University registration no. <strong>${data.universityRegNo}</strong>.
        </p>
        <p>
          I would like to assure the concerned institution and personalities that he/she is disciplined, sincere and
          attentive towards his/her study. Besides, he/she possesses amicable personality and co-operative attitude too.
        </p>
      `
        },
        {
            id: "business",
            name: "Business Studies Certificate",
            content: (data) => `
        <p class="mb-4">
          This is to certify that <strong>${data.genderPrefix} ${data.applicantName}</strong> ${data.relation}
          <strong>Mr. ${data.fatherName}</strong> a permanent resident of
          <strong>${data.addressLine}</strong> is a regular student of the 4-Year Bachelor of Business Studies
          (B.B.S.) program at this college with Tribhuvan University Registration Number <strong>${data.universityRegNo}</strong>
          for the academic year <strong>${data.academicYear}</strong>. According to the college
          record, his/her date of birth is <strong>${data.dobAD} A.D.</strong> Now, he/she is studying in B.B.S. ${data.currentYear} year.
        </p>
        <p class="mb-4">
          <strong>${data.genderPrefix} ${data.applicantName}</strong> is a diligent, disciplined and attentive student. He/She possesses
          an amicable personality towards his/her friends and peer groups.
        </p>
        <p>
          We know nothing against his/her moral character and wish him/her success in his/her future
          endeavors.
        </p>
      `
        }
    ];

    const [selectedTemplate, setSelectedTemplate] = useState(documentTemplates[0]);
    const [logoBase64, setLogoBase64] = useState("");

    useEffect(() => {
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
        logoSize: 80,

        // Header info
        headerTitle: 'College/Campus Name',
        headerSubtitle: 'Campus Address',
        headerAddress: 'District, Province, Nepal',

        // Reference & Date
        refNo: '2082/083',
        disNo: '25',
        dispatchNo: '2082/083/68',
        issueDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),

        // Student Data
        applicantName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
        genderPrefix: getGenderPrefix(student),
        relation: getRelation(student),
        fatherName: student.familyInfo?.fatherName || '',
        motherName: student.familyInfo?.motherName || '',

        addressLine: `${student.address?.municipality || ''} Rural Municipality Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''} Province, Nepal`,

        dobBS: student.personalInfo?.dobBS || "2063/01/04",
        dobAD: formatDate(student.personalInfo?.dobAD) || "17th April 2006 A.D.",

        // Academic Info
        program: "Bachelor of Business Studies (B.B.S.)",
        academicYear: "2024-2028 A.D.",
        currentYear: "1st",
        rollNumber: "189/081",
        universityRegNo: "7-27-0095-2024",

        // Signatory
        signatoryName: "Campus Chief Name",
        signatoryDesignation: "Campus Chief",
    });

    useEffect(() => {
        if (student) {
            setFormData((prev) => ({
                ...prev,
                applicantName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
                genderPrefix: getGenderPrefix(student),
                relation: getRelation(student),
                fatherName: student.familyInfo?.fatherName || '',
                motherName: student.familyInfo?.motherName || '',
                addressLine: `${student.address?.municipality || ''} Rural Municipality Ward No. ${student.address?.wardNo || ''}, ${student.address?.district || ''}, ${student.address?.province || ''} Province, Nepal`,
                dobBS: student.personalInfo?.dobBS || "",
                dobAD: formatDate(student.personalInfo?.dobAD),
            }));
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
        @page { margin: 0.5in; }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.4;
          text-align: justify;
        }
        .title {
          text-align: center;
          font-size: 14pt;
          font-weight: bold;
          text-decoration: underline;
          margin-top: 5pt;
          margin-bottom: 15pt;
        }
        p { margin: 0; padding: 0; margin-bottom: 8pt; }
        .signature-block {
          text-align: right;
          margin-top: 40pt;
          font-size: 11pt;
        }
      </style>
    </head>
    <body>
      ${formData.includeHeader ? `
      <table style="width: 100%; margin-bottom: 5pt;">
        <tr>
          <td style="width: 20%; vertical-align: top; padding-top: 5pt; padding-left: 5pt;">
             ${logoBase64 ? `<img src="${logoBase64}" width="110" height="auto" />` : ''}
          </td>
          <td style="width: 60%; text-align: center; padding-bottom: 5pt;">
            <div style="font-size: 16pt; font-weight: bold; color: #DC2626;">${formData.headerTitle}</div>
            <div style="font-size: 14pt; font-weight: bold; color: #DC2626;">${formData.headerSubtitle}</div>
            <div style="font-size: 12pt; font-weight: bold; color: #DC2626;">${formData.headerAddress}</div>
          </td>
          <td style="width: 20%;"></td>
        </tr>
      </table>

      <table style="width: 100%; color: #DC2626; font-weight: bold; font-size: 11pt; margin-bottom: 20pt;">
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
      ` : ''}

      <div class="title">To Whom It May Concern</div>

      ${selectedTemplate.content(formData)}

      <div class="signature-block">
        <div>......................................</div>
        <strong>${formData.signatoryName}</strong><br>
        ${formData.signatoryDesignation}
      </div>
    </body>
    </html>
    `;

        const blob = new Blob(["\ufeff", content], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Character_Certificate_${formData.applicantName}.doc`.replace(
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
                    height: 296mm;
                    margin: 0;
                    padding: 15mm !important;
                    background: white;
                    z-index: 9999;
                    overflow: hidden !important;
                }
                .print-hidden { display: none !important; }
            }
        `}
            </style>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gradient-to-r from-red-50 to-white">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-red-600" size={18} /> Running Certificate Generator
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

                <div className="p-3 sm:p-6 overflow-y-auto">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">

                        {/* LIVE PREVIEW (LEFT on desktop, TOP on mobile) */}
                        <div className="flex-1 lg:flex-[2] flex flex-col">

                            {/* Preview Container */}
                            <div className="bg-gray-200 p-4 sm:p-8 flex justify-center overflow-auto h-[400px] sm:h-[500px] lg:h-[700px] rounded-lg">
                                <div
                                    id="printable-certificate"
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    spellCheck={false}
                                    className="bg-white shadow-2xl p-[0.5in] sm:p-[1in] w-full sm:w-[210mm] min-h-[297mm] font-serif text-[10pt] sm:text-[12pt] leading-[1.6] text-justify relative outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                                    style={{ fontFamily: "Times New Roman, serif" }}
                                >

                                    {/* Conditional Header - OR Space Reservation */}
                                    {formData.includeHeader ? (
                                        <>
                                            <div className="flex items-start justify-between pb-2 mb-1">
                                                <div className="w-32">
                                                    {/* Logo space reserved for physical stamping */}
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
                                                    Date: {formData.issueDate}
                                                </div>
                                            </div>

                                            <div className="border-b-2 border-red-600 mb-6"></div>
                                        </>
                                    ) : (
                                        <div className="mb-24">{/* Space for letterhead - 6rem top margin */}</div>
                                    )}

                                    <div className="text-center font-bold underline text-[16px] mb-6">
                                        To Whom It May Concern
                                    </div>

                                    <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content(formData) }} />

                                    <div className="mt-16 text-right">
                                        <div>......................................</div>
                                        <div className="font-bold">{formData.signatoryName}</div>
                                        <div>{formData.signatoryDesignation}</div>
                                    </div>

                                    {/* Conditional Footer - OR Space Reservation */}
                                    {formData.includeFooter ? (
                                        <div className="absolute bottom-4 left-0 right-0 text-center pt-2 border-t-2 border-red-600 mx-8">
                                            <span className="text-[10px] font-bold text-red-600">Campus Chief</span>
                                        </div>
                                    ) : (
                                        <div className="h-20">{/* Space for letterhead footer - 5rem bottom margin */}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* EDITABLE FIELDS (RIGHT, 1/3 width) */}
                        <div className="flex-1 space-y-6">

                            {/* DOCUMENT TYPE SELECTOR */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200 shadow-sm">
                                <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Document Template</label>
                                <select
                                    value={selectedTemplate.id}
                                    onChange={(e) => setSelectedTemplate(documentTemplates.find(t => t.id === e.target.value))}
                                    className="w-full border-blue-300 bg-white rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                >
                                    {documentTemplates.map(template => (
                                        <option key={template.id} value={template.id}>{template.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SETTINGS CARD */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
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

                            {/* HEADER DETAILS */}
                            {formData.includeHeader && (
                                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Header Details</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Campus/College Name</label>
                                            <input name="headerTitle" value={formData.headerTitle} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
                                            <input name="headerSubtitle" value={formData.headerSubtitle} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
                                            <input name="headerAddress" value={formData.headerAddress} onChange={handleChange} className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STUDENT DATA */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student Information</h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Roll Number</label>
                                        <input name="rollNumber" value={formData.rollNumber} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">University Reg No.</label>
                                        <input name="universityRegNo" value={formData.universityRegNo} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Program</label>
                                    <input name="program" value={formData.program} onChange={handleChange}
                                        className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                                        <input name="academicYear" value={formData.academicYear} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Current Year</label>
                                        <input name="currentYear" value={formData.currentYear} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                </div>
                            </div>

                            {/* SIGNATORY */}
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <UserPen size={14} /> Signatory
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                                        <input name="signatoryName" value={formData.signatoryName} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Designation</label>
                                        <input name="signatoryDesignation" value={formData.signatoryDesignation} onChange={handleChange}
                                            className="w-full border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20" />
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
