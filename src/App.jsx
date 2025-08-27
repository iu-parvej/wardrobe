import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

// ---------------- LocalStorage helpers ----------------
// Saves data to localStorage
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
// Loads data from localStorage, or returns a fallback if not found
const loadData = (key, fallback) => {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    return fallback;
  }
};

// ---------------- Reusable Multi-Image Input Component ----------------
// This component now handles an array of image URLs
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
            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg shadow" />
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

// ---------------- Modal ----------------
function Modal({ product, onClose }) {
  if (!product) return null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [];

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const showNav = images.length > 1;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/10 p-6 rounded-3xl max-w-lg w-full relative backdrop-blur-sm shadow-2xl scale-in-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-red-400 text-xl font-bold transition-transform transform hover:scale-125">×</button>
        <div className="relative">
          {images.length > 0 ? (
            <img
              src={images[currentImageIndex]}
              alt={product.title}
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-700 flex items-center justify-center rounded-2xl shadow-lg">
              <span>No Image</span>
            </div>
          )}
          {showNav && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
              >
                &larr;
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
              >
                &rarr;
              </button>
            </>
          )}
        </div>
        <h3 className="mt-4 font-bold text-2xl text-purple-300">{product.title}</h3>
        <p className="text-gray-300 text-sm mt-1">{product.details}</p>
        <p className="text-green-300 font-extrabold text-xl mt-2">৳ {product.price}</p>
        {product.tags && product.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag, i) => (
              <span key={i} className="bg-purple-600 px-3 py-1 rounded-full text-xs font-semibold">{tag}</span>
            ))}
          </div>
        )}
        {product.link && (
          <a href={product.link} target="_blank" rel="noopener noreferrer"
             className="block mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-xl font-bold text-center transition-all shadow-md">
            View Product
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------- Main App ----------------
function App() {
  const [collections, setCollections] = useState(() => loadData("collections", []));
  const [products, setProducts] = useState(() => loadData("products", {}));
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Persist state to localStorage on every change
  useEffect(() => saveData("collections", collections), [collections]);
  useEffect(() => saveData("products", products), [products]);

  // Handle showing messages
  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const MessageBar = () => {
    if (!message.text) return null;
    const bgColor = message.type === "error" ? "bg-red-500" : "bg-green-500";
    return (
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl text-center z-50 ${bgColor} text-white shadow-xl animate-slide-up`}>
        {message.text}
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6 font-inter">
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out; }
          .animate-slide-up { animation: slideUp 0.3s ease-out; }
          .scale-in-center { animation: scaleIn 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
          
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          @keyframes scaleIn { 
            from { transform: scale(0.8); opacity: 0; } 
            to { transform: scale(1); opacity: 1; } 
          }
          `}
        </style>
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-6 border-b border-white/20">
          <Link to="/" className="text-3xl font-extrabold text-purple-300 tracking-wide hover:text-purple-200 transition-colors">
            Collection of Parvei
          </Link>
          <nav className="space-x-2 sm:space-x-4 mt-4 sm:mt-0">
            <Link to="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">Home</Link>
            {isAdmin ? (
              <>
                <Link to="/admin" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">Admin</Link>
                <button className="bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600 transition-all" onClick={() => setIsAdmin(false)}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">Admin Login</Link>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home collections={collections} />} />
          <Route path="/collection/:id" element={<Collection products={products} collections={collections} />} />
          <Route path="/login" element={<Login setIsAdmin={setIsAdmin} showMessage={showMessage} />} />
          <Route path="/admin" element={<Admin 
            collections={collections} 
            setCollections={setCollections} 
            products={products} 
            setProducts={setProducts} 
            isAdmin={isAdmin}
            showMessage={showMessage}
          />} />
        </Routes>
        <MessageBar />
      </div>
    </Router>
  );
}

// ---------------- Pages ----------------
function Home({ collections }) {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center text-indigo-200">Available Collections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collections.map((c) => (
          <Link key={c.id} to={`/collection/${c.id}`} className="bg-white/10 p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 group">
            {c.cover ? (
              <img 
                src={c.cover} 
                alt={c.title} 
                className="w-full h-40 object-cover rounded-xl group-hover:shadow-xl transition-shadow" 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/374151/E9D5FF?text=No+Image"; }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-xl text-gray-400">
                <span>No Image</span>
              </div>
            )}
            <h3 className="font-bold mt-4 text-xl text-purple-200 group-hover:text-purple-100 transition-colors">{c.title}</h3>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{c.details}</p>
          </Link>
        ))}
        {!collections.length && <p className="text-center col-span-full text-gray-400">No collections yet. Log in as an admin to add some.</p>}
      </div>
    </div>
  );
}

function Collection({ products, collections }) {
  const { id } = useParams();
  const collection = collections.find((c) => c.id === id);
  const [modal, setModal] = useState(null);

  if (!collection) return <p className="text-center text-lg text-red-400">Collection not found.</p>;

  const collectionProducts = products[id] || [];

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center text-purple-200">{collection.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collectionProducts.map((p) => (
          <div key={p.id} onClick={() => setModal(p)} className="bg-white/10 p-4 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300 group">
            {p.images && p.images.length > 0 ? (
              <img 
                src={p.images[0]} // Display the first image in the list view
                alt={p.title} 
                className="w-full h-40 object-cover rounded-xl group-hover:shadow-xl transition-shadow" 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/374151/E9D5FF?text=No+Image"; }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-xl text-gray-400">
                <span>No Image</span>
              </div>
            )}
            <h4 className="font-bold mt-4 text-xl text-purple-200 group-hover:text-purple-100 transition-colors">{p.title}</h4>
            <p className="text-green-300 font-extrabold text-lg mt-1">৳ {p.price}</p>
          </div>
        ))}
        {!collectionProducts.length && <p className="text-center col-span-full text-gray-400">No products yet.</p>}
      </div>
      {modal && <Modal product={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function Login({ setIsAdmin, showMessage }) {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    if (username.value === "parvej" && password.value === "1234") {
      setIsAdmin(true);
      showMessage("Logged in successfully!", "success");
      navigate("/admin");
    } else {
      showMessage("Wrong credentials!", "error");
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white/10 p-8 rounded-3xl shadow-lg backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">Admin Login</h2>
      <input name="username" placeholder="Username" className="block mb-4 p-4 w-full text-black rounded-xl" required/>
      <input name="password" type="password" placeholder="Password" className="block mb-6 p-4 w-full text-black rounded-xl" required/>
      <button className="bg-gradient-to-r from-purple-500 to-pink-500 w-full px-6 py-3 rounded-xl font-bold text-white hover:scale-105 transition-transform duration-300 shadow-md">
        Login
      </button>
    </form>
  );
}

function Admin({ collections, setCollections, products, setProducts, isAdmin, showMessage }) {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
    }
  }, [isAdmin, navigate]);

  const createCollection = (col) => {
    setCollections([...collections, col]);
    showMessage("Collection created!", "success");
  };
    
  const updateCollection = (col) => {
    setCollections(collections.map((c) => (c.id === col.id ? col : c)));
    setEditingCollection(null);
    showMessage("Collection updated!", "success");
  };
    
  const deleteCollection = (id) => {
    setCollections(collections.filter((c) => c.id !== id));
    const newProducts = { ...products };
    delete newProducts[id];
    setProducts(newProducts);
    showMessage("Collection deleted!", "success");
  };

  const createProduct = (colId, prod) => {
    setProducts({  
      ...products,  
      [colId]: [...(products[colId] || []), prod]  
    });
    showMessage("Product added!", "success");
  };
    
  const updateProduct = (colId, prod) => {
    setProducts({
      ...products,
      [colId]: (products[colId] || []).map((p) => (p.id === prod.id ? prod : p)),
    });
    setEditingProduct(null);
    showMessage("Product updated!", "success");
  };
    
  const deleteProduct = (colId, prodId) => {
    setProducts({
      ...products,
      [colId]: (products[colId] || []).filter((p) => p.id !== prodId),
    });
    showMessage("Product deleted!", "success");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!selectedCollection ? (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-purple-200">Manage Collections</h2>
          <CollectionForm onSubmit={createCollection} editing={editingCollection} onUpdate={updateCollection} onCancel={() => setEditingCollection(null)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {collections.map((c) => (
              <div key={c.id} className="bg-white/10 p-4 rounded-2xl shadow-md backdrop-blur-sm">
                {c.cover ? (
                  <img 
                    src={c.cover} 
                    alt={c.title} 
                    className="w-full h-40 object-cover rounded-xl mb-3" 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/374151/E9D5FF?text=No+Image"; }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-xl mb-3 text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
                <h3 className="font-bold text-lg text-purple-200">{c.title}</h3>
                <p className="text-sm text-gray-400">{c.details}</p>
                <div className="mt-4 space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-white font-semibold transition" onClick={() => setSelectedCollection(c)}>Products</button>
                  <button className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg text-white font-semibold transition" onClick={() => setEditingCollection(c)}>Edit</button>
                  <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-white font-semibold transition" onClick={() => deleteCollection(c.id)}>Delete</button>
                </div>
              </div>
            ))}
            {!collections.length && <p className="col-span-full text-center text-gray-400">No collections to display.</p>}
          </div>
        </div>
      ) : (
        <div>
          <button className="mb-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition" onClick={() => setSelectedCollection(null)}>← Back to Collections</button>
          <h2 className="text-3xl font-bold mb-6 text-purple-200">Products in {selectedCollection.title}</h2>
          <ProductForm
            colId={selectedCollection.id}
            onSubmit={(prod) => createProduct(selectedCollection.id, prod)}
            editing={editingProduct}
            onUpdate={(prod) => updateProduct(selectedCollection.id, prod)}
            onCancel={() => setEditingProduct(null)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {(products[selectedCollection.id] || []).map((p) => (
              <div key={p.id} onClick={() => setEditingProduct(p)} className="bg-white/10 p-4 rounded-2xl shadow-md backdrop-blur-sm">
                {p.images && p.images.length > 0 ? (
                  <img 
                    src={p.images[0]} // Display the first image
                    alt={p.title} 
                    className="w-full h-40 object-cover rounded-xl mb-3" 
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/374151/E9D5FF?text=No+Image"; }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-700 flex items-center justify-center rounded-xl mb-3 text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
                <h4 className="font-bold text-lg text-purple-200">{p.title}</h4>
                <p className="text-green-300 font-bold text-base">৳ {p.price}</p>
                <p className="text-sm text-gray-400">{p.details}</p>
                <div className="mt-4 space-x-2">
                  <button className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-lg text-white font-semibold transition" onClick={() => setEditingProduct(p)}>Edit</button>
                  <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-white font-semibold transition" onClick={() => deleteProduct(selectedCollection.id, p.id)}>Delete</button>
                </div>
              </div>
            ))}
            {!(products[selectedCollection.id] || []).length && <p className="col-span-full text-center text-gray-400">No products in this collection.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Reusable Forms ----------------
function CollectionForm({ onSubmit, editing, onUpdate, onCancel }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [cover, setCover] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setDetails(editing.details || "");
      setCover(editing.cover || "");
    } else {
      setTitle("");
      setDetails("");
      setCover("");
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const col = { id: editing?.id || Date.now().toString(), title, details, cover };
    if (editing) {
      onUpdate(col);
    } else {
      onSubmit(col);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-3xl shadow-lg backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4 text-purple-200">{editing ? "Edit Collection" : "Create New Collection"}</h2>
      <div className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="block p-4 w-full text-black rounded-xl" required />
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" className="block p-4 w-full text-black rounded-xl" required />
        <MultiImageInput value={cover ? [cover] : []} onChange={(images) => setCover(images[0] || "")} placeholder="Cover Image URL" />
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

// ---------------- Tag Input ----------------
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

function ProductForm({ colId, onSubmit, editing, onUpdate, onCancel }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]); // Changed from image to images

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setPrice(editing.price || "");
      setDetails(editing.details || "");
      setLink(editing.link || "");
      setTags(editing.tags || []);
      setImages(editing.images || []); // Updated for images array
    } else {
      setTitle("");
      setPrice("");
      setDetails("");
      setLink("");
      setTags([]);
      setImages([]);
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = {  
      id: editing?.id || Date.now().toString(),  
      title,  
      price,  
      details,  
      link,  
      tags,  
      images  // Changed from image to images
    };
    if (editing) {
      onUpdate(prod);
    } else {
      onSubmit(prod);
    }
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

export default App;
