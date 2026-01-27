import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResources, resourceAdded } from '../../features/resources/resourceSlice';
import { BookOpen, Calendar, Clock, Lock, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import io from 'socket.io-client';
import Modal from '../ui/Modal';
import { fixImageUrl } from '../../utils/imageUtils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io.connect(SOCKET_URL);

export default function StudentExamList() {
    const dispatch = useDispatch();
    const { resources, isLoading } = useSelector((state) => state.resources);
    const { user, currentProfile } = useSelector((state) => state.auth);

    const [previewDoc, setPreviewDoc] = useState(null);

    // Filter only Exam questions
    const examResources = resources.filter(r => r.category === 'exam');

    // Helper to determine type
    const isImage = (url) => fixImageUrl(url).match(/\.(jpeg|jpg|gif|png|webp)$/i);

    useEffect(() => {
        dispatch(getResources());
    }, [dispatch]);

    useEffect(() => {
        socket.on('new_resource', (newResource) => {
            if (newResource.category === 'exam') {
                dispatch(resourceAdded(newResource));
            }
        });
        return () => {
            socket.off('new_resource');
        };
    }, [dispatch]);

    // Anti-Screenshot Logic
    const [isSecurityTriggered, setIsSecurityTriggered] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!previewDoc) return;

        const triggerSecurity = () => {
            // INSTANT DOM MANIPULATION (Bypass React Render Cycle)
            if (contentRef.current) {
                contentRef.current.style.opacity = '0';
                contentRef.current.style.filter = 'blur(10px)';
            }
            setIsSecurityTriggered(true);
        };

        const handleKeyDown = (e) => {
            // Detect PrintScreen, Meta+Shift+S (Mac), Win+Shift+S (Windows), Ctrl+P
            if (
                e.key === 'PrintScreen' ||
                (e.metaKey && e.shiftKey && e.key === '4') || // Mac Screenshot
                (e.ctrlKey && e.key === 'p') || // Print
                (e.metaKey && e.shiftKey && e.key === 's') // Windows/Mac Snipping
            ) {
                triggerSecurity();
            }
        };

        const handleBlur = () => {
            triggerSecurity();
        };

        // Removed handleFocus so it doesn't auto-clear. User must click button.

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('blur', handleBlur);

        // Prevent Context Menu globally in this component
        const handleContextMenu = (e) => e.preventDefault();
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [previewDoc]);

    const resumeViewing = () => {
        setIsSecurityTriggered(false);
        // Restore visibility after state update
        setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.style.opacity = '1';
                contentRef.current.style.filter = 'none';
            }
        }, 100);
    }

    if (!isLoading && examResources.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
                <p>No exam questions assigned yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* CSS to block printing */}
            <style>{`
                @media print {
                    body { display: none !important; }
                }
            `}</style>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                <ShieldAlert className="shrink-0 text-amber-600" size={20} />
                <div>
                    <p className="font-bold">Exam Security Active</p>
                    <p>These documents are protected. Content will hide automatically if you try to capture it.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {examResources.map((resource) => (
                    <div key={resource._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Lock size={64} />
                        </div>

                        <div>
                            <div className="flex items-start justify-between mb-3 relative z-10">
                                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">
                                    <BookOpen size={20} />
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
                                    {resource.fileType?.toUpperCase() || 'EXAM'}
                                </span>
                            </div>
                            <h4 className="font-semibold text-slate-800 line-clamp-2 mb-1 relative z-10" title={resource.name}>{resource.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 relative z-10">
                                <Calendar size={12} /> {new Date(resource.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <button
                            onClick={() => setPreviewDoc(resource)}
                            className="w-full py-2.5 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium shadow-md shadow-primary-200"
                        >
                            <Eye size={16} /> View Securely
                        </button>
                    </div>
                ))}
            </div>

            {/* SECURE MODAL */}
            {previewDoc && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <div className="bg-white w-full max-w-[98vw] h-[98vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 select-none">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Lock size={16} className="text-red-500" />
                                Secure Exam Viewer
                            </h3>
                            <button
                                onClick={() => setPreviewDoc(null)}
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Viewer Container */}
                        <div className="flex-1 bg-slate-900 relative overflow-hidden select-none flex flex-col items-center justify-center">

                            {/* SECURITY CURTAIN - Show if triggered */}
                            {isSecurityTriggered && (
                                <div className="absolute inset-0 z-[1000] bg-black flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in duration-75">
                                    <AlertTriangle size={64} className="text-red-500 mb-6" />
                                    <h2 className="text-3xl font-bold mb-4 text-red-500">Security Violation Detected</h2>
                                    <p className="max-w-md text-slate-300 mb-8 text-lg">
                                        We detected a screenshot attempt or window focus loss. content is hidden to protect exam integrity.
                                    </p>
                                    <button
                                        onClick={resumeViewing}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg hover:shadow-red-500/30"
                                    >
                                        Resume Viewing
                                    </button>
                                </div>
                            )}

                            {/* Warning Banner */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] bg-slate-800/80 text-white border border-slate-700 px-6 py-2 rounded-full text-xs font-mono pointer-events-none shadow-lg backdrop-blur-sm">
                                PROTECTED VIEW • {user?.name?.toUpperCase()}
                            </div>

                            <div
                                ref={contentRef}
                                className={`w-full h-full flex items-center justify-center relative z-10 p-4 transition-none`}
                            >
                                {isImage(previewDoc.fileUrl) ? (
                                    <img
                                        src={fixImageUrl(previewDoc.fileUrl)}
                                        alt="Secure Content"
                                        className="max-w-full max-h-full object-contain pointer-events-none select-none shadow-2xl"
                                        onDragStart={(e) => e.preventDefault()}
                                    />
                                ) : (
                                    // IFRAME
                                    <iframe
                                        src={`${fixImageUrl(previewDoc.fileUrl)}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="w-full h-full border-0 bg-white shadow-2xl"
                                        title="Exam Question"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
