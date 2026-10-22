import { createBrowserRouter } from 'react-router';
import Root from '../Pages/Root/Root';
import Error from '../Pages/ErrorPage/Error';
import Home from '../Pages/Home/Home';
import Login from '../Pages/Login/Login';
import Register from '../Pages/Register/Register';
import Projects from '../Pages/Projects/Projects';
import Gismap from '../Pages/Gismap/Gismap';
import About from '../Pages/About/About';
import Contact from '../Pages/Contact/Contact';
import ResetPassword from '../Pages/ResetPassword/ResetPassword';
import ProjectDetails from '../Pages/ProjectDetails/ProjectDetails';
import Blog from '../Pages/Blog/Blog';
import BlogPostDetails from '../Pages/Blog/BlogPostDetails';
import TermsOfService from '../Pages/About/TermsOfService';
import PrivacyPolicy from '../Pages/About/PrivacyPolicy';

// Dashboard
import Dashboard from '../Pages/Dashboard/Dashboard';
import Overview from '../Pages/Dashboard/Overview';
import FinancialLedger from '../Pages/Dashboard/FinancialLedger';
import ProjectProgress from '../Pages/Dashboard/ProjectProgress';
import Support from '../Pages/Dashboard/Support';
import Profile from '../Pages/Dashboard/Profile';
import Settings from '../Pages/Dashboard/Settings';
import ProtectedRoute from '../Components/ProtectedRoute/ProtectedRoute';

// Admin Pages
import AdminLayout from '../Pages/Admin/AdminLayout';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import ClientManagement from '../Pages/Admin/ClientManagement';
import AdminLeads from '../Pages/Admin/AdminLeads';
import AdminOnboarding from '../Pages/Admin/AdminOnboarding';
import AdminInstallments from '../Pages/Admin/AdminInstallments';
import AdminFinancials from '../Pages/Admin/AdminFinancials';
import AdminSiteProgress from '../Pages/Admin/AdminSiteProgress';
import AdminWebsiteProjects from '../Pages/Admin/AdminWebsiteProjects';
import AdminProjectDetails from '../Pages/Admin/AdminProjectDetails';
import AdminSettings from '../Pages/Admin/AdminSettings';
import AdminTickets from '../Pages/Admin/AdminTickets';

import { Outlet } from 'react-router';
import ChatWidget from '../Components/ChatWidget/ChatWidget';

// ── AppLayout Wrapper ────────────────────────────────────────────────────────
// Mounts ChatWidget globally across all pages without routing it.
// It shares the react-router context.
const AppLayout = () => {
    return (
        <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-150">
            <Outlet />
            <ChatWidget />
        </div>
    );
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: '',
                Component: Root,
                errorElement: <Error />,
                children: [
                    {
                        index: true,
                        Component: Home,
                    },
                    {
                        path: 'projects',
                        Component: Projects,
                    },
                ],
            },
            { path: 'login',          Component: Login },
            { path: 'register',       Component: Register },
            { path: 'terms',          Component: TermsOfService },
            { path: 'privacy',        Component: PrivacyPolicy },
            { path: 'gismap',         Component: Gismap },
            { path: 'about',          Component: About },
            { path: 'contact',        Component: Contact },
            { path: 'blog',           Component: Blog },
            { path: 'blog/:id',       Component: BlogPostDetails },
            { path: 'reset-password', Component: ResetPassword },
            { path: 'project-details/:id', Component: ProjectDetails },

            // ── Protected Dashboard ───────────────────────────────────────────────────
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true,              Component: Overview },
                    { path: 'financials',       Component: FinancialLedger },
                    { path: 'progress',         Component: ProjectProgress },
                    { path: 'profile',          Component: Profile },
                    { path: 'settings',         Component: Settings },
                    { path: 'support',          Component: Support },
                ],
            },
            // ── Protected Admin ───────────────────────────────────────────────────────
            {
                path: 'admin',
                element: (
                    <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true,              Component: AdminDashboard },
                    { path: 'management',       Component: ClientManagement },
                    { path: 'leads',            Component: AdminLeads },
                    { path: 'onboarding',       Component: AdminOnboarding },
                    { path: 'installments',     Component: AdminInstallments },
                    { path: 'financials',       Component: AdminFinancials },
                    { path: 'progress',         Component: AdminSiteProgress },
                    { path: 'project-details',  Component: AdminProjectDetails },
                    { path: 'website-projects', Component: AdminWebsiteProjects },
                    { path: 'settings',         Component: AdminSettings },
                    { path: 'tickets',          Component: AdminTickets },
                    { path: 'contact',          Component: AdminSettings },
                ]
            },
            // ── Catch-all Fallback Route ──────────────────────────────────────────────
            { path: '*', Component: Error },
        ]
    }
]);