import {
    ArrowLeft, Award, Building2,
    Calendar,
    CalendarDays,
    Camera,
    CheckCircle,
    ClipboardCheck,
    DollarSign,
    Eye,
    FileCheck,
    FileText,
    Download,
    Globe,
    Loader2,
    Mail,
    MapPin,
    Mic,
    PenTool,
    Phone,
    Plus,
    Printer,
    Save,
    ShieldCheck,
    Trash2,
    Upload,
    User,
    Users,
    X,
    XCircle,
    ChevronRight,
    BookOpen,
    Bell
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bsToAd } from '@sbmdkl/nepali-date-converter';
import { clearCurrentProfile, getMyProfile, getStudentById, reset, updateProfile, updateStudentStatus } from '../../features/students/studentSlice';
import api from '../../utils/api';
import SEO from '../../components/common/SEO';

// Import Generator Modals
import AnnualIncomeVerificationModal from '../../components/generators/AnnualIncomeVerificationModal';
import DateOfBirthVerificationModal from '../../components/generators/DateOfBirthVerificationModal';
import OccupationVerificationModal from '../../components/generators/OccupationVerificationModal';
import RelationshipVerificationModal from '../../components/generators/RelationshipVerificationModal';
import SurnameVerificationModal from '../../components/generators/SurnameVerificationModal';
import TaxClearanceVerificationModal from '../../components/generators/TaxClearanceVerificationModal';
import DateOfBirthVerificationMarriedModal from '../../components/generators/DateOfBirthVerificationMarriedModal';
import RelationshipVerificationMarriedModal from '../../components/generators/RelationshipVerificationMarriedModal';
import LanguageCertificateModal from '../../components/generators/LanguageCertificateModal';
import CharacterCertificateModal from '../../components/generators/CharacterCertificateModal';
import NepalAddressSelector from '../../components/common/NepalAddressSelector';

