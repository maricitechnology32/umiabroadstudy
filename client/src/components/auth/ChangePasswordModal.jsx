import { useState } from 'react';
import { Lock, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

export default function ChangePasswordModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const { currentPassword, newPassword, confirmPassword } = formData;

    const onChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const resetForm = () => {
        setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setShowPasswords({
            current: false,
            new: false,
            confirm: false
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (currentPassword === newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/auth/changepassword', { currentPassword, newPassword });
            toast.success('Password changed successfully!');
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Change Password" size="sm">
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Current Password */}
                <div className="relative">
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        label="Current Password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={onChange}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                    >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* New Password */}
                <div className="relative">
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        label="New Password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={onChange}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                    >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Confirm New Password */}
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={onChange}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                    >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Password requirements */}
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
                    <p className="font-medium mb-1">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li className={newPassword.length >= 6 ? 'text-emerald-600' : ''}>
                            At least 6 characters
                        </li>
                        <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-emerald-600' : ''}>
                            Passwords must match
                        </li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
