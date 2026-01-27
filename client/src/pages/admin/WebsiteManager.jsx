import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSiteContent, updateSiteContent } from '../../features/siteContent/siteContentSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Trash2, Save, Loader2, Upload, X, LayoutTemplate, List, PieChart, Type, Star, Sparkles, LinkIcon } from 'lucide-react';
import { fixImageUrl } from '../../utils/imageUtils';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebsiteManager() {
    const dispatch = useDispatch();
    const { content, loading } = useSelector((state) => state.siteContent);
    const [activeTab, setActiveTab] = useState('hero');
    const [formData, setFormData] = useState({
        hero: {
            title: '',
            subtitle: '',
            badgeText: '',
            ctaPrimary: { text: '', link: '' },
            ctaSecondary: { text: '', link: '' }
        },
        aiSection: {
            title: '',
            description: ''
        },
        features: [],
        stats: [],
        testimonials: []
    });

    useEffect(() => {
        dispatch(fetchSiteContent());
    }, [dispatch]);

    useEffect(() => {
        if (content) {
            setFormData({
                hero: {
                    title: content.hero?.title || '',
                    subtitle: content.hero?.subtitle || '',
                    badgeText: content.hero?.badgeText || '',
                    ctaPrimary: { text: content.hero?.ctaPrimary?.text || '', link: content.hero?.ctaPrimary?.link || '' },
                    ctaSecondary: { text: content.hero?.ctaSecondary?.text || '', link: content.hero?.ctaSecondary?.link || '' }
                },
                aiSection: {
                    title: content.aiSection?.title || '',
                    description: content.aiSection?.description || ''
                },
                features: content.features || [],
                stats: content.stats || [],
                testimonials: content.testimonials || []
            });
        }
    }, [content]);

    // Handle nested object updates (Hero/AI)
    const handleChange = (section, field, value, nestedField = null) => {
        setFormData(prev => {
            if (nestedField) {
                return { ...prev, [section]: { ...prev[section], [field]: { ...prev[section][field], [nestedField]: value } } };
            }
            return { ...prev, [section]: { ...prev[section], [field]: value } };
        });
    };

    // Handle Array Modifications (Features/Stats/Testimonials)
    const handleArrayChange = (index, field, value, section) => {
        const newArray = [...formData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setFormData(prev => ({ ...prev, [section]: newArray }));
    };

    const addItem = (section, template) => {
        setFormData(prev => ({ ...prev, [section]: [...prev[section], template] }));
    };

    const removeItem = (section, index) => {
        setFormData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateSiteContent(formData)).unwrap();
            toast.success('Website content updated successfully');
        } catch (error) {
            toast.error('Failed to update content');
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === id
                ? 'bg-white text-secondary-900 shadow-sm ring-1 ring-black/5'
                : 'text-secondary-500 hover:text-secondary-900 hover:bg-white/50'
                } `}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    if (loading && !content) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">Website Manager</h1>
                    <p className="text-secondary-500">Customize your public landing page content.</p>
                </div>
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </Button>
            </div>

            {/* Tabs */}
            <div className="bg-secondary-100/50 p-1 rounded-xl border border-secondary-200/60 flex items-center gap-1 overflow-x-auto">
                <TabButton id="hero" label="Hero" icon={LayoutTemplate} />
                <TabButton id="features" label="Features" icon={List} />
                <TabButton id="stats" label="Stats" icon={PieChart} />
                <TabButton id="ai" label="AI Section" icon={Type} />
                <TabButton id="testimonials" label="Testimonials" icon={Star} />
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {activeTab === 'hero' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-700">Badge Text</label>
                            <div className="relative">
                                <Sparkles size={16} className="absolute left-3 top-3 text-secondary-400" />
                                <Input className="pl-10" placeholder="e.g. New: AI Mock Interviews V2.0" value={formData.hero.badgeText} onChange={(e) => handleChange('hero', 'badgeText', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-700">Main Headline</label>
                            <Input placeholder="e.g. The Smartest Way to Move to Japan" value={formData.hero.title} onChange={(e) => handleChange('hero', 'title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-secondary-700">Subtitle</label>
                            <textarea className="w-full rounded-xl border-slate-200 p-3 text-sm focus:ring-primary-500 min-h-[80px]" placeholder="e.g. Automate your COE documents, track applications, and practice with our realistic AI Immigration Officer." value={formData.hero.subtitle} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-semibold text-secondary-700">Primary Button</label><Input placeholder="e.g. Start Free Trial" value={formData.hero.ctaPrimary.text} onChange={(e) => handleChange('hero', 'ctaPrimary', e.target.value, 'text')} /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold text-secondary-700">Link</label><Input placeholder="e.g. /register" value={formData.hero.ctaPrimary.link} onChange={(e) => handleChange('hero', 'ctaPrimary', e.target.value, 'link')} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-sm font-semibold text-secondary-700">Secondary Button</label><Input placeholder="e.g. Watch Demo" value={formData.hero.ctaSecondary.text} onChange={(e) => handleChange('hero', 'ctaSecondary', e.target.value, 'text')} /></div>
                            <div className="space-y-2"><label className="text-sm font-semibold text-secondary-700">Link</label><Input placeholder="e.g. https://youtube.com/..." value={formData.hero.ctaSecondary.link} onChange={(e) => handleChange('hero', 'ctaSecondary', e.target.value, 'link')} /></div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'features' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-secondary-900">Features List</h3>
                            <Button type="button" size="sm" variant="outline" onClick={() => addItem('features', { title: '', description: '', icon: 'Zap' })}><Plus size={16} className="mr-2" /> Add Feature</Button>
                        </div>
                        {formData.features.map((item, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 relative group">
                                <button type="button" onClick={() => removeItem('features', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg p-1 transition-colors"><Trash2 size={18} /></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-semibold text-secondary-600">Title</label><Input placeholder="e.g. Auto-Document Gen" value={item.title} onChange={(e) => handleArrayChange(idx, 'title', e.target.value, 'features')} /></div>
                                    <div className="space-y-1"><label className="text-xs font-semibold text-secondary-600">Icon Name (Lucide)</label><Input placeholder="e.g. FileText, Zap, Shield" value={item.icon} onChange={(e) => handleArrayChange(idx, 'icon', e.target.value, 'features')} /></div>
                                    <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-secondary-600">Description</label><textarea className="w-full rounded-lg border-slate-200 p-2 text-sm" placeholder="e.g. Generate COE Application forms in one click." value={item.description} onChange={(e) => handleArrayChange(idx, 'description', e.target.value, 'features')} /></div>
                                </div>
                            </div>
                        ))}
                        {formData.features.length === 0 && <p className="text-center text-secondary-400 py-8">No features added yet.</p>}
                    </motion.div>
                )}

                {activeTab === 'stats' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-secondary-900">Statistics</h3>
                            <Button type="button" size="sm" variant="outline" onClick={() => addItem('stats', { label: '', value: '' })}><Plus size={16} className="mr-2" /> Add Stat</Button>
                        </div>
                        {formData.stats.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-end p-4 border border-slate-100 rounded-xl bg-slate-50 relative group">
                                <button type="button" onClick={() => removeItem('stats', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg p-1 transition-colors"><Trash2 size={16} /></button>
                                <div className="flex-1 space-y-1"><label className="text-xs font-semibold text-secondary-600">Value</label><Input placeholder="e.g. 50+ or 98%" value={item.value} onChange={(e) => handleArrayChange(idx, 'value', e.target.value, 'stats')} /></div>
                                <div className="flex-[2] space-y-1"><label className="text-xs font-semibold text-secondary-600">Label</label><Input placeholder="e.g. Consultancies or Success Rate" value={item.label} onChange={(e) => handleArrayChange(idx, 'label', e.target.value, 'stats')} /></div>
                            </div>
                        ))}
                        {formData.stats.length === 0 && <p className="text-center text-secondary-400 py-8">No stats added yet.</p>}
                    </motion.div>
                )}

                {activeTab === 'ai' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="space-y-2"><label className="text-sm font-semibold text-secondary-700">Title</label><Input placeholder="e.g. Practice with a Real AI Immigration Officer" value={formData.aiSection.title} onChange={(e) => handleChange('aiSection', 'title', e.target.value)} /></div>
                        <div className="space-y-2"><label className="text-sm font-semibold text-secondary-700">Description</label><textarea className="w-full rounded-xl border-slate-200 p-3 text-sm focus:ring-primary-500 min-h-[80px]" placeholder="e.g. Don't let the interview scare you. Our AI simulator mimics a real Japanese immigration officer." value={formData.aiSection.description} onChange={(e) => handleChange('aiSection', 'description', e.target.value)} /></div>
                    </motion.div>
                )}

                {activeTab === 'testimonials' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-secondary-900">Testimonials</h3>
                            <Button type="button" size="sm" variant="outline" onClick={() => addItem('testimonials', { name: '', role: '', quote: '' })}><Plus size={16} className="mr-2" /> Add Testimonial</Button>
                        </div>
                        {formData.testimonials.map((item, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 relative group space-y-3">
                                <button type="button" onClick={() => removeItem('testimonials', idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg p-1 transition-colors"><Trash2 size={16} /></button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-semibold text-secondary-600">Name</label><Input placeholder="e.g. Ram Sharma" value={item.name} onChange={(e) => handleArrayChange(idx, 'name', e.target.value, 'testimonials')} /></div>
                                    <div className="space-y-1"><label className="text-xs font-semibold text-secondary-600">Role</label><Input placeholder="e.g. CEO, Kathmandu Consultancy" value={item.role} onChange={(e) => handleArrayChange(idx, 'role', e.target.value, 'testimonials')} /></div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-secondary-600">Author Image</label>
                                    <div className="flex gap-4 items-center">
                                        {item.image && (
                                            <img src={fixImageUrl(item.image)} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                        )}
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id={`upload - ${idx} `}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        // Show loading state if we had one, for now toast
                                                        const toastId = toast.loading("Uploading image...");
                                                        const token = localStorage.getItem('token');
                                                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                                        const res = await fetch(`${API_URL}/upload`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: formData
                                                        });
                                                        const data = await res.json();
                                                        toast.dismiss(toastId);

                                                        if (data.success) {
                                                            handleArrayChange(idx, 'image', data.url, 'testimonials');
                                                            toast.success("Image uploaded!");
                                                        } else {
                                                            toast.error(data.message || "Upload failed");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        toast.error("Upload error");
                                                    }
                                                }}
                                            />
                                            < label htmlFor={`upload-${idx}`} className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-secondary-600 hover:bg-slate-50 transition-colors" >
                                                <Upload size={16} />
                                                {item.image ? 'Change Photo' : 'Upload Photo'}
                                            </label >
                                        </div >
                                    </div >
                                </div >
                                <div className="space-y-1"><label className="text-xs font-semibold text-secondary-600">Quote</label><textarea className="w-full rounded-lg border-slate-200 p-2 text-sm" placeholder="e.g. This software transformed our workflow..." value={item.quote} onChange={(e) => handleArrayChange(idx, 'quote', e.target.value, 'testimonials')} /></div>
                            </div >
                        ))}
                        {formData.testimonials.length === 0 && <p className="text-center text-secondary-400 py-8">No testimonials added yet.</p>}
                    </motion.div >
                )}
            </form >
        </div >
    );
}
