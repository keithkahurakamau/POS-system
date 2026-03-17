import React, { useState, useEffect } from 'react';
import { ProductAPI, SaleAPI, PaymentAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
    Search, ShoppingCart, Trash2, CreditCard, 
    ChevronRight, Package, Loader2, AlertTriangle, X,
    Smartphone, Banknote // Added new icons
} from 'lucide-react';

const POS = () => {
    const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('MPESA'); // New state: 'MPESA' or 'CASH'
    const [paymentStatus, setPaymentStatus] = useState('IDLE'); 
    const [lowStockAlert, setLowStockAlert] = useState(null);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            const response = await ProductAPI.getAll();
            setProducts(response.data);
        } catch (error) { console.error("Failed to load products", error); }
    };

    const handleAddToCart = (product) => {
        if (product.quantity_in_stock <= 0) {
            setLowStockAlert({ name: product.product_name, type: 'OUT_OF_STOCK', qty: 0 });
            return;
        }
        if (product.quantity_in_stock < 10) {
            setLowStockAlert({ name: product.product_name, type: 'LOW_STOCK', qty: product.quantity_in_stock });
        }
        addToCart(product);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        // Require phone only for M-Pesa
        if (paymentMethod === 'MPESA' && !phoneNumber) return;

        setPaymentStatus('PROCESSING');

        try {
            const salePayload = {
                total_amount: cartTotal,
                payment_method: paymentMethod, // Dynamically set method
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal
                }))
            };

            const saleResponse = await SaleAPI.create(salePayload);
            const saleId = saleResponse.data.sale_id;

            if (paymentMethod === 'CASH') {
                // INSTANT CASH SUCCESS
                setPaymentStatus('COMPLETED');
                window.open(`http://localhost:8000/api/sales/${saleId}/receipt`, '_blank');
                clearCart();
                setTimeout(() => setPaymentStatus('IDLE'), 4000);
            } else {
                // MPESA WORKFLOW
                await PaymentAPI.initiateStkPush({
                    sale_id: saleId,
                    phone_number: phoneNumber,
                    amount: cartTotal
                });

                const pollInterval = setInterval(async () => {
                    const statusCheck = await SaleAPI.getById(saleId);
                    if (statusCheck.data.transaction_status === 'COMPLETED') {
                        clearInterval(pollInterval);
                        setPaymentStatus('COMPLETED');
                        window.open(`http://localhost:8000/api/sales/${saleId}/receipt`, '_blank');
                        clearCart();
                        setPhoneNumber('');
                        setTimeout(() => setPaymentStatus('IDLE'), 5000);
                    }
                }, 3000);

                setTimeout(() => {
                    clearInterval(pollInterval);
                    setPaymentStatus(prev => prev === 'COMPLETED' ? 'COMPLETED' : 'FAILED');
                }, 60000);
            }

        } catch (error) {
            console.error("Checkout failed:", error);
            setPaymentStatus('FAILED');
        }
    };

    const filteredProducts = products.filter(p => 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            
            {lowStockAlert && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5">
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${
                        lowStockAlert.type === 'OUT_OF_STOCK' ? 'bg-red-600 border-red-500' : 'bg-amber-500 border-amber-400'
                    } text-white`}>
                        <AlertTriangle size={24} className="animate-pulse" />
                        <div>
                            <p className="font-black text-sm uppercase tracking-tighter leading-none mb-1">
                                {lowStockAlert.type === 'OUT_OF_STOCK' ? 'Out of Stock!' : 'Running Low!'}
                            </p>
                            <p className="text-xs font-bold opacity-90">{lowStockAlert.name} has only {lowStockAlert.qty} left.</p>
                        </div>
                        <button onClick={() => setLowStockAlert(null)} className="ml-4 p-1 hover:bg-white/20 rounded-lg transition"><X size={18} /></button>
                    </div>
                </div>
            )}
            
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white p-6 border-b border-slate-200 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                        <Package size={18}/><span className="text-sm font-bold uppercase tracking-wider">{products.length} Items</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.product_id} onClick={() => handleAddToCart(product)} className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-slate-200">
                                <div className="aspect-square rounded-2xl bg-slate-50 mb-3 overflow-hidden border border-slate-100 relative">
                                    {product.image_url ? <img src={`http://localhost:8000${product.image_url}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={48} /></div>}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 shadow-sm uppercase">{product.category}</div>
                                </div>
                                <h3 className="font-bold text-slate-800 line-clamp-1">{product.product_name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-lg font-black text-emerald-600">Ksh {product.selling_price}</span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${product.quantity_in_stock < 10 ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>QTY: {product.quantity_in_stock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            <aside className="w-[400px] bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10">
                <div className="p-6 flex items-center gap-3 border-b border-slate-50">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><ShoppingCart size={24} /></div>
                    <div><h2 className="text-xl font-black text-slate-900 leading-tight">Current Sale</h2><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{cart.length} unique items</p></div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50"><ShoppingCart size={64} strokeWidth={1} /><p className="mt-4 font-bold text-lg">Cart is empty</p></div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product_id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl group border border-transparent hover:border-emerald-100 transition-all">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.product_name}</h4>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Ksh {item.unit_price} × {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800 text-sm">Ksh {item.subtotal}</p>
                                    <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600 p-1 transition"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-900 rounded-t-[40px] text-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
                    {/* NEW: Payment Method Switcher */}
                    <div className="flex gap-2 mb-6 p-1 bg-slate-800 rounded-2xl border border-slate-700">
                        <button 
                            onClick={() => setPaymentMethod('MPESA')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${paymentMethod === 'MPESA' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                        >
                            <Smartphone size={16} /> M-Pesa
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('CASH')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${paymentMethod === 'CASH' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-300'}`}
                        >
                            <Banknote size={16} /> Cash
                        </button>
                    </div>

                    <div className="flex justify-between items-end mb-6">
                        <div><p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">Total Payable</p><h3 className="text-4xl font-black leading-none">Ksh {cartTotal.toLocaleString()}</h3></div>
                        <button onClick={clearCart} className="text-slate-400 hover:text-white text-xs font-bold transition">Clear All</button>
                    </div>

                    <div className="space-y-4">
                        {paymentMethod === 'MPESA' ? (
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="M-Pesa Number (254...)"
                                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-4 text-white font-bold text-lg outline-none focus:border-emerald-500 transition-all"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl text-center">
                                <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Collect Ksh {cartTotal.toLocaleString()} from Customer</p>
                            </div>
                        )}

                        <button 
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || paymentStatus === 'PROCESSING'}
                            className="w-full py-5 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-900/40"
                        >
                            {paymentStatus === 'PROCESSING' ? (
                                <><Loader2 className="animate-spin" /> {paymentMethod === 'MPESA' ? 'Verifying...' : 'Processing...'}</>
                            ) : (
                                <><CreditCard size={22} /> {paymentMethod === 'CASH' ? 'Complete Cash Sale' : 'Charge M-Pesa'} <ChevronRight size={18} /></>
                            )}
                        </button>

                        {paymentStatus === 'COMPLETED' && (
                            <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-center font-bold animate-bounce mt-4">
                                Sale Successful! Receipt Opened.
                            </div>
                        )}
                        {paymentStatus === 'FAILED' && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-2xl text-center font-bold mt-4 border border-red-500/50">
                                Transaction Failed. Try again.
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default POS;