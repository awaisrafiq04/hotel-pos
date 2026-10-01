import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { MenuItem, Category } from '../types.js';
import { Price } from '../components/Price';

const sampleImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=200&fit=crop',
];

export const Menu: React.FC = () => {
  const {
    categories, menuItems,
    addCategory, updateCategory, deleteCategory,
    addMenuItem, updateMenuItem, deleteMenuItem
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Category Modal
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });

  // Item Modal
  const [itemModal, setItemModal] = useState<{ open: boolean; item: MenuItem | null }>({ open: false, item: null });
  const [itemForm, setItemForm] = useState({
    name: '', price: '', costPrice: '', preparationTime: '', categoryId: '', description: '', image: '', available: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Category File State
  const [selectedCategoryFile, setSelectedCategoryFile] = useState<File | null>(null);
  const categoryFileInputRef = React.useRef<HTMLInputElement>(null);

  // Image Picker
  const [showImagePicker, setShowImagePicker] = useState<'category' | 'item' | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Category handlers
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setCategoryForm({ name: category.name, image: category.image });
      setCategoryModal({ open: true, category });
      setSelectedCategoryFile(null);
    } else {
      setCategoryForm({ name: '', image: '' });
      setCategoryModal({ open: true, category: null });
      setSelectedCategoryFile(null);
    }
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) return;

    let categoryData: any;
    if (selectedCategoryFile) {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('image', selectedCategoryFile);
      categoryData = formData;
    } else {
      categoryData = categoryForm;
    }

    if (categoryModal.category) {
      updateCategory(categoryModal.category.id, categoryData);
    } else {
      addCategory(categoryData);
    }
    setCategoryModal({ open: false, category: null });
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Delete this category? All items in it will become uncategorized.')) {
      deleteCategory(id);
    }
  };

  // Item handlers
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setItemForm({
        name: item.name,
        price: item.price.toString(),
        costPrice: (item.costPrice || '').toString(),
        categoryId: item.categoryId,
        description: item.description,
        preparationTime: (item.preparationTime || '').toString(),
        image: item.image,
        available: item.available,
      });
      setItemModal({ open: true, item });
      setSelectedFile(null);
    } else {
      setItemForm({
        name: '',
        price: '',
        costPrice: '',
        categoryId: categories[0]?.id || '',
        description: '',
        preparationTime: '',
        image: '',
        available: true
      });
      setItemModal({ open: true, item: null });
      setSelectedFile(null);
    }
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.price || !itemForm.categoryId) return;

    let itemData: any;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('name', itemForm.name);
      formData.append('price', itemForm.price);
      formData.append('costPrice', itemForm.costPrice);
      formData.append('categoryId', itemForm.categoryId);
      formData.append('description', itemForm.description);
      formData.append('preparation_time', itemForm.preparationTime);
      formData.append('image', selectedFile);
      formData.append('available', String(itemForm.available));
      itemData = formData;
    } else {
      itemData = {
        name: itemForm.name,
        price: parseFloat(itemForm.price),
        costPrice: parseFloat(itemForm.costPrice) || 0,
        categoryId: itemForm.categoryId,
        description: itemForm.description,
        preparation_time: parseInt(itemForm.preparationTime) || 0,
        image: itemForm.image || sampleImages[0],
        available: itemForm.available,
      };
    }

    if (itemModal.item) {
      updateMenuItem(itemModal.item.id, itemData);
    } else {
      addMenuItem(itemData);
    }
    setItemModal({ open: false, item: null });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this menu item?')) {
      deleteMenuItem(id);
    }
  };

  const selectImage = (url: string) => {
    if (showImagePicker === 'category') {
      setCategoryForm({ ...categoryForm, image: url });
      setSelectedCategoryFile(null); // Clear file if URL is selected
    } else if (showImagePicker === 'item') {
      setItemForm({ ...itemForm, image: url });
      setSelectedFile(null); // Clear file if URL is selected
    }
    setShowImagePicker(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setItemForm({ ...itemForm, image: previewUrl });
    }
  };

  const handleCategoryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCategoryFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCategoryForm({ ...categoryForm, image: previewUrl });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg-soft overflow-hidden">
      {/* Header */}
      <header className="h-20 md:h-24 bg-white border-b border-gray-50 flex items-center justify-between px-6 md:px-10 shrink-0 z-20">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-gray-800 tracking-tight leading-none">Menu Manager</h1>
          <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Catalog & Categories</p>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative hidden sm:block">
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-11 pr-4 py-2.5 md:py-3.5 bg-gray-50 border border-transparent rounded-2xl text-gray-800 font-bold focus:bg-white transition-all outline-none w-40 md:w-72 text-sm"
            />
          </div>

          <button
            onClick={() => openItemModal()}
            className="flex items-center gap-2 md:gap-3 px-5 md:px-8 py-2.5 md:py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg text-[10px] md:text-sm uppercase tracking-wider shrink-0"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span className="hidden xs:inline">New Product</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 md:py-8 no-scrollbar">
        {/* Category Selector (POS Style) */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-black text-gray-800 tracking-tight">Choose Category</h3>
             <button 
               onClick={() => openCategoryModal()}
               className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
             >
               + Create Category
             </button>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`min-w-[120px] h-[130px] rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border-2 ${selectedCategory === 'all'
                ? 'bg-primary border-primary text-white shadow-xl shadow-pink-100'
                : 'bg-white border-white hover:border-primaryLight text-gray-500 shadow-sm'
                }`}
            >
              <span className="text-4xl">🍱</span>
              <span className="text-xs font-black uppercase tracking-widest">All Items</span>
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <div key={cat.id} className="relative group">
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-w-[120px] h-[130px] rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border-2 ${isActive
                      ? 'bg-primary border-primary text-white shadow-xl shadow-pink-100'
                      : 'bg-white border-white hover:border-primaryLight text-gray-500 shadow-sm'
                      }`}
                  >
                    <img src={cat.image} alt={cat.name} className={`w-14 h-14 rounded-full object-cover ${isActive ? 'ring-2 ring-white/20' : ''}`} />
                    <span className="text-xs font-black uppercase tracking-widest truncate max-w-[90px]">{cat.name}</span>
                  </button>
                  
                  {/* Category Actions on Hover */}
                  <div className={`absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'z-30' : ''}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openCategoryModal(cat); }}
                      className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-primary"
                    >
                      <i className="fa-solid fa-pen text-[10px]"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-red-400 hover:bg-red-50"
                    >
                      <i className="fa-solid fa-trash text-[10px]"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-gray-800 tracking-tight">
               {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
             </h3>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
               {filteredItems.length} Items found
             </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[32px] shadow-sm border border-white overflow-hidden group flex flex-col transition-all hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-4 py-1.5 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Inactive</span>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => openItemModal(item)}
                      className="w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-700 hover:text-primary transition-colors"
                    >
                      <i className="fa-solid fa-edit text-sm"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[9px] font-black text-primary bg-primaryLight px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {categories.find(c => c.id === item.categoryId)?.name || 'Misc'}
                      </span>
                      <p className="text-lg font-black text-gray-800"><Price amount={item.price} /></p>
                    </div>
                    <h3 className="text-sm font-extrabold text-gray-800 truncate mb-1">{item.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed line-clamp-2">{item.description || 'No description available.'}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400 font-black text-[9px] uppercase tracking-widest">
                       <i className="fa-solid fa-fire text-primaryLight"></i>
                       <span>{item.preparationTime || 12}m Prep</span>
                    </div>

                    <button
                      onClick={() => updateMenuItem(item.id, { available: !item.available })}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${item.available ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${item.available ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center opacity-30">
              <i className="fa-solid fa-box-open text-8xl mb-6"></i>
              <h4 className="text-2xl font-black text-gray-800">No items found</h4>
              <p className="font-bold text-gray-400">Try selecting a different category</p>
            </div>
          )}
        </section>
      </div>

      {/* MODALS - Kept from previous version but ensuring design consistency */}
      {/* Category Modal */}
      <Modal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, category: null })}
        title={categoryModal.category ? 'Edit Category' : 'Create New Category'}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Category Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="Ex: Italian Pasta"
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cover Image</label>
            <div className="space-y-4">
              <div className="relative group">
                <div className="aspect-video bg-gray-50 rounded-[28px] overflow-hidden border border-gray-100">
                  {categoryForm.image ? (
                    <img src={categoryForm.image} alt="Category" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <i className="fa-solid fa-image text-4xl text-gray-200"></i>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Preview</p>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px] rounded-[28px]">
                   <button 
                     onClick={() => categoryFileInputRef.current?.click()}
                     className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-800 hover:text-primary transition-all"
                   >
                     <i className="fa-solid fa-upload text-lg"></i>
                   </button>
                   <button 
                     onClick={() => setShowImagePicker('category')}
                     className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-800 hover:text-primary transition-all"
                   >
                     <i className="fa-solid fa-images text-lg"></i>
                   </button>
                </div>
              </div>
              
              <div className="relative">
                <i className="fa-solid fa-link absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  placeholder="Or paste an image URL..."
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>

              <input type="file" ref={categoryFileInputRef} onChange={handleCategoryFileSelect} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setCategoryModal({ open: false, category: null })}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCategory}
              className="flex-2 py-4 bg-primary text-white font-black rounded-2xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs"
            >
              {categoryModal.category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={itemModal.open}
        onClose={() => setItemModal({ open: false, item: null })}
        title={itemModal.item ? 'Product Settings' : 'Add New Product'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Product Identity</label>
              <input
                type="text"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="Item Name (e.g. Classic Burger)"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sales Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Making Cost</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.costPrice}
                    onChange={(e) => setItemForm({ ...itemForm, costPrice: e.target.value })}
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prep Time (m)</label>
                <input
                  type="number"
                  value={itemForm.preparationTime}
                  onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })}
                  placeholder="m"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Catalog</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Short Description</label>
              <textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Delicious details about this product..."
                rows={3}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 font-bold focus:bg-white focus:border-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Product Media</label>
              <div className="aspect-square bg-gray-50 rounded-[40px] overflow-hidden border-2 border-dashed border-gray-100 relative group">
                {itemForm.image ? (
                  <img src={itemForm.image} alt="Item" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <i className="fa-solid fa-cloud-arrow-up text-5xl text-gray-200"></i>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Image Asset</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-800 hover:text-primary transition-all shadow-xl">
                      <i className="fa-solid fa-camera text-xl"></i>
                   </button>
                   <button onClick={() => setShowImagePicker('item')} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-800 hover:text-primary transition-all shadow-xl">
                      <i className="fa-solid fa-grip text-xl"></i>
                   </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${itemForm.available ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                   <span className="font-extrabold text-gray-800 text-sm">Visible in POS</span>
                </div>
                <button
                  onClick={() => setItemForm({ ...itemForm, available: !itemForm.available })}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 ${itemForm.available ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${itemForm.available ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setItemModal({ open: false, item: null })}
                className="flex-1 py-5 bg-gray-100 text-gray-600 font-black rounded-3xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs"
              >
                Discard
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-2 py-5 bg-primary text-white font-black rounded-3xl hover:bg-[#b01356] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs"
              >
                {itemModal.item ? 'Save Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Image Gallery Modal */}
      <Modal
        isOpen={showImagePicker !== null}
        onClose={() => setShowImagePicker(null)}
        title="Asset Library"
        size="lg"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {sampleImages.map((url, i) => (
            <button
              key={i}
              onClick={() => selectImage(url)}
              className="aspect-square rounded-[32px] overflow-hidden hover:ring-8 hover:ring-primaryLight transition-all group relative border border-gray-100"
            >
              <img src={url} alt={`Sample ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};
