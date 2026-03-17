import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Settings, LogOut, Clock } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: <ShoppingCart size={22} />, label: 'Sales' },
        { path: '/admin', icon: <Package size={22} />, label: 'Inventory' },
        { path: '/analytics', icon: <BarChart3 size={22} />, label: 'Insights' },
        { path: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
        { path: '/history', icon: <Clock size={22} />, label: 'History' },
    ];

    return (
        <aside className="w-20 md:w-64 bg-slate-900 h-screen flex flex-col transition-all duration-300 shadow-2xl z-50">
            {/* Brand Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-white font-black text-xl">KN</span>
                </div>
                <span className="hidden md:block text-white font-black tracking-tighter text-xl">
                    Kamkunji<span className="text-emerald-400">Ndogo</span>
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
                            ${isActive 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
                        `}
                    >
                        <div className="transition-transform group-hover:scale-110">
                            {item.icon}
                        </div>
                        <span className="hidden md:block font-bold text-sm tracking-wide">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 mt-auto border-t border-slate-800">
                <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group">
                    <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden md:block font-bold text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;