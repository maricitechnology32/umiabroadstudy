 

import { Building2, Calendar, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getStudentById } from '../../features/students/studentSlice'; // To refresh profile
import { applyStudent, getUniversities } from '../../features/universities/universitySlice';

export default function UniversityApplications({ student }) {
  const dispatch = useDispatch();
  
  // Fetch universities from the consultancy's list
  const { universities, isLoading } = useSelector((state) => state.universities);
  
  // Get current user to check role
  const { user } = useSelector((state) => state.auth);
  const isStudent = user?.role === 'student';
  
  const [selectedUni, setSelectedUni] = useState('');
  const [status, setStatus] = useState('Shortlisted');
  const [intake, setIntake] = useState('April 2025');
  const [course, setCourse] = useState('Japanese Language Course');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load the consultancy's university list when component mounts
  // Only needed if we are an admin adding a university, but good to have for reference
  useEffect(() => {
    if (!isStudent) {
        dispatch(getUniversities());
    }
  }, [dispatch, isStudent]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedUni) return toast.error("Please select a university");
    
    setIsSubmitting(true);
    try {
        // Find the selected university object to get its name
        const uniObj = universities.find(u => u._id === selectedUni);

        await dispatch(applyStudent({
            studentId: student._id,
            universityId: selectedUni,
            universityName: uniObj?.name, // Send name for easier display
            status,
            intake,
            course
        })).unwrap(); // Unwrap to handle errors in catch block
        
        toast.success("University assigned successfully!");
        
        // Refresh the student profile to show the new application immediately
        dispatch(getStudentById(student._id));
        
        // Reset form
        setSelectedUni('');
        setStatus('Shortlisted');
    } catch (error) {
        toast.error("Failed to assign university");
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
        
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-gray-800">University Applications</h2>
                <p className="text-sm text-gray-500">
                    {isStudent 
                        ? "View the status of your university applications." 
                        : "Manage university shortlisting and application status."}
                </p>
            </div>
        </div>

        {/* ASSIGNMENT FORM - HIDDEN FOR STUDENTS */}
        {!isStudent && (
            <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Plus size={16}/> Assign New University
                </h4>
                <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    
                    {/* University Selector */}
                    <div className="md:col-span-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">University / School</label>
                        <select 
                            className="w-full p-2.5 border border-green-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={selectedUni}
                            onChange={(e) => setSelectedUni(e.target.value)}
                        >
                            <option value="">Select University...</option>
                            {universities.map(uni => (
                                <option key={uni._id} value={uni._id}>
                                    {uni.name} ({uni.location})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Course */}
                    <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course</label>
                        <input 
                            className="w-full p-2.5 border border-green-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            placeholder="e.g. Japanese Language"
                        />
                    </div>

                    {/* Intake */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Intake</label>
                        <select 
                            className="w-full p-2.5 border border-green-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={intake}
                            onChange={(e) => setIntake(e.target.value)}
                        >
                            <option>April 2025</option>
                            <option>July 2025</option>
                            <option>October 2025</option>
                            <option>January 2026</option>
                            <option>April 2026</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Status</label>
                        <select 
                            className="w-full p-2.5 border border-green-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option>Shortlisted</option>
                            <option>Applied</option>
                            <option>Offer Letter</option>
                            <option>COE Received</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <button 
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="w-full p-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center transition-colors disabled:bg-green-400"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* APPLICATIONS LIST - VISIBLE TO EVERYONE */}
        <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {isStudent ? "My Applications" : "Current Applications"}
            </h4>
            
            {student?.applications?.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <Building2 className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-400 text-sm">No universities assigned yet.</p>
                </div>
            )}

            {student?.applications?.map((app) => (
                <div key={app._id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className="bg-green-50 p-3 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{app.universityName}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {app.intake}</span>
                                <span>•</span>
                                <span>{app.course}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize
                            ${app.status === 'Visa Granted' ? 'bg-green-50 text-green-700 border-green-200' : 
                              app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                              app.status === 'COE Received' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                            {app.status}
                        </span>
                        
                        <div className="text-right">
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Applied On</p>
                             <p className="text-xs text-gray-600">{new Date(app.applicationDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}