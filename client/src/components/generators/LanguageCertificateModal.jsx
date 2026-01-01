import { BookOpen, Download, Printer, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LanguageCertificateModal({ isOpen, onClose, student }) {
    if (!isOpen || !student) return null;

    // --- 1. INITIAL STATE ---
    const [formData, setFormData] = useState({
        // Letterpad toggle
        includeLetterpad: true,

        // Meta
        certNo: '106/2025',
        issueDate: '2025年 09月 21日',

        // Student Info
        studentName: '',
        sex: 'Male',
        dob: '',
        nationality: 'ネパール',

        // Course Info
        courseName: '初級日本語',
        textbook: 'みんなの日本語I/II',

        startDate: '2025/04/20',
        endDate: '2026/02/16',

        // Attendance Logic
        totalHours: 512,
        totalDays: 256,
        attendedDays: 117,
        attendedHours: 234,
        totalStudyHours: 512, // 合計学習時間

        remarks: '日曜日から金曜日\n（am7:00からam9:00）',
        attendanceRate: '100.00%',

        // Scores
        vocabScore: 84,
        listeningScore: 90,
        readingScore: 89,
        conversationScore: 91,
        totalScore: 354,
        totalMax: 400,

        // Signatories
        teacherName: 'Karuna Panthee',
        principalName: 'Sudan Pandey',

        // Footer
        companyWeb: 'www.umiabroadstudy.com',
        companyEmail: 'umiabroadstudy@gmail.com'
    });

    // --- 2. POPULATE DATA ---
    useEffect(() => {
        if (student) {
            const certData = student.visaDetails?.japaneseLanguage?.certificateDetails || {};

            const formatDateJP = (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return `${d.getFullYear()}年 ${String(d.getMonth() + 1).padStart(2, '0')}月 ${String(d.getDate()).padStart(2, '0')}日`;
            };

            const formatDateSlash = (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
            };

            setFormData(prev => ({
                ...prev,
                studentName: (student.personalInfo?.firstName + ' ' + student.personalInfo?.lastName).toUpperCase(),
                sex: student.personalInfo?.gender || 'Male',
                dob: formatDateJP(student.personalInfo?.dobAD),

                courseName: certData.courseName || prev.courseName,
                textbook: certData.textbook || prev.textbook,
                startDate: certData.startDate ? formatDateSlash(certData.startDate) : prev.startDate,
                endDate: certData.endDate ? formatDateSlash(certData.endDate) : prev.endDate,

                vocabScore: certData.scores?.vocab || prev.vocabScore,
                listeningScore: certData.scores?.listening || prev.listeningScore,
                readingScore: certData.scores?.reading || prev.readingScore,
                conversationScore: certData.scores?.conversation || prev.conversationScore,

                totalHours: certData.totalHours || prev.totalHours,
                attendedHours: certData.attendedHours || prev.attendedHours,
                attendanceRate: certData.attendanceRate ? certData.attendanceRate + '%' : prev.attendanceRate,
            }));
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePrint = () => {
        window.print();
    };

    // --- 3. WORD DOC GENERATOR (2-Page Layout) ---
    const generateWordDoc = () => {
        const isMale = formData.sex === 'Male';
        const maleCircle = isMale ? 'border: 1pt solid black; border-radius: 50%; padding: 1pt 4pt;' : 'padding: 1pt 4pt;';
        const femaleCircle = !isMale ? 'border: 1pt solid black; border-radius: 50%; padding: 1pt 4pt;' : 'padding: 1pt 4pt;';

        const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Language Certificate</title>
        <style>
          @page { size: A4; margin: 0; }
          body { 
            font-family: 'MS Mincho', 'Times New Roman', serif; 
            font-size: 9pt; 
            line-height: 1.2; 
            margin: 0;
            padding: 0;
          }
          
          .page {
            width: 210mm;
            height: 297mm;
            position: relative;
            ${formData.includeLetterpad ? `background-image: url('${window.location.origin}/umi_letterpad.png'); background-size: 100% 100%; background-position: center; background-repeat: no-repeat;` : ''}
          }
          
          .content-area {
            padding: 110pt 50pt 40pt 50pt;
          }
          
          .cert-info-table { width: 100%; margin-bottom: 10pt; font-weight: bold; font-size: 9pt; }
          .cert-info-table td { border: none; padding: 1pt; }

          .cert-title { text-align: center; font-size: 16pt; font-weight: bold; text-decoration: underline; margin: 10pt 0 12pt 0; letter-spacing: 3pt; }

          .data-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
          .data-table td { border: 1pt solid black; padding: 3pt 5pt; vertical-align: middle; }
          
          .col-label { font-weight: bold; width: 20%; text-align: center; }
          .col-val { width: 30%; text-align: center; }
          
          .score-table { width: 85%; border-collapse: collapse; margin: 12pt auto; font-size: 9pt; }
          .score-table td { border: 1pt solid black; padding: 3pt; text-align: center; }
          .score-header { font-weight: bold; }
          
          .notes { font-size: 8pt; margin: 12pt 0; line-height: 1.6; }
          
          .sig-table { width: 100%; position: absolute; bottom: 200pt; left: 50pt; right: 50pt; border: none; }
          .sig-td { border: none; text-align: center; vertical-align: top; width: 33%; padding: 5pt; }
          .sig-title { font-weight: bold; font-size: 9pt; margin-bottom: 3pt; }
          .sig-name { font-weight: bold; font-size: 9pt; }
          
          .footer-links { margin-top: 80pt; }
          .footer-links a { color: blue; }
        </style>
      </head>
      <body>
        
        <!-- SINGLE PAGE: All Content -->
        <div class="page">
          <div class="content-area">
        
            <table class="cert-info-table">
                <tr>
                    <td style="text-align: left;">証明書番号: ${formData.certNo}</td>
                    <td style="text-align: right;">発行日 : ${formData.issueDate}</td>
                </tr>
            </table>

            <div class="cert-title">日本語学習証明書</div>

            <!-- Student Info Table -->
            <table class="data-table" style="margin-bottom: 5pt;">
                <tr>
                    <td class="col-label" style="text-align: left; padding-left: 8pt; width: 18%;">学生氏名 :</td>
                    <td style="text-align: left; padding-left: 8pt; width: 35%; font-weight: bold;">${formData.studentName}</td>
                    <td class="col-label" style="width: 12%;">性別</td>
                    <td style="width: 35%; text-align: center;">
                        <span style="${maleCircle}">男</span> 
                        &nbsp;&nbsp;
                        <span style="${femaleCircle}">女</span>
                    </td>
                </tr>
                <tr>
                    <td class="col-label" style="text-align: left; padding-left: 8pt;">生年月日 :</td>
                    <td style="text-align: left; padding-left: 8pt; font-weight: bold;">${formData.dob}</td>
                    <td class="col-label">国籍</td>
                    <td style="text-align: center;">${formData.nationality}</td>
                </tr>
            </table>

            <!-- Course Details Table -->
            <table class="data-table" style="margin-bottom: 4pt;">
                <tr>
                    <td class="col-label">課程</td>
                    <td class="col-val">${formData.courseName}</td>
                    <td class="col-label">教材</td>
                    <td class="col-val">${formData.textbook}</td>
                </tr>
                <tr>
                    <td class="col-label" style="font-size: 8pt;">日本語学習期間</td>
                    <td class="col-val" style="font-size: 8pt;">
                        ${formData.startDate}　～　${formData.endDate}<br/>(修了予定)
                    </td>
                    <td class="col-label" style="font-size: 8pt;">合計学習時間</td>
                    <td class="col-val">${formData.totalStudyHours} 時間</td>
                </tr>
                <tr>
                    <td class="col-label">学習期間</td>
                    <td class="col-val">${formData.attendedDays}日/${formData.totalDays}日間</td>
                    <td class="col-label" style="font-size: 7pt; line-height: 1.2;">現在までの<br/>総学習時間</td>
                    <td class="col-val">${formData.attendedHours}/${formData.totalHours}時間</td>
                </tr>
                <tr>
                    <td class="col-label">備考</td>
                    <td class="col-val" style="white-space: pre-wrap; font-size: 7pt;">${formData.remarks}</td>
                    <td class="col-label">出席率</td>
                    <td class="col-val" style="font-weight: bold;">${formData.attendanceRate}</td>
                </tr>
            </table>

            <div style="font-size: 9pt; font-weight: bold; margin: 18pt 0; text-align: center;">
                日本語学習状況が下記の通りであることをここに証明致します。
            </div>

            <div class="notes" style="font-size: 7pt; margin: 3pt 0;">
                ※休日・祝祭日はネパールカレンダー、当校規定に基づきます。<br/>
                ※欠席に関しましては原則振替授業を義務づけています。
            </div>

            <!-- Scores Table -->
            <table class="score-table" style="width: 90%; margin: 6pt auto;">
                <tr class="score-header">
                    <td>文字・語彙</td>
                    <td>聴解</td>
                    <td>読解・文法</td>
                    <td>会話</td>
                    <td>総合点</td>
                </tr>
                <tr>
                    <td>${formData.vocabScore}/100</td>
                    <td>${formData.listeningScore}/100</td>
                    <td>${formData.readingScore}/100</td>
                    <td>${formData.conversationScore}/100</td>
                    <td style="font-weight: bold;">${formData.totalScore}/${formData.totalMax}</td>
                </tr>
            </table>

            <!-- Signatures Section with lines above -->
            <table class="sig-table" style="margin-top: 10pt;">
                <tr>
                    <td class="sig-td">
                        <div style="border-top: 1pt solid black; width: 100%; margin-bottom: 2pt;"></div>
                        <div class="sig-title">日本語教師</div>
                        <div class="sig-name">${formData.teacherName}</div>
                    </td>
                    <td class="sig-td">
                        <div style="border-top: 1pt solid black; width: 100%; margin-bottom: 2pt;"></div>
                        <div class="sig-title">学校印</div>
                        <!-- Seal space -->
                    </td>
                    <td class="sig-td">
                        <div style="border-top: 1pt solid black; width: 100%; margin-bottom: 2pt;"></div>
                        <div class="sig-title">校長</div>
                        <div class="sig-name">${formData.principalName}</div>
                    </td>
                </tr>
            </table>

            <!-- Web and Email Links - Same line, Orange color -->
            <div style="position: absolute; bottom: 50pt; left: 50pt; right: 50pt; display: flex; justify-content: center; font-size: 9pt;">
                <div>
                    <span style="color: #E69500; font-weight: bold;">Web: </span>
                    <a href="http://${formData.companyWeb}" style="color: #E69500; text-decoration: underline;">${formData.companyWeb}</a>
                </div>
                <div>
                    <span style="color: #E69500; font-weight: bold;">Email: </span>
                    <a href="mailto:${formData.companyEmail}" style="color: #E69500; text-decoration: underline;">${formData.companyEmail}</a>
                </div>
            </div>

          </div>
        </div>

      </body>
      </html>
    `;

        const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Language_Certificate_${formData.studentName.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 210mm;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-page {
                        width: 210mm;
                        height: 297mm;
                        position: relative;
                    }
                    @page { size: A4; margin: 0; }
                }
            `}</style>

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

                {/* HEADER */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gradient-to-r from-indigo-50 to-white">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="text-indigo-600" size={20} /> Language Certificate (UMI) - Single Page
                    </h3>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-bold shadow-md active:scale-95 transition">
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
                            <select onChange={(e) => document.execCommand('fontName', false, e.target.value)} className="text-xs border rounded px-2 py-1" defaultValue="MS Mincho">
                                <option value="MS Mincho">MS Mincho</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Arial">Arial</option>
                            </select>
                            <select onChange={(e) => document.execCommand('fontSize', false, e.target.value)} className="text-xs border rounded px-2 py-1" defaultValue="3">
                                <option value="2">10pt</option>
                                <option value="3">12pt</option>
                                <option value="4">14pt</option>
                            </select>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button onClick={() => document.execCommand('bold')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 font-bold text-sm border" title="Bold">B</button>
                            <button onClick={() => document.execCommand('italic')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 italic text-sm border" title="Italic">I</button>
                            <button onClick={() => document.execCommand('underline')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 underline text-sm border" title="Underline">U</button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button onClick={() => document.execCommand('undo')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border" title="Undo">↩</button>
                            <button onClick={() => document.execCommand('redo')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-sm border" title="Redo">↪</button>
                        </div>

                        {/* Preview Container - Scrollable 2 Pages */}
                        <div className="bg-gray-400 p-6 overflow-auto flex-1">
                            <div
                                id="printable-certificate"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                spellCheck={false}
                                className="print-area focus:outline-none"
                                style={{ fontFamily: '"MS Mincho", "Times New Roman", serif' }}
                            >
                                {/* ===== SINGLE PAGE: All Content ===== */}
                                <div
                                    className="print-page bg-white shadow-lg w-full sm:w-[210mm] h-[297mm] mx-auto relative"
                                    style={{
                                        backgroundImage: formData.includeLetterpad ? 'url(/umi_letterpad.png)' : 'none',
                                        backgroundSize: '100% 100%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                    <div className="pt-[165px] px-[50px] pb-[40px]" style={{ fontFamily: '"MS Mincho", "Yu Mincho", serif' }}>

                                        {/* Cert Meta */}
                                        <div className="flex justify-between font-bold text-[9px] mb-4">
                                            <span>証明書番号: {formData.certNo}</span>
                                            <span>発行日 : {formData.issueDate}</span>
                                        </div>

                                        {/* Title */}
                                        <div className="text-[15px] font-bold text-center underline tracking-[0.12em] mb-5" style={{ textDecorationThickness: '1px' }}>
                                            日本語学習証明書
                                        </div>

                                        {/* Student Info Table */}
                                        <table className="w-full border-collapse mb-4" style={{ border: '1px solid black', fontSize: '9px' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', fontWeight: 'bold', width: '15%' }}>学生氏名 :</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', fontWeight: 'bold', width: '40%' }}>{formData.studentName}</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', fontWeight: 'bold', width: '10%', textAlign: 'center' }}>性別</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', width: '35%', textAlign: 'center' }}>
                                                        <span style={formData.sex === 'Male' ? { border: '1px solid black', borderRadius: '50%', padding: '1px 6px' } : {}}>男</span>
                                                        &nbsp;&nbsp;
                                                        <span style={formData.sex !== 'Male' ? { border: '1px solid black', borderRadius: '50%', padding: '1px 6px' } : {}}>女</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', fontWeight: 'bold' }}>生年月日 :</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', fontWeight: 'bold' }}>{formData.dob}</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', fontWeight: 'bold', textAlign: 'center' }}>国籍</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 6px', textAlign: 'center' }}>{formData.nationality}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Course Details Table - 4 Column Layout */}
                                        <table className="w-full border-collapse mb-4" style={{ border: '1px solid black', fontSize: '9px' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', width: '18%', textAlign: 'center' }}>課程</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', width: '32%', textAlign: 'center' }}>{formData.courseName}</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', width: '18%', textAlign: 'center' }}>教材</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', width: '32%', textAlign: 'center' }}>{formData.textbook}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', fontSize: '8px' }}>日本語学習期間</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', fontSize: '8px' }}>
                                                        {formData.startDate}　～　{formData.endDate}<br /><span style={{ fontSize: '7px' }}>(修了予定)</span>
                                                    </td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', fontSize: '8px' }}>合計学習時間</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.totalStudyHours} 時間</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center' }}>学習期間</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.attendedDays}日/{formData.totalDays}日間</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', fontSize: '7px', lineHeight: '1.2' }}>現在までの<br />総学習時間</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.attendedHours}/{formData.totalHours}時間</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center' }}>備考</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center', whiteSpace: 'pre-wrap', fontSize: '7px', lineHeight: '1.3' }}>{formData.remarks}</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center' }}>出席率</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center' }}>{formData.attendanceRate}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Certification Statement */}
                                        <div style={{ fontSize: '9px', fontWeight: 'bold', margin: '18px 0', textAlign: 'center' }}>
                                            日本語学習状況が下記の通りであることをここに証明致します。
                                        </div>

                                        {/* Notes */}
                                        <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.6' }}>
                                            ※休日・祝祭日はネパールカレンダー、当校規定に基づきます。<br />
                                            ※欠席に関しましては原則振替授業を義務づけています。
                                        </div>

                                        {/* Scores Table */}
                                        <table className="border-collapse mx-auto mb-3" style={{ width: '90%', border: '1px solid black', fontSize: '9px' }}>
                                            <thead>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', width: '20%' }}>文字・語彙</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', width: '20%' }}>聴解</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', width: '20%' }}>読解・文法</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', width: '20%' }}>会話</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center', width: '20%' }}>総合点</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.vocabScore}/100</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.listeningScore}/100</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.readingScore}/100</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', textAlign: 'center' }}>{formData.conversationScore}/100</td>
                                                    <td style={{ border: '1px solid black', padding: '6px 5px', fontWeight: 'bold', textAlign: 'center' }}>{formData.totalScore}/{formData.totalMax}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Signatures with lines above */}
                                        <div style={{ position: 'absolute', bottom: '200px', left: '50px', right: '50px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '9px' }}>
                                            {/* Teacher */}
                                            <div style={{ width: '30%' }}>
                                                <div style={{ borderTop: '1px solid black', width: '100%', marginBottom: '2px' }}></div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>日本語教師</div>
                                                <div style={{ fontWeight: 'bold' }}>{formData.teacherName}</div>
                                            </div>
                                            {/* School Seal */}
                                            <div style={{ width: '30%' }}>
                                                <div style={{ borderTop: '1px solid black', width: '100%', marginBottom: '2px' }}></div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>学校印</div>
                                                {/* Seal space */}
                                            </div>
                                            {/* Principal */}
                                            <div style={{ width: '30%' }}>
                                                <div style={{ borderTop: '1px solid black', width: '100%', marginBottom: '2px' }}></div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>校長</div>
                                                <div style={{ fontWeight: 'bold' }}>{formData.principalName}</div>
                                            </div>
                                        </div>

                                        {/* Web and Email - Same line, Orange color */}
                                        <div style={{ position: 'absolute', bottom: '170px', left: '50px', right: '50px', display: 'flex', justifyContent: 'center', fontSize: '9px', gap: '10px' }}>
                                            <div>
                                                <span style={{ color: '#E69500', fontWeight: 'bold' }}>Web: </span>
                                                <a href={`http://${formData.companyWeb}`} style={{ color: '#E69500', textDecoration: 'underline' }}>
                                                    {formData.companyWeb}
                                                </a>
                                            </div>
                                            <div>
                                                <span style={{ color: '#E69500', fontWeight: 'bold' }}>Email: </span>
                                                <a href={`mailto:${formData.companyEmail}`} style={{ color: '#E69500', textDecoration: 'underline' }}>
                                                    {formData.companyEmail}
                                                </a>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT: EDITABLE FIELDS (1/3 width) */}
                    <div className="w-1/3 p-6 space-y-4 overflow-y-auto bg-gray-50">

                        {/* LETTERPAD TOGGLE */}
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-bold text-indigo-800">Include Letterpad Background</span>
                                <input
                                    type="checkbox"
                                    checked={formData.includeLetterpad}
                                    onChange={(e) => setFormData({ ...formData, includeLetterpad: e.target.checked })}
                                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                                />
                            </label>
                            <p className="text-xs text-indigo-600 mt-1">Toggle OFF if printing on pre-printed stationery</p>
                        </div>

                        {/* META */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Certificate Info</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Cert No.</label>
                                    <input name="certNo" value={formData.certNo} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Issue Date (日)</label>
                                    <input name="issueDate" value={formData.issueDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* STUDENT INFO */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Student Info</h4>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Name (ENGLISH)</label>
                                <input name="studentName" value={formData.studentName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">DOB (日)</label>
                                    <input name="dob" value={formData.dob} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Sex</label>
                                    <select name="sex" value={formData.sex} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm">
                                        <option value="Male">Male (男)</option>
                                        <option value="Female">Female (女)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* COURSE DETAILS */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Course Details</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Course (課程)</label>
                                    <input name="courseName" value={formData.courseName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Textbook (教材)</label>
                                    <input name="textbook" value={formData.textbook} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Start Date</label>
                                    <input name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">End Date</label>
                                    <input name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* ATTENDANCE */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Attendance</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Total Days</label>
                                    <input type="number" name="totalDays" value={formData.totalDays} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Attended Days</label>
                                    <input type="number" name="attendedDays" value={formData.attendedDays} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Total Hours</label>
                                    <input type="number" name="totalHours" value={formData.totalHours} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Attended Hours</label>
                                    <input type="number" name="attendedHours" value={formData.attendedHours} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Attendance Rate</label>
                                <input name="attendanceRate" value={formData.attendanceRate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm font-bold" />
                            </div>
                        </div>

                        {/* SCORES */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-blue-700 uppercase">Scores (out of 100)</h4>
                            <div className="grid grid-cols-5 gap-2">
                                <div>
                                    <label className="block text-[8px] font-bold text-center text-gray-500">Vocab</label>
                                    <input type="number" name="vocabScore" value={formData.vocabScore} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm text-center font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-center text-gray-500">Listen</label>
                                    <input type="number" name="listeningScore" value={formData.listeningScore} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm text-center font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-center text-gray-500">Read</label>
                                    <input type="number" name="readingScore" value={formData.readingScore} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm text-center font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-center text-gray-500">Conv</label>
                                    <input type="number" name="conversationScore" value={formData.conversationScore} onChange={handleChange} className="w-full border rounded px-2 py-1 text-sm text-center font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-center text-blue-600">Total</label>
                                    <input type="number" name="totalScore" value={formData.totalScore} onChange={handleChange} className="w-full border-blue-300 rounded px-2 py-1 text-sm text-center font-bold text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* SIGNATORIES */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Signatories (Page 2)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Teacher (日本語教師)</label>
                                    <input name="teacherName" value={formData.teacherName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Principal (校長)</label>
                                    <input name="principalName" value={formData.principalName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* FOOTER LINKS */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Contact Info (Page 2)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Website</label>
                                    <input name="companyWeb" value={formData.companyWeb} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                    <input name="companyEmail" value={formData.companyEmail} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
