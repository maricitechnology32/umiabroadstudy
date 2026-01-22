import { ArrowLeft, Download, FileCheck, Search, User, Filter, ArrowUpDown, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getUniversities } from '../../features/universities/universitySlice';
import { getStudents, updateProfile } from '../../features/students/studentSlice';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { fixImageUrl } from '../../utils/imageUtils';

export default function UniversityStudentList() {
    const { universityId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { universities, isLoading: uniLoading } = useSelector((state) => state.universities);
    const { students, isLoading: studentLoading } = useSelector((state) => state.students);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    useEffect(() => {
        if (!universities || universities.length === 0) {
            dispatch(getUniversities());
        }
        if (!students || students.length === 0) {
            dispatch(getStudents());
        }
    }, [dispatch, universities, students]);

    const university = universities?.find(u => u._id === universityId);

    // Initial Filter: Students with VARIFIED documents for this Uni
    const relevantStudents = students?.filter(student =>
        student.user?.role === 'student' &&
        student.applicationDocuments?.some(doc =>
            (doc.universityId === universityId || doc.universityId?._id === universityId) &&
            doc.status === 'Verified'
        )
    ) || [];

    // Search & Sort Logic
    const filteredStudents = relevantStudents.filter(student => {
        const fullName = (student.personalInfo?.firstName + ' ' + student.personalInfo?.lastName).toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || student.personalInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    }).sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'name') {
            aValue = (a.personalInfo?.firstName + a.personalInfo?.lastName).toLowerCase();
            bValue = (b.personalInfo?.firstName + b.personalInfo?.lastName).toLowerCase();
        } else {
            // Default sort/other keys
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    if (uniLoading || studentLoading) {
        return <div className="p-8 text-center">Loading details...</div>;
    }

    if (!university) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>University not found.</p>
                <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/universities')}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{university.name}</h1>
                    <p className="text-slate-500 text-sm">Managing students for {university.location}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleSort('name')} className="flex items-center gap-2">
                        <ArrowUpDown size={16} /> Sort by Name
                    </Button>
                </div>
            </div>

            {/* Student List */}
            {filteredStudents.length > 0 ? (
                <div className="space-y-4">
                    {filteredStudents.map(student => (
                        <Card key={student._id} className="hover:shadow-md transition-shadow duration-200">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Student Info */}
                                <div className="flex items-center gap-4 min-w-[250px] border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg">
                                        {student.personalInfo?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{student.personalInfo?.firstName} {student.personalInfo?.lastName}</h3>
                                        <p className="text-sm text-slate-500">{student.personalInfo?.email}</p>
                                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                            Student
                                        </div>
                                    </div>
                                </div>

                                {/* Documents List */}
                                <div className="flex-1">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Verified Documents</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {student.applicationDocuments
                                            .filter(doc => (doc.universityId === universityId || doc.universityId?._id === universityId) && doc.status === 'Verified')
                                            .map(doc => (
                                                <div key={doc._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-primary-200 transition-colors">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileCheck size={16} className="text-emerald-500 shrink-0" />
                                                        <span className="text-sm font-medium text-slate-700 truncate">{doc.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <a
                                                            href={fixImageUrl(doc.verifiedUrl || doc.originalUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs flex items-center gap-1 text-slate-600 hover:text-primary-600 font-medium bg-white px-2 py-1 rounded shadow-sm"
                                                            title="View"
                                                        >
                                                            <Download size={12} />
                                                        </a>

                                                        <button
                                                            onClick={async () => {
                                                                if (!window.confirm("Are you sure you want to delete this document?")) return;
                                                                const updatedDocs = student.applicationDocuments.filter(d => d._id !== doc._id);
                                                                await dispatch(updateProfile({ id: student._id, data: { applicationDocuments: updatedDocs } })).unwrap();
                                                                dispatch(getStudents()); // Refresh list
                                                            }}
                                                            className="text-xs flex items-center gap-1 text-slate-600 hover:text-red-600 font-medium bg-white px-2 py-1 rounded shadow-sm"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <User size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-slate-900 font-bold text-lg">No Students Found</h3>
                    <p className="text-slate-500 mt-1">No students have verified documents matching your search for this university.</p>
                </div>
            )}
        </div>
    );
}
