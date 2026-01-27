 

import { Copy, Eraser, FileText, Globe, Languages, Loader2, PenTool, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function SopWritingAssistant({ student }) {
    // Local state for the "Interview" inputs
    const [inputs, setInputs] = useState({
        introduction: `My name is ${student?.personalInfo?.firstName} ${student?.personalInfo?.lastName}, born in ${student?.address?.district}, Nepal.`,
        academicBackground: "I completed my +2 in Management with a 3.2 GPA in 2023.",
        whyJapan: "Japan is a leader in technology and disciplined work culture.",
        whyCourse: "I want to study Japanese Language to N2 level.",
        financialSupport: `My father, ${student?.familyInfo?.fatherName}, runs a business and will sponsor me.`,
        futurePlans: "After my studies, I intend to return to Nepal to start my own business."
    });

    // STATE: Stores both language versions
    const [generatedContent, setGeneratedContent] = useState({
        english: "",
        japanese: ""
    });

    const [activeLang, setActiveLang] = useState("english"); // 'english' | 'japanese'
    const [isGenerating, setIsGenerating] = useState(false);
    const [tone, setTone] = useState("formal"); 

    // Handle Input Changes
    const handleChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    // Handle Editor Changes (Manual Edits)
    const handleEditorChange = (e) => {
        setGeneratedContent(prev => ({
            ...prev,
            [activeLang]: e.target.value
        }));
    };

    // --- AI GENERATION LOGIC ---
    const handleGenerate = async () => {
        setIsGenerating(true);
        setActiveLang('english'); // Reset view to English initially
        
        // CRITICAL: Robust Prompt Engineering for Full Translation
        const prompt = `
            You are a professional Japanese Immigration Scrivener (Gyoseishoshi).
            Write a Statement of Purpose (Reason for Study) for a Student Visa application.

            **APPLICANT PROFILE:**
            - Name: ${student?.personalInfo?.firstName} ${student?.personalInfo?.lastName}
            - Nationality: Nepali
            - Tone: ${tone} (Formal/Polite Desu-Masu form)
            
            **DETAILS PROVIDED:**
            1. Introduction: ${inputs.introduction}
            2. Academic History: ${inputs.academicBackground}
            3. Why Japan: ${inputs.whyJapan}
            4. Study Goals: ${inputs.whyCourse}
            5. Financial Sponsor: ${inputs.financialSupport}
            6. Future Plans: ${inputs.futurePlans}

            **OUTPUT INSTRUCTIONS (STRICT):**
            Return a purely JSON object with two keys: "english" and "japanese".
            
            1. "english": A well-structured, persuasive essay in English.
            2. "japanese": A FULL translation of the English version into natural Japanese.
               - DO NOT use English variable placeholders.
               - Transliterate all Names (Applicant, Father) into KATAKANA.
               - Convert academic scores (GPA/Percentage) into Japanese context (e.g., "GPA 3.2の成績で").
               - Use standard Immigration document formatting (Header: 入国管理局御中, Title: 就学理由書, Signature placeholder).
        `;

        try {
            // --- REAL API CALL ---
            const res = await api.post('/ai/generate-sop', { prompt });
            
            // Parse the response (assuming backend sends { text: "JSON_STRING" })
            let data;
            try {
                // First try direct access if backend sends object
                if (typeof res.data.text === 'object') {
                    data = res.data.text;
                } else {
                    // Otherwise parse string
                    data = JSON.parse(res.data.text);
                }
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                toast.error("AI response format error.");
                return;
            }

            setGeneratedContent({
                english: data.english || "Error generating English text.",
                japanese: data.japanese || "Error generating Japanese text."
            });

            toast.success("Bilingual SOP Generated Successfully!");

        } catch (error) {
            console.error("API Error:", error);
            toast.error("Failed to generate SOP. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent[activeLang]);
        toast.success(`Copied ${activeLang === 'english' ? 'English' : 'Japanese'} version!`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[650px] animate-in fade-in">
            
            {/* LEFT COLUMN: The Interview (Inputs) */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <PenTool size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Drafting Assistant</h3>
                            <p className="text-xs text-slate-500">Fill in the key points. AI will write both languages.</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <InputArea 
                            label="1. Introduction" 
                            name="introduction" 
                            value={inputs.introduction} 
                            onChange={handleChange}
                            hint="Who are you and where are you from?"
                        />
                        <InputArea 
                            label="2. Academic History" 
                            name="academicBackground" 
                            value={inputs.academicBackground} 
                            onChange={handleChange}
                            hint="Last degree passed, year, and percentage/GPA."
                        />
                        <InputArea 
                            label="3. Why Japan?" 
                            name="whyJapan" 
                            value={inputs.whyJapan} 
                            onChange={handleChange}
                            hint="Why not study this in Nepal? Be specific about Japanese culture/tech."
                        />
                        <InputArea 
                            label="4. Study Goals" 
                            name="whyCourse" 
                            value={inputs.whyCourse} 
                            onChange={handleChange}
                            hint="What level (N2/N1) do you want to reach? Which university after language school?"
                        />
                        <InputArea 
                            label="5. Financial Support" 
                            name="financialSupport" 
                            value={inputs.financialSupport} 
                            onChange={handleChange}
                            hint="Who is paying? What is their occupation and annual income?"
                        />
                        <InputArea 
                            label="6. Future Plans" 
                            name="futurePlans" 
                            value={inputs.futurePlans} 
                            onChange={handleChange}
                            hint="Return to Nepal to work? Join a Japanese company?"
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: The Output (Preview & Edit) */}
            <div className="flex flex-col space-y-6">
                
                {/* Control Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-sm font-bold text-slate-600">Tone:</span>
                        <select 
                            value={tone} 
                            onChange={(e) => setTone(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                        >
                            <option value="formal">Formal (Immigration Safe)</option>
                            <option value="passionate">Passionate & Descriptive</option>
                            <option value="simple">Simple (N4/N5 Level)</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-70"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        {generatedContent.english ? "Regenerate Both" : "Generate Draft"}
                    </button>
                </div>

                {/* Editor Area with Language Tabs */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
                    
                    {/* Header with Tabs */}
                    <div className="bg-slate-50 px-4 pt-4 border-b border-slate-200 flex justify-between items-end">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveLang('english')}
                                className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                    activeLang === 'english' 
                                    ? 'bg-white text-indigo-600 border-t border-x border-slate-200 shadow-sm translate-y-[1px]' 
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <FileText size={14} /> English
                            </button>
                            <button 
                                onClick={() => setActiveLang('japanese')}
                                className={`px-4 py-2 rounded-t-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                    activeLang === 'japanese' 
                                    ? 'bg-white text-rose-600 border-t border-x border-slate-200 shadow-sm translate-y-[1px]' 
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <Globe size={14} /> Japanese (日本語)
                            </button>
                        </div>

                        <div className="pb-2 flex gap-2">
                            <button onClick={() => setGeneratedContent(prev => ({...prev, [activeLang]: ""}))} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition" title="Clear"><Eraser size={14}/></button>
                            <button onClick={handleCopy} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition" title="Copy"><Copy size={14}/></button>
                        </div>
                    </div>
                    
                    <textarea 
                        className={`flex-1 w-full p-6 resize-none outline-none text-slate-800 leading-relaxed text-lg transition-all ${activeLang === 'japanese' ? 'font-sans' : 'font-serif'}`}
                        placeholder={activeLang === 'english' ? "Generated English content will appear here..." : "ここに生成された日本語のテキストが表示されます..."}
                        value={generatedContent[activeLang]}
                        onChange={handleEditorChange}
                        spellCheck={false}
                    ></textarea>

                    {/* Word Count Footer */}
                    <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-400 flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            {activeLang === 'english' ? <Languages size={12}/> : <Globe size={12}/>}
                            {activeLang === 'english' ? 'English Version' : 'Japanese Translation'}
                        </span>
                        <span>
                            {generatedContent[activeLang] ? generatedContent[activeLang].length : 0} characters
                        </span>
                    </div>

                    {/* Empty State Overlay */}
                    {!generatedContent.english && !isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-10">
                            <div className="bg-white p-6 rounded-full shadow-xl mb-4 border border-indigo-50">
                                <Wand2 className="text-indigo-500" size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">Ready to write.</p>
                            <p className="text-slate-400 text-sm">Fill the details and hit Generate.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SUB COMPONENT ---
function InputArea({ label, name, value, onChange, hint }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{label}</label>
            <textarea 
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder-slate-400"
                placeholder="Type here..."
            />
            {hint && <p className="text-[10px] text-slate-400 mt-1 italic">{hint}</p>}
        </div>
    );
}