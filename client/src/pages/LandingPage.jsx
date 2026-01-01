import {
   ArrowRight,
   Bot,
   CheckCircle2,
   ChevronRight,
   FileText,
   Globe,
   LayoutDashboard,
   MessageSquare,
   Mic,
   Play,
   ShieldCheck,
   Sparkles,
   Zap,
   Users,
   Award,
   Building,
   Star,
   Quote,
   Search,
   Calendar,
   Clock,
   Eye,
   Briefcase,
   MapPin,
   DollarSign,
   Phone,
   Mail,
   Map
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLandingData } from '../features/landing/landingSlice';
import { fetchBlogs } from '../features/blog/blogSlice';
import { fetchJobs } from '../features/jobs/jobSlice';
import Button from '../components/ui/Button';
import { fixImageUrl } from '../utils/imageUtils';

// IMPORT YOUR NEW COMPONENTS
import SEO from '../components/common/SEO';
import SuccessStories from './SuccessStories'; // Adjust path as needed
import Navbar from '../components/layout/Navbar';
import BannerAd from '../components/ads/BannerAd';


// Icon Mapping Helper
const DynamicIcon = ({ name, className, size }) => {
   const icons = {
      FileText, LayoutDashboard, ShieldCheck, Zap, Globe, Users, Award, Building, Star, Bot, Mic, MessageSquare, Play, CheckCircle2,
      // Add more defaults or map generic ones
      Settings: Sparkles,
      Document: FileText
   };
   const IconComponent = icons[name] || Sparkles;
   return <IconComponent className={className} size={size} />;
};

export default function LandingPage() {
   const [showDemoModal, setShowDemoModal] = useState(false);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Selectors
   const { branding, content, about, contact } = useSelector((state) => state.landing);
   const { blogs } = useSelector((state) => state.blog);
   const { jobs } = useSelector((state) => state.jobs);

   useEffect(() => {
      dispatch(fetchLandingData());
      dispatch(fetchBlogs({ page: 1, limit: 3 })); // Fetch latest 3 blogs
      dispatch(fetchJobs({ page: 1, limit: 3 }));   // Fetch latest 3 jobs
   }, [dispatch]);

   // Defaults
   const heroTitle = content?.hero?.title || "The Smartest Way to Move to Japan.";
   const heroSubtitle = content?.hero?.subtitle || "Automate your COE documents, track applications, and practice with our realistic AI Immigration Officer. Trusted by 50+ consultancies.";
   const heroBadge = content?.hero?.badgeText || "New: AI Mock Interviews V2.0";
   const ctaPrimaryText = "Free Visa Assessment"; // Changed to focus on student inquiry
   const ctaSecondaryText = content?.hero?.ctaSecondary?.text || "Watch Demo";

   const aiTitle = content?.aiSection?.title || "Practice with a Real AI Immigration Officer.";
   const aiDesc = content?.aiSection?.description || "Don't let the interview scare you. Our AI simulator mimics a real Japanese immigration officer at Narita Airport.";

   // Dynamic Lists with Fallbacks
   const featuresList = content?.features?.length > 0 ? content.features : [
      { title: "Auto-Document Gen", description: "Generate COE Application forms, financial sponsors, and SOPs in one click.", icon: "FileText" },
      { title: "Student CRM", description: "Manage student profiles, documents, and application statuses from a single centralized dashboard.", icon: "LayoutDashboard" },
      { title: "Error Checking", description: "Our system validates data against Immigration Bureau standards to avoid rejections.", icon: "ShieldCheck" }
   ];

   const statsList = content?.stats?.length > 0 ? content.stats : [
      { value: "50+", label: "Consultancies" },
      { value: "10k+", label: "Applications Processed" },
      { value: "98%", label: "Success Rate" }
   ];

   const testimonialsList = content?.testimonials?.length > 0 ? content.testimonials : [
      { name: "Ramesh K.", role: "CEO, Fuji Consultancy", quote: "This software reduced our paperwork time by 90%. Highly recommended for Nepal consultancies." },
      { name: "Sita P.", role: "Student", quote: "The AI interview practice gave me so much confidence!" }
   ];

   // Helpers
   const calculateReadTime = (content) => {
      if (!content) return 1;
      const wordsPerMinute = 200;
      const wordCount = content.split(' ').length;
      return Math.ceil(wordCount / wordsPerMinute);
   };

   const formatDeadline = (deadline) => {
      if (!deadline) return 'No deadline';
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
   };

   const formatSalary = (salaryRange) => {
      if (!salaryRange || !salaryRange.min) return 'Competitive';
      const formatter = new Intl.NumberFormat('ja-JP');
      return `Rs${formatter.format(salaryRange.min)} - Rs${formatter.format(salaryRange.max)}`;
   };


   // Animation Variants
   const fadeInUp = {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
   };

   const staggerContainer = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: {
            staggerChildren: 0.2
         }
      }
   };

   return (
      <div className="min-h-screen bg-white font-sans text-secondary-900 selection:bg-primary-100 overflow-x-hidden">
         <SEO
            title="Global Flow - Automate Your Consultancy"
            description="The smartest way to move to Japan. Automate COE documents, track applications, and practice with our AI Immigration Officer."
         />

         {/* --- DEMO MODAL --- */}
         {showDemoModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
               <div className="bg-primary-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-700 relative">
                  <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-secondary-800/50">
                     <h3 className="text-white font-bold">Platform Walkthrough</h3>
                     <button onClick={() => setShowDemoModal(false)} className="text-secondary-400 hover:text-white transition-colors">
                        <span className="sr-only">Close</span>✕
                     </button>
                  </div>
                  <div className="aspect-video bg-black flex items-center justify-center relative group cursor-pointer">
                     <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/20 to-transparent pointer-events-none"></div>
                     <p className="text-secondary-500 font-medium group-hover:text-secondary-400 transition-colors">Video Demo Coming Soon...</p>
                  </div>
               </div>
            </div>
         )}

         <Navbar />

         {/* --- HERO SECTION --- */}
         <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none">
               <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary-50 rounded-full blur-[80px] opacity-50"></div>
            </div>

            <motion.div
               initial="hidden"
               animate="visible"
               variants={staggerContainer}
               className="max-w-5xl mx-auto px-6 text-center relative z-10"
            >
               <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
                  <Sparkles size={14} className="text-primary-500" /> {heroBadge}
               </motion.div>

               <motion.h1 variants={fadeInUp} className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                  {heroTitle.includes('Japan') ? (
                     <>
                        {heroTitle.replace('Move to Japan.', '')}
                        <span className="text-primary-600">Move to Japan.</span>
                     </>
                  ) : heroTitle}
               </motion.h1>

               <motion.p variants={fadeInUp} className="text-base md:text-lg text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
                  {heroSubtitle}
               </motion.p>

               <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/inquiry/default">
                     <Button className="w-full sm:w-auto px-6 py-2.5 shadow-md hover:shadow-lg transition-shadow">
                        {ctaPrimaryText} <ArrowRight size={18} className="ml-2" />
                     </Button>
                  </Link>

                  <Button
                     variant="outline"
                     onClick={() => setShowDemoModal(true)}
                     className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-slate-50"
                  >
                     <Play size={16} className="fill-slate-700 mr-2 text-slate-700" /> {ctaSecondaryText}
                  </Button>
               </motion.div>

               {/* --- STATS SECTION (New) --- */}
               {statsList.length > 0 && (
                  <motion.div variants={fadeInUp} className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-8 md:gap-16">
                     {statsList.map((stat, idx) => (
                        <div key={idx} className="text-center">
                           <p className="text-2xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
                           <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
                        </div>
                     ))}
                  </motion.div>
               )}
            </motion.div>
         </section>

         {/* Banner Ad */}
         <BannerAd className="container mx-auto" />

         {/* --- DASHBOARD PREVIEW --- */}
         <section className="pb-24 px-4 relative">
            <motion.div
               initial={{ opacity: 0, y: 60 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="max-w-5xl mx-auto"
            >
               {/* Window Frame */}
               <div className="rounded-xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10 backdrop-blur-xl relative z-10">
                  <div className="relative rounded-lg overflow-hidden bg-white aspect-[16/10] md:aspect-[21/9] flex group">

                     {/* Sidebar - Primary Theme Color */}
                     <div className="w-16 md:w-56 bg-primary-900 border-r border-primary-800 flex flex-col pt-5 pb-4">
                        <div className="px-4 mb-6 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">GF</div>
                           <span className="text-white font-bold hidden md:block">GlobalFlow</span>
                        </div>
                        <div className="flex-1 space-y-1 px-2">
                           {[
                              { icon: LayoutDashboard, label: 'Dashboard', active: true },
                              { icon: Users, label: 'Students', active: false },
                              { icon: FileText, label: 'Documents', active: false },
                              { icon: MessageSquare, label: 'Messages', active: false },
                           ].map((item, i) => (
                              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-default ${item.active ? 'bg-primary-800 text-white' : 'text-primary-200 hover:text-white'}`}>
                                 <item.icon size={18} />
                                 <span className="text-sm font-medium hidden md:block">{item.label}</span>
                                 {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden md:block" />}
                              </div>
                           ))}
                        </div>
                        <div className="px-4 mt-auto">
                           <div className="flex items-center gap-3 text-primary-300 hover:text-white transition-colors cursor-pointer">
                              <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center"><Sparkles size={14} /></div>
                              <div className="hidden md:block">
                                 <p className="text-xs font-medium text-white">Upgrade Plan</p>
                                 <p className="text-[10px]">Unlock AI Features</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Main Content */}
                     <div className="flex-1 bg-slate-50 flex flex-col relative overflow-hidden">

                        {/* Header */}
                        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 md:px-8">
                           <div className="flex items-center gap-4 text-slate-400">
                              <span className="text-secondary-900 font-bold text-lg">Overview</span>
                           </div>
                           <div className="flex items-center gap-4">
                              {/* Search Placeholder */}
                              <div className="relative hidden md:block">
                                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search size={16} />
                                 </div>
                                 <div className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-48 text-slate-500 cursor-not-allowed">Search student...</div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200" />
                           </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-6 md:p-8 space-y-8 overflow-hidden relative">
                           {/* Stats Row */}
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                              {[
                                 { label: 'Total Students', value: '1,240', icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
                                 { label: 'Visa Granted', value: '856', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                 { label: 'Pending COE', value: '42', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
                              ].map((stat, i) => (
                                 <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between group hover:border-primary-100 transition-colors"
                                 >
                                    <div>
                                       <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">{stat.label}</p>
                                       <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                       <stat.icon size={20} />
                                    </div>
                                 </motion.div>
                              ))}
                           </div>

                           {/* Recent Applications Table */}
                           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                 <h3 className="font-bold text-slate-800">Recent Applications</h3>
                                 <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">Live Updates</span>
                              </div>
                              <div className="p-2">
                                 {[
                                    { name: 'Sita Sharma', status: 'Visa Granted', date: 'Just now', progress: 100, color: 'text-emerald-600', bar: 'bg-emerald-500' },
                                    { name: 'Ravi Verma', status: 'COE Processing', date: '2h ago', progress: 65, color: 'text-primary-600', bar: 'bg-primary-500' },
                                    { name: 'Anjali Gupta', status: 'Document Review', date: '5h ago', progress: 30, color: 'text-orange-600', bar: 'bg-orange-500' },
                                 ].map((row, i) => (
                                    <motion.div
                                       key={i}
                                       initial={{ opacity: 0, x: -10 }}
                                       whileInView={{ opacity: 1, x: 0 }}
                                       transition={{ delay: 0.5 + (i * 0.1) }}
                                       className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                             {row.name.charAt(0)}
                                          </div>
                                          <div>
                                             <p className="text-sm font-medium text-slate-900">{row.name}</p>
                                             <p className="text-xs text-slate-500">Student ID #{1000 + i}</p>
                                          </div>
                                       </div>
                                       <div className="hidden md:block w-32">
                                          <div className="flex justify-between text-[10px] mb-1">
                                             <span className={row.color + " font-semibold"}>{row.status}</span>
                                             <span className="text-slate-400">{row.progress}%</span>
                                          </div>
                                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                             <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${row.progress}%` }}
                                                transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                                className={`h-full rounded-full ${row.bar}`}
                                             />
                                          </div>
                                       </div>
                                    </motion.div>
                                 ))}
                              </div>
                           </div>

                           {/* Floating Success Toast */}
                           <motion.div
                              initial={{ y: 50, opacity: 0, scale: 0.9 }}
                              whileInView={{ y: 0, opacity: 1, scale: 1 }}
                              transition={{ delay: 1.5, type: 'spring' }}
                              className="absolute bottom-6 right-6 bg-slate-900 text-white pl-3 pr-4 py-2.5 rounded-lg shadow-xl flex items-center gap-3 text-sm font-medium z-20 border border-slate-700/50"
                           >
                              <div className="bg-emerald-500/20 p-1.5 rounded-full">
                                 <CheckCircle2 size={14} className="text-emerald-400" />
                              </div>
                              <div>
                                 <p>Visa Granted</p>
                                 <p className="text-[10px] text-slate-400">Sita Sharma • Just now</p>
                              </div>
                           </motion.div>

                        </div>
                     </div>
                  </div>
               </div>

               {/* Background Glow */}
               <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10 opacity-50 pointer-events-none" />
            </motion.div>
         </section>

         {/* --- FEATURES GRID --- */}
         <section id="features" className="py-12 lg:py-16 bg-slate-50 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 relative z-10">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center max-w-2xl mx-auto mb-10"
               >
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">Everything you need to <span className="text-primary-600">manage your consultancy.</span></h2>
                  <p className="text-slate-500 text-base leading-relaxed">We've digitized the entire workflow, eliminating 90% of paperwork.</p>
               </motion.div>

               <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8"
               >
                  {featuresList.map((feature, idx) => (
                     <FeatureCard
                        key={idx}
                        iconName={feature.icon}
                        title={feature.title}
                        desc={feature.description}
                        delay={idx * 0.1}
                     />
                  ))}
               </motion.div>
            </div>
         </section>

         {/* --- AI SECTION --- */}
         <section id="ai-simulator" className="py-16 overflow-hidden relative bg-white">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

               <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
               >
                  <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium mb-6 border border-primary-100">
                     <Bot size={14} /> Powered by Vapi.ai & GPT-4o
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                     {aiTitle} <br />
                     <span className="text-primary-600">AI Immigration Officer.</span>
                  </h2>
                  <p className="text-base text-slate-500 mb-6 leading-relaxed">
                     {aiDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-8 border border-primary-100">
                     <Bot size={14} /> Powered by Vapi.ai & GPT-4o
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6 leading-tight">
                     {aiTitle} <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">AI Immigration Officer.</span>
                  </h2>
                  <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                     {aiDesc}
                  </p>
                  <ul className="space-y-4 mb-10">
                     <ListItem text="Real-time voice interaction (latency < 800ms)" delay={0.1} />
                     <ListItem text="Student & Skilled Worker scenarios" delay={0.2} />
                     <ListItem text="Feedback on pronunciation and grammar" delay={0.3} />
                  </ul>
                  <Link to="/register" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all hover:text-primary-700 text-lg group">
                     Try the Simulator <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </motion.div>

               <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
               >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>

                  <div className="relative bg-primary-900 rounded-3xl p-8 border border-slate-700 shadow-2xl overflow-hidden group hover:border-slate-600 transition-colors">
                     {/* Window Header */}
                     <div className="flex justify-between items-center mb-12">
                        <div className="flex gap-2.5">
                           <div className="w-3 h-3 rounded-full bg-red-500"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-secondary-500 text-xs font-mono flex items-center gap-2">
                           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> LIVE SIMULATION
                        </div>
                     </div>

                     {/* Bot Avatar Area */}
                     <div className="h-64 flex items-center justify-center relative">
                        {/* Circle Waves */}
                        <div className="absolute inset-0 flex items-center justify-center">
                           <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="w-48 h-48 border border-primary-500/30 rounded-full absolute"></motion.div>
                           <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-64 h-64 border border-primary-500/20 rounded-full absolute"></motion.div>
                        </div>

                        <div className="relative z-10">
                           <div className="w-32 h-32 rounded-full border-4 border-primary-600 bg-secondary-800 flex items-center justify-center shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                              <Bot className="text-primary-400" size={48} />
                           </div>

                           {/* Chat Bubbles */}
                           <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="absolute -right-[110%] top-0 bg-white p-4 rounded-xl rounded-bl-none shadow-xl text-sm w-48 text-slate-700 font-medium"
                           >
                              こんにちは。お名前を教えてください。
                           </motion.div>

                           <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.5 }}
                              className="absolute -left-[110%] bottom-0 bg-primary-600 p-4 rounded-xl rounded-tr-none shadow-xl text-sm w-48 text-white font-medium"
                           >
                              私はカランです。
                           </motion.div>
                        </div>
                     </div>

                     {/* Controls */}
                     <div className="mt-12 flex justify-center gap-6">
                        <button className="h-14 w-14 rounded-full bg-secondary-800 hover:bg-secondary-700 border border-secondary-700 flex items-center justify-center text-secondary-400 transition-colors">
                           <MessageSquare size={20} />
                        </button>
                        <button className="h-14 w-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/50 relative overflow-hidden group/mic">
                           <div className="absolute inset-0 bg-red-500/20 translate-y-full group-hover/mic:translate-y-0 transition-transform"></div>
                           <div className="w-3 h-3 bg-red-500 rounded-sm animate-pulse relative z-10"></div>
                        </button>
                        <button className="h-14 w-14 rounded-full bg-secondary-800 hover:bg-secondary-700 border border-secondary-700 flex items-center justify-center text-secondary-400 transition-colors">
                           <Mic size={20} />
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         </section>



         {/* --- SUCCESS STORIES --- */}
         {testimonialsList.length > 0 && (
            <section id="testimonials" className="py-12 lg:py-16 bg-white relative">
               <div className="max-w-5xl mx-auto px-4">
                  <div className="text-center mb-10">
                     <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Loved by Consultancies in Nepal</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {testimonialsList.map((item, idx) => (
                        <motion.div
                           key={idx}
                           initial={{ opacity: 0, y: 20 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="bg-secondary-50 p-8 rounded-2xl border border-secondary-100 relative"
                        >
                           <Quote className="absolute top-6 right-6 text-primary-200" size={40} />
                           <p className="text-lg text-secondary-700 italic mb-6">"{item.quote}"</p>
                           <div className="flex items-center gap-4">
                              {item.image && (
                                 <div className="shrink-0">
                                    <img
                                       src={fixImageUrl(item.image)}
                                       alt={item.name}
                                       className="w-12 h-12 rounded-full object-cover bg-slate-200 border border-slate-100"
                                       onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                 </div>
                              )}
                              <div>
                                 <p className="font-bold text-secondary-900">{item.name}</p>
                                 <p className="text-sm text-secondary-500">{item.role}</p>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </section>
         )}

         {/* --- LATEST NEWS SECTION (BLOGS) --- */}
         {blogs && blogs.length > 0 && (
            <section className="py-12 lg:py-16 bg-slate-50 relative">
               <div className="max-w-6xl mx-auto px-4">
                  <div className="flex justify-between items-end mb-8">
                     <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Latest News & Updates</h2>
                        <p className="text-slate-500">Stay informed about studying and working in Japan.</p>
                     </div>
                     <Link to="/blogs" className="hidden md:flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all">
                        View All Blogs <ArrowRight size={20} />
                     </Link>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                     {blogs.map((blog) => (
                        <Link key={blog._id} to={`/blog/${blog.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:border-primary-100 transition-all duration-300">
                           <div className="relative aspect-video bg-slate-100 overflow-hidden">
                              {blog.featuredImage ? (
                                 <img src={fixImageUrl(blog.featuredImage)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                    <FileText size={48} />
                                 </div>
                              )}
                              <div className="absolute top-4 left-4">
                                 <span className="px-3 py-1 bg-white/90 backdrop-blur text-primary-700 text-xs font-bold rounded-full shadow-sm">
                                    {blog.category || 'News'}
                                 </span>
                              </div>
                           </div>
                           <div className="p-6">
                              <h3 className="text-xl font-bold text-secondary-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">{blog.title}</h3>
                              <p className="text-secondary-500 text-sm line-clamp-2 mb-4">{blog.excerpt}</p>
                              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-secondary-400 font-medium">
                                 <span className="flex items-center gap-1"><Clock size={14} /> {calculateReadTime(blog.content)} min read</span>
                                 <span className="flex items-center gap-1"><Eye size={14} /> {blog.viewCount || 0}</span>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>

                  <div className="mt-8 text-center md:hidden">
                     <Link to="/blogs" className="inline-flex items-center gap-2 text-primary-600 font-bold">
                        View All Blogs <ArrowRight size={20} />
                     </Link>
                  </div>
               </div>
            </section>
         )}

         {/* --- FEATURED CAREERS SECTION --- */}
         {jobs && jobs.length > 0 && (
            <section className="py-12 lg:py-16 bg-white relative border-t border-slate-100">
               <div className="max-w-6xl mx-auto px-4">
                  <div className="flex justify-between items-end mb-8">
                     <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Join Our Team</h2>
                        <p className="text-slate-500">Build your career with a forward-thinking company.</p>
                     </div>
                     <Link to="/careers" className="hidden md:flex items-center gap-2 text-primary-600 font-bold hover:gap-3 transition-all">
                        View Openings <ArrowRight size={20} />
                     </Link>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                     {jobs.map((job) => (
                        <div
                           key={job._id}
                           onClick={() => navigate(`/careers/${job.slug}`)}
                           className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100">
                                 {job.jobType.replace('-', ' ')}
                              </span>
                              {job.applicationDeadline && (
                                 <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} /> {formatDeadline(job.applicationDeadline)}
                                 </span>
                              )}
                           </div>

                           <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">{job.title}</h3>
                           <p className="text-sm font-semibold text-primary-600 mb-4">{job.department}</p>

                           <div className="space-y-2 mb-6 flex-grow">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                 <MapPin size={16} className="text-primary-500" />
                                 {job.location}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                 <DollarSign size={16} className="text-primary-500" />
                                 {formatSalary(job.salaryRange)}
                              </div>
                           </div>

                           <div className="pt-4 border-t border-slate-100 mt-auto">
                              <div className="flex items-center justify-between text-primary-600 font-bold text-sm group-hover:gap-2 transition-all">
                                 Apply Now <ArrowRight size={16} />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-8 text-center md:hidden">
                     <Link to="/careers" className="inline-flex items-center gap-2 text-primary-600 font-bold">
                        View Openings <ArrowRight size={20} />
                     </Link>
                  </div>
               </div>
            </section>
         )}

         {/* --- ABOUT US SUMMARY --- */}
         <section className="py-16 bg-white relative overflow-hidden border-t border-slate-100">
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
               <div>
                  <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium mb-6 border border-primary-100">
                     About Us
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{branding?.tagline || 'Empowering Your Journey to Japan'}</h2>
                  <p className="text-base text-slate-600 mb-6 leading-relaxed">
                     {about?.mission || "We are a dedicated team of education consultants and visa experts with over 10 years of experience helping students achieve their dreams."}
                  </p>

                  <div className="grid grid-cols-2 gap-8 mb-10">
                     {(about?.stats?.length > 0 ? about.stats : [
                        { value: '98%', label: 'Visa Success Rate' },
                        { value: '10k+', label: 'Students Counseled' },
                        { value: '5', label: 'Office Locations' },
                        { value: '24/7', label: 'Student Support' }
                     ]).map((stat, idx) => (
                        <div key={idx}>
                           <h4 className="text-3xl font-bold text-primary-600 mb-1">{stat.value}</h4>
                           <p className="text-sm text-slate-500">{stat.label}</p>
                        </div>
                     ))}
                  </div>

                  <Link to="/about">
                     <Button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3">
                        Learn More About Us
                     </Button>
                  </Link>
               </div>
               <div className="relative h-[400px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-lg">
                  {/* Placeholder for About Image if available, else abstract */}
                  {branding?.logo ? (
                     <img src={fixImageUrl(branding.logo)} alt="About Us" className="w-full h-full object-contain p-8" />
                  ) : (
                     <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center">
                        <Globe size={120} className="text-primary-200" />
                     </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-sm border-t border-slate-100">
                     <p className="text-slate-700 font-semibold text-lg italic">"{about?.mission || 'Our mission is to make international education accessible to everyone.'}"</p>
                     <p className="text-slate-500 text-sm mt-1">- {branding?.name || 'Founder'}'s Message</p>
                  </div>
               </div>
            </div>
         </section>

         {/* --- CONTACT SECTION --- */}
         <section className="py-12 lg:py-16 bg-white relative">
            <div className="max-w-3xl mx-auto px-4 text-center">
               <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Get in Touch</h2>
               <p className="text-slate-500 mb-8">Have questions? We're here to help you every step of the way.</p>

               <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                     <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-3">
                        <Phone size={20} />
                     </div>
                     <h4 className="font-semibold text-slate-900 mb-1 text-sm">Call Us</h4>
                     <p className="text-slate-500 text-sm">{contact?.mainContact?.phone || branding?.phone || "+977 1 4XXXXXX"}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                     <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
                        <Mail size={20} />
                     </div>
                     <h4 className="font-semibold text-slate-900 mb-1 text-sm">Email Us</h4>
                     <p className="text-slate-500 text-sm">{contact?.mainContact?.email || branding?.email || "info@example.com"}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                     <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-3">
                        <Map size={20} />
                     </div>
                     <h4 className="font-semibold text-slate-900 mb-1 text-sm">Visit Us</h4>
                     <p className="text-slate-500 text-sm">{contact?.mainContact?.address || branding?.address || "Your address"}</p>
                  </div>
               </div>

               <Link to="/contact">
                  <Button size="xl" className="bg-primary-600 hover:bg-primary-700 text-white px-12 py-5 shadow-xl shadow-primary-500/30">
                     Contact Support
                  </Button>
               </Link>
            </div>
         </section>

         {/* --- CTA SECTION --- */}
         <section className="py-16 bg-primary-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/20 rounded-full blur-[100px] opacity-30"></div>

            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="max-w-3xl mx-auto px-4 text-center relative z-10"
            >
               <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">Ready to streamline your visa process?</h2>
               <p className="text-primary-200 mb-8 max-w-xl mx-auto">Join the platform that is processing thousands of applications for Japan every month.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link to="/register" className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition shadow-md">
                     Get Started for Free
                  </Link>
                  <Link to="/contact" className="px-6 py-3 bg-transparent border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition">
                     Contact Sales
                  </Link>
               </div>
               <p className="mt-4 text-sm text-primary-300">No credit card required for 14-day trial.</p>
            </motion.div>
         </section>



         {/* --- FOOTER --- */}
         <footer className="bg-white border-t border-secondary-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2 mb-6">
                     {branding?.logo ? (
                        <img src={fixImageUrl(branding.logo)} alt={branding.name} className="w-8 h-8 rounded-lg object-cover" />
                     ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary-500/30">
                           {branding?.name?.charAt(0) || 'C'}
                        </div>
                     )}
                     <span className="font-bold text-xl tracking-tight text-secondary-900">{branding?.name || 'Your Consultancy'}</span>
                  </div>
                  <p className="text-sm text-secondary-500 leading-relaxed pr-8">{branding?.tagline || 'Helping students and workers reach Japan with confidence.'}</p>
               </div>
               <div>
                  <h4 className="font-bold text-secondary-900 mb-6">Quick Links</h4>
                  <ul className="space-y-3 text-sm text-secondary-500">
                     <li><Link to="/#features" className="hover:text-primary-600 transition-colors">Features</Link></li>
                     <li><Link to="/#ai-simulator" className="hover:text-primary-600 transition-colors">AI Interview</Link></li>
                     <li><Link to="/careers" className="hover:text-primary-600 transition-colors">Careers</Link></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-secondary-900 mb-6">Resources</h4>
                  <ul className="space-y-3 text-sm text-secondary-500">
                     <li><Link to="/blogs" className="hover:text-primary-600 transition-colors">Blog</Link></li>
                     <li><Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                     <li><Link to="/inquiry/default" className="hover:text-primary-600 transition-colors">Apply Online</Link></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-secondary-900 mb-6">Contact</h4>
                  <ul className="space-y-3 text-sm text-secondary-500">
                     <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
                     <li><Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link></li>
                     <li><Link to="/register" className="hover:text-primary-600 transition-colors">Register</Link></li>
                  </ul>
               </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 border-t border-secondary-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-sm text-secondary-400 font-medium">© {new Date().getFullYear()} {branding?.name || 'Your Consultancy'}. All rights reserved.</p>
               <div className="flex gap-4">
                  {contact?.socialMedia?.map((social, idx) => (
                     <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="text-secondary-400 hover:text-primary-600 transition-colors">
                        {social.platform}
                     </a>
                  ))}
               </div>
            </div>
         </footer>
      </div>
   );
}

// --- SUB COMPONENTS ---

export function FeatureCard({ iconName, title, desc, delay }) {
   return (
      <motion.div
         variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
         }}
         className="bg-white p-8 rounded-3xl border border-secondary-100/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-primary-100/50 hover:-translate-y-2 transition-all duration-300 group"
      >
         <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-secondary-100 group-hover:border-primary-100">
            <div className="group-hover:-rotate-6 transition-transform duration-300 text-primary-600">
               <DynamicIcon name={iconName} size={32} />
            </div>
         </div>
         <h3 className="text-xl font-bold text-secondary-900 mb-3">{title}</h3>
         <p className="text-secondary-500 leading-relaxed">{desc}</p>
      </motion.div>
   )
}

function ListItem({ text, delay }) {
   return (
      <motion.li
         initial={{ opacity: 0, x: -20 }}
         whileInView={{ opacity: 1, x: 0 }}
         transition={{ delay, duration: 0.5 }}
         viewport={{ once: true }}
         className="flex items-center gap-3 text-secondary-700 font-medium"
      >
         <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
         <span>{text}</span>
      </motion.li>
   )
}