// Import University Component
import BankStatementGeneratorModal from '../../components/generators/BankStatementGeneratorModal';
import JapaneseInterview from '../../components/student/JapaneseInterview';
import SopWritingAssistant from '../../components/student/SopWritingAssistant';
import StudentEventCalendar from '../../components/student/StudentEventCalendar';
import UniversityApplications from '../../components/student/UniversityApplications';
import StudentResourceList from '../../components/student/StudentResourceList';
import StudentExamList from '../../components/student/StudentExamList';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function StudentProfile() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentProfile, isLoading, isSuccess, message } = useSelector((state) => state.students);
    const { user } = useSelector((state) => state.auth);

    const isAdminView = !!studentId;

    // --- PERMISSIONS ---
    const role = user?.role;
    const subRole = user?.subRole;

    const canGenerateDocs =
        role === 'consultancy_admin' ||
        subRole === 'manager' ||
        subRole === 'document_officer' ||
        subRole === 'counselor';

    const canManageUnis =
        role === 'consultancy_admin' ||
        subRole === 'manager' ||
        subRole === 'counselor';

    const canViewApplications = true;

    const canChangeStatus =
        role === 'consultancy_admin' ||
        subRole === 'manager' ||
        subRole === 'document_officer';

    const [activeTab, setActiveTab] = useState(role === 'student' ? 'sop' : 'personal');

    const isStudent = role === 'student';

    // Form Data State
    const [formData, setFormData] = useState({
        personalInfo: { title: 'Mr.', firstName: '', lastName: '', gender: 'Male', dobAD: '', dobBS: '', email: '', phone: '', citizenshipNo: '', citizenshipDistrict: '', citizenshipDate: '', passportNo: '', passportExpiry: '', passportIssuePlace: '', photoUrl: '' },
        address: { municipality: '', wardNo: '', district: '', province: '', tole: '' },
        familyInfo: { fatherName: '', motherName: '', grandfatherName: '', spouseName: '', relatives: [] },
        academics: [],
        financialInfo: { incomeSources: [], fiscalYears: [], exchangeRate: 134, sponsor: '' },
        documents: { other: [] },
        visaDetails: { japaneseLanguage: {}, education: {}, intake: '' }
    });


    // UI States
    const [newDocTitle, setNewDocTitle] = useState('');
    const [isAddingDoc, setIsAddingDoc] = useState(false);

    // Generator Modal States
    const [showSurnameModal, setShowSurnameModal] = useState(false);
    const [showDobModal, setShowDobModal] = useState(false);
    const [showRelationModal, setShowRelationModal] = useState(false);
    const [showOccupationModal, setShowOccupationModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showBankStatementModal, setshowBankStatementModal] = useState(false);
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [showDobMarriedModal, setShowDobMarriedModal] = useState(false);
    const [showRelationMarriedModal, setShowRelationMarriedModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showCharacterModal, setShowCharacterModal] = useState(false);

    // --- 1. INITIALIZATION ---
    useEffect(() => {
        if (isAdminView) {
            dispatch(getStudentById(studentId));
        } else {
            dispatch(getMyProfile());
        }

        return () => {
            dispatch(reset());
            dispatch(clearCurrentProfile());
        };
    }, [dispatch, studentId, isAdminView]);

    // --- 2. SYNC STATE ---
    useEffect(() => {
        if (currentProfile) {
            setFormData(prev => ({
                ...prev,
                ...currentProfile,
                personalInfo: { ...prev.personalInfo, ...currentProfile.personalInfo },
                address: { ...prev.address, ...currentProfile.address },
                familyInfo: { ...prev.familyInfo, ...currentProfile.familyInfo },
                academics: currentProfile.academics || [],
                financialInfo: { ...prev.financialInfo, ...currentProfile.financialInfo },
                documents: {
                    ...currentProfile.documents,
                    other: currentProfile.documents?.other || []
                },
                visaDetails: currentProfile.visaDetails || {}
            }));
        }
    }, [currentProfile]);

    // --- 3. ALERTS ---
    useEffect(() => {
        if (isSuccess && message) toast.success(message);
        if (isSuccess) dispatch(reset());
    }, [isSuccess, message, dispatch]);

    // --- HANDLERS ---
    const handleSave = () => {
        if (!currentProfile?._id) return;
        dispatch(updateProfile({ id: currentProfile._id, data: formData }));
    };

    const handleStatusChange = (newStatus) => {
        if (window.confirm(`Change status to ${newStatus}?`)) {
            dispatch(updateStudentStatus({ id: currentProfile._id, status: newStatus }));
        }
    };

    const updateField = (section, field, value, entireObject = null) => {
        if (entireObject) {
            setFormData(prev => ({ ...prev, [section]: entireObject }));
        } else {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        }
    };

    // --- ACADEMIC HELPERS ---
    const addAcademicRow = () => {
        setFormData(prev => ({
            ...prev,
            academics: [...prev.academics, { level: '', institution: '', passedYear: '', grade: '' }]
        }));
    };

    const updateAcademicRow = (index, field, value) => {
        const newList = [...formData.academics];
        newList[index][field] = value;
        setFormData(prev => ({ ...prev, academics: newList }));
    };

    const removeAcademicRow = (index) => {
        const newList = formData.academics.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, academics: newList }));
    };

    // --- DOCUMENT HELPERS ---
    const handleDocumentUpdate = async (fieldKey, url) => {
        const updatedDocuments = { ...formData.documents, [fieldKey]: url };
        setFormData(prev => ({ ...prev, documents: updatedDocuments }));

        try {
            await dispatch(updateProfile({ id: currentProfile._id, data: { ...formData, documents: updatedDocuments } })).unwrap();
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Document uploaded but failed to save.");
        }
    };

    // --- DYNAMIC DOCUMENTS ---
    const handleAddDynamicDoc = async () => {
        if (!newDocTitle.trim()) return toast.error("Please enter a document title");

        const newDoc = { title: newDocTitle, url: '' };
        const updatedOtherDocs = [...(formData.documents.other || []), newDoc];
        const updatedDocuments = { ...formData.documents, other: updatedOtherDocs };

        setFormData(prev => ({ ...prev, documents: updatedDocuments }));
        setNewDocTitle('');
        setIsAddingDoc(false);

        try {
            await dispatch(updateProfile({ id: currentProfile._id, data: { ...formData, documents: updatedDocuments } })).unwrap();
            toast.success("Document slot added!");
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save new document slot.");
        }
    };

    const handleDynamicDocUpload = async (index, url) => {
        const updatedOtherDocs = formData.documents.other.map((doc, i) => i === index ? { ...doc, url: url } : doc);
        const updatedDocuments = { ...formData.documents, other: updatedOtherDocs };
        setFormData(prev => ({ ...prev, documents: updatedDocuments }));

        try {
            await dispatch(updateProfile({ id: currentProfile._id, data: { ...formData, documents: updatedDocuments } })).unwrap();
        } catch (error) {
            console.error("Save failed", error);
        }
    };

    const removeDynamicDoc = async (index) => {
        const updatedOtherDocs = formData.documents.other.filter((_, i) => i !== index);
        const updatedDocuments = { ...formData.documents, other: updatedOtherDocs };
        setFormData(prev => ({ ...prev, documents: updatedDocuments }));

        try {
            await dispatch(updateProfile({ id: currentProfile._id, data: { ...formData, documents: updatedDocuments } })).unwrap();
            toast.success("Document removed.");
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    // --- PROFILE PHOTO ---
    const handleProfilePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const toastId = toast.loading("Uploading photo...");
            const res = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newPhotoUrl = res.data.url;
            updateField('personalInfo', 'photoUrl', newPhotoUrl);

            const updatedProfileData = { ...formData, personalInfo: { ...formData.personalInfo, photoUrl: newPhotoUrl } };
            await dispatch(updateProfile({ id: currentProfile._id, data: updatedProfileData })).unwrap();
            toast.dismiss(toastId);
            toast.success("Profile photo saved!");
        } catch (error) {
            toast.dismiss();
            toast.error("Photo upload failed");
        }
    };

    if (!currentProfile && isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-50">
            <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full"></div>
                <Loader2 className="animate-spin text-primary-600 mb-4 relative z-10" size={48} />
            </div>
            <span className="text-slate-600 font-semibold text-lg mt-4">Loading Profile...</span>
            <span className="text-slate-400 text-sm mt-1">Please wait</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 pb-24 font-sans text-slate-900 overflow-x-hidden">
            <SEO
                title={`${formData.personalInfo.firstName || 'Student'} ${formData.personalInfo.lastName} | Profile`}
                description="Student profile management."
                noIndex={true}
            />

            {/* TOP NAVIGATION */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isAdminView && (
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="mb-6"
                    >
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Button>
                )}

                {/* PROFILE HEADER */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-200">

                    {/* Profile Content */}
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                        <div className="flex flex-col gap-4 sm:gap-6">

                            {/* Avatar & Info - Stack on mobile, row on larger */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-2xl bg-white p-1.5 sm:p-2 shadow-md border-2 border-white">
                                        <div className="h-full w-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                                            {formData.personalInfo.photoUrl ? (
                                                <img src={formData.personalInfo.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                                            ) : <User size={36} className="text-slate-400 sm:w-12 sm:h-12" />}
                                        </div>
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-slate-800 text-white p-2 sm:p-2.5 rounded-xl cursor-pointer shadow-md hover:bg-primary-600 transition-colors">
                                        <Camera size={14} className="sm:w-4 sm:h-4" />
                                        <input type="file" hidden accept="image/*" onChange={handleProfilePhotoUpload} />
                                    </label>
                                </div>

                                {/* Name & Badges */}
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight truncate">
                                        {formData.personalInfo.firstName || 'Student'} {formData.personalInfo.lastName}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 sm:mt-3">
                                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border
                                            ${isAdminView ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-primary-700 border-primary-200'}`}>
                                            <ShieldCheck size={10} className="sm:w-3 sm:h-3" />
                                            {isAdminView ? 'Admin' : 'Applicant'}
                                        </span>
                                        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-slate-600 text-xs">
                                            <Globe size={12} className="text-primary-600" />
                                            {formData.address.district || 'Nepal'}
                                        </span>
                                    </div>
                                </div>

                                {/* Status & Save - Row on mobile */}
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
                                    {/* Status Badge */}
                                    <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-sm
                                        ${currentProfile?.profileStatus === 'verified' ? 'bg-primary-50 border-primary-200 text-primary-700' :
                                            currentProfile?.profileStatus === 'lead' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full 
                                            ${currentProfile?.profileStatus === 'verified' ? 'bg-primary-600' : 'bg-amber-600'}`}></span>
                                        {currentProfile?.profileStatus}
                                    </div>

                                    {/* Save Button */}
                                    {!isStudent && (
                                        <Button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            isLoading={isLoading}
                                            size="sm"
                                            className="text-xs sm:text-sm"
                                        >
                                            <Save size={14} className="mr-1 sm:mr-2 sm:w-[18px] sm:h-[18px]" />
                                            <span className="hidden sm:inline">Save</span>
                                            <span className="sm:hidden">Save</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions Bar */}
                    {isAdminView && canChangeStatus && (
                        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200">
                            <div className="flex flex-wrap gap-3 items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 w-full sm:w-auto mb-2 sm:mb-0">Workflow Actions:</span>
                                {currentProfile?.profileStatus === 'lead' && (
                                    <>
                                        <button onClick={() => handleStatusChange('rejected')} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition shadow-sm">
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button onClick={() => handleStatusChange('draft')} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-purple-600 bg-white border border-purple-200 hover:bg-purple-50 rounded-lg flex items-center justify-center gap-2 transition shadow-sm">
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    </>
                                )}
                                {currentProfile?.profileStatus === 'draft' && (
                                    <button onClick={() => handleStatusChange('verified')} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-primary-600 bg-white border border-primary-200 hover:bg-primary-50 rounded-lg flex items-center justify-center gap-2 transition shadow-sm">
                                        <CheckCircle size={14} /> Verify & Lock
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* STICKY TABS */}
            <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm mb-8 transition-all">
                <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 relative">
                    {/* Scroll indicator gradients for mobile */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10 sm:hidden"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10 sm:hidden"></div>

                    <div className="flex overflow-x-auto hide-scrollbar gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-secondary-100/50 rounded-xl sm:rounded-2xl border border-secondary-200/60" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {/* Small spacer for left indicator on mobile */}
                        <div className="shrink-0 w-2 sm:hidden"></div>

                        {!isStudent && [
                            { id: 'personal', label: 'Personal', icon: <User size={14} /> },
                            { id: 'address', label: 'Address', icon: <MapPin size={14} /> },
                            { id: 'family', label: 'Family', icon: <User size={14} /> },
                            { id: 'academics', label: 'Academics', icon: <Award size={14} /> },
                            { id: 'financial', label: 'Financial', icon: <DollarSign size={14} /> },
                        ].map(tab => (
                            <TabButton key={tab.id} {...tab} active={activeTab} set={setActiveTab} />
                        ))}

                        <TabButton id="uploads" label="My Uploads" icon={<Upload size={14} />} active={activeTab} set={setActiveTab} />

                        <TabButton id="documents" label="Notices & Routines" icon={<Bell size={14} />} active={activeTab} set={setActiveTab} />

                        <TabButton id="exams" label="Exams" icon={<BookOpen size={14} />} active={activeTab} set={setActiveTab} color="purple" />

                        {!isStudent && (
                            <>
                                <div className="w-px h-6 bg-secondary-300 self-center mx-1 sm:mx-2 hidden sm:block opacity-30 shrink-0"></div>
                                <TabButton id="review" label="Review" icon={<ClipboardCheck size={14} />} active={activeTab} set={setActiveTab} />
                            </>
                        )}

                        {canViewApplications && !isStudent && (
                            <TabButton id="applications" label="Apps" icon={<Building2 size={14} />} active={activeTab} set={setActiveTab} highlight />
                        )}

                        {isAdminView && canGenerateDocs && (
                            <TabButton id="generate" label="Gen" icon={<Printer size={14} />} active={activeTab} set={setActiveTab} color="purple" />
                        )}

                        <TabButton id="sop" label="SOP" icon={<PenTool size={14} />} active={activeTab} set={setActiveTab} color="purple" />
                        <TabButton id="interview" label="AI" icon={<Mic size={14} />} active={activeTab} set={setActiveTab} color="red" />
                        <TabButton id="events" label="Events" icon={<CalendarDays size={14} />} active={activeTab} set={setActiveTab} color="green" />

                        {/* Spacer to ensure last tab is visible when scrolled */}
                        <div className="shrink-0 w-4"></div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="min-h-[600px] pb-12">

                    {/* PERSONAL TAB */}
                    {activeTab === 'personal' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SectionHeader title="Basic Identity" subtitle="Ensure these details match the passport exactly." icon={<User className="text-primary-600" />} />

                            <Card className="p-6 sm:p-8 rounded-2xl shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-2">
                                        <Select label="Title" value={formData.personalInfo.title} onChange={(e) => updateField('personalInfo', 'title', e.target.value)}>
                                            <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-4"><Input label="First Name" value={formData.personalInfo.firstName} onChange={(e) => updateField('personalInfo', 'firstName', e.target.value)} /></div>
                                    <div className="md:col-span-4"><Input label="Last Name" value={formData.personalInfo.lastName} onChange={(e) => updateField('personalInfo', 'lastName', e.target.value)} /></div>
                                    <div className="md:col-span-2">
                                        <Select label="Gender" value={formData.personalInfo.gender} onChange={(e) => updateField('personalInfo', 'gender', e.target.value)}>
                                            <option>Male</option><option>Female</option><option>Other</option>
                                        </Select>
                                    </div>

                                    <div className="md:col-span-6">
                                        <Input
                                            label="Date of Birth (BS)"
                                            placeholder="YYYY/MM/DD"
                                            value={formData.personalInfo.dobBS}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateField('personalInfo', 'dobBS', val);

                                                // Attempt auto-conversion if valid length
                                                // Matches YYYY/MM/DD or YYYY-MM-DD
                                                if (val.match(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/)) {
                                                    try {
                                                        const standardized = val.replace(/\//g, '-');
                                                        const adDateStr = bsToAd(standardized);
                                                        updateField('personalInfo', 'dobAD', adDateStr);
                                                    } catch (err) {
                                                        console.log("Date conversion error", err);
                                                    }
                                                }
                                            }}
                                            leftIcon={<Calendar size={16} />}
                                        />
                                    </div>
                                    <div className="md:col-span-6"><Input label="Date of Birth (AD)" type="date" value={formData.personalInfo.dobAD ? formData.personalInfo.dobAD.split('T')[0] : ''} onChange={(e) => updateField('personalInfo', 'dobAD', e.target.value)} leftIcon={<Calendar size={16} />} /></div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <InfoCard title="Citizenship Details" icon={FileText} color="primary">
                                    <div className="space-y-5">
                                        <Input label="Citizenship No." value={formData.personalInfo.citizenshipNo} onChange={(e) => updateField('personalInfo', 'citizenshipNo', e.target.value)} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <Input label="Issue District" value={formData.personalInfo.citizenshipDistrict} onChange={(e) => updateField('personalInfo', 'citizenshipDistrict', e.target.value)} />
                                            <Input label="Issue Date (BS)" value={formData.personalInfo.citizenshipDate} onChange={(e) => updateField('personalInfo', 'citizenshipDate', e.target.value)} />
                                        </div>
                                    </div>
                                </InfoCard>

                                <InfoCard title="Passport Details" icon={Globe} color="primary">
                                    <div className="space-y-5">
                                        <Input label="Passport No." value={formData.personalInfo.passportNo} onChange={(e) => updateField('personalInfo', 'passportNo', e.target.value)} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <Input label="Issue Place" value={formData.personalInfo.passportIssuePlace} onChange={(e) => updateField('personalInfo', 'passportIssuePlace', e.target.value)} />
                                            <Input label="Expiry Date (AD)" type="date" value={formData.personalInfo.passportExpiry ? formData.personalInfo.passportExpiry.split('T')[0] : ''} onChange={(e) => updateField('personalInfo', 'passportExpiry', e.target.value)} />
                                        </div>
                                    </div>
                                </InfoCard>
                            </div>
                        </div>
                    )}

                    {/* ADDRESS TAB */}
                    {activeTab === 'address' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SectionHeader title="Permanent Address" subtitle="This address will appear on all generated legal documents." icon={<MapPin className="text-primary-600" />} />
                            <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                <NepalAddressSelector
                                    value={formData.address}
                                    onChange={(newAddress) => updateField('address', null, null, newAddress)}
                                    disabled={isLoading}
                                />
                            </Card>
                        </div>
                    )}

                    {/* FAMILY TAB */}
                    {activeTab === 'family' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SectionHeader title="Family Information" subtitle="Required for Birth, Relationship, and Income Verification docs." icon={<User className="text-primary-600" />} />
                            <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input label="Father's Full Name" value={formData.familyInfo.fatherName} onChange={(e) => updateField('familyInfo', 'fatherName', e.target.value)} />
                                    <Input label="Mother's Full Name" value={formData.familyInfo.motherName} onChange={(e) => updateField('familyInfo', 'motherName', e.target.value)} />
                                    <Input label="Grandfather's Full Name" value={formData.familyInfo.grandfatherName} onChange={(e) => updateField('familyInfo', 'grandfatherName', e.target.value)} />
                                    <Input label="Spouse Name (Optional)" value={formData.familyInfo.spouseName} onChange={(e) => updateField('familyInfo', 'spouseName', e.target.value)} />
                                    <Input label="Father-in-Law Name (Optional)" value={formData.familyInfo.fatherInLawName} onChange={(e) => updateField('familyInfo', 'fatherInLawName', e.target.value)} />
                                    <Input label="Mother-in-Law Name (Optional)" value={formData.familyInfo.motherInLawName} onChange={(e) => updateField('familyInfo', 'motherInLawName', e.target.value)} />
                                </div>
                            </Card>
                        </div>
                    )
                    }

                    {/* ACADEMICS TAB */}
                    {
                        activeTab === 'academics' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-end">
                                    <SectionHeader title="Academic History" subtitle="List qualifications in descending order (Masters -> Bachelors -> +2)." icon={<Award className="text-primary-600" />} />
                                    <Button onClick={addAcademicRow} className="flex items-center gap-2">
                                        <Plus size={16} /> Add Qualification
                                    </Button>
                                </div>

                                <Card className="p-8 rounded-2xl shadow-sm space-y-6">
                                    {formData.academics.length === 0 && (
                                        <div className="text-center py-16 text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                                <FileText size={24} className="text-slate-300" />
                                            </div>
                                            <p className="font-semibold text-lg">No academic records added yet.</p>
                                            <p className="text-sm mt-1">Click "Add Qualification" to start.</p>
                                        </div>
                                    )}
                                    {formData.academics.map((row, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-6 rounded-xl border border-slate-200 relative group transition-all hover:border-primary-300 hover:shadow-sm">
                                            <div className="md:col-span-3"><Input label="Level" placeholder="e.g. +2, Bachelor" value={row.level} onChange={(e) => updateAcademicRow(index, 'level', e.target.value)} /></div>
                                            <div className="md:col-span-5"><Input label="Institution" placeholder="School/College Name" value={row.institution} onChange={(e) => updateAcademicRow(index, 'institution', e.target.value)} /></div>
                                            <div className="md:col-span-2"><Input label="Year" placeholder="Passed Year" value={row.passedYear} onChange={(e) => updateAcademicRow(index, 'passedYear', e.target.value)} /></div>
                                            <div className="md:col-span-1"><Input label="GPA/%" value={row.grade} onChange={(e) => updateAcademicRow(index, 'grade', e.target.value)} /></div>
                                            <div className="md:col-span-1 flex justify-end pb-2">
                                                <Button variant="danger" size="icon" onClick={() => removeAcademicRow(index)} className="h-10 w-10">
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </div >
                        )
                    }

                    {/* FINANCIAL TAB */}
                    {
                        activeTab === 'financial' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="Financial Status" subtitle="Data for Annual Income & Tax Clearance." icon={<DollarSign className="text-primary-600" />} />
                                <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                    <div className="max-w-md">
                                        <Input label="Current Exchange Rate (1 USD = ? NPR)" type="number" value={formData.financialInfo.exchangeRate} onChange={(e) => updateField('financialInfo', 'exchangeRate', e.target.value)} />
                                    </div>
                                    <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl flex gap-4 text-amber-800 text-sm items-start">
                                        <div className="p-2 bg-amber-100 rounded-full shrink-0"><CheckCircle size={16} /></div>
                                        <div>
                                            <p className="font-bold mb-1">Important Note</p>
                                            <p className="leading-relaxed">Income source details are handled via the "Annual Income" generator in the Generators tab. Please consult with the document officer.</p>
                                        </div>
                                    </div>
                                </Card>
                            </div >
                        )
                    }

                    {/* NOTICES & ROUTINES TAB (Formerly Documents) */}
                    {
                        activeTab === 'documents' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="Notices & Routines" subtitle="Important updates, exam schedules, and resources from your consultancy." icon={<Bell className="text-primary-600" />} />

                                {/* Resource Downloads (From Consultancy) */}
                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-8">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Bell className="text-blue-600" size={20} /> Latest Updates
                                    </h3>
                                    <StudentResourceList />
                                </div>
                            </div>
                        )
                    }

                    {/* EXAMS TAB */}
                    {
                        activeTab === 'exams' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="Exam Center" subtitle="View your exam questions securely. strict no-download policy active." icon={<BookOpen className="text-purple-600" />} />
                                <StudentExamList />
                            </div>
                        )
                    }

                    {/* NEW TAB FOR STUDENT UPLOADS (Moving student uploads to a separate 'Uploads' tab to satisfy request "not the students document") */}
                    {
                        activeTab === 'uploads' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="My Documents" subtitle="Upload and manage your personal documents." icon={<Upload className="text-primary-600" />} />

                                <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
                                        <div className="p-2 bg-primary-100 rounded-xl"><CheckCircle size={20} className="text-primary-600" /></div>
                                        Your Uploads (Mandatory)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        <DocumentUploadCard title="Citizenship (Front)" fieldKey="citizenshipFront" existingUrl={formData.documents?.citizenshipFront} onUpload={handleDocumentUpdate} />
                                        <DocumentUploadCard title="Citizenship (Back)" fieldKey="citizenshipBack" existingUrl={formData.documents?.citizenshipBack} onUpload={handleDocumentUpdate} />
                                        <DocumentUploadCard title="Passport (Bio Page)" fieldKey="passportBio" existingUrl={formData.documents?.passportBio} onUpload={handleDocumentUpdate} />
                                        <DocumentUploadCard title="SLC/SEE Marksheet" fieldKey="slcMarksheet" existingUrl={formData.documents?.slcMarksheet} onUpload={handleDocumentUpdate} />
                                        <DocumentUploadCard title="SLC/SEE Character" fieldKey="slcCharacter" existingUrl={formData.documents?.slcCharacter} onUpload={handleDocumentUpdate} />
                                        <DocumentUploadCard title="+2 Transcript" fieldKey="plus2Transcript" existingUrl={formData.documents?.plus2Transcript} onUpload={handleDocumentUpdate} />
                                    </div>
                                </Card>

                                <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                                            <div className="p-2 bg-primary-100 rounded-xl"><Plus size={20} className="text-blue-600" /></div>
                                            Additional Uploads
                                        </h3>
                                        {!isAddingDoc && (
                                            <Button size="sm" variant="secondary" onClick={() => setIsAddingDoc(true)} className="flex items-center gap-2">
                                                <Plus size={14} /> Add Slot
                                            </Button>
                                        )}
                                    </div>

                                    {isAddingDoc && (
                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex flex-col sm:flex-row gap-4 items-end max-w-2xl">
                                                <div className="flex-1 w-full">
                                                    <Input label="Document Title" placeholder="e.g. Work Experience Letter" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} />
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button onClick={handleAddDynamicDoc}>Confirm</Button>
                                                    <Button variant="outline" onClick={() => setIsAddingDoc(false)}>Cancel</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {formData.documents?.other?.map((doc, index) => (
                                            <div key={index} className="relative group">
                                                <DocumentUploadCard title={doc.title} fieldKey={`other-${index}`} existingUrl={doc.url} onUpload={(key, url) => handleDynamicDocUpload(index, url)} />
                                                <div className="absolute -top-3 -right-3">
                                                    <Button variant="danger" size="icon" onClick={() => removeDynamicDoc(index)} className="h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div >
                        )
                    }

                    {/* REVIEW TAB */}
                    {
                        activeTab === 'review' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="Profile Review" subtitle="Quick glance summary." icon={<ClipboardCheck className="text-primary-600" />} />
                                <div className="grid grid-cols-1 gap-8">
                                    {/* Personal & Identity */}
                                    <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                        <h3 className="font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                            <FileCheck className="text-primary-600" size={20} /> Personal & Identity Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                            <ReviewItem label="Full Name" value={`${formData.personalInfo.title} ${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`} icon={<User size={16} />} />
                                            <ReviewItem label="Gender" value={formData.personalInfo.gender} icon={<User size={16} />} />
                                            <ReviewItem label="Email" value={formData.personalInfo.email} icon={<Mail size={16} />} />
                                            <ReviewItem label="Phone" value={formData.personalInfo.phone} icon={<Phone size={16} />} />
                                            <ReviewItem label="Date of Birth (BS)" value={formData.personalInfo.dobBS} icon={<Calendar size={16} />} />
                                            <ReviewItem label="Date of Birth (AD)" value={formData.personalInfo.dobAD ? formData.personalInfo.dobAD.split('T')[0] : ''} icon={<Calendar size={16} />} />
                                            <ReviewItem label="Citizenship No." value={formData.personalInfo.citizenshipNo} icon={<FileText size={16} />} />
                                            <ReviewItem label="Issue District" value={formData.personalInfo.citizenshipDistrict} icon={<MapPin size={16} />} />
                                            <ReviewItem label="Issue Date (BS)" value={formData.personalInfo.citizenshipDate} icon={<Calendar size={16} />} />
                                            <ReviewItem label="Passport No." value={formData.personalInfo.passportNo} icon={<Globe size={16} />} />
                                            <ReviewItem label="Passport Expiry" value={formData.personalInfo.passportExpiry ? formData.personalInfo.passportExpiry.split('T')[0] : ''} icon={<Calendar size={16} />} />
                                            <ReviewItem label="Issue Place" value={formData.personalInfo.passportIssuePlace} icon={<MapPin size={16} />} />
                                        </div>
                                    </Card>

                                    {/* Address Details */}
                                    <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                        <h3 className="font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                            <MapPin className="text-primary-600" size={20} /> Address Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                            <ReviewItem label="Province" value={formData.address.province} icon={<MapPin size={16} />} />
                                            <ReviewItem label="District" value={formData.address.district} icon={<MapPin size={16} />} />
                                            <ReviewItem label="Municipality" value={formData.address.municipality} icon={<Building2 size={16} />} />
                                            <ReviewItem label="Ward No." value={formData.address.wardNo} icon={<MapPin size={16} />} />
                                            <ReviewItem label="Tole" value={formData.address.tole} icon={<MapPin size={16} />} />
                                            <div className="sm:col-span-2 lg:col-span-3">
                                                <ReviewItem label="Formatted Address" value={formData.address.formatted} icon={<MapPin size={16} />} />
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Family Information */}
                                    <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                        <h3 className="font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                            <Users className="text-primary-600" size={20} /> Family Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                            <ReviewItem label="Father's Name" value={formData.familyInfo.fatherName} icon={<User size={16} />} />
                                            <ReviewItem label="Mother's Name" value={formData.familyInfo.motherName} icon={<User size={16} />} />
                                            <ReviewItem label="Grandfather's Name" value={formData.familyInfo.grandfatherName} icon={<User size={16} />} />
                                            <ReviewItem label="Spouse's Name" value={formData.familyInfo.spouseName} icon={<User size={16} />} />
                                        </div>
                                    </Card>

                                    {/* Financial & Visa Details */}
                                    <Card className="p-8 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50/50">
                                        <h3 className="font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                            <DollarSign className="text-primary-600" size={20} /> Financial & Visa Overview
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                                            <ReviewItem label="Sponsor" value={formData.financialInfo.sponsor} icon={<User size={16} />} />
                                            <ReviewItem label="Exchange Rate" value={formData.financialInfo.exchangeRate} icon={<DollarSign size={16} />} />
                                            <ReviewItem label="Target Intake" value={formData.visaDetails.intake} icon={<Calendar size={16} />} />
                                        </div>
                                    </Card>
                                </div>
                            </div >
                        )
                    }

                    {/* APPLICATIONS TAB */}
                    {
                        canViewApplications && activeTab === 'applications' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <UniversityApplications student={currentProfile} />
                            </div>
                        )
                    }

                    {/* GENERATE TAB */}
                    {
                        activeTab === 'generate' && isAdminView && canGenerateDocs && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="Document Generators" subtitle="Create official legal documents automatically." icon={<Printer className="text-purple-600" />} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <GenerationCard title="Birth Verification" desc="Verify Date of Birth in AD & BS formats." icon={FileText} onClick={() => setShowDobModal(true)} />
                                    <GenerationCard title="Relationship Cert" desc="Generate family tree with photos." icon={User} onClick={() => setShowRelationModal(true)} />
                                    <GenerationCard title="Occupation Verification" desc="Validate parental job details." icon={Building2} onClick={() => setShowOccupationModal(true)} />
                                    <GenerationCard title="Surname Verification" desc="Resolve naming discrepancies." icon={CheckCircle} onClick={() => setShowSurnameModal(true)} />
                                    <GenerationCard title="Annual Income" desc="3-Year Income Source Table." icon={ClipboardCheck} onClick={() => setShowIncomeModal(true)} />
                                    <GenerationCard title="Bank Statement" desc="Generate statement summaries." icon={Building2} onClick={() => setshowBankStatementModal(true)} />
                                    <GenerationCard title="Tax Clearance" desc="Tax status verification docs." icon={ShieldCheck} onClick={() => setShowTaxModal(true)} />
                                    <GenerationCard title="DOB (Married)" desc="Verified DOB for married women." icon={FileText} onClick={() => setShowDobMarriedModal(true)} />
                                    <GenerationCard title="Relation (Married)" desc="Verified Relationship for married women." icon={Users} onClick={() => setShowRelationMarriedModal(true)} />
                                    <GenerationCard title="Japanese Certificate" desc="Japanese Language Course Certificate." icon={BookOpen} onClick={() => setShowLanguageModal(true)} />
                                    <GenerationCard title="Running Certificate" desc="Student character & verification letters." icon={FileCheck} onClick={() => setShowCharacterModal(true)} />
                                </div>
                            </div>
                        )
                    }

                    {/* SOP WRITER TAB */}
                    {
                        activeTab === 'sop' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="SOP Writing Assistant" subtitle="AI-powered drafting engine for Statement of Purpose (Riyu-sho)." icon={<PenTool className="text-purple-600" />} />
                                <SopWritingAssistant student={currentProfile} />
                            </div>
                        )
                    }

                    {/* INTERVIEW TAB */}
                    {
                        activeTab === 'interview' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <SectionHeader title="Mock Interview Room" subtitle="AI-powered preparation for Immigration Interviews." icon={<Mic className="text-red-600" />} />
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                    <JapaneseInterview />
                                </div>
                            </div>
                        )
                    }

                    {/* EVENTS TAB */}
                    {
                        activeTab === 'events' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <StudentEventCalendar />
                            </div>
                        )
                    }

                </div>
            </div>

            {/* --- MODALS --- */}
            <SurnameVerificationModal isOpen={showSurnameModal} onClose={() => setShowSurnameModal(false)} student={currentProfile} />
            <DateOfBirthVerificationModal isOpen={showDobModal} onClose={() => setShowDobModal(false)} student={currentProfile} />
            <RelationshipVerificationModal isOpen={showRelationModal} onClose={() => setShowRelationModal(false)} student={currentProfile} />
            <OccupationVerificationModal isOpen={showOccupationModal} onClose={() => setShowOccupationModal(false)} student={currentProfile} />
            <TaxClearanceVerificationModal isOpen={showTaxModal} onClose={() => setShowTaxModal(false)} student={currentProfile} />
            <BankStatementGeneratorModal isOpen={showBankStatementModal} onClose={() => setshowBankStatementModal(false)} student={currentProfile} />
            {showIncomeModal && <AnnualIncomeVerificationModal isOpen={showIncomeModal} onClose={() => setShowIncomeModal(false)} student={currentProfile} />}
            <DateOfBirthVerificationMarriedModal isOpen={showDobMarriedModal} onClose={() => setShowDobMarriedModal(false)} student={currentProfile} />
            <RelationshipVerificationMarriedModal isOpen={showRelationMarriedModal} onClose={() => setShowRelationMarriedModal(false)} student={currentProfile} />
            <LanguageCertificateModal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} student={currentProfile} />
            <CharacterCertificateModal isOpen={showCharacterModal} onClose={() => setShowCharacterModal(false)} student={currentProfile} />

        </div >
    );
}

// --- SUB COMPONENTS ---

function SectionHeader({ title, subtitle, icon }) {
    return (
        <div className="mb-4 sm:mb-6 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-white rounded-full opacity-80 hidden sm:block"></div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="p-2 sm:p-2.5 bg-white rounded-xl border border-primary-100 shadow-sm shrink-0">
                    {icon}
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">{title}</h2>
            </div>
            <p className="text-slate-500 font-medium pl-10 sm:pl-14 text-xs sm:text-sm line-clamp-2">{subtitle}</p>
        </div>
    );
}

function InfoCard({ title, icon: Icon, color = 'primary', children }) {
    const colorClasses = {
        primary: {
            border: 'from-primary-500 to-primary-600',
            bg: 'from-primary-50 to-primary-100/50',
            iconBg: 'from-primary-100 to-primary-50',
            iconText: 'text-primary-600',
            hover: 'hover:border-primary-200'
        },
        emerald: {
            border: 'from-primary-500 to-primary-500',
            bg: 'from-primary-50 to-primary-100/50',
            iconBg: 'from-primary-100 to-primary-50',
            iconText: 'text-primary-600',
            hover: 'hover:border-primary-200'
        },
        blue: {
            border: 'from-blue-500 to-indigo-500',
            bg: 'from-blue-50 to-blue-100/50',
            iconBg: 'from-blue-100 to-blue-50',
            iconText: 'text-blue-600',
            hover: 'hover:border-primary-200'
        },
        purple: {
            border: 'from-purple-500 to-violet-500',
            bg: 'from-purple-50 to-purple-100/50',
            iconBg: 'from-purple-100 to-purple-50',
            iconText: 'text-purple-600',
            hover: 'hover:border-purple-200'
        }
    };

    const c = colorClasses[color] || colorClasses.primary;

    return (
        <Card className={`relative overflow-hidden group ${c.hover} transition-all duration-300 hover:shadow-lg`}>
            {/* Decorative gradient border */}
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${c.border}`}></div>
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative p-6 sm:p-8">
                <h3 className="font-bold text-slate-800 flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className={`p-2.5 bg-gradient-to-br ${c.iconBg} rounded-xl ${c.iconText} shadow-sm ring-1 ring-black/5`}>
                        <Icon size={20} />
                    </div>
                    <span className="text-lg">{title}</span>
                </h3>
                {children}
            </div>
        </Card>
    );
}

function TabButton({ id, label, icon, active, set, highlight, color = 'primary' }) {
    const isActive = active === id;

    const baseActive = "bg-white shadow-sm ring-1 ring-black/5";
    const baseInactive = "text-secondary-500 hover:text-secondary-900 hover:bg-white/50";

    const colorConfig = {
        primary: { activeText: 'text-primary-600' },
        blue: { activeText: 'text-blue-600' },
        purple: { activeText: 'text-purple-600' },
        red: { activeText: 'text-red-600' },
        green: { activeText: 'text-emerald-600' }
    };

    const selected = highlight ? 'blue' : color;
    const config = colorConfig[selected] || colorConfig.primary;

    return (
        <button
            onClick={() => set(id)}
            title={label}
            className={`
                py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 
                transition-all duration-200 whitespace-nowrap rounded-lg sm:rounded-xl shrink-0 relative min-w-[44px]
                ${isActive ? `${baseActive} ${config.activeText}` : baseInactive}
            `}
        >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
            {isActive && <ChevronRight size={14} className="ml-0.5 sm:ml-1 opacity-50 hidden sm:block" />}
        </button>
    );
}

function DocumentUploadCard({ title, fieldKey, existingUrl, onUpload }) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onUpload(fieldKey, res.data.url);
            toast.success(`${title} uploaded!`);
        } catch (error) { toast.error("Upload failed."); } finally { setIsUploading(false); }
    };

    return (
        <div
            onClick={() => !existingUrl && fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); /* handle drop */ }}
            className={`
                group relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 h-52
                border-2 border-dashed backdrop-blur-sm
                ${isDragOver ? 'border-primary-400 bg-primary-50/80 scale-[1.02]' : ''}
                ${existingUrl
                    ? 'border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-md'
                    : 'border-slate-200 hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50/50 hover:to-primary-50/30 cursor-pointer hover:-translate-y-1 hover:shadow-xl'
                }
             `}>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf" />

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-30">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            </div>

            {isUploading ? (
                <div className="flex flex-col items-center animate-pulse relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-xl"></div>
                        <Loader2 className="animate-spin text-blue-600 mb-3 relative" size={36} />
                    </div>
                    <span className="text-sm text-primary-700 font-semibold">Uploading...</span>
                    <div className="w-24 h-1 bg-primary-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            ) : existingUrl ? (
                <>
                    <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center mb-3 text-primary-600 shadow-lg shadow-primary-200/50 relative z-10">
                        <CheckCircle size={28} strokeWidth={2.5} />
                    </div>
                    <p className="text-sm text-slate-900 font-bold mb-1 truncate w-full px-2 relative z-10">{title}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary-700 font-bold bg-primary-100 px-3 py-1 rounded-full mb-4 relative z-10">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
                        UPLOADED
                    </span>

                    <div className="flex gap-2 relative z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <a href={existingUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2 bg-white border border-primary-200 rounded-xl text-xs font-bold text-slate-700 hover:text-primary-700 hover:border-primary-400 hover:shadow-md transition-all flex items-center gap-1.5">
                            <Eye size={14} /> View
                        </a>
                        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current.click() }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-primary-600 hover:border-primary-400 hover:shadow-md transition-all flex items-center gap-1.5">
                            <Upload size={14} /> Replace
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 group-hover:from-blue-100 group-hover:to-indigo-50 flex items-center justify-center mb-3 transition-all duration-300 border border-slate-200 group-hover:border-primary-200 shadow-sm group-hover:shadow-md relative z-10">
                        <Upload className="text-slate-400 group-hover:text-primary-600 transition-colors duration-300" size={26} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary-700 transition-colors duration-300 mb-1 relative z-10">{title}</h4>
                    <span className="text-xs text-slate-400 group-hover:text-slate-500 font-medium relative z-10">Click or drag to upload</span>
                </>
            )}
        </div>
    );
}

