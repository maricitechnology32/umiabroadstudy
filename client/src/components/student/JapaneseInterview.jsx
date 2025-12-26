 


import Vapi from '@vapi-ai/web';
import {
    Activity,
    AlertCircle,
    Briefcase,
    Cpu,
    GraduationCap,
    Headphones,
    Mic,
    Power,
    Radio,
    Wifi
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

// Your Vapi Public Key
const VAPI_PUBLIC_KEY = "0a816e83-46d3-4f80-a64e-6d34c132e160";

export default function JapaneseInterview() {
    const vapiRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle, connecting, active
    const [volume, setVolume] = useState(0);
    const [activeScenario, setActiveScenario] = useState('student');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    // Timer logic for active call
    useEffect(() => {
        let interval;
        if (status === 'active') {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const vapi = new Vapi(VAPI_PUBLIC_KEY);
        vapiRef.current = vapi;

        // --- EVENT LISTENERS ---
        vapi.on('call-start', () => {
            setStatus('active');
            toast.success("Simulation Initialized. Officer is speaking.");
        });

        vapi.on('call-end', () => {
            setStatus('idle');
            setVolume(0);
            setIsSpeaking(false);
        });

        vapi.on('volume-level', (level) => {
            setVolume(level);
            setIsSpeaking(level > 0.05);
        });

        vapi.on('error', (e) => {
            console.error("Vapi Error:", e);
            setStatus('idle');
            const msg = e.error?.msg || e.message || "Connection failed";
            toast.error(msg.includes("ejected") ? "Simulation ended." : "Connection error.");
        });

        return () => {
            vapi.stop();
        };
    }, []);

    const startInterview = async () => {
        if (!vapiRef.current) return;
        setStatus('connecting');

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });

            let systemPrompt = "";
            let firstMessage = "";

            if (activeScenario === 'student') {
                systemPrompt = `You are a strict but fair Immigration Officer at Narita Airport, Japan. 
           Your job is to interview a student visa applicant. 
           Speak ONLY in Japanese. Target JLPT N4 level (polite but simple).
           Ask one question at a time.
           Topics: Study plans, financial sponsor (who is paying?), and why they chose this school.
           If the user answers correctly, move to the next topic. If they struggle, repeat the question simply.`;
                firstMessage = "こんにちは。入国審査を始めます。まず、お名前を教えてください。";
            } else {
                systemPrompt = `You are a Japanese Factory Manager interviewing a candidate for a 'Tokutei Ginou' (Skilled Worker) visa.
           Focus on: Physical strength, past work experience, and willingness to follow rules.
           Speak polite Japanese (Desu/Masu form). 
           Ask one question at a time.
           Be professional but demanding.`;
                firstMessage = "初めまして。面接を担当します。自己紹介をお願いします。";
            }

            await vapiRef.current.start({
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [{ role: "system", content: systemPrompt }]
                },
                transcriber: { provider: "deepgram", model: "nova-2", language: "ja" },
                voice: {
                    provider: "11labs",
                    voiceId: "cgSgspJ2msm6clMCkdW9",
                    stability: 0.5,
                    similarityBoost: 0.75
                },
                firstMessage: firstMessage
            });

        } catch (err) {
            console.error("Start Failed:", err);
            setStatus('idle');
            toast.error("Microphone access denied.");
        }
    };

    const stopInterview = () => {
        vapiRef.current?.stop();
    };

    // --- RENDER HELPERS ---
    const isLive = status === 'active' || status === 'connecting';
    const themeColor = activeScenario === 'student' ? 'green' : 'purple';

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500">
            
            {/* MAIN SIMULATOR CONTAINER */}
            <div className={`relative overflow-hidden transition-all duration-500 rounded-3xl border shadow-2xl ${
                isLive 
                ? 'bg-slate-900 border-slate-700 h-[600px]' 
                : 'bg-white border-gray-200 min-h-[500px]'
            }`}>

                {/* --- 1. IDLE STATE: SELECTION SCREEN --- */}
                {!isLive && (
                    <div className="h-full p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                        <Cpu className="text-gray-400" />
                                        AI Interview Coach
                                    </h2>
                                    <p className="text-gray-500 mt-2">Select a simulation protocol to begin your visa training.</p>
                                </div>
                                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    SYSTEM ONLINE
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Student Card */}
                                <ScenarioCard 
                                    id="student"
                                    title="Student Visa Protocol"
                                    desc="Simulates Narita Airport Immigration. Focus on study plans and sponsorship."
                                    icon={<GraduationCap size={32}/>}
                                    active={activeScenario}
                                    set={setActiveScenario}
                                    color="green"
                                />
                                {/* Work Card */}
                                <ScenarioCard 
                                    id="work"
                                    title="Skilled Worker Protocol"
                                    desc="Simulates Factory Manager Interview. Focus on skills and endurance."
                                    icon={<Briefcase size={32}/>}
                                    active={activeScenario}
                                    set={setActiveScenario}
                                    color="purple"
                                />
                            </div>
                        </div>

                        {/* Start Bar */}
                        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Headphones size={16} />
                                <span>Use headphones for best accuracy.</span>
                            </div>
                            <button 
                                onClick={startInterview}
                                className={`
                                    relative overflow-hidden group px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all transform hover:-translate-y-1 hover:shadow-2xl active:scale-95
                                    ${activeScenario === 'student' ? 'bg-green-600 hover:bg-green-500 shadow-green-200' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-200'}
                                `}
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <Mic size={20} /> INITIALIZE INTERVIEW
                                </span>
                                {/* Button Shine Effect */}
                                <div className="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20"></div>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- 2. LIVE STATE: IMMERSIVE UI --- */}
                {isLive && (
                    <div className="relative h-full flex flex-col items-center justify-center p-8">
                        {/* Background Grid Animation */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.9)_2px,transparent_2px),linear-gradient(90deg,rgba(15,23,42,0.9)_2px,transparent_2px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
                        
                        {/* Top HUD */}
                        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-md text-xs font-mono font-bold tracking-widest border bg-opacity-20 backdrop-blur-md
                                    ${activeScenario === 'student' ? 'bg-green-500 border-green-400 text-green-200' : 'bg-purple-500 border-purple-400 text-purple-200'}`}>
                                    {activeScenario === 'student' ? 'PROTOCOL: STUDENT' : 'PROTOCOL: WORKER'}
                                </div>
                                <div className="px-3 py-1 rounded-md text-xs font-mono font-bold tracking-widest border border-slate-600 bg-slate-800/50 text-slate-400 flex items-center gap-2">
                                    <Wifi size={12} className={status === 'active' ? 'text-green-400' : 'text-yellow-400'} />
                                    {status === 'active' ? 'VAPI-4o CONNECTED' : 'ESTABLISHING LINK...'}
                                </div>
                            </div>
                            <div className="text-slate-400 font-mono text-sm tracking-wider">
                                {formatTime(callDuration)}
                            </div>
                        </div>

                        {/* Central AI Orb Visualizer */}
                        <div className="relative z-0 flex items-center justify-center h-64 w-64">
                            {/* Glow Layer */}
                            <div 
                                className={`absolute inset-0 rounded-full blur-3xl transition-all duration-100 ease-out opacity-40
                                    ${activeScenario === 'student' ? 'bg-green-500' : 'bg-purple-500'}`}
                                style={{ transform: `scale(${1 + volume * 1.5})` }}
                            />
                            
                            {/* Core Orb */}
                            <div 
                                className={`relative z-10 w-32 h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-75 ease-linear
                                    ${activeScenario === 'student' ? 'bg-slate-900 border-green-400' : 'bg-slate-900 border-purple-400'}`}
                                style={{ 
                                    transform: `scale(${1 + volume * 0.5})`,
                                    boxShadow: `0 0 ${20 + volume * 100}px ${activeScenario === 'student' ? '#60a5fa' : '#c084fc'}`
                                }}
                            >
                                {status === 'connecting' ? (
                                    <Activity className="text-white animate-spin" size={32} />
                                ) : (
                                    <div className={`w-full h-full rounded-full opacity-80 ${activeScenario === 'student' ? 'bg-gradient-to-tr from-green-900 to-green-400' : 'bg-gradient-to-tr from-purple-900 to-purple-400'}`}></div>
                                )}
                            </div>

                            {/* Ripples when speaking */}
                            {isSpeaking && (
                                <>
                                    <div className={`absolute w-full h-full rounded-full border opacity-20 animate-ping ${activeScenario === 'student' ? 'border-green-400' : 'border-purple-400'}`} style={{ animationDuration: '2s' }}></div>
                                    <div className={`absolute w-[120%] h-[120%] rounded-full border opacity-10 animate-ping ${activeScenario === 'student' ? 'border-green-400' : 'border-purple-400'}`} style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                                </>
                            )}
                        </div>

                        {/* Live Status Text */}
                        <div className="mt-8 text-center h-12">
                            {status === 'connecting' && <span className="text-slate-400 font-mono text-sm animate-pulse">Initializing Neural Link...</span>}
                            {status === 'active' && (
                                <span className={`text-lg font-medium tracking-wide animate-pulse ${isSpeaking ? (activeScenario === 'student' ? 'text-green-300' : 'text-purple-300') : 'text-slate-500'}`}>
                                    {isSpeaking ? "DETECTING VOICE INPUT..." : "OFFICER IS SPEAKING..."}
                                </span>
                            )}
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-8 left-0 w-full flex justify-center gap-6 z-10">
                            {/* Mute Toggle (Visual only for simulation feel) */}
                            <div className="flex gap-4">
                                <button className="p-4 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all">
                                    {isSpeaking ? <Mic size={24} /> : <Radio size={24} />}
                                </button>
                                
                                <button 
                                    onClick={stopInterview}
                                    className="group flex items-center gap-3 px-8 py-4 rounded-full bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all backdrop-blur-sm"
                                >
                                    <Power size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold tracking-wider">TERMINATE</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Instruction Footer */}
            {!isLive && (
                <div className="mt-6 flex justify-center">
                    <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-yellow-100 shadow-sm">
                        <AlertCircle size={16} />
                        <span><strong>Tip:</strong> Speak clearly and politely. The AI will pause if you stop speaking.</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB COMPONENTS ---

function ScenarioCard({ id, title, desc, icon, active, set, color }) {
    const isActive = active === id;
    const activeClass = color === 'green' 
        ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
        : 'border-purple-500 bg-purple-50 ring-2 ring-purple-200';
    
    return (
        <div 
            onClick={() => set(id)}
            className={`
                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                ${isActive ? activeClass : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
            `}
        >
            {isActive && (
                <div className={`absolute top-4 right-4 text-${color}-600`}>
                   <div className="w-4 h-4 rounded-full border-[3px] border-current"></div>
                </div>
            )}
            
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                isActive ? `bg-${color}-600 text-white shadow-md` : 'bg-gray-100 text-gray-500'
            }`}>
                {icon}
            </div>
            
            <h3 className={`text-lg font-bold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
        </div>
    );
}