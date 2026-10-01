import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';

interface Purchase {
    id: number;
    title: string;
    amount: string | number;
    date: string;
    category: string;
    description: string;
    image?: string;
}

interface PurchaseCategory {
    id: number;
    name: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const Purchases = () => {
    const { formatPrice } = useApp();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [categories, setCategories] = useState<PurchaseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedViewCategory, setSelectedViewCategory] = useState<string>('All');
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New Purchase Form
    const [newPurchase, setNewPurchase] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: ''
    });

    useEffect(() => {
        fetchPurchases();
        fetchCategories();
    }, []);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/purchases`);
            if (res.ok) {
                const data = await res.json();
                setPurchases(data);
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/purchase-categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0 && !newPurchase.category) {
                    setNewPurchase(prev => ({ ...prev, category: data[0].name }));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddPurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newPurchase.title);
            formData.append('amount', newPurchase.amount);
            formData.append('date', newPurchase.date);
            formData.append('category', newPurchase.category);
            formData.append('description', newPurchase.description);
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const url = editingPurchase 
                ? `${API_URL}/purchases/${editingPurchase.id}` 
                : `${API_URL}/purchases`;
            
            const res = await fetch(url, {
                method: editingPurchase ? 'POST' : 'POST', // Laravel often needs POST with _method spoofing for FormData + PUT
                body: formData
            });

            // Note: Since we are using FormData, if we wanted PUT we'd usually use POST + _method='PUT'
            // but for simplicity and backend compatibility, I'll stick to POST if the backend supports it or add the spoof.
            if (editingPurchase) formData.append('_method', 'PUT');

            const actualRes = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (actualRes.ok) {
                setShowModal(false);
                setEditingPurchase(null);
                setNewPurchase({
                    title: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    category: categories[0]?.name || '',
                    description: ''
                });
                setSelectedFile(null);
                fetchPurchases();
            }
        } catch (error) {
            console.error('Error adding purchase', error);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            const res = await fetch(`${API_URL}/purchase-categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                setNewCategoryName('');
                fetchCategories();
            }
        } catch (error) {
            console.error('Error adding category', error);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Delete this category?')) return;
        try {
            await fetch(`${API_URL}/purchase-categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this purchase?')) return;
        try {
            await fetch(`${API_URL}/purchases/${id}`, { method: 'DELETE' });
            fetchPurchases();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const totalExpenses = purchases.reduce((sum, p) => sum + Number(p.amount), 0);
    const categoryExpenses = selectedViewCategory === 'All'
        ? totalExpenses
        : purchases.filter(p => p.category === selectedViewCategory).reduce((sum, p) => sum + Number(p.amount), 0);

    return (
        <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
            {/* Header */}
            <header className="h-24 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 z-20">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Financial Ledger</h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Operational expenses & purchases</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-3 px-6 py-3.5 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-wider"
                    >
                        <i className="fa-solid fa-tags text-xs"></i>
                        Tags
                    </button>
                    <button
                        onClick={() => {
                            setEditingPurchase(null);
                            setNewPurchase({
                                title: '',
                                amount: '',
                                date: new Date().toISOString().split('T')[0],
                                category: categories[0]?.name || '',
                                description: ''
                            });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 text-sm uppercase tracking-wider"
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                        New Expense
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {/* Total Burn - High Width */}
                    <div className="md:col-span-2 bg-white rounded-[32px] p-6 shadow-sm border border-white flex items-center gap-6 group hover:shadow-xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                        <div className="w-14 h-14 rounded-2xl bg-pink-50 text-primary flex items-center justify-center text-lg shrink-0 border border-primary/10">
                            <i className="fa-solid fa-file-invoice-dollar"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cumulative Financial Burn</p>
                            <p className="text-3xl font-black text-gray-800 tracking-tighter">{formatPrice(totalExpenses)}</p>
                        </div>
                        <div className="hidden lg:block px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                             <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tight">Synchronized</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white flex items-center gap-4 group hover:shadow-xl transition-all">
                         <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-base shrink-0 border border-amber-100/50">
                            <i className="fa-solid fa-filter"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">{selectedViewCategory}</p>
                                <select 
                                    className="bg-transparent border-none outline-none text-[8px] font-black uppercase text-primary cursor-pointer"
                                    value={selectedViewCategory}
                                    onChange={(e) => setSelectedViewCategory(e.target.value)}
                                >
                                    <option value="All">All Tags</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <p className="text-xl font-black text-gray-800 tracking-tighter">{formatPrice(categoryExpenses)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white flex items-center gap-4 group hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center text-base shrink-0 border border-gray-100">
                            <i className="fa-solid fa-receipt"></i>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Records</p>
                            <p className="text-xl font-black text-gray-800 tracking-tighter">{purchases.length}</p>
                        </div>
                    </div>
                </div>

                {/* Ledger Table */}
                <div className="bg-white rounded-[32px] shadow-sm border border-white overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/20">
                                <th className="px-8 py-5 text-[8px] font-black text-gray-400 uppercase tracking-widest">Entry Date</th>
                                <th className="px-8 py-5 text-[8px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-5 text-[8px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-[8px] font-black text-gray-400 uppercase tracking-widest">Valuation</th>
                                <th className="px-8 py-5 text-[8px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {purchases.map(purchase => (
                                <tr key={purchase.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center text-[10px] border border-gray-100">
                                                <i className="fa-solid fa-calendar"></i>
                                            </div>
                                            <p className="text-[11px] font-black text-gray-800">{new Date(purchase.date).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div>
                                            <p className="text-sm font-black text-gray-800 tracking-tight">{purchase.title}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 line-clamp-1">{purchase.description || 'No notes attached'}</p>
                                            {purchase.image && (
                                                <a 
                                                    href={`${API_URL.replace('/api', '')}${purchase.image}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-1.5 mt-2 text-[8px] font-black uppercase tracking-widest text-primary hover:underline"
                                                >
                                                    <i className="fa-solid fa-paperclip"></i>
                                                    View Asset
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all border border-gray-100 group-hover:border-primary">
                                            {purchase.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-lg font-black text-gray-800 tracking-tighter">{formatPrice(Number(purchase.amount))}</p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingPurchase(purchase);
                                                    setNewPurchase({
                                                        title: purchase.title,
                                                        amount: purchase.amount.toString(),
                                                        date: purchase.date.split('T')[0],
                                                        category: purchase.category,
                                                        description: purchase.description || ''
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="w-8 h-8 bg-gray-50 text-gray-300 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            >
                                                <i className="fa-solid fa-pen-to-square text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(purchase.id)}
                                                className="w-8 h-8 bg-gray-50 text-gray-300 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            >
                                                <i className="fa-solid fa-trash-can text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {purchases.length === 0 && !loading && (
                        <div className="py-32 flex flex-col items-center justify-center opacity-30">
                            <i className="fa-solid fa-receipt text-9xl mb-8"></i>
                            <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">No Expenditure</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Clean sheet for the current period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Expense Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingPurchase(null);
                }}
                title={editingPurchase ? "Modify Expenditure" : "Log New Expenditure"}
                size="md"
            >
                <form onSubmit={handleAddPurchase} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Item / Service Title</label>
                        <input
                            required
                            placeholder="e.g. Utility Payment - March"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                            value={newPurchase.title}
                            onChange={e => setNewPurchase({ ...newPurchase, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Valuation</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                value={newPurchase.amount}
                                onChange={e => setNewPurchase({ ...newPurchase, amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Transaction Date</label>
                            <input
                                required
                                type="date"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                value={newPurchase.date}
                                onChange={e => setNewPurchase({ ...newPurchase, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Budget Category</label>
                        <select
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            value={newPurchase.category}
                            onChange={e => setNewPurchase({ ...newPurchase, category: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Supplementary Notes</label>
                        <textarea
                            rows={3}
                            placeholder="Add context to this entry..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all resize-none"
                            value={newPurchase.description}
                            onChange={e => setNewPurchase({ ...newPurchase, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Receipt Digitization</label>
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-[32px] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                                {selectedFile ? (
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <i className="fa-solid fa-camera text-2xl text-gray-200"></i>
                                )}
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                >
                                    <i className="fa-solid fa-upload"></i>
                                </button>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Upload visual proof</p>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all"
                                >
                                    {selectedFile ? 'Change File' : 'Browse Files'}
                                </button>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-2 py-4 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs"
                        >
                            {editingPurchase ? 'Update Record' : 'Commit Record'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Categories Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title="Expense Categorization"
                size="sm"
            >
                <div className="space-y-6">
                    <form onSubmit={handleAddCategory} className="flex gap-3">
                        <input
                            className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                            placeholder="New Tag Name..."
                            value={newCategoryName}
                            onChange={e => setNewCategoryName(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            className="w-14 bg-primary text-white rounded-2xl hover:bg-[#b01356] transition-all flex items-center justify-center shadow-lg shadow-pink-100"
                        >
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="group flex justify-between items-center p-5 bg-gray-50 rounded-[24px] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50">
                                <span className="font-black text-gray-800 tracking-tight">{cat.name}</span>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)} 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                >
                                    <i className="fa-solid fa-xmark text-sm"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};
