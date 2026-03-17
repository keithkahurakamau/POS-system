import React, { useState, useEffect } from 'react';
import { AnalyticsAPI } from '../services/api';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
    Title, Tooltip, Legend, ArcElement, Filler 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, DollarSign, Package, ArrowUpRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Analytics = () => {
    const [metrics, setMetrics] = useState({ 
        total_products: 0, 
        inventory_value: 0, 
        sales_today: 0, 
        total_profit: 0,
        sales_trend: [], 
        category_dist: {} 
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await AnalyticsAPI.getDashboard();
                setMetrics(res.data);
            } catch (err) {
                console.error("Dashboard load failed", err);
            }
        };
        loadData();
    }, []);

    // --- CHART LOGIC (NOW SINGLE DECLARATIONS) ---

    const salesData = {
        labels: metrics.sales_trend.length > 0 ? metrics.sales_trend.map(s => s.date) : ['No Data'],
        datasets: [{
            label: 'Daily Revenue (Ksh)',
            data: metrics.sales_trend.length > 0 ? metrics.sales_trend.map(s => s.total) : [0],
            fill: true,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
        }]
    };

    const categoryData = {
        labels: Object.keys(metrics.category_dist).length > 0 ? Object.keys(metrics.category_dist) : ['Empty'],
        datasets: [{
            data: Object.values(metrics.category_dist).length > 0 ? Object.values(metrics.category_dist) : [1],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 0,
        }]
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen overflow-y-auto scrollbar-hide">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Insights</h1>
                    <p className="text-slate-500 font-medium">Real-time performance metrics for your retail shop.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated</p>
                    <p className="text-sm font-bold text-slate-700">{new Date().toLocaleTimeString()}</p>
                </div>
            </header>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4"><TrendingUp /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Today's Sales</p>
                    <h2 className="text-2xl font-black text-slate-900">Ksh {metrics.sales_today.toLocaleString()}</h2>
                </div>

                <div className="bg-emerald-600 p-6 rounded-3xl shadow-xl shadow-emerald-200 transition-transform hover:scale-[1.02] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <div className="p-3 bg-white/20 text-white w-fit rounded-2xl mb-4"><ArrowUpRight /></div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Total Net Profit</p>
                    <h2 className="text-2xl font-black text-white">Ksh {metrics.total_profit.toLocaleString()}</h2>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-2xl mb-4"><Package /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Stock Value (Cost)</p>
                    <h2 className="text-2xl font-black text-slate-900">Ksh {metrics.inventory_value.toLocaleString()}</h2>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl mb-4"><Package /></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active SKUs</p>
                    <h2 className="text-2xl font-black text-slate-900">{metrics.total_products} Items</h2>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-800">Revenue Trend</h3>
                        <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase">Rolling 7-Day</span>
                    </div>
                    <div className="h-[300px]">
                        <Line data={salesData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-6">Inventory by Category</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        <Doughnut data={categoryData} options={{ cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 }}}}} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;