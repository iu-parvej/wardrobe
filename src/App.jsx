import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Client, Account, Databases, ID } from "appwrite";

// === Initialize Appwrite ===
const client = new Client();
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
if (!endpoint) throw new Error("VITE_APPWRITE_ENDPOINT missing");
if (!projectId) throw new Error("VITE_APPWRITE_PROJECT_ID missing");
if (!databaseId) throw new Error("VITE_APPWRITE_DATABASE_ID missing");
client.setEndpoint(endpoint).setProject(projectId);
export const account = new Account(client);
export const databases = new Databases(client);

// ======================
// Reusable Forms & Inputs
// ======================
function MultiImageInput({ value = [], onChange, placeholder = "Image URL" }) {
  const [input, setInput] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput("");
    }
  };
  const removeImage = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((image, i) => (
          <div key={i} className="relative w-24 h-24">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg shadow"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/374151/E9D5FF?text=No+Image"; }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold text-white shadow-lg"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="text-gray-400 text-sm mb-1 block">{placeholder}</label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add Image URL & press Enter"
        className="block p-3 w-full text-black rounded-lg"
      />
    </div>
  );
}

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onChange([...value, input.trim()]);
      setInput("");
    }
  };
  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {value.map((tag, i) => (
          <span key={i} className="bg-purple-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-semibold">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-red-300 font-bold transition-transform transform hover:scale-125">×</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type tag & press Enter"
        className="block p-3 w-full text-black rounded-lg"
      />
    </div>
  );
}

// ======================
// Shop Select Input
// ======================
function ShopSelect({ value, onChange, availableShops, onNewShop }) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const filteredShops = availableShops.filter(shop => 
    shop.name.toLowerCase().includes(input.toLowerCase())
  );

  const handleSelect = (shopName) => {
    onChange(shopName);
    setInput(shopName);
    setShowDropdown(false);
  };

  const handleAddNew = () => {
    if (input && !availableShops.find(s => s.name === input)) {
      onNewShop(input);
      onChange(input);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label className="block mb-2 text-gray-400 text-sm">Shop Name:</label>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onChange(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Select or add shop"
          className="block p-3 w-full text-black rounded-lg"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border max-h-60 overflow-auto">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <div
                key={shop.$id}
                onClick={() => handleSelect(shop.name)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
              >
                {shop.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No shops found</div>
          )}
          {input && !availableShops.find(s => s.name === input) && (
            <div
              onClick={handleAddNew}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-600 font-medium border-t"
            >
              + Add "{input}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ======================
// MultiSelect Dropdown Component
// ======================
function MultiSelectDropdown({ options, selected, onChange, label, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      <label className="block mb-2 text-gray-400 text-sm">{label}</label>
      <div 
        className="bg-white/20 p-3 rounded-lg cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-white">
          {selected.length === 0 ? placeholder : 
           selected.length === options.length ? "All selected" :
           `${selected.length} selected`}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="flex justify-between text-sm">
              <button 
                onClick={toggleAll}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {selected.length === options.length ? 'Deselect All' : 'Select All'}
              </button>
              <button 
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="py-1">
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => {}}
                    className="mr-2 accent-purple-500"
                  />
                  <span className="text-gray-800">{option}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ======================
// Price Range Input Component
// ======================
function PriceRangeInput({ value, onChange }) {
  const [localValue, setLocalValue] = useState(value);

  // Sync localValue with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e) => {
    const min = parseInt(e.target.value) || 0;
    const newValue = [min, Math.max(localValue[1], min)];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e) => {
    const max = parseInt(e.target.value) || 10000;
    const newValue = [Math.min(localValue[0], max), max];
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {/* Increased margin-top for more spacing below label */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <input
            type="number"
            value={localValue[0]}
            onChange={handleMinChange}
            min="0"
            max="10000"
            placeholder="Min Price (৳)"
            className="w-full p-3 bg-white/20 text-white rounded-lg h-12"
          />
        </div>
        <div className="flex flex-col">
          <input
            type="number"
            value={localValue[1]}
            onChange={handleMaxChange}
            min="0"
            max="10000"
            placeholder="Max Price (৳)"
            className="w-full p-3 bg-white/20 text-white rounded-lg h-12"
          />
        </div>
      </div>
    </div>
  );
}

// ======================
// Filter Bar Component
// ======================
function FilterBar({ 
  tags, 
  shops, 
  onTagFilter, 
  onShopFilter, 
  onPriceRange, 
  onSearch,
  selectedTags = [],
  selectedShops = [],
  priceRange = [0, 10000]
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [localSelectedTags, setLocalSelectedTags] = useState(selectedTags);
  const [localSelectedShops, setLocalSelectedShops] = useState(selectedShops);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  const applyFilters = () => {
    onTagFilter(localSelectedTags);
    onShopFilter(localSelectedShops);
    onPriceRange(localPriceRange);
  };

  const resetFilters = () => {
    setLocalSelectedTags([]);
    setLocalSelectedShops([]);
    setLocalPriceRange([0, 10000]);
    onTagFilter([]);
    onShopFilter([]);
    onPriceRange([0, 10000]);
    setLocalSearch('');
    onSearch('');
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products by name, tag, or shop..."
            className="w-full p-3 pl-10 bg-white/20 text-white rounded-lg focus:outline-none"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-purple-200 hover:text-purple-100 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button
            onClick={resetFilters}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/20">
          {/* Tags Filter */}
          <div>
            <MultiSelectDropdown
              options={tags}
              selected={localSelectedTags}
              onChange={setLocalSelectedTags}
              label="Tags"
              placeholder="Select tags"
            />
          </div>

          {/* Shops Filter */}
          <div>
            <MultiSelectDropdown
              options={shops.map(s => s.name)}
              selected={localSelectedShops}
              onChange={setLocalSelectedShops}
              label="Shops"
              placeholder="Select shops"
            />
          </div>

          {/* Price Range */}
          <div>
            <PriceRangeInput
              value={localPriceRange}
              onChange={setLocalPriceRange}
            />
          </div>
        </div>
      )}

      {showFilters && (
        <div className="flex justify-end mt-4 pt-4 border-t border-white/20">
          <button
            onClick={applyFilters}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}

// ======================
// Collection Form (with Pin Option)
// ======================
function CollectionForm({ onSubmit, editing, onUpdate, onCancel }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [cover, setCover] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setDetails(editing.details || "");
      setCover(editing.cover || "");
      setPinned(editing.pinned || false);
    } else {
      setTitle("");
      setDetails("");
      setCover("");
      setPinned(false);
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const col = { $id: editing?.$id || ID.unique(), title, details, cover, pinned };
    editing ? onUpdate(col) : onSubmit(col);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-3xl shadow-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4 text-purple-200">{editing ? "Edit Collection" : "Create New Collection"}</h2>
      <div className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="block p-4 w-full text-black rounded-xl" required />
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" className="block p-4 w-full text-black rounded-xl" required />
        <MultiImageInput value={cover ? [cover] : []} onChange={(images) => setCover(images[0] || "")} placeholder="Cover Image URL" />
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={pinned}
            onChange={e => setPinned(e.target.checked)}
            className="accent-pink-500"
          />
          <span className="text-pink-400 font-semibold">Pin this collection</span>
        </label>
      </div>
      <div className="flex gap-4 mt-6">
        <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-300 shadow-md">
          {editing ? "Update" : "Create"}
        </button>
        {editing && <button type="button" onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded-xl text-white font-semibold transition">Cancel</button>}
      </div>
    </form>
  );
}

function ProductForm({ colId, onSubmit, editing, onUpdate, onCancel, shops, onAddShop }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setPrice(editing.price || "");
      setDetails(editing.details || "");
      setLink(editing.link || "");
      setTags(editing.tags || []);
      setImages(editing.images || []);
      setShopName(editing.shop_name || "");
    } else {
      setTitle("");
      setPrice("");
      setDetails("");
      setLink("");
      setTags([]);
      setImages([]);
      setShopName("");
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = {
      $id: editing?.$id || ID.unique(),
      title,
      price,
      details,
      link,
      tags,
      images,
      shop_name: shopName
    };
    editing ? onUpdate(prod) : onSubmit(prod);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-3xl shadow-lg mb-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 text-purple-200">{editing ? "Edit Product" : "Add New Product"}</h3>
      <div className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="block p-4 w-full text-black rounded-xl" required />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price" className="block p-4 w-full text-black rounded-xl" required />
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" className="block p-4 w-full text-black rounded-xl" required />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Product Link" className="block p-4 w-full text-black rounded-xl" />
        <div className="py-2">
          <label className="block mb-2 text-gray-400 text-sm">Tags:</label>
          <TagInput value={tags} onChange={setTags} />
        </div>
        <div className="py-2">
          <label className="block mb-2 text-gray-400 text-sm">Images:</label>
          <MultiImageInput value={images} onChange={setImages} placeholder="Add Image URL & press Enter" />
        </div>
        <div className="py-2">
          <ShopSelect 
            value={shopName} 
            onChange={setShopName} 
            availableShops={shops}
            onNewShop={onAddShop}
          />
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button type="submit" className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-300 shadow-md">
          {editing ? "Update" : "Add"}
        </button>
        {editing && <button type="button" onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded-xl text-white font-semibold transition">Cancel</button>}
      </div>
    </form>
  );
}

// ======================
// Main App Component
// ======================
function App() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState({});
  const [shops, setShops] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedShops, setSelectedShops] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({}), 3000);
  };

  const MessageBar = () => {
    if (!message.text) return null;
    return (
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white text-center z-50 shadow-lg
        ${message.type === "error" ? "bg-red-500" : "bg-green-500"}
        animate-slide-up
      `}>
        {message.text}
      </div>
    );
  };

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = await account.get();
        if (user.email === "official.parvej.hossain@gmail.com") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkUserSession();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { documents: cols } = await databases.listDocuments(databaseId, "collections");
      setCollections(cols);

      const { documents: prods } = await databases.listDocuments(databaseId, "products");
      const { documents: shopDocs } = await databases.listDocuments(databaseId, "shops");

      setShops(shopDocs);

      const grouped = {};
      cols.forEach(col => {
        grouped[col.$id] = prods
          .filter(p => p.collection_id === col.$id)
          .map(p => ({
            ...p,
            tags: p.tags ? JSON.parse(p.tags) : [],
            images: p.images ? JSON.parse(p.images) : [],
            shop_name: p.shop_name || ""
          }));
      });
      setProducts(grouped);
      showMessage("Data loaded successfully.");
    } catch (error) {
      console.error("Data fetch failed:", error);
      showMessage("Failed to load data. Check Appwrite permissions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .animate-slide-up { animation: slideUp 0.3s ease-out; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-white/20">
          <Link to="/" className="text-3xl font-bold text-purple-300 hover:text-purple-200">Collection of PARVEJ</Link>
          <nav className="space-x-4 mt-4 sm:mt-0">
            <Link to="/" className="px-4 py-2 bg-white/10 rounded-lg">Home</Link>
            {isAdmin ? (
              <>
                <Link to="/admin" className="px-4 py-2 bg-white/10 rounded-lg">Admin Panel</Link>
                <button
                  onClick={async () => {
                    try {
                      await account.deleteSession('current');
                      setIsAdmin(false);
                      showMessage("Logged out successfully.");
                    } catch (error) {
                      showMessage("Logout failed.", "error");
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-white/10 rounded-lg">Admin Login</Link>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            <Home 
              collections={collections} 
              products={products}
              shops={shops}
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              selectedShops={selectedShops}
              priceRange={priceRange}
              onSearch={setSearchQuery}
              onTagFilter={setSelectedTags}
              onShopFilter={setSelectedShops}
              onPriceRange={setPriceRange}
            />
          } />
          <Route path="/collection/:id" element={
            <Collection 
              products={products} 
              collections={collections}
              shops={shops}
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              selectedShops={selectedShops}
              priceRange={priceRange}
              onSearch={setSearchQuery}
              onTagFilter={setSelectedTags}
              onShopFilter={setSelectedShops}
              onPriceRange={setPriceRange}
            />
          } />
          <Route path="/login" element={<LoginForm setIsAdmin={setIsAdmin} showMessage={showMessage} />} />
          <Route path="/admin" element={isAdmin ? (
            <Admin
              collections={collections}
              setCollections={setCollections}
              products={products}
              setProducts={setProducts}
              shops={shops}
              setShops={setShops}
              showMessage={showMessage}
              fetchData={fetchData}
            />
          ) : (
            <div className="text-center text-red-400 mt-10">🔒 Access denied. <Link to="/login" className="underline">Log in</Link>.</div>
          )} />
        </Routes>

        <MessageBar />
      </div>
    </Router>
  );
}

// ======================
// Login Form
// ======================
function LoginForm({ setIsAdmin, showMessage }) {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = e.target;
    try {
      const session = await account.createEmailPasswordSession(email.value, password.value);
      if (session.userId) {
        setIsAdmin(true);
        showMessage("✅ Login successful!", "success");
        navigate("/admin");
      }
    } catch (error) {
      console.error("Login failed:", error);
      showMessage("❌ Wrong credentials! " + error.message, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white/10 p-8 rounded-3xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="block mb-4 p-4 w-full rounded-xl text-black"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="block mb-6 p-4 w-full rounded-xl text-black"
        required
      />
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
      >
        Login
      </button>
    </form>
  );
}

// ======================
// Home & Collection Pages
// ======================
function Home({ 
  collections, 
  products, 
  shops,
  searchQuery,
  selectedTags,
  selectedShops,
  priceRange,
  onSearch,
  onTagFilter,
  onShopFilter,
  onPriceRange
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract all unique tags from products
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    Object.values(products).forEach(collectionProducts => {
      collectionProducts.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => tagsSet.add(tag));
        }
      });
    });
    return Array.from(tagsSet);
  }, [products]);

  // Filter function
  const filterProducts = (productList) => {
    return productList.filter(product => {
      // Search filter
      if (searchQuery && 
          !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) &&
          !(product.shop_name && product.shop_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Tags filter
      if (selectedTags.length > 0 && 
          !selectedTags.some(tag => product.tags.includes(tag))) {
        return false;
      }
      
      // Shops filter
      if (selectedShops.length > 0 && 
          !selectedShops.includes(product.shop_name)) {
        return false;
      }
      
      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      
      return true;
    });
  };

  // Get all products across all collections
  const allProducts = useMemo(() => {
    let all = [];
    Object.values(products).forEach(collectionProducts => {
      all = [...all, ...collectionProducts];
    });
    return all;
  }, [products]);

  // Filter all products based on search, tags, shops, and price range
  const filteredProducts = filterProducts(allProducts);

  // Check if we should show products directly on homepage
  const showProductsDirectly = searchQuery !== "" || 
                               selectedTags.length > 0 || 
                               selectedShops.length > 0 || 
                               priceRange[0] > 0 || 
                               priceRange[1] < 10000;

  // Split pinned and non-pinned collections
  const pinned = collections.filter(c => c.pinned);
  const others = collections.filter(c => !c.pinned);

  // Unified card style for both pinned and non-pinned (using the pinned card style)
  const cardClass = "min-w-[220px] max-w-xs bg-white/10 p-4 rounded-xl hover:scale-105 transition flex-shrink-0 border-2";
  const cardImageClass = "w-full h-40 object-cover rounded-lg";
  
  // Product card style
  const productCardClass = "w-[260px] h-[320px] bg-white/10 p-4 rounded-xl hover:scale-105 transition flex-shrink-0 cursor-pointer flex flex-col";
  const productImageClass = "w-full h-[180px] object-cover object-center rounded-lg mb-4";

  // State for modal
  const [modal, setModal] = useState(null);

  // Handle product click
  const handleProductClick = (product) => {
    // Find which collection this product belongs to
    const collectionId = Object.keys(products).find(colId => 
      products[colId].some(p => p.$id === product.$id)
    );
    
    if (collectionId) {
      // Navigate to the collection with the product ID as state
      navigate(`/collection/${collectionId}`, { 
        state: { 
          selectedProduct: product,
          fromSearch: true,
          searchQuery,
          selectedTags,
          selectedShops,
          priceRange
        } 
      });
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar
        tags={allTags}
        shops={shops}
        onTagFilter={onTagFilter}
        onShopFilter={onShopFilter}
        onPriceRange={onPriceRange}
        onSearch={onSearch}
        selectedTags={selectedTags}
        selectedShops={selectedShops}
        priceRange={priceRange}
      />

      {/* Show products directly if filtering */}
      {showProductsDirectly && filteredProducts.length > 0 ? (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-center text-purple-200">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
          </h3>
          <div className="flex flex-wrap gap-8">
            {filteredProducts.map(p => (
              <div key={p.$id} onClick={() => handleProductClick(p)} className={productCardClass}>
                <img
                  src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                  alt={p.title}
                  className={productImageClass}
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-lg">{p.title}</h4>
                  <p className="text-green-300 font-bold text-lg mt-2">৳ {p.price}</p>
                  {p.shop_name && (
                    <p className="text-sm text-blue-300 mt-1">from {p.shop_name}</p>
                  )}
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.tags.map((tag, i) => (
                        <span key={i} className="bg-purple-600 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Show collections when not filtering
        <>
          {pinned.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-pink-300">📌 Pinned Collections</h3>
              <div
                className="flex gap-4 overflow-x-auto pb-4 mb-8 scrollbar-hide"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {pinned.map(c => {
                  const productCount = (products[c.$id] || []).length;
                  return (
                    <Link
                      key={c.$id}
                      to={`/collection/${c.$id}`}
                      className={cardClass + " border-pink-400"}
                    >
                      <img
                        src={c.cover || "https://placehold.co/600x400?text=No+Image"}
                        alt={c.title}
                        className={cardImageClass}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/600x400?text=No+Image";
                        }}
                      />
                      <h3 className="font-bold mt-4">{c.title}</h3>
                      <p className="text-sm text-gray-400">{c.details}</p>
                      <p className="text-xs text-purple-300 mt-2">{productCount} product{productCount !== 1 ? 's' : ''}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          
          {others.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {others.map(c => {
                const productCount = (products[c.$id] || []).length;
                return (
                  <Link
                    key={c.$id}
                    to={`/collection/${c.$id}`}
                    className={cardClass + " border-white/20"}
                    style={{ flex: "0 0 220px" }}
                  >
                    <img
                      src={c.cover || "https://placehold.co/600x400?text=No+Image"}
                      alt={c.title}
                      className={cardImageClass}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                    <h3 className="font-bold mt-4">{c.title}</h3>
                    <p className="text-sm text-gray-400">{c.details}</p>
                    <p className="text-xs text-purple-300 mt-2">{productCount} product{productCount !== 1 ? 's' : ''}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400">No collections available.</p>
          )}
        </>
      )}
    </div>
  );
}

function Collection({ 
  collections, 
  products, 
  shops,
  searchQuery,
  selectedTags,
  selectedShops,
  priceRange,
  onSearch,
  onTagFilter,
  onShopFilter,
  onPriceRange
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const collection = collections.find(c => c.$id === id);
  
  // Extract all unique tags from all products
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    Object.values(products).forEach(collectionProducts => {
      collectionProducts.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => tagsSet.add(tag));
        }
      });
    });
    return Array.from(tagsSet);
  }, [products]);

  if (!collection) return <p className="text-center text-red-400 mt-10">Not found</p>;

  // Filter products based on search, tags, shops, and price range
  const collectionProducts = (products[id] || []).filter(product => {
    // Search filter
    if (searchQuery && 
        !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !(product.shop_name && product.shop_name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Tags filter
    if (selectedTags.length > 0 && 
        !selectedTags.some(tag => product.tags.includes(tag))) {
      return false;
    }
    
    // Shops filter
    if (selectedShops.length > 0 && 
        !selectedShops.includes(product.shop_name)) {
      return false;
    }
    
    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    return true;
  });

  // Get product from navigation state if available
  const [selectedProduct, setSelectedProduct] = useState(location.state?.selectedProduct || null);
  const fromSearch = location.state?.fromSearch || false;

  // Handle back button
  const handleBack = () => {
    if (fromSearch && location.state?.searchQuery) {
      // Go back to search results
      navigate('/', { 
        state: {
          searchQuery: location.state.searchQuery,
          selectedTags: location.state.selectedTags,
          selectedShops: location.state.selectedShops,
          priceRange: location.state.priceRange
        } 
      });
    } else {
      navigate('/');
    }
  };

  // Fixed card size for all products
  const cardClass =
    "w-[260px] h-[320px] bg-white/10 p-4 rounded-xl hover:scale-105 transition flex-shrink-0 cursor-pointer flex flex-col";
  const cardImageClass =
    "w-full h-[180px] object-cover object-center rounded-lg mb-4";

  return (
    <div>
      {/* Filter Bar */}
      <FilterBar
        tags={allTags}
        shops={shops}
        onTagFilter={onTagFilter}
        onShopFilter={onShopFilter}
        onPriceRange={onPriceRange}
        onSearch={onSearch}
        selectedTags={selectedTags}
        selectedShops={selectedShops}
        priceRange={priceRange}
      />
      
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBack}
          className="mr-4 text-purple-200 hover:text-purple-100"
        >
          ← Back
        </button>
        <h2 className="text-4xl font-bold text-center text-purple-200 flex-1">{collection.title}</h2>
      </div>
      
      {collectionProducts.length > 0 ? (
        <div className="flex flex-wrap gap-8">
          {collectionProducts.map(p => (
            <div key={p.$id} onClick={() => setSelectedProduct(p)} className={cardClass}>
              <img
                src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                alt={p.title}
                className={cardImageClass}
                style={{ objectFit: "cover", objectPosition: "center" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400?text=No+Image";
                }}
              />
              <div className="flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-lg">{p.title}</h4>
                <p className="text-green-300 font-bold text-lg mt-2">৳ {p.price}</p>
                {p.shop_name && (
                  <p className="text-sm text-blue-300 mt-1">from {p.shop_name}</p>
                )}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.tags.map((tag, i) => (
                      <span key={i} className="bg-purple-600 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No products match your filters.</p>
      )}
      
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

// ======================
// Product Modal
// ======================
function ProductModal({ product, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (product.images?.length || 1));
  };
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + (product.images?.length || 1)) % (product.images?.length || 1));
  };
  const openFullscreen = (index, e) => {
    e.stopPropagation();
    setFullscreenImage(index);
  };
  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : ["https://placehold.co/600x400?text=No+Image"];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white/10 p-6 rounded-2xl max-w-lg w-full relative pt-12" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-xl font-bold p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10">
          ×
        </button>
        <div className="relative mb-4">
          <img
            src={images[currentImageIndex]}
            alt={product.title}
            className="w-full h-64 object-cover rounded-xl cursor-pointer"
            onClick={(e) => openFullscreen(currentImageIndex, e)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=No+Image";
            }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                &larr;
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                &rarr;
              </button>
            </>
          )}
        </div>
        <h3 className="mt-4 font-bold text-xl">{product.title}</h3>
        <p className="text-gray-300 mt-1">{product.details}</p>
        {product.shop_name && (
          <p className="text-blue-300 mt-1">Shop: {product.shop_name}</p>
        )}
        <p className="text-green-300 font-bold">৳ {product.price}</p>
        {product.tags && product.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag, i) => (
              <span key={i} className="bg-purple-600 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
        {product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded"
          >
            View Product
          </a>
        )}
      </div>
      {fullscreenImage !== null && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={closeFullscreen}>
          <div className="relative max-w-screen-xl max-h-screen-xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[fullscreenImage]}
              alt={`Full screen view of image ${fullscreenImage + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/1000x800?text=No+Image";
              }}
            />
            <button onClick={closeFullscreen} className="absolute top-4 right-4 text-white text-4xl font-bold p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
              ×
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full text-2xl hover:bg-black/70 transition-colors"
                >
                  &larr;
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full text-2xl hover:bg-black/70 transition-colors"
                >
                  &rarr;
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ======================
// Admin Panel
// ======================
function Admin({ 
  collections, 
  setCollections, 
  products, 
  setProducts, 
  shops, 
  setShops, 
  showMessage, 
  fetchData 
}) {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const createCollection = async (col) => {
    try {
      const response = await databases.createDocument(
        databaseId,
        "collections",
        ID.unique(),
        {
          title: col.title,
          details: col.details,
          cover: col.cover || "",
          pinned: !!col.pinned
        }
      );
      setCollections([...collections, response]);
      showMessage("✅ Collection created!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  const updateCollection = async (col) => {
    try {
      await databases.updateDocument(
        databaseId,
        "collections",
        col.$id,
        {
          title: col.title,
          details: col.details,
          cover: col.cover || "",
          pinned: !!col.pinned
        }
      );
      setCollections(collections.map(c => c.$id === col.$id ? { ...col } : c));
      setEditingCollection(null);
      showMessage("✅ Updated!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  const deleteCollection = async (id) => {
    try {
      const collectionProducts = products[id] || [];
      for (const product of collectionProducts) {
        await databases.deleteDocument(databaseId, "products", product.$id);
      }
      await databases.deleteDocument(databaseId, "collections", id);
      fetchData();
      showMessage("🗑️ Deleted!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  const createProduct = async (colId, prod) => {
    try {
      const response = await databases.createDocument(
        databaseId,
        "products",
        ID.unique(),
        {
          collection_id: colId,
          title: prod.title,
          price: parseInt(prod.price),
          details: prod.details,
          link: prod.link || "",
          tags: JSON.stringify(prod.tags),
          images: JSON.stringify(prod.images),
          shop_name: prod.shop_name || ""
        }
      );
      setProducts({
        ...products,
        [colId]: [...(products[colId] || []), {
          ...response,
          tags: prod.tags,
          images: prod.images,
          shop_name: prod.shop_name
        }]
      });
      showMessage("✅ Product added!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  const updateProduct = async (colId, prod) => {
    try {
      await databases.updateDocument(
        databaseId,
        "products",
        prod.$id,
        {
          title: prod.title,
          price: parseInt(prod.price),
          details: prod.details,
          link: prod.link || "",
          tags: JSON.stringify(prod.tags),
          images: JSON.stringify(prod.images),
          shop_name: prod.shop_name || ""
        }
      );
      setProducts({
        ...products,
        [colId]: products[colId].map(p => p.$id === prod.$id ? prod : p)
      });
      setEditingProduct(null);
      showMessage("✅ Updated!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  const deleteProduct = async (colId, prodId) => {
    try {
      await databases.deleteDocument(databaseId, "products", prodId);
      setProducts({
        ...products,
        [colId]: products[colId].filter(p => p.$id !== prodId)
      });
      showMessage("🗑️ Deleted!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  const addShop = async (shopName) => {
    try {
      const response = await databases.createDocument(
        databaseId,
        "shops",
        ID.unique(),
        {
          name: shopName
        }
      );
      setShops([...shops, response]);
      showMessage("✅ Shop added!");
    } catch (error) {
      showMessage("❌ " + error.message, "error");
    }
  };

  // Use the same card style for admin preview
  const cardClass = "min-w-[220px] max-w-xs bg-white/10 p-4 rounded-xl";
  const cardImageClass = "w-full h-40 object-cover rounded-lg";

  return (
    <div className="max-w-6xl mx-auto">
      {!selectedCollection ? (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-purple-200">Manage Collections</h2>
          <CollectionForm onSubmit={createCollection} editing={editingCollection} onUpdate={updateCollection} onCancel={() => setEditingCollection(null)} />
          <div className="flex flex-wrap gap-6 mt-10">
            {collections.map(c => (
              <div key={c.$id} className={cardClass + (c.pinned ? " border-2 border-pink-400" : " border-2 border-white/20")}>
                <img
                  src={c.cover || "https://placehold.co/600x400?text=No+Image"}
                  alt={c.title}
                  className={cardImageClass}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
                <h3 className="font-bold mt-4">{c.title}</h3>
                <p className="text-sm text-gray-400">{c.details}</p>
                {c.pinned && <span className="inline-block mt-2 px-2 py-1 bg-pink-500 text-white text-xs rounded-full">Pinned</span>}
                <div className="mt-4 space-x-2">
                  <button onClick={() => setSelectedCollection(c)} className="bg-green-500 text-white px-3 py-1 rounded">Products</button>
                  <button onClick={() => setEditingCollection(c)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => deleteCollection(c.$id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedCollection(null)} className="mb-6 bg-white/10 px-4 py-2 rounded">← Back</button>
          <h2 className="text-3xl font-bold mb-6 text-purple-200">Products in {selectedCollection.title}</h2>
          <ProductForm
            colId={selectedCollection.$id}
            onSubmit={(prod) => createProduct(selectedCollection.$id, prod)}
            editing={editingProduct}
            onUpdate={(prod) => updateProduct(selectedCollection.$id, prod)}
            onCancel={() => setEditingProduct(null)}
            shops={shops}
            onAddShop={addShop}
          />
          <div className="flex flex-wrap gap-8">
            {(products[selectedCollection.$id] || []).map(p => (
              <div key={p.$id} className="w-[260px] h-[320px] bg-white/10 p-4 rounded-xl flex flex-col">
                <img
                  src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                  alt={p.title}
                  className="w-full h-[180px] object-cover object-center rounded-lg mb-4"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-lg">{p.title}</h4>
                  <p className="text-green-300 font-bold text-lg mt-2">৳ {p.price}</p>
                  {p.shop_name && (
                    <p className="text-sm text-blue-300 mt-1">from {p.shop_name}</p>
                  )}
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.tags.map((tag, i) => (
                        <span key={i} className="bg-purple-600 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 space-x-2">
                  <button onClick={() => setEditingProduct(p)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => deleteProduct(selectedCollection.$id, p.$id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;