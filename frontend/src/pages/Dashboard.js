import React, { useState, useEffect } from 'react';
import { AnalyticsAPI, ProductAPI } from '../services/api';
import { 
    LayoutDashboard, 
    AlertCircle, 
    AlertTriangle, // Added this
    CheckCircle2, 
    Clock, 
    ArrowRight,
    TrendingUp,
    ShoppingBag,
    ShoppingCart // Added this
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [metrics, setMetrics] = useState({ total_products: 0, inventory_value: 0, sales_today: 0, total_profit: 0 });
    const [lowStockItems, setLowStockItems] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [analyticsRes, productsRes] = await Promise.all([
                    AnalyticsAPI.getDashboard(),
                    ProductAPI.getAll()
                ]);
                setMetrics(analyticsRes.data);
                
                // Filter for items with less than 10 units in stock
                const lowStock = productsRes.data.filter(p => p.quantity_in_stock < 10);
                setLowStockItems(lowStock.slice(0, 5)); // Show top 5 urgent items
            } catch (error) {
                console.error("Dashboard load failed", error);
            }
        };
        loadDashboardData();
    }, []);

    return (
        <div className="p-8 bg-slate-50 min-h-screen overflow-y-auto scrollbar-hide">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Hello, Shop Manager</h1>
                <p className="text-slate-500 font-medium">Here's what's happening in the shop today.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Metrics & Quick Actions */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 text-emerald-100 group-hover:text-emerald-200 transition-colors">
                                <TrendingUp size={64} />
                            </div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Today's Revenue</p>
                            <h2 className="text-3xl font-black text-slate-900">Ksh {metrics.sales_today.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                <CheckCircle2 size={16} /> <span>Live Updates</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Estimated Profit</p>
                            <h2 className="text-3xl font-black text-white">Ksh {metrics.total_profit.toLocaleString()}</h2>
                            <Link to="/analytics" className="mt-4 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-sm transition">
                                View Full Report <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Recent Alerts / Low Stock */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900">Inventory Alerts</h3>
                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase">
                                {lowStockItems.length} Urgent
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {lowStockItems.length > 0 ? (
                                lowStockItems.map(item => (
                                    <div key={item.product_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-red-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{item.product_name}</p>
                                                <p className="text-xs text-slate-500 font-bold uppercase">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-600 font-black">{item.quantity_in_stock} left</p>
                                            <Link to="/admin" className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition">Update Stock</Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">All stock levels look healthy!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Start & Help */}
                <div className="space-y-8">
                    <div className="bg-emerald-600 p-8 rounded-[40px] text-white shadow-lg shadow-emerald-200 overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Start a Sale</h3>
                            <p className="text-emerald-100 text-sm mb-6 leading-relaxed">Ready to serve a customer? Open the terminal to begin.</p>
                            <Link to="/" className="inline-flex items-center justify-center bg-white text-emerald-600 px-6 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-50 transition-all active:scale-95">
                                <ShoppingBag size={18} className="mr-2" /> Open POS Terminal
                            </Link>
                        </div>
                        <ShoppingCart size={140} className="absolute -bottom-10 -right-10 text-emerald-500 opacity-20 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" /> System Log
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <div className="w-1 bg-emerald-500 rounded-full" />
                                <div>
                                    <p className="font-bold text-slate-700">M-Pesa API Connected</p>
                                    <p className="text-xs text-slate-400 font-medium">Verified at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-1 bg-blue-500 rounded-full" />
                                <div>
                                    <p className="font-bold text-slate-700">Database Sync Stable</p>
                                    <p className="text-xs text-slate-400 font-medium">All local changes pushed.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;