import React, { useState, useEffect } from 'react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, onSnapshot, doc, addDoc, setDoc, deleteDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// --- Firebase Setup ---
const firebaseConfig = {
    apiKey: "AIzaSyA89DXv8k6wKmTEx4ZAlx74lrylJ3efPlI",
    authDomain: "genderrevealsrus-a27f3.firebaseapp.com",
    projectId: "genderrevealsrus-a27f3",
    storageBucket: "genderrevealsrus-a27f3.appspot.com",
    messagingSenderId: "138699724662",
    appId: "1:138699724662:web:b7b5c413b978d600970c57",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = 'kroI33bVo4PZQbuFbFf7Ko5xPwB2';

// --- Helper Components ---
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>{children}</div>;
const Button = ({ children, onClick, className = '', variant = 'primary', type = 'button', disabled = false }) => {
    const variants = { primary: 'bg-blue-600 text-white hover:bg-blue-700', secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300', danger: 'bg-red-600 text-white hover:bg-red-700' };
    return <button onClick={onClick} type={type} disabled={disabled} className={`font-bold py-2 px-4 rounded-lg shadow-sm transition duration-300 disabled:opacity-50 ${variants[variant]} ${className}`}>{children}</button>;
};
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button></div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};
const LoadingSpinner = () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;

// --- Admin Components ---
const AdminLoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8"><h1 className="text-4xl font-extrabold text-gray-700">Admin Portal</h1></div>
                <Card>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4"><label className="block text-gray-700 font-bold mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" required /></div>
                        <div className="mb-6"><label className="block text-gray-700 font-bold mb-2">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" required /></div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing In...' : 'Sign In'}</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

const ManageServices = ({ services }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const openModal = (item = null) => {
        setCurrentItem(item);
        setName(item ? item.name : '');
        setPrice(item ? item.price : '');
        setIsOpen(true);
    };

    const handleSave = async () => {
        const priceNum = parseFloat(price);
        if (!name || isNaN(priceNum)) return alert('Please enter a valid name and price.');

        if (currentItem) {
            await setDoc(doc(db, 'rentalItems', currentItem.id), { name, price: priceNum }, { merge: true });
        } else {
            await addDoc(collection(db, 'rentalItems'), { name, price: priceNum });
        }
        setIsOpen(false);
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this service? This cannot be undone.')) {
            await deleteDoc(doc(db, 'rentalItems', id));
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Services</h2>
                <Button onClick={() => openModal()}>Add New Service</Button>
            </div>
            <div className="space-y-3">
                {services.map(item => (
                    <div key={item.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                        <div><p className="font-semibold">{item.name}</p><p className="text-gray-600">${item.price.toFixed(2)}</p></div>
                        <div className="space-x-2">
                            <Button onClick={() => openModal(item)} variant="secondary">Edit</Button>
                            <Button onClick={() => handleDelete(item.id)} variant="danger">Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={currentItem ? 'Edit Service' : 'Add New Service'}>
                <div className="space-y-4">
                    <div><label className="font-bold">Service Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div><label className="font-bold">Price</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" /></div>
                    <div className="pt-4 flex justify-end space-x-3"><Button onClick={() => setIsOpen(false)} variant="secondary">Cancel</Button><Button onClick={handleSave}>Save</Button></div>
                </div>
            </Modal>
        </Card>
    );
};

const ManageSpecials = ({ specials, services }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedServices, setSelectedServices] = useState({});

    const openModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { title: '', description: '', price: '', imageUrl: '' });
        const initialSelected = {};
        if (item && item.serviceIds) {
            item.serviceIds.forEach(id => initialSelected[id] = true);
        }
        setSelectedServices(initialSelected);
        setIsOpen(true);
    };
    
    useEffect(() => {
        if (!isOpen) return;
        const originalPrice = Object.keys(selectedServices).reduce((total, id) => {
            if (selectedServices[id]) {
                const service = services.find(s => s.id === id);
                return total + (service ? service.price : 0);
            }
            return total;
        }, 0);
        setFormData(prev => ({ ...prev, originalPrice: originalPrice.toFixed(2) }));
    }, [selectedServices, services, isOpen]);

    const handleSave = async () => {
        const priceNum = parseFloat(formData.price);
        if (!formData.title || isNaN(priceNum)) return alert('Please enter a valid title and price.');
        
        const serviceIds = Object.keys(selectedServices).filter(id => selectedServices[id]);
        const dataToSave = { ...formData, price: priceNum, serviceIds };

        if (currentItem) {
            await setDoc(doc(db, 'specials', currentItem.id), dataToSave, { merge: true });
        } else {
            await addDoc(collection(db, 'specials'), dataToSave);
        }
        setIsOpen(false);
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this special?')) {
            await deleteDoc(doc(db, 'specials', id));
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Manage Specials</h2><Button onClick={() => openModal()}>Add New Special</Button></div>
            <div className="space-y-3">
                {specials.map(item => (
                    <div key={item.id} className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                        <div><p className="font-semibold">{item.title}</p><p className="text-gray-600">${item.price.toFixed(2)}</p></div>
                        <div className="space-x-2"><Button onClick={() => openModal(item)} variant="secondary">Edit</Button><Button onClick={() => handleDelete(item.id)} variant="danger">Delete</Button></div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={currentItem ? 'Edit Special' : 'Add New Special'}>
                <div className="space-y-4">
                    <div><label className="font-bold">Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full p-2 border rounded-md"/></div>
                    <div><label className="font-bold">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full p-2 border rounded-md"/></div>
                    <div><label className="font-bold">Image URL</label><input type="text" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="mt-1 block w-full p-2 border rounded-md"/></div>
                    <div>
                        <label className="font-bold">Included Services</label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md">
                            {services.map(service => (
                                <label key={service.id} className="flex items-center"><input type="checkbox" checked={!!selectedServices[service.id]} onChange={() => setSelectedServices(prev => ({...prev, [service.id]: !prev[service.id]}))} className="mr-2"/>{service.name}</label>
                            ))}
                        </div>
                    </div>
                    <div><p>Original Price (Auto-calculated): <span className="font-bold">${formData.originalPrice || '0.00'}</span></p></div>
                    <div><label className="font-bold">Special Price</label><input type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="mt-1 block w-full p-2 border rounded-md"/></div>
                    <div className="pt-4 flex justify-end space-x-3"><Button onClick={() => setIsOpen(false)} variant="secondary">Cancel</Button><Button onClick={handleSave}>Save</Button></div>
                </div>
            </Modal>
        </Card>
    );
};

// --- NEW: Manage Site Content Component ---
const ManageSiteContent = ({ siteContent, setSiteContent }) => {
    const [formData, setFormData] = useState(siteContent);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(siteContent);
    }, [siteContent]);

    const handleSave = async () => {
        setIsSaving(true);
        const contentDoc = doc(db, 'siteContent', 'contact');
        await setDoc(contentDoc, formData, { merge: true });
        setIsSaving(false);
        alert('Content saved!');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-6">Manage Site Content</h2>
            <div className="space-y-4 max-w-lg">
                <div><label className="font-bold">Phone Number</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md"/></div>
                <div><label className="font-bold">Email Address</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md"/></div>
                <div><label className="font-bold">Facebook URL</label><input type="text" name="facebook" value={formData.facebook || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md"/></div>
                <div><label className="font-bold">Instagram URL</label><input type="text" name="instagram" value={formData.instagram || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md"/></div>
                <div className="pt-4"><Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Content'}</Button></div>
            </div>
        </Card>
    );
};


// --- App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState('services');
    const [services, setServices] = useState([]);
    const [specials, setSpecials] = useState([]);
    const [siteContent, setSiteContent] = useState({});

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        const unsubscribeServices = onSnapshot(collection(db, 'rentalItems'), snapshot => {
            setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeSpecials = onSnapshot(collection(db, 'specials'), snapshot => {
            setSpecials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubscribeContent = onSnapshot(doc(db, 'siteContent', 'contact'), doc => {
            setSiteContent(doc.data() || {});
        });
        return () => { unsubscribeAuth(); unsubscribeServices(); unsubscribeSpecials(); unsubscribeContent(); };
    }, []);

    const handleLogout = async () => await signOut(auth);

    if (loading) return <LoadingSpinner />;
    if (!user || user.uid !== ADMIN_UID) return <AdminLoginScreen />;

    const renderPage = () => {
        switch (activePage) {
            case 'services': return <ManageServices services={services} />;
            case 'specials': return <ManageSpecials specials={specials} services={services} />;
            case 'content': return <ManageSiteContent siteContent={siteContent} />;
            default: return <ManageServices services={services} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col">
                <div className="p-6 text-center border-b"><h1 className="text-2xl font-extrabold text-gray-700">Admin</h1></div>
                <nav className="flex-grow p-4">
                    <ul className="space-y-2">
                        <li><button onClick={() => setActivePage('services')} className={`w-full text-left px-4 py-2 rounded-lg ${activePage === 'services' ? 'bg-blue-500 text-white' : ''}`}>Services</button></li>
                        <li><button onClick={() => setActivePage('specials')} className={`w-full text-left px-4 py-2 rounded-lg ${activePage === 'specials' ? 'bg-blue-500 text-white' : ''}`}>Specials</button></li>
                        <li><button onClick={() => setActivePage('content')} className={`w-full text-left px-4 py-2 rounded-lg ${activePage === 'content' ? 'bg-blue-500 text-white' : ''}`}>Site Content</button></li>
                    </ul>
                </nav>
                <div className="p-4 border-t"><Button onClick={handleLogout} className="w-full" variant="secondary">Logout</Button></div>
            </aside>
            <main className="flex-grow p-8">{renderPage()}</main>
        </div>
    );
}
