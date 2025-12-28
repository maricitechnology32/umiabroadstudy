import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    fetchAboutUsAdmin,
    createAboutUs,
    updateAboutUs,
    addTeamMember,
    removeTeamMember,
    reset
} from '../../features/aboutUs/aboutUsSlice';
import Button from '../../components/ui/Button';
import { fixImageUrl } from '../../utils/imageUtils';
import Input from '../../components/ui/Input';
import { Plus, Trash2, Save, Users, Upload } from 'lucide-react';
import api from '../../utils/api';

const AboutUsManager = () => {
    const dispatch = useDispatch();
    const { aboutUsList, isLoading, isSuccess, isError, message } = useSelector((state) => state.aboutUs);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mission: '',
        vision: '',
        values: [],
        teamMembers: [],
        stats: [],
        isActive: true
    });

    const [currentAboutUs, setCurrentAboutUs] = useState(null);
    const [newValue, setNewValue] = useState({ title: '', description: '', icon: '✨' });
    const [newStat, setNewStat] = useState({ label: '', value: '', icon: '📊' });
    const [newMember, setNewMember] = useState({ name: '', role: '', bio: '', imageUrl: '', linkedin: '', email: '' });
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        dispatch(fetchAboutUsAdmin());
    }, [dispatch]);

    useEffect(() => {
        if (aboutUsList && aboutUsList.length > 0) {
            const active = aboutUsList.find(item => item.isActive) || aboutUsList[0];
            setCurrentAboutUs(active);
            setFormData(active);
        }
    }, [aboutUsList]);

    useEffect(() => {
        if (isError) toast.error(message);
        if (isSuccess && message) toast.success(message);
        dispatch(reset());
    }, [isError, isSuccess, message, dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddValue = () => {
        if (!newValue.title || !newValue.description) {
            toast.error('Please fill in value title and description');
            return;
        }
        setFormData(prev => ({
            ...prev,
            values: [...prev.values, newValue]
        }));
        setNewValue({ title: '', description: '', icon: '✨' });
    };

    const handleRemoveValue = (index) => {
        setFormData(prev => ({
            ...prev,
            values: prev.values.filter((_, i) => i !== index)
        }));
    };

    const handleAddStat = () => {
        if (!newStat.label || !newStat.value) {
            toast.error('Please fill in stat label and value');
            return;
        }
        setFormData(prev => ({
            ...prev,
            stats: [...prev.stats, newStat]
        }));
        setNewStat({ label: '', value: '', icon: '📊' });
    };

    const handleRemoveStat = (index) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setUploadingImage(true);
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewMember(prev => ({ ...prev, imageUrl: res.data.url }));
            toast.success('Image uploaded');
        } catch (error) {
            toast.error('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleAddTeamMember = async () => {
        if (!newMember.name || !newMember.role) {
            toast.error('Please fill in member name and role');
            return;
        }

        if (currentAboutUs) {
            await dispatch(addTeamMember({ id: currentAboutUs._id, memberData: newMember }));
            setNewMember({ name: '', role: '', bio: '', imageUrl: '', linkedin: '', email: '' });
        } else {
            setFormData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, newMember]
            }));
            setNewMember({ name: '', role: '', bio: '', imageUrl: '', linkedin: '', email: '' });
        }
    };

    const handleRemoveTeamMember = async (index, memberId) => {
        if (currentAboutUs && memberId) {
            await dispatch(removeTeamMember({ id: currentAboutUs._id, teamMemberId: memberId }));
        } else {
            setFormData(prev => ({
                ...prev,
                teamMembers: prev.teamMembers.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentAboutUs) {
            await dispatch(updateAboutUs({ id: currentAboutUs._id, data: formData }));
        } else {
            await dispatch(createAboutUs(formData));
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">About Us Management</h1>
                <p className="text-slate-600 mt-1">Manage your About Us page content</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <Input
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                rows={3}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="rounded"
                            />
                            <label className="text-sm font-semibold text-slate-700">Publish on public page</label>
                        </div>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Mission & Vision</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Mission</label>
                            <textarea
                                name="mission"
                                value={formData.mission}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Vision</label>
                            <textarea
                                name="vision"
                                value={formData.vision}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Company Values</h2>
                    <div className="space-y-4">
                        {formData.values.map((value, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{value.icon}</span>
                                        <strong>{value.title}</strong>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{value.description}</p>
                                </div>
                                <button type="button" onClick={() => handleRemoveValue(index)} className="text-red-600 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Icon (emoji)"
                                value={newValue.icon}
                                onChange={(e) => setNewValue(prev => ({ ...prev, icon: e.target.value }))}
                                className="w-20 px-3 py-2 border border-slate-200 rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Title"
                                value={newValue.title}
                                onChange={(e) => setNewValue(prev => ({ ...prev, title: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                value={newValue.description}
                                onChange={(e) => setNewValue(prev => ({ ...prev, description: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                            />
                            <Button type="button" onClick={handleAddValue} size="sm">
                                <Plus size={18} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Team Members</h2>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {formData.teamMembers.map((member, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                {member.imageUrl && (
                                    <img src={fixImageUrl(member.imageUrl)} alt={member.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                                )}
                                <h3 className="font-semibold">{member.name}</h3>
                                <p className="text-sm text-emerald-600">{member.role}</p>
                                <button type="button" onClick={() => handleRemoveTeamMember(index, member._id)} className="text-red-600 text-sm mt-2">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-sm">Add New Member</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            <Input
                                placeholder="Name"
                                value={newMember.name}
                                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <Input
                                placeholder="Role"
                                value={newMember.role}
                                onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                            />
                            <Input
                                placeholder="Bio (optional)"
                                value={newMember.bio}
                                onChange={(e) => setNewMember(prev => ({ ...prev, bio: e.target.value }))}
                            />
                            <Input
                                placeholder="LinkedIn URL (optional)"
                                value={newMember.linkedin}
                                onChange={(e) => setNewMember(prev => ({ ...prev, linkedin: e.target.value }))}
                            />
                            <Input
                                placeholder="Email (optional)"
                                value={newMember.email}
                                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm text-slate-600 mb-1">Profile Image</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" disabled={uploadingImage} />
                                {newMember.imageUrl && <img src={fixImageUrl(newMember.imageUrl)} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />}
                            </div>
                        </div>
                        <Button type="button" onClick={handleAddTeamMember} disabled={uploadingImage} size="sm">
                            <Users size={16} className="mr-2" /> Add Member
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Stats & Achievements</h2>
                    <div className="space-y-4">
                        {formData.stats.map((stat, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                <span className="text-2xl">{stat.icon}</span>
                                <div className="flex-1">
                                    <strong>{stat.value}</strong> - {stat.label}
                                </div>
                                <button type="button" onClick={() => handleRemoveStat(index)} className="text-red-600">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Icon"
                                value={newStat.icon}
                                onChange={(e) => setNewStat(prev => ({ ...prev, icon: e.target.value }))}
                                className="w-20 px-3 py-2 border border-slate-200 rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Value (e.g., 500+)"
                                value={newStat.value}
                                onChange={(e) => setNewStat(prev => ({ ...prev, value: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Label (e.g., Happy Clients)"
                                value={newStat.label}
                                onChange={(e) => setNewStat(prev => ({ ...prev, label: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                            />
                            <Button type="button" onClick={handleAddStat} size="sm">
                                <Plus size={18} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} isLoading={isLoading}>
                        <Save size={18} className="mr-2" />
                        {currentAboutUs ? 'Update' : 'Create'} About Us
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AboutUsManager;
