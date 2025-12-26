import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
    };

    return (
        <div className="min-h-screen flex flex-col bg-secondary-50 overflow-x-hidden">

            <div className="flex flex-1 w-full">
                {/* Sidebar */}
                <Sidebar
                    onLogout={handleLogout}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main column - takes full width minus sidebar on large screens */}
                <div className="flex flex-col flex-1 w-full min-w-0 lg:pl-64">

                    {/* Header */}
                    <Header onMenuClick={() => setIsSidebarOpen(true)} user={user} />

                    {/* Main content - properly constrained */}
                    <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">
                        <div className="mx-auto max-w-6xl w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Layout;

