import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/forgotpassword', { email });
            setEmailSent(true);
            toast.success('Password reset email sent!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Mail className="text-white" size={28} />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Forgot Password?
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    No worries, we&apos;ll send you reset instructions.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardContent className="p-8">
                        {!emailSent ? (
                            <form className="space-y-6" onSubmit={onSubmit}>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="Email address"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    isLoading={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>

                                <div className="text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Mail className="text-emerald-600" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Check your email</h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => setEmailSent(false)}
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        try again
                                    </button>
                                </p>
                                <div className="pt-4">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ForgotPassword;
