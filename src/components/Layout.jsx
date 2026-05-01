import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, activePage, setActivePage, darkMode, toggleDarkMode }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex font-sans">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
            />

            <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
                <Header title={activePage} />

                <div className="flex-1 p-8 mt-16 overflow-y-auto text-slate-800 dark:text-slate-100">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
