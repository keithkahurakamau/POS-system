import React, { useState, useEffect } from 'react';
import { SaleAPI } from '../services/api';
import { Printer, Calendar, Clock, CheckCircle2, Search } from 'lucide-react';

const SalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadSales = async () => {
            const res = await SaleAPI.getAll(); // Ensure this is added to your api.js
            setSales(res.data);
        };
        loadSales();
    }, []);

    const filteredSales = sales.filter(s => 
        s.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sale_id.toString().includes(searchTerm)
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen overflow-y-auto scrollbar-hide">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sales Ledger</h1>
                    <p className="text-slate-500 font-medium">History of all transactions and M-Pesa records.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search receipt or ID..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-5 font-bold text-slate-600 text-xs uppercase">Sale ID</th>
                            <th className="p-5 font-bold text-slate-600 text-xs uppercase text-center"><Calendar size={14} className="inline mr-1"/> Date</th>
                            <th className="p-5 font-bold text-slate-600 text-xs uppercase">M-Pesa Reference</th>
                            <th className="p-5 font-bold text-slate-600 text-xs uppercase">Total (Ksh)</th>
                            <th className="p-5 font-bold text-slate-600 text-xs uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSales.map(sale => (
                            <tr key={sale.sale_id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-5 font-black text-slate-700"># {sale.sale_id}</td>
                                <td className="p-5 text-slate-500 font-medium text-sm text-center">
                                    {new Date(sale.sale_date).toLocaleDateString()} <br/>
                                    <span className="text-[10px] opacity-60">{new Date(sale.sale_date).toLocaleTimeString()}</span>
                                </td>
                                <td className="p-5 font-mono text-sm">
                                    {sale.mpesa_receipt_number ? (
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
                                            {sale.mpesa_receipt_number}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 italic">No Reference</span>
                                    )}
                                </td>
                                <td className="p-5 font-black text-slate-900">{sale.total_amount.toLocaleString()}</td>
                                <td className="p-5 text-right">
                                    <button 
                                        onClick={() => window.open(`http://localhost:8000/api/sales/${sale.sale_id}/receipt`, '_blank')}
                                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition shadow-lg active:scale-95"
                                    >
                                        <Printer size={14} /> Re-print
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesHistory;