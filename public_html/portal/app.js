import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { loadStripe } from 'https://cdn.jsdelivr.net/npm/@stripe/stripe-js/+esm';
import { Elements, CardElement, useStripe, useElements } from 'https://cdn.jsdelivr.net/npm/@stripe/react-stripe-js/+esm';

// --- Firebase Setup ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, addDoc, query, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA89DXv8k6wKmTEx4ZAlx74lrylJ3efPlI",
  authDomain: "genderrevealsrus-a27f3.firebaseapp.com",
  projectId: "genderrevealsrus-a27f3",
  storageBucket: "genderrevealsrus-a27f3.appspot.com",
  messagingSenderId: "138699724662",
  appId: "1:138699724662:web:b7b5c413b978d600970c57",
  measurementId: "G-NNP332RKK2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY'); // Replace with your actual Stripe Publishable Key

// --- Helper Components ---
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>{children}</div>;
const Button = ({ children, onClick, className = '', variant = 'primary', type = 'button', disabled = false }) => {
  const baseClasses = 'font-bold py-2 px-6 rounded-full shadow-md transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100';
  const variants = { primary: 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600', secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300', };
  return <button onClick={onClick} type={type} disabled={disabled} className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</button>;
};
const GradientText = ({ children }) => <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">{children}</span>;
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold"><GradientText>{title}</GradientText></h2><button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button></div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};
const LoadingSpinner = () => <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div></div>;
const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-700">{label}</span>
        <button onClick={() => setEnabled(!enabled)} className={`${enabled ? 'bg-pink-500' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}>
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
        </button>
    </div>
);

// --- Helper Functions ---
const formatTime = (time) => { if (!time) return ''; const [hours, minutes] = time.split(':'); const hoursNum = parseInt(hours, 10); const ampm = hoursNum >= 12 ? 'PM' : 'AM'; const formattedHours = hoursNum % 12 || 12; return `${formattedHours}:${minutes} ${ampm}`; };
const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// --- Main App Components ---
const LoginScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name: name, email: email, phone: '',
                    notificationPrefs: { bookingConfirmations: true, specialOffers: false },
                    paymentMethod: null
                });
            }
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8"><h1 className="text-4xl font-extrabold"><GradientText>Customer Portal</GradientText></h1><p className="text-gray-600 mt-2">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</p></div>
                <Card>
                    <form onSubmit={handleAuth}>
                        {!isLogin && (<div className="mb-4"><label className="block text-gray-700 font-bold mb-2">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" required /></div>)}
                        <div className="mb-4"><label className="block text-gray-700 font-bold mb-2">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" required /></div>
                        <div className="mb-6"><label className="block text-gray-700 font-bold mb-2">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700" required /></div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <div className="flex items-center justify-between"><Button type="submit" disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</Button>
                            <a href="#" onClick={() => setIsLogin(!isLogin)} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">{isLogin ? 'Create an account' : 'Have an account? Sign In'}</a>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
const Dashboard = ({ user, bookings, setActivePage, openContactModal }) => { const t=bookings.filter(e=>"Upcoming"===e.status||"Pending Approval"===e.status).sort((e,t)=>new Date(e.eventDate)-new Date(t.eventDate)),o=bookings.filter(e=>"Past"===e.status);return<div><h2 className="text-3xl font-bold mb-6">Welcome back, {user.name.split(" ")[0]}!</h2><div className="grid md:grid-cols-3 gap-6 mb-8"><Card className="text-center bg-pink-100"><p className="text-4xl font-extrabold text-pink-600">{bookings.length}</p><p className="text-gray-700 font-semibold">Total Bookings</p></Card><Card className="text-center bg-blue-100"><p className="text-4xl font-extrabold text-blue-600">{t.length}</p><p className="text-gray-700 font-semibold">Upcoming Events</p></Card><Card className="text-center bg-gray-200"><p className="text-4xl font-extrabold text-gray-600">{o.length}</p><p className="text-gray-700 font-semibold">Past Events</p></Card></div><div className="grid lg:grid-cols-3 gap-8"><div className="lg:col-span-2"><Card><h3 className="text-2xl font-bold mb-4">Next Upcoming Event</h3>{t.length>0?<div className="p-4 bg-gray-50 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-bold text-lg">{t[0].eventName}</p><p className="text-gray-600">{formatDate(t[0].eventDate)} at {formatTime(t[0].eventTime)}</p><p className="text-gray-500 text-sm">{t[0].address}, {t[0].city}</p></div><p className="font-bold text-xl text-pink-500">${t[0].total.toFixed(2)}</p></div><Button onClick={()=>setActivePage("bookings")}className="mt-4 text-sm">View All Bookings</Button></div>:<p className="text-gray-500">You have no upcoming events.</p>}</Card></div><div><Card><h3 className="text-2xl font-bold mb-4">Quick Actions</h3><div className="space-y-3"><Button onClick={()=>setActivePage("newBooking")}className="w-full">Make a New Booking</Button><Button onClick={openContactModal}className="w-full"variant="secondary">Contact Support</Button></div></Card></div></div></div>};
const Bookings = ({ bookings }) => { const t=e=>"Upcoming"===e?"border-pink-500 bg-pink-50":"Pending Approval"===e?"border-yellow-500 bg-yellow-50":"Past"===e?"border-gray-400 bg-gray-100":"border-gray-400 bg-gray-100";return<Card><h2 className="text-3xl font-bold mb-6">Your Bookings</h2><div className="space-y-6">{bookings.map(e=><div key={e.id}className={`p-6 rounded-lg border-l-4 ${t(e.status)}`}><div className="flex flex-col sm:flex-row justify-between sm:items-start"><div><h3 className="text-xl font-bold">{e.eventName}</h3><p className="text-gray-600 font-semibold">{formatDate(e.eventDate)} at {formatTime(e.eventTime)}</p><p className="text-gray-500">{e.address}, {e.city}, {e.zip}</p><p className="font-bold mt-1">{e.status}</p></div><p className="font-bold text-2xl mt-2 sm:mt-0">${e.total.toFixed(2)}</p></div><div className="mt-4 pt-4 border-t"><h4 className="font-bold mb-2">Items Rented:</h4><ul className="list-disc list-inside text-gray-700">{e.items.map((e,t)=><li key={t}>{e.name}</li>)}</ul></div></div>)}</div></Card>};
const Account = ({ user, onUpdateUser }) => { const [t,e]=useState(!1),[o,n]=useState(user),[a,s]=useState({current:"",new:"",confirm:""});const l=t=>{n({...o,[t.target.name]:t.target.value})},i=t=>{s({...a,[t.target.name]:t.target.value})},c=(t,e)=>{n({...o,notificationPrefs:{...o.notificationPrefs,[t]:e}})},r=()=>{onUpdateUser(o),e(!1)};return<div className="space-y-8"><Card><div className="flex justify-between items-center mb-6"><h2 className="text-3xl font-bold">Your Profile</h2>{!t&&<Button onClick={()=>e(!0)}>Edit Profile</Button>}</div>{t?<div className="space-y-4"><div><label className="font-bold">Name</label><input type="text"name="name"value={o.name}onChange={l}className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div><label className="font-bold">Email</label><input type="email"name="email"value={o.email}onChange={l}className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" disabled/></div><div><label className="font-bold">Phone</label><input type="tel"name="phone"value={o.phone}onChange={l}className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div className="flex space-x-4 pt-2"><Button onClick={r}>Save Changes</Button><Button onClick={()=>e(!1)}variant="secondary">Cancel</Button></div></div>:<div className="space-y-4 text-lg"><p><strong className="font-semibold w-32 inline-block">Name:</strong> {user.name}</p><p><strong className="font-semibold w-32 inline-block">Email:</strong> {user.email}</p><p><strong className="font-semibold w-32 inline-block">Phone:</strong> {user.phone}</p></div>}</Card><Card><h3 className="text-2xl font-bold mb-4">Change Password</h3><div className="space-y-4 max-w-md"><div><label className="font-bold">Current Password</label><input type="password"name="current"value={a.current}onChange={i}className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div><label className="font-bold">New Password</label><input type="password"name="new"value={a.new}onChange={i}className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div><label className="font-bold">Confirm New Password</label><input type="password"name="confirm"value={a.confirm}onChange={i}className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/></div><div className="pt-2"><Button disabled={!a.current||!a.new||a.new!==a.confirm}>Update Password</Button></div></div></Card><Card><h3 className="text-2xl font-bold mb-4">Notification Preferences</h3><div className="space-y-4 max-w-md"><ToggleSwitch label="Booking Confirmations & Updates"enabled={o.notificationPrefs.bookingConfirmations}setEnabled={t=>c("bookingConfirmations",t)}/><ToggleSwitch label="Special Offers & Promotions"enabled={o.notificationPrefs.specialOffers}setEnabled={t=>c("specialOffers",t)}/><div className="pt-2"><Button onClick={r}>Save Preferences</Button></div></div></Card></div>};
const NewBooking = ({ onBookingSubmit, rentalItems, coupons }) => { const [t,e]=useState(""),[o,n]=useState(""),[a,s]=useState(""),[l,i]=useState(""),[c,r]=useState(""),[d,p]=useState(""),[u,m]=useState({}),[f,h]=useState(0),[g,b]=useState(0),[y,N]=useState(""),[v,k]=useState(0),[S,w]=useState({text:"",type:""});useEffect(()=>{const t=Object.keys(u).reduce((t,e)=>{if(u[e]){const o=rentalItems.find(t=>t.id===e);return t+(o?o.price:0)}return t},0);h(t);const e=t*(v/100);b(t-e)},[u,v,rentalItems]);const C=t=>{m(e=>({...e,[t]:!e[t]}))},B=()=>{const t=coupons.find(t=>t.code.toUpperCase()===y.toUpperCase());t?(k(t.discountPercent),w({text:`${t.discountPercent}% coupon applied successfully!`,type:"success"})):(k(0),w({text:"Invalid coupon code.",type:"error"}))},A=t=>{t.preventDefault();const o=Object.keys(u).filter(t=>u[t]).map(t=>rentalItems.find(e=>e.id===t));const m={eventName:t,eventDate:o,eventTime:a,address:l,city:c,zip:d,status:"Pending Approval",items:o,subtotal:f,discount:v,total:g,createdAt:new Date()};onBookingSubmit(m)};return<Card><h2 className="text-3xl font-bold mb-6">Create a New Booking</h2><form onSubmit={A}><div className="grid md:grid-cols-2 gap-6 mb-4"><div><label className="block font-bold mb-1">Event Name</label><input type="text"value={t}onChange={t=>e(t.target.value)}className="w-full p-2 border rounded-md"required/></div><div className="grid grid-cols-2 gap-4"><div><label className="block font-bold mb-1">Event Date</label><input type="date"value={o}onChange={t=>n(t.target.value)}className="w-full p-2 border rounded-md"required/></div><div><label className="block font-bold mb-1">Event Time</label><input type="time"value={a}onChange={t=>s(t.target.value)}className="w-full p-2 border rounded-md"required/></div></div></div><div className="mb-6"><label className="block font-bold mb-1">Street Address</label><input type="text"value={l}onChange={t=>i(t.target.value)}className="w-full p-2 border rounded-md"required/></div><div className="grid md:grid-cols-2 gap-6 mb-6"><div><label className="block font-bold mb-1">City</label><input type="text"value={c}onChange={t=>r(t.target.value)}className="w-full p-2 border rounded-md"required/></div><div><label className="block font-bold mb-1">ZIP Code</label><input type="text"value={d}onChange={t=>p(t.target.value)}className="w-full p-2 border rounded-md"required/></div></div><h3 className="text-2xl font-bold mb-4">Select Items</h3><div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">{rentalItems.map(t=><div key={t.id}className={`p-4 rounded-lg cursor-pointer transition-all ${u[t.id]?"bg-pink-100 ring-2 ring-pink-500":"bg-white shadow-sm"}`}onClick={()=>C(t.id)}><div className="flex justify-between items-center"><span className="font-semibold">{t.name}</span><span className="font-bold text-pink-500">${t.price}</span></div></div>)}</div><div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t"><div><label className="block font-bold mb-1">Coupon Code</label><div className="flex"><input type="text"value={y}onChange={t=>N(t.target.value)}className="w-full p-2 border rounded-l-md"placeholder="e.g., SAVE10"/><button type="button"onClick={B}className="bg-gray-600 text-white font-bold p-2 rounded-r-md hover:bg-gray-700">Apply</button></div>{S.text&&<p className={`mt-2 text-sm ${"success"===S.type?"text-green-600":"text-red-600"}`}>{S.text}</p>}</div><div className="text-right"><p className="text-lg">Subtotal: <span className="font-semibold">${f.toFixed(2)}</span></p>{v>0&&<p className="text-lg text-green-600">Discount: <span className="font-semibold">-${(f*(v/100)).toFixed(2)} ({v}%)</span></p>}<p className="text-2xl font-bold mt-2">Total: <span className="text-pink-500">${g.toFixed(2)}</span></p></div></div><div className="mt-8 text-center"><Button type="submit"disabled={!t||!o||!a||!l||!c||!d||0===f}>Submit Booking Request</Button></div></form></Card>};
const CheckoutForm = ({ onSuccessfulSave }) => { const t=useStripe(),e=useElements(),[o,n]=useState(null),[a,s]=useState(!1);const l=async o=>{o.preventDefault(),s(!0),t&&e&&(console.log("Creating payment method..."),await t.createPaymentMethod({type:"card",card:e.getElement(CardElement)}).then(({error:t,paymentMethod:e})=>{t?(n(t.message),s(!1),console.error(t)):(n(null),console.log("PaymentMethod created:",e),console.log("Simulating saving card to backend..."),setTimeout(()=>{onSuccessfulSave({id:e.id,brand:e.card.brand,last4:e.card.last4}),s(!1)},1e3))}))};return<form onSubmit={l}><label className="block font-bold mb-2">Card Details</label><div className="p-3 border rounded-md shadow-sm"><CardElement options={{style:{base:{color:"#32325d",fontFamily:"inherit",fontSmoothing:"antialiased",fontSize:"16px","::placeholder":{color:"#aab7c4"}},invalid:{color:"#fa755a",iconColor:"#fa755a"}}}}/></div>{o&&<div className="text-red-500 text-sm mt-2">{o}</div>}<Button type="submit"disabled={!t||a}className="w-full mt-6">{a?"Saving...":"Save Card"}</Button></form>};
const Billing = ({ user, onUpdatePaymentMethod }) => { const [t,e]=useState(!1);const o=o=>{onUpdatePaymentMethod(o),e(!1)};return<div className="space-y-8"><Card><h2 className="text-3xl font-bold mb-2">Billing</h2><p className="text-gray-600 mb-6">Manage your payment methods.</p>{user.paymentMethod&&!t?<div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between"><div><p className="font-semibold">{user.paymentMethod.brand.charAt(0).toUpperCase()+user.paymentMethod.brand.slice(1)} ending in {user.paymentMethod.last4}</p><p className="text-sm text-gray-500">This card will be used for approved bookings.</p></div><Button onClick={()=>e(!0)}variant="secondary">Update Card</Button></div>:<div><p className="mb-4">{user.paymentMethod?"Update your card on file:":"Add a card to be used for future bookings:"}</p><CheckoutForm onSuccessfulSave={o}/>{t&&<Button onClick={()=>e(!1)}variant="secondary"className="w-full mt-2">Cancel</Button>}</div>}</Card></div>};
const PortalLayout = ({ user, onLogout, children, activePage, setActivePage }) => { const t=(t,e,o)=><button onClick={()=>setActivePage(t)}className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg transition-colors ${activePage===t?"bg-pink-500 text-white":"hover:bg-gray-200"}`}><i className={`fas ${o} w-6 text-center`}></i><span className="font-semibold">{e}</span></button>;return<div className="flex min-h-screen bg-gray-100"><aside className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col"><div className="p-6 text-center border-b"><h1 className="text-2xl font-extrabold"><GradientText>Portal</GradientText></h1></div><nav className="flex-grow p-4"><ul className="space-y-2"><li>{t("dashboard","Dashboard","fa-tachometer-alt")}</li><li>{t("bookings","Bookings","fa-calendar-check")}</li><li>{t("newBooking","New Booking","fa-plus-circle")}</li><li>{t("billing","Billing","fa-credit-card")}</li><li>{t("account","Account","fa-user-circle")}</li></ul></nav><div className="p-4 border-t"><div className="text-center mb-4"><p className="font-bold">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></div><Button onClick={onLogout}className="w-full"variant="secondary"><i className="fas fa-sign-out-alt mr-2"></i>Logout</Button></div></aside><main className="flex-grow p-8">{children}</main></div>};

// --- App Component ---
function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isBookingSuccessModalOpen, setBookingSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (doc) => { setUserData({ id: doc.id, ...doc.data() }); });
      const bookingsQuery = query(collection(db, 'users', user.uid, 'bookings'), orderBy('createdAt', 'desc'));
      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => { setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
      const itemsQuery = query(collection(db, 'rentalItems'));
      const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => { setRentalItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
      const couponsQuery = query(collection(db, 'coupons'));
      const unsubscribeCoupons = onSnapshot(couponsQuery, (snapshot) => { setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); });
      return () => { unsubscribeUser(); unsubscribeBookings(); unsubscribeItems(); unsubscribeCoupons(); };
    }
  }, [user]);

  const handleLogout = async () => { await signOut(auth); };
  const handleUpdateUser = async (updatedData) => { if (!user) return; await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true }); };
  const handleNewBooking = async (newBookingData) => { if (!user) return; await addDoc(collection(db, 'users', user.uid, 'bookings'), newBookingData); setBookingSuccessModalOpen(true); };
  const handleUpdatePaymentMethod = async (paymentMethod) => { if (!user) return; const userDocRef = doc(db, 'users', user.uid); await setDoc(userDocRef, { paymentMethod }, { merge: true }); };
  const closeSuccessModal = () => { setBookingSuccessModalOpen(false); setActivePage('bookings'); };

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginScreen />;
  if (!userData) return <LoadingSpinner />;

  const renderPage = () => {
      switch(activePage) {
          case 'dashboard': return <Dashboard user={userData} bookings={bookings} setActivePage={setActivePage} openContactModal={() => setContactModalOpen(true)} />;
          case 'bookings': return <Bookings bookings={bookings} />;
          case 'newBooking': return <NewBooking onBookingSubmit={handleNewBooking} rentalItems={rentalItems} coupons={coupons} />;
          case 'billing': return <Billing user={userData} onUpdatePaymentMethod={handleUpdatePaymentMethod} />;
          case 'account': return <Account user={userData} onUpdateUser={handleUpdateUser} />;
          default: return <Dashboard user={userData} bookings={bookings} setActivePage={setActivePage} openContactModal={() => setContactModalOpen(true)} />;
      }
  };

  return (
    <Elements stripe={stripePromise}>
        <PortalLayout user={userData} onLogout={handleLogout} activePage={activePage} setActivePage={setActivePage}>
            {renderPage()}
        </PortalLayout>
        <Modal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} title="Contact Support"><div className="space-y-4"><p>If you need help with a booking or have any questions, please reach out to us!</p><p><strong className="font-semibold">Phone:</strong> <a href="tel:956-655-9850" className="text-pink-500 hover:underline">(956) 655-9850</a></p><p><strong className="font-semibold">Email:</strong> <a href="mailto:genderrevealsrus@gmail.com" className="text-pink-500 hover:underline">genderrevealsrus@gmail.com</a></p><div className="pt-4"><Button onClick={() => setContactModalOpen(false)} className="w-full">Close</Button></div></div></Modal>
        <Modal isOpen={isBookingSuccessModalOpen} onClose={closeSuccessModal} title="Request Submitted!"><div className="space-y-4 text-center"><p className="text-lg">Your booking request has been sent successfully!</p><p className="text-gray-600">It is now pending approval. You will be notified once the admin confirms your booking. You will not be charged until the booking is approved.</p><div className="pt-4"><Button onClick={closeSuccessModal} className="w-full">View My Bookings</Button></div></div></Modal>
    </Elements>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
