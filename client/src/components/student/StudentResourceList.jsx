import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResources, resourceAdded } from '../../features/resources/resourceSlice';
import { FileText, Download, Loader2, Calendar, Clock, Eye } from 'lucide-react';
import io from 'socket.io-client';
import Modal from '../ui/Modal';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
// Initialize outside to prevent reconnections, though inside useEffect is safer for auth-based logic if needed.
// But here we need to join room based on consultancy. NotificationBell handles joining rooms globally.
// If NotificationBell joins `consultancy_ID`, we can just listen here.
const socket = io.connect(SOCKET_URL);

export default function StudentResourceList() {
    const dispatch = useDispatch();
    const { resources, isLoading } = useSelector((state) => state.resources);
    const { user } = useSelector((state) => state.auth);

    const [previewDoc, setPreviewDoc] = useState(null);

    // Helper to determine type
    const isImage = (url) => url.match(/\.(jpeg|jpg|gif|png|webp)$/i);

    useEffect(() => {
        dispatch(getResources());
    }, [dispatch]);

    // Listener for real-time list updates
    useEffect(() => {
        if (!user) return;

        // Note: Joining room is handled by NotificationBell largely, 
        // but to be safe/independent, we can emit join here too if we have consultancyId.
        // However, standard socket logic allows joining multiple times or just checking.
        // If NotificationBell is mounted (which it is in layout), we are good.
        // To be safe, let's just listen.

        socket.on('new_resource', (newResource) => {
            dispatch(resourceAdded(newResource));
        });

        return () => {
            socket.off('new_resource');
        };
    }, [dispatch, user]);

    if (isLoading && resources.length === 0) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary-600" /></div>;
    }

    if (resources.length === 0) {
        return (
            <div className="text-center py-6 text-slate-500 bg-white rounded-xl border border-blue-100">
                <FileText size={32} className="mx-auto mb-2 opacity-50 text-blue-400" />
                <p>No resources shared by consultancy yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                    <div key={resource._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                    <FileText size={20} />
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
                                    {resource.fileType?.toUpperCase() || 'DOC'}
                                </span>
                            </div>
                            <h4 className="font-semibold text-slate-800 line-clamp-2 mb-1" title={resource.name}>{resource.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                <Calendar size={12} /> {new Date(resource.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto pt-2">
                            <button
                                onClick={() => setPreviewDoc(resource)}
                                className="flex-1 py-2 flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium"
                            >
                                <Eye size={16} /> Preview
                            </button>
                            <a
                                href={resource.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium"
                            >
                                <Download size={16} /> Download
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                title={previewDoc?.name || 'Document Preview'}
                size="full"
            >
                {previewDoc && (
                    <div className="w-full h-full min-h-[70vh] flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden">
                        {isImage(previewDoc.fileUrl) ? (
                            <img
                                src={previewDoc.fileUrl}
                                alt={previewDoc.name}
                                className="max-w-full max-h-[80vh] object-contain"
                            />
                        ) : previewDoc.fileUrl.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                            /* Microsoft Office Viewer */
                            window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (
                                <div className="text-center p-8 text-slate-500">
                                    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Detailed Preview Unavailable on Localhost</h3>
                                    <p className="mb-4 max-w-sm mx-auto">
                                        Microsoft Office Viewer cannot access files on your local computer.
                                        This feature will work automatically when you host your website.
                                    </p>
                                    <a
                                        href={previewDoc.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                                    >
                                        <Download size={16} /> Download Instead
                                    </a>
                                </div>
                            ) : (
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDoc.fileUrl)}`}
                                    className="w-full h-[80vh] border-0"
                                    title="Office Document Preview"
                                />
                            )
                        ) : (
                            /* Fallback: Native Viewer (PDF, Text, etc.) */
                            <iframe
                                src={previewDoc.fileUrl}
                                className="w-full h-[80vh] border-0"
                                title="Document Preview"
                            />
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
