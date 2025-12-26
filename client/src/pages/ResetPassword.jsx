import { Loader2, Lock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

function ResetPassword() {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState(false);

    const { password, confirmPassword } = formData;

    const onChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Regex for uppercase, lowercase, number, special char
        const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\];:'"<>,.?/|\\])/;

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (!complexityRegex.test(password)) {
            toast.error('Password must include uppercase, lowercase, number, and special character');
            return;
        }

        setIsLoading(true);
        try {
            await api.put(`/auth/resetpassword/${resettoken}`, { password, confirmPassword });
            // Note: confirmPassword sent just in case backend wants it later, but mainly for frontend check
            setResetSuccess(true);
            toast.success('Password reset successful!');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to reset password';

            // If it's a validation error, don't show the "Link Expired" screen
            if (errorMsg === 'Validation failed' || errorMsg.includes('Password must')) {
                toast.error(error.response?.data?.errors?.[0]?.message || errorMsg);
            } else {
                // For other errors (likely token invalid), show the error state
                setResetError(true);
                toast.error(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${resetSuccess
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30'
                    : resetError
                        ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                        : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/30'
                    }`}>
                    {resetSuccess ? (
                        <CheckCircle className="text-white" size={28} />
                    ) : resetError ? (
                        <XCircle className="text-white" size={28} />
                    ) : (
                        <Lock className="text-white" size={28} />
                    )}
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    {resetSuccess ? 'Password Reset!' : resetError ? 'Reset Failed' : 'Set New Password'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {resetSuccess
                        ? 'Your password has been successfully changed.'
                        : resetError
                            ? 'The reset link is invalid or has expired.'
                            : 'Enter your new password below.'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="border-none shadow-xl shadow-slate-200/50">
                    <CardContent className="p-8">
                        {resetSuccess ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="text-emerald-600" size={32} />
                                </div>
                                <p className="text-sm text-slate-600">
                                    You can now login with your new password.
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        ) : resetError ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="text-red-600" size={32} />
                                </div>
                                <p className="text-sm text-slate-600">
                                    Please request a new password reset link.
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => navigate('/forgot-password')}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        Request New Link
                                    </Button>
                                    <Link
                                        to="/login"
                                        className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form className="space-y-6" onSubmit={onSubmit}>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    label="New Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={onChange}
                                    required
                                    autoComplete="new-password"
                                />

                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    label="Confirm New Password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={onChange}
                                    required
                                    autoComplete="new-password"
                                />

                                <div className="text-xs text-slate-500">
                                    Password must be at least 6 characters.
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    isLoading={isLoading}
                                >
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ResetPassword;
