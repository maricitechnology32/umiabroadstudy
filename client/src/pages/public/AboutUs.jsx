import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAboutUs, reset } from '../../features/aboutUs/aboutUsSlice';
import { Target, Eye, Heart, Users, Award, Globe, Loader2, Linkedin, Mail, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { fixImageUrl } from '../../utils/imageUtils';
import BannerAd from '../../components/ads/BannerAd';


const AboutUs = ({ isDashboard }) => {
    const dispatch = useDispatch();
    const { aboutUs, isLoading } = useSelector((state) => state.aboutUs);

    useEffect(() => {
        dispatch(fetchAboutUs());
        return () => dispatch(reset());
    }, [dispatch]);

    if (isLoading || !aboutUs) {
        return (
            <>
                {!isDashboard && <Navbar />}
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-primary-50">
                    <Loader2 className="animate-spin text-primary-600" size={48} />
                </div>
                {!isDashboard && <Footer />}
            </>
        );
    }

    return (
        <>
            {!isDashboard && <Navbar />}
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">

                {/* Hero Section */}
                <section className="bg-primary-600 text-white py-12 mt-14">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-3">{aboutUs.title}</h1>
                        <p className="text-primary-100 max-w-2xl mx-auto leading-relaxed">
                            {aboutUs.description}
                        </p>
                    </div>
                </section>



                {/* Mission & Vision */}
                <section className="py-10 container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Mission */}
                            {aboutUs.mission && (
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-primary-50 rounded-lg">
                                            <Target className="text-primary-600" size={24} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-sm">{aboutUs.mission}</p>
                                </div>
                            )}

                            {/* Vision */}
                            {aboutUs.vision && (
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-primary-50 rounded-lg">
                                            <Eye className="text-primary-600" size={24} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-sm">{aboutUs.vision}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Values */}
                {aboutUs.values && aboutUs.values.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">The principles that guide everything we do</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                {aboutUs.values.map((value, index) => (
                                    <div
                                        key={index}
                                        className="group bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:bg-primary-50 hover:border-primary-200 transition-all duration-300"
                                    >
                                        <div className="text-4xl mb-4">{value.icon || '✨'}</div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors">
                                            {value.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Stats */}
                {aboutUs.stats && aboutUs.stats.length > 0 && (
                    <section className="py-10 bg-primary-600 text-white">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
                                {aboutUs.stats.map((stat, index) => (
                                    <div key={index} className="p-4">
                                        <div className="text-2xl mb-1">{stat.icon || '📊'}</div>
                                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                        <div className="text-primary-100 text-xs">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}



                {/* Team */}
                {aboutUs.teamMembers && aboutUs.teamMembers.length > 0 && (
                    <section className="py-16 container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                The dedicated professionals behind our success
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {aboutUs.teamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:border-primary-200 transition-all duration-300 text-center"
                                >
                                    {/* Avatar */}
                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        {member.imageUrl ? (
                                            <img
                                                src={fixImageUrl(member.imageUrl)}
                                                alt={member.name}
                                                className="w-full h-full rounded-full object-cover border-4 border-primary-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                                    <p className="text-primary-600 font-semibold text-sm mb-3">{member.role}</p>
                                    {member.bio && (
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                            {member.bio}
                                        </p>
                                    )}

                                    {/* Social Links */}
                                    <div className="flex justify-center gap-3">
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                                            >
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                        {member.email && (
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                                            >
                                                <Mail size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}



                {/* CTA Section */}
                <section className="py-16 bg-slate-100">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Start Your Journey?</h2>
                        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                            Join thousands of students who have achieved their dreams of studying in Japan with our help.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/inquiry"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                            >
                                Get Started
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/careers"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors border border-primary-200"
                            >
                                Join Our Team
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
            {!isDashboard && <Footer />}
        </>
    );
};

export default AboutUs;
