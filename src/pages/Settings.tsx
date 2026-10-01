import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';

export const Settings = () => {
    const {
        currency, tax_rate, restaurant_name, restaurant_address, restaurantEmail, restaurantLogo, updateSettings,
        user, factoryReset, kitchenMode, waiterMode, setKitchenMode, setWaiterMode
    } = useApp();

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [formState, setFormState] = useState({
        currency: currency || 'USD',
        tax_rate: tax_rate || 0,
        restaurant_name: restaurant_name || '',
        restaurant_address: restaurant_address || '',
        restaurant_email: restaurantEmail || ''
    });

    const [passwordState, setPasswordState] = useState({
        currentPassword: '',
        newPassword: ''
    });

    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'waiter' });

    useEffect(() => {
        setFormState({ 
            currency: currency || 'USD', 
            tax_rate: tax_rate || 0, 
            restaurant_name: restaurant_name || '', 
            restaurant_address: restaurant_address || '',
            restaurant_email: restaurantEmail || ''
        });
        fetchUsers();
    }, [currency, tax_rate, restaurant_name, restaurant_address, restaurantEmail]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users`);
            if (res.ok) setUsers(await res.json());
        } catch (e) { }
    };

    const handleSaveSettings = async () => {
        if (logoFile) {
            const formData = new FormData();
            formData.append('restaurant_name', formState.restaurant_name);
            formData.append('restaurant_address', formState.restaurant_address);
            formData.append('restaurant_email', formState.restaurant_email);
            formData.append('currency', formState.currency);
            formData.append('tax_rate', formState.tax_rate.toString());
            formData.append('restaurant_logo', logoFile);
            await updateSettings(formData);
            setLogoFile(null);
        } else {
            await updateSettings({
                currency: formState.currency,
                tax_rate: formState.tax_rate,
                restaurant_name: formState.restaurant_name,
                restaurant_address: formState.restaurant_address,
                restaurant_email: formState.restaurant_email
            });
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            if (res.ok) {
                setNewUser({ username: '', password: '', name: '', role: 'waiter' });
                fetchUsers();
            }
        } catch (e) { }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: user?.id,
                    current_password: passwordState.currentPassword,
                    new_password: passwordState.newPassword
                })
            });

            if (res.ok) {
                alert('Password updated successfully');
                setPasswordState({ currentPassword: '', newPassword: '' });
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update password');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating password');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
            {/* Header */}
            <header className="h-24 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 z-20">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">System Settings</h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Global parameters & core configurations</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated as</p>
                        <p className="text-sm font-black text-primary uppercase tracking-tight">{user?.name}</p>
                    </div>
                    <div className="w-12 h-12 bg-primaryLight rounded-2xl flex items-center justify-center text-primary">
                        <i className="fa-solid fa-user-shield text-xl"></i>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* General Configuration */}
                    <div className="space-y-10">

                        {/* Workflow Modes */}
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-white">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-lg">
                                    <i className="fa-solid fa-toggle-on"></i>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Workflow Modes</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Configure active station features</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Kitchen Mode Toggle */}
                                <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${kitchenMode ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all ${kitchenMode ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <i className="fa-solid fa-kitchen-set"></i>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-sm">Kitchen Mode</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{kitchenMode ? 'Orders sent to kitchen queue' : 'Orders complete instantly'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setKitchenMode(!kitchenMode)}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${kitchenMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${kitchenMode ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>

                                {/* Waiter Mode Toggle */}
                                <div className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${waiterMode ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all ${waiterMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                            <i className="fa-solid fa-user-tie"></i>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 text-sm">Waiter Mode</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{waiterMode ? 'Waiter login & assignment active' : 'Admin-only ordering mode'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setWaiterMode(!waiterMode)}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${waiterMode ? 'bg-blue-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${waiterMode ? 'translate-x-7' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>

                                {!kitchenMode && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                        <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
                                        <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                                            Kitchen Mode is <strong>OFF</strong>. Orders will skip the kitchen queue and be marked as <strong>Completed</strong> instantly upon placing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-white">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-pink-50 text-primary flex items-center justify-center text-lg">
                                    <i className="fa-solid fa-sliders"></i>
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">General Branding</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Restaurant Name</label>
                                    <input
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                        value={formState.restaurant_name}
                                        onChange={e => setFormState({ ...formState, restaurant_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Street Address</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all min-h-[100px] resize-none"
                                        value={formState.restaurant_address}
                                        onChange={e => setFormState({ ...formState, restaurant_address: e.target.value })}
                                        placeholder="Full business address..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Admin Recovery Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                        value={formState.restaurant_email}
                                        onChange={e => setFormState({ ...formState, restaurant_email: e.target.value })}
                                        placeholder="admin@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Brand Identity Asset</label>
                                    <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100/50">
                                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 shrink-0">
                                            {(logoFile || restaurantLogo) ? (
                                                <img
                                                    src={logoFile ? URL.createObjectURL(logoFile) : (restaurantLogo || '')}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <i className="fa-solid fa-image text-gray-100 text-3xl"></i>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setLogoFile(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => logoInputRef.current?.click()}
                                                    className="px-6 py-3 bg-white border border-gray-100 text-gray-800 font-black rounded-xl hover:text-primary transition-all text-[10px] uppercase tracking-widest shadow-sm"
                                                >
                                                    {logoFile || restaurantLogo ? 'Update Logo' : 'Upload Asset'}
                                                </button>
                                                {logoFile && (
                                                    <button
                                                        onClick={() => setLogoFile(null)}
                                                        className="w-12 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all"
                                                    >
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Currency Symbol</label>
                                        <input
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all text-center whitespace-pre"
                                            value={formState.currency}
                                            onChange={e => setFormState({ ...formState, currency: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tax Multiplier (%)</label>
                                        <input
                                            type="number" step="0.01"
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all text-center"
                                            value={formState.tax_rate}
                                            onChange={e => setFormState({ ...formState, tax_rate: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveSettings}
                                    className="w-full py-5 bg-primary text-white font-black rounded-3xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs mt-4"
                                >
                                    Apply Configuration
                                </button>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-white">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-lg">
                                    <i className="fa-solid fa-key"></i>
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Security Credentials</h2>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                        value={passwordState.currentPassword}
                                        onChange={e => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">New Secure Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                                        value={passwordState.newPassword}
                                        onChange={e => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-5 bg-gray-800 text-white font-black rounded-3xl hover:bg-black transition-all uppercase tracking-widest text-xs"
                                >
                                    Update Security Key
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* User Management */}
                    <div className="space-y-10">
                        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-white flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg">
                                    <i className="fa-solid fa-users-gear"></i>
                                </div>
                                <h2 className="text-2xl font-black text-gray-800 tracking-tight">Staff Management</h2>
                            </div>

                            <form onSubmit={handleCreateUser} className="mb-10 p-8 bg-gray-50 rounded-[32px] border border-gray-100/50">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Onboard New Member</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        placeholder="Username" required
                                        className="px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold focus:border-primary outline-none transition-all text-sm"
                                        value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    />
                                    <input
                                        placeholder="Display Name" required
                                        className="px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold focus:border-primary outline-none transition-all text-sm"
                                        value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                    <input
                                        type="password" placeholder="Key" required
                                        className="px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold focus:border-primary outline-none transition-all text-sm"
                                        value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                    <select
                                        className="px-5 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-800 font-bold focus:border-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                                        value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="waiter">Waiter</option>
                                        <option value="chef">Chef</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="mt-6 w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100">
                                    Authorize Access
                                </button>
                            </form>

                            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Member</th>
                                            <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Privilege</th>
                                            <th className="pb-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map(u => (
                                            <tr key={u.id} className="group">
                                                <td className="py-5">
                                                    <p className="text-sm font-black text-gray-800 tracking-tight">{u.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">@{u.username}</p>
                                                </td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                        u.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                                        u.role === 'chef' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right">
                                                    {u.username !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="w-8 h-8 bg-gray-50 text-gray-300 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 bg-white rounded-[40px] p-10 shadow-sm border-2 border-red-50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-lg">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h2 className="text-2xl font-black text-red-600 tracking-tight">Danger Zone</h2>
                    </div>

                    <div className="bg-red-50/30 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 border border-red-100/50">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-lg font-black text-red-800 tracking-tight mb-2">Factory Reset Terminal</h3>
                            <p className="text-[11px] font-bold text-red-600 leading-relaxed uppercase tracking-wide opacity-80">
                                This will purge all transaction history, catalog items, and staff accounts. System settings and master admin remain intact. This action is irreversible.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to reset all POS data? This cannot be undone.')) {
                                    factoryReset();
                                }
                            }}
                            className="px-10 py-5 bg-red-600 text-white font-black rounded-[24px] hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase tracking-widest text-[10px] shrink-0"
                        >
                            Purge System Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
