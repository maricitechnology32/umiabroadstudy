import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingDocuments, updateDocumentStatus, verifyUploadDocument, clearDocumentState } from '../../features/documents/documentSlice';
import { FileText, CheckCircle, XCircle, Printer, Upload, Loader2, Eye, ExternalLink } from 'lucide-react';
import Button from '../ui/Button'; // Assuming these exist
import Modal from '../ui/Modal';  // Assuming these exist
import { toast } from 'react-toastify';

export default function DocumentVerificationManager() {
    const dispatch = useDispatch();
    const { pendingDocuments, isLoading, error, successMessage } = useSelector((state) => state.documents);
    const { user } = useSelector((state) => state.auth);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'history'

    // Permission Check
    // Admin/Manager: Can Verify/Reject
    // Receptionist/Staff: Can Print/Upload
    const canVerify = ['consultancy_admin', 'manager'].includes(user?.role) || ['manager'].includes(user?.subRole);
    const canUpload = ['consultancy_admin', 'consultancy_staff', 'counselor'].includes(user?.role); // Broad access for upload

    useEffect(() => {
        if (viewMode === 'pending') {
            dispatch(fetchPendingDocuments('Draft,Pending Verification'));
        } else {
            dispatch(fetchPendingDocuments('Verified,Rejected'));
        }
    }, [dispatch, viewMode]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage);
            dispatch(clearDocumentState());
            setUploadModalOpen(false);
            setUploadFile(null);
            // Refresh current view
            if (viewMode === 'pending') {
                dispatch(fetchPendingDocuments('Draft,Pending Verification'));
            } else {
                dispatch(fetchPendingDocuments('Verified,Rejected'));
            }
        }
        if (error) {
            toast.error(error);
            dispatch(clearDocumentState());
        }
    }, [successMessage, error, dispatch, viewMode]);

    const handlePrint = (url) => {
        // Just open the original URL in new tab for printing
        window.open(url, '_blank');
    };

    const handleOpenUpload = (doc) => {
        setSelectedDoc(doc);
        setUploadModalOpen(true);
    };

    const handleUploadSubmit = () => {
        if (!uploadFile) return toast.error("Please select a file");
        dispatch(verifyUploadDocument({
            studentId: selectedDoc.studentId,
            docId: selectedDoc._id,
            file: uploadFile
        }));
    };

    const handleVerification = (doc, status) => {
        if (window.confirm(`Are you sure you want to ${status} this document?`)) {
            dispatch(updateDocumentStatus({
                studentId: doc.studentId,
                docId: doc._id,
                status
            }));
        }
    };

    if (isLoading && pendingDocuments.length === 0) {
        return <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2" />Loading documents...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Document Verification Queue</h2>
                    <p className="text-slate-500 text-sm">Manage document printing, signing, and verification.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'pending' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setViewMode('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'history' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setViewMode('history')}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Document Type</th>
                            <th className="px-6 py-4">University</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pendingDocuments.map((doc) => (
                            <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                        {doc.studentName?.charAt(0)}
                                    </div>
                                    {doc.studentName}
                                </td>
                                <td className="px-6 py-4">{doc.type}</td>
                                <td className="px-6 py-4 text-slate-500">{doc.universityId?.name || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${doc.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                        doc.status === 'Pending Verification' ? 'bg-orange-100 text-orange-700' :
                                            'bg-slate-100'
                                        }`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {/* Actions for Receptionist/Staff (Draft -> Upload) */}
                                    {doc.status === 'Draft' && canUpload && (
                                        <>
                                            <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => handlePrint(doc.originalUrl)}>
                                                <Printer size={16} className="mr-1" /> Print
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => handleOpenUpload(doc)}>
                                                <Upload size={16} className="mr-1" /> Upload Signed
                                            </Button>
                                        </>
                                    )}

                                    {/* Actions for Admin (Pending Verification -> Verify) */}
                                    {doc.status === 'Pending Verification' && (
                                        <>
                                            <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => handlePrint(doc.verifiedUrl)}>
                                                <Eye size={16} className="mr-1" /> View Upload
                                            </Button>
                                            {canVerify && (
                                                <>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleVerification(doc, 'Verified')}>
                                                        <CheckCircle size={16} className="mr-1" /> Verify
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleVerification(doc, 'Rejected')}>
                                                        <XCircle size={16} />
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {pendingDocuments.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                    <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                                    No documents pending verification.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Upload Modal */}
            <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Signed Document">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Please upload the scanned copy of the signed <strong>{selectedDoc?.type}</strong> for <strong>{selectedDoc?.studentName}</strong>.
                    </p>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                        <input
                            type="file"
                            accept="application/pdf,image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                        {uploadFile ? (
                            <div className="text-emerald-600 font-medium flex flex-col items-center">
                                <FileText size={32} className="mb-2" />
                                {uploadFile.name}
                            </div>
                        ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                                <Upload size={32} className="mb-2" />
                                Click or Drag to upload PDF/Image
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUploadSubmit} disabled={!uploadFile}>Upload & Submit</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
