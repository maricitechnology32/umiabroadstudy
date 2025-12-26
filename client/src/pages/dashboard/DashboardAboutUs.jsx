import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAboutUs, reset } from '../../features/aboutUs/aboutUsSlice';
import { Users, Target, Eye, Mail, Linkedin, Loader2, ArrowRight } from 'lucide-react';

const DashboardAboutUs = () => {
    const dispatch = useDispatch();
    const { aboutUs, isLoading } = useSelector((state) => state.aboutUs);

    useEffect(() => {
        dispatch(fetchAboutUs());
        return () => dispatch(reset());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    if (!aboutUs) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-slate-600">About Us content not available</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-16 pb-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    About Our Company
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
                    {aboutUs.title}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    {aboutUs.description}
                </p>
            </div>

            {/* Mission & Vision */}
            {(aboutUs.mission || aboutUs.vision) && (
                <div className="grid md:grid-cols-2 gap-6">
                    {aboutUs.mission && (
                        <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary-200 transition-all duration-300 hover:shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="inline-flex p-3 bg-primary-50 rounded-xl mb-4">
                                    <Target className="text-primary-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h2>
                                <p className="text-slate-600 leading-relaxed">{aboutUs.mission}</p>
                            </div>
                        </div>
                    )}
                    {aboutUs.vision && (
                        <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary-200 transition-all duration-300 hover:shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="inline-flex p-3 bg-primary-50 rounded-xl mb-4">
                                    <Eye className="text-primary-600" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h2>
                                <p className="text-slate-600 leading-relaxed">{aboutUs.vision}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            {aboutUs.stats && aboutUs.stats.length > 0 && (
                <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-10 border border-slate-700">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
                    <div className="relative grid md:grid-cols-4 gap-8">
                        {aboutUs.stats.map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                                <div className="text-4xl font-bold text-white mb-1 text-white">
                                    {stat.value}
                                </div>
                                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Values */}
            {aboutUs.values && aboutUs.values.length > 0 && (
                <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900">Our Core Values</h2>
                        <p className="text-slate-600">The principles that guide everything we do</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {aboutUs.values.map((value, index) => (
                            <div
                                key={index}
                                className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        {value.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{value.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Team */}
            {aboutUs.teamMembers && aboutUs.teamMembers.length > 0 && (
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900">Meet Our Team</h2>
                        <p className="text-slate-600">Dedicated professionals committed to your success</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {aboutUs.teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
                            >
                                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                    {member.imageUrl ? (
                                        <img
                                            src={member.imageUrl}
                                            alt={member.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Users size={64} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                            {member.name}
                                        </h3>
                                        <p className="text-primary-600 font-medium text-sm">{member.role}</p>
                                    </div>
                                    {member.bio && (
                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                            {member.bio}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                                            >
                                                <Linkedin size={16} />
                                            </a>
                                        )}
                                        {member.email && (
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                            >
                                                <Mail size={16} />
                                            </a>
                                        )}
                                        {(member.linkedin || member.email) && (
                                            <a
                                                href="#"
                                                className="ml-auto text-slate-400 hover:text-slate-600 transition-colors group/link"
                                            >
                                                <ArrowRight size={16} className="group-hover/link:translate-x-0.5 transition-transform" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAboutUs;
