import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Client, Account, Databases, ID } from "appwrite";

// === Initialize Appwrite ===
const client = new Client();

// Load from .env
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

// Reusable Multi-Image Input Component
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

// Tag Input
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
    const col = { $id: editing?.$id || ID.unique(), title, details, cover };
    editing ? onUpdate(col) : onSubmit(col);
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

function ProductForm({ colId, onSubmit, editing, onUpdate, onCancel }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [link, setLink] = useState("");
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setPrice(editing.price || "");
      setDetails(editing.details || "");
      setLink(editing.link || "");
      setTags(editing.tags || []);
      setImages(editing.images || []);
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
      $id: editing?.$id || ID.unique(),
      title,
      price,
      details,
      link,
      tags,
      images,
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

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

      const grouped = {};
      cols.forEach(col => {
        grouped[col.$id] = prods
          .filter(p => p.collection_id === col.$id)
          .map(p => ({
            ...p,
            tags: p.tags ? JSON.parse(p.tags) : [],
            images: p.images ? JSON.parse(p.images) : []
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
          <Route path="/" element={<Home collections={collections} />} />
          <Route path="/collection/:id" element={<Collection products={products} collections={collections} />} />
          <Route path="/login" element={<LoginForm setIsAdmin={setIsAdmin} showMessage={showMessage} />} />
          <Route path="/admin" element={isAdmin ? (
            <Admin
              collections={collections}
              setCollections={setCollections}
              products={products}
              setProducts={setProducts}
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
function Home({ collections }) {
  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center text-indigo-200">Available Collections</h2>
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map(c => (
            <Link
              key={c.$id}
              to={`/collection/${c.$id}`}
              className="bg-white/10 p-4 rounded-xl hover:scale-105 transition"
            >
              <img
                src={c.cover || "https://placehold.co/600x400?text=No+Image"}
                alt={c.title}
                className="w-full h-40 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400?text=No+Image";
                }}
              />
              <h3 className="font-bold mt-4">{c.title}</h3>
              <p className="text-sm text-gray-400">{c.details}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No collections yet.</p>
      )}
    </div>
  );
}

function Collection({ collections, products }) {
  const { id } = useParams();
  const collection = collections.find(c => c.$id === id);
  const [modal, setModal] = useState(null);

  if (!collection) return <p className="text-center text-red-400 mt-10">Not found</p>;

  const collectionProducts = products[id] || [];

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center text-purple-200">{collection.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collectionProducts.map(p => (
          <div key={p.$id} onClick={() => setModal(p)} className="bg-white/10 p-4 rounded-xl cursor-pointer hover:scale-105 transition">
            <img
              src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
              alt={p.title}
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400?text=No+Image";
              }}
            />
            <h4 className="font-bold mt-4">{p.title}</h4>
            <p className="text-green-300 font-bold">৳ {p.price}</p>
          </div>
        ))}
      </div>
      {modal && <Modal product={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

// New component for full-screen image viewing
function FullscreenImageViewer({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = (e) => {
    e.stopPropagation(); // Prevents clicks from closing the modal
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation(); // Prevents clicks from closing the modal
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-screen-xl max-h-screen-xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex] || "https://placehold.co/1000x800?text=No+Image"}
          alt={`Full screen view of image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/1000x800?text=No+Image";
          }}
        />
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-4xl font-bold p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
          ×
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full text-2xl hover:bg-black/70 transition-colors"
            >
              &larr;
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full text-2xl hover:bg-black/70 transition-colors"
            >
              &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Product Details Modal
function Modal({ product, onClose }) {
  if (!product) return null;
  const images = product.images?.length > 0 ? product.images : [""];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const openFullscreen = (index, e) => {
    e.stopPropagation();
    setFullscreenImage(index);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white/10 p-6 rounded-2xl max-w-lg w-full relative pt-12" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-xl font-bold p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10">
          ×
        </button>

        <div className="relative mb-4">
          <img
            src={images[currentImageIndex] || "https://placehold.co/600x400?text=No+Image"}
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
        <FullscreenImageViewer
          images={images}
          initialIndex={fullscreenImage}
          onClose={closeFullscreen}
        />
      )}
    </div>
  );
}

// ======================
// Admin Panel
// ======================
function Admin({ collections, setCollections, products, setProducts, showMessage, fetchData }) {
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
          cover: col.cover || ""
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
          cover: col.cover || ""
        }
      );
      setCollections(collections.map(c => c.$id === col.$id ? col : c));
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
          images: JSON.stringify(prod.images)
        }
      );
      setProducts({
        ...products,
        [colId]: [...(products[colId] || []), {
          ...response,
          tags: prod.tags,
          images: prod.images
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
          images: JSON.stringify(prod.images)
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

  return (
    <div className="max-w-6xl mx-auto">
      {!selectedCollection ? (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-purple-200">Manage Collections</h2>
          <CollectionForm onSubmit={createCollection} editing={editingCollection} onUpdate={updateCollection} onCancel={() => setEditingCollection(null)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
            {collections.map(c => (
              <div key={c.$id} className="bg-white/10 p-4 rounded-xl">
                <img
                  src={c.cover || "https://placehold.co/600x400?text=No+Image"}
                  alt={c.title}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
                <h3 className="font-bold mt-4">{c.title}</h3>
                <p className="text-sm text-gray-400">{c.details}</p>
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
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(products[selectedCollection.$id] || []).map(p => (
              <div key={p.$id} className="bg-white/10 p-4 rounded-xl">
                <img
                  src={p.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                  alt={p.title}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=No+Image";
                  }}
                />
                <h4 className="font-bold mt-4">{p.title}</h4>
                <p className="text-green-300 font-bold">৳ {p.price}</p>
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