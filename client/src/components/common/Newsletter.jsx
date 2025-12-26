import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subscribeToNewsletter, resetSubscribe } from '../../features/subscribe/subscribeSlice';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

const Newsletter = () => {
    const dispatch = useDispatch();
    const { isLoading, success, message, error } = useSelector((state) => state.subscribe);
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (success) {
            toast.success(message);
            setEmail('');
            // Reset state after 3 seconds so user can subscribe another email if they want
            // or just to clear the success state locally
            const timer = setTimeout(() => dispatch(resetSubscribe()), 5000);
            return () => clearTimeout(timer);
        }
        if (error) {
            toast.error(error);
            dispatch(resetSubscribe());
        }
    }, [success, error, message, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        dispatch(subscribeToNewsletter(email));
    };

    return (
        <section className="container mx-auto px-4 max-w-4xl mt-24 mb-24">
            <div className="bg-secondary-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full blur-[100px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                        <Mail className="text-white" size={32} />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay updated with JapanVisa</h2>
                    <p className="text-secondary-300 mb-8 max-w-xl mx-auto text-lg">
                        Get the latest immigration news, COE updates, and tips delivered straight to your inbox.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto" onSubmit={handleSubmit}>
                        <div className="flex-1 relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 backdrop-blur-sm transition-all"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || success}
                            className={`px-8 py-4 font-bold rounded-xl transition-all shadow-lg shadow-primary-900/50 flex items-center justify-center gap-2 min-w-[140px]
                                ${success
                                    ? 'bg-emerald-500 text-white cursor-default'
                                    : 'bg-primary-600 text-white hover:bg-primary-500 hover:scale-105 active:scale-95'
                                } disabled:opacity-70 disabled:hover:scale-100`}
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : success ? (
                                <>
                                    <CheckCircle size={20} />
                                    Subscribed
                                </>
                            ) : (
                                'Subscribe'
                            )}
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-secondary-500">
                        We respect your privacy. No spam, ever.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
