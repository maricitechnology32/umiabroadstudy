import { Building2, Download, MapPin, Plus, Search, User, FileCheck, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addUniversity, getUniversities, importUniversity, reset, searchMaster } from '../../features/universities/universitySlice';
import { getStudents } from '../../features/students/studentSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { fixImageUrl } from '../../utils/imageUtils';

export default function UniversityManager() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { universities, masterSearchResults, isLoading, isSuccess, message } = useSelector((state) => state.universities);
    const { students } = useSelector((state) => state.students);

    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '', location: '', type: 'Language School', commissionPercentage: 0
    });

    useEffect(() => {
        dispatch(getUniversities());
        dispatch(getStudents()); // Fetch students to cross-reference
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess && message) {
            toast.success(message);
            if (activeTab === 'manual') {
                setShowForm(false);
                setFormData({ name: '', location: '', type: 'Language School', commissionPercentage: 0 });
            }
            dispatch(reset());
        }
    }, [isSuccess, message, dispatch, activeTab]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        dispatch(addUniversity(formData));
    };

    const handleSearchMaster = () => {
        if (searchQuery.length > 2) {
            dispatch(searchMaster(searchQuery));
        }
    };

    const handleImport = (mUni) => {
        const commission = prompt(`Enter commission rate for ${mUni.name} (e.g., 15):`);
        if (commission !== null && !isNaN(commission)) {
            dispatch(importUniversity({ masterId: mUni._id, commission: Number(commission) }));
        } else {
            toast.info("Import cancelled or invalid commission rate.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">University Database</h2>
                    <p className="text-secondary-500">Manage your partner schools.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 w-full sm:w-auto">
                    <Plus size={18} /> Add New
                </Button>
            </div>

            {showForm && (
                <Card className="border-primary-100 animate-in slide-in-from-top-2 mb-6">

                    <div className="flex gap-4 border-b border-secondary-100 mb-6">
                        <button onClick={() => setActiveTab('manual')} className={`pb-2 px-2 text-sm font-bold transition-colors ${activeTab === 'manual' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}>Manual Entry</button>
                        <button onClick={() => setActiveTab('import')} className={`pb-2 px-2 text-sm font-bold transition-colors ${activeTab === 'import' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-secondary-500 hover:text-secondary-700'}`}>Import from Master DB</button>
                    </div>

                    {activeTab === 'manual' ? (
                        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input placeholder="Name (e.g. Tokyo Intl School)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <Input placeholder="Location (e.g. Shinjuku, Tokyo)" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                            <Select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option>Language School</option>
                                <option>University</option>
                                <option>Vocational College</option>
                            </Select>
                            <Input type="number" placeholder="Commission %" value={formData.commissionPercentage} onChange={e => setFormData({ ...formData, commissionPercentage: e.target.value })} />

                            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                                <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="text-secondary-500">Cancel</Button>
                                <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save School'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search global database..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleSearchMaster} className="flex items-center gap-2"><Search size={16} /> Search</Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border border-secondary-200 rounded-lg">
                                {masterSearchResults.map(mUni => (
                                    <div key={mUni._id} className="p-3 border-b border-secondary-100 flex justify-between items-center hover:bg-secondary-50">
                                        <div>
                                            <div className="font-bold text-sm text-secondary-900">{mUni.name}</div>
                                            <div className="text-xs text-secondary-500">{mUni.location} • {mUni.type}</div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => handleImport(mUni)} className="text-primary-600 hover:bg-primary-50 hover:text-primary-700"><Download size={18} /> Import</Button>
                                    </div>
                                ))}
                                {masterSearchResults.length === 0 && searchQuery.length > 2 && <div className="p-4 text-center text-secondary-400 text-sm">No results found</div>}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {universities.map(uni => (
                    <Card
                        key={uni._id}
                        className="p-5 border-secondary-200 shadow-sm hover:shadow-md transition cursor-pointer hover:border-primary-300 group"
                        onClick={() => navigate(`/admin/universities/${uni._id}`)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-primary-50 p-2 rounded-md text-primary-600 group-hover:bg-primary-100 transition-colors"><Building2 size={20} /></div>
                            <span className="text-xs bg-secondary-100 px-2 py-1 rounded text-secondary-600">{uni.type}</span>
                        </div>
                        <h3 className="font-bold text-secondary-900 group-hover:text-primary-700 transition-colors">{uni.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-secondary-500 mt-1">
                            <MapPin size={14} /> {uni.location}
                        </div>
                        {uni.commissionPercentage > 0 && (
                            <div className="mt-3 pt-3 border-t border-secondary-100 text-xs font-medium text-secondary-700">
                                Commission: {uni.commissionPercentage}%
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}