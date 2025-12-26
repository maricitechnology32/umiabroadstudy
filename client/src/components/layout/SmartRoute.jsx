import React from 'react';
import { useSelector } from 'react-redux';
import Layout from './Layout';

/**
 * SmartRoute wrapper that adapts content based on authentication status.
 * 
 * Props:
 * - children: The public component to render (e.g., <AboutUs />)
 * - dashboardComponent: Optional. A specific component to render for logged-in users.
 *   If not provided, 'children' will be rendered wrapped in Layout, with an 'isDashboard' prop injected.
 * 
 * Usage:
 * <Route path="/about" element={<SmartRoute><AboutUs /></SmartRoute>} />
 * <Route path="/contact" element={<SmartRoute dashboardComponent={DashboardContact}><Contact /></SmartRoute>} />
 */
const SmartRoute = ({ children, dashboardComponent: DashboardComponent }) => {
    const { user } = useSelector((state) => state.auth);

    if (user) {
        // Authenticated user

        // 1. If a specific dashboard component is provided, use it
        if (DashboardComponent) {
            return (
                <Layout>
                    <DashboardComponent />
                </Layout>
            );
        }

        // 2. Otherwise, wrap the public component in Layout and inject isDashboard prop
        // We use React.cloneElement to pass the prop to the child
        return (
            <Layout>
                {React.isValidElement(children)
                    ? React.cloneElement(children, { isDashboard: true })
                    : children
                }
            </Layout>
        );
    }

    // Public visitor - render as is
    return children;
};

export default SmartRoute;
