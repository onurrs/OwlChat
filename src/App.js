import React, { useRef, useState } from 'react';
import './App.css';

// Import Firebase v9+ modular SDK
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwB05fkt-QG77Yz6wlvo9ujuw2V0J6c2I",
  authDomain: "owlchat-859fd.firebaseapp.com",
  projectId: "owlchat-859fd",
  storageBucket: "owlchat-859fd.firebasestorage.app",
  messagingSenderId: "259687236303",
  appId: "1:259687236303:web:98774c76b7526b84e0edba",
  measurementId: "G-N72K4WGVQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>İNTİHAL PC (Yedek)</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Google ile giriş yap</button>
    </>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => signOut(auth)}>Oturumu Kapat</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Mesajınızı yazın..." />
        <button type="submit" disabled={!formValue}>Uçur</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  );
}

export default App;