function GenerationCard({ title, desc, icon: Icon, onClick }) {
    return (
        <button onClick={onClick} className="group flex flex-col text-left h-full bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-white transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5">
            {/* Content */}
            <div className="relative z-10">
                <div className="bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-primary-100 group-hover:to-primary-50 p-4 rounded-2xl w-fit shadow-sm mb-4 border border-slate-200 group-hover:border-primary-200 transition-all duration-300">
                    <Icon size={26} className="text-slate-500 group-hover:text-primary-600 transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-primary-700 transition-colors duration-300">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium group-hover:text-slate-600 transition-colors duration-300">{desc}</p>
            </div>

            {/* Decorative arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </button>
    );
}

function ReviewItem({ label, value, icon }) {
    return (
        <div className="group bg-gradient-to-br from-slate-50/80 via-white to-slate-50/50 p-5 rounded-2xl border border-slate-200/80 hover:border-primary-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-3">
                <div className="text-slate-400 group-hover:text-primary-500 transition-colors p-1.5 bg-slate-100 group-hover:bg-primary-50 rounded-lg">
                    {icon}
                </div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
            </div>
            <p className="text-base text-slate-900 font-semibold break-words pl-8">
                {value || <span className="text-slate-400 font-normal italic">Not set</span>}
            </p>
        </div>
    );
}