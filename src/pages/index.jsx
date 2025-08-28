import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import ClientManagement from "./ClientManagement";

import Leads from "./Leads";

import Automations from "./Automations";

import Messages from "./Messages";

import Appointments from "./Appointments";

import Analytics from "./Analytics";

import Integrations from "./Integrations";

import SMSSettings from "./SMSSettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    ClientManagement: ClientManagement,
    
    Leads: Leads,
    
    Automations: Automations,
    
    Messages: Messages,
    
    Appointments: Appointments,
    
    Analytics: Analytics,
    
    Integrations: Integrations,
    
    SMSSettings: SMSSettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/ClientManagement" element={<ClientManagement />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Automations" element={<Automations />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Appointments" element={<Appointments />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Integrations" element={<Integrations />} />
                
                <Route path="/SMSSettings" element={<SMSSettings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}