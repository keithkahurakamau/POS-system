import React, { useState, useEffect } from 'react';
import { ProductAPI } from '../services/api';
import { Edit, Trash2, Plus, X, Package, Search } from 'lucide-react';

const Admin = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        product_name: '', category: '', buying_price: '', 
        selling_price: '', quantity_in_stock: '', sku: '', description: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            const res = await ProductAPI.getAll();
            setProducts(res.data);
        } catch (err) { console.error("Error loading products", err); }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
        } else {
            setEditingProduct(null);
            setFormData({ product_name: '', category: '', buying_price: '', selling_price: '', quantity_in_stock: '', sku: '', description: '' });
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (selectedImage) data.append('image', selectedImage);

        try {
            if (editingProduct) {
                await ProductAPI.update(editingProduct.product_id, data);
            } else {
                await ProductAPI.create(data);
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (err) { alert("Action failed. Check console."); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await ProductAPI.delete(id);
            loadProducts();
        }
    };

    const filteredProducts = products.filter(p => 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Inventory</h1>
                    <p className="text-slate-500">Manage your shop's stock levels and pricing.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> Add New Product
                </button>
            </div>

            {/* Search & Stats Bar */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <Package className="text-emerald-600" size={20} />
                    <span className="font-semibold">{products.length} Total Items</span>
                </div>
            </div>

            {/* Table Section */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Product</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Category</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">SKU</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Stock</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Price (Ksh)</th>
                                <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map(product => (
                                <tr key={product.product_id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                                            {product.image_url ? (
                                                <img src={`http://localhost:8000${product.image_url}`} className="w-full h-full object-cover" alt="" />
                                            ) : <Package className="w-full h-full p-2 text-slate-300" />}
                                        </div>
                                        <span className="font-bold text-slate-800">{product.product_name}</span>
                                    </td>
                                    <td className="p-4 text-slate-600 font-medium">{product.category}</td>
                                    <td className="p-4 font-mono text-sm text-slate-500">{product.sku}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${product.quantity_in_stock < 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {product.quantity_in_stock} in stock
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-slate-900">{product.selling_price.toLocaleString()}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(product.product_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-black text-slate-800">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Product Name</label>
                                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-emerald-500" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-emerald-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">SKU</label>
                                <input required className="w-full p-3 rounded-xl border border-slate-200 outline-emerald-500" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Buying Price</label>
                                <input type="number" required className="w-full p-3 rounded-xl border border-slate-200 outline-emerald-500" value={formData.buying_price} onChange={e => setFormData({...formData, buying_price: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Selling Price</label>
                                <input type="number" required className="w-full p-3 rounded-xl border border-slate-200 outline-emerald-500" value={formData.selling_price} onChange={e => setFormData({...formData, selling_price: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Stock Quantity</label>
                                <input type="number" required className="w-full p-3 rounded-xl border border-slate-200 outline-emerald-500" value={formData.quantity_in_stock} onChange={e => setFormData({...formData, quantity_in_stock: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Image</label>
                                <input type="file" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" onChange={e => setSelectedImage(e.target.files[0])} />
                            </div>
                            <div className="col-span-2 mt-4 flex gap-3">
                                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition">Save Product</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;