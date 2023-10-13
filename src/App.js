import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyANi6jm1em0TW_3cIzaw8dStebKFi9Q5wc",
  authDomain: "praytgt.firebaseapp.com",
  projectId: "praytgt",
  storageBucket: "praytgt.appspot.com",
  messagingSenderId: "691132041579",
  appId: "1:691132041579:web:2a48aa29b5e8912e17242e",
  measurementId: "G-PSGR1KKEPR"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  useEffect(() => {
    const signInAnonymously = async () => {
      try {
        await auth.signInAnonymously();
      } catch (error) {
        console.error(error);
      }
    };

    // Check if there's no signed-in user (user is null)
    if (!user) {
      signInAnonymously();
    }
  }, [user]);

  return (
    <div className="App">
      <header>
        <h1>Cầu nguyện</h1>
      </header>

      <section>
        {user && <ChatRoom />}
      </section>

    </div>
  );
}


function ChatRoom() {
  const dummy = useRef();
  const messageContainerRef = useRef(); // Reference for the message container

  const messagesRef = firestore.collection('messages');
  const [initialLoadCount, setInitialLoadCount] = useState(25);

  const query = messagesRef.orderBy('createdAt', 'desc').limit(initialLoadCount);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [userName, setUserName] = useState('');
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0); // Store scroll position

  useEffect(() => {
    if (messages && messages.length > 0) {
      // Preserve the scroll position when loading messages
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight - scrollPosition;
    }
  }, [messages, scrollPosition]);
  
  const loadMoreMessages = () => {
    setScrollPosition(
      messageContainerRef.current.scrollHeight -
        messageContainerRef.current.scrollTop
    );
    setInitialLoadCount(initialLoadCount + 10);
  };

  useEffect(() => {
    // Scroll to the preserved position after loading more messages
    messageContainerRef.current.scrollTop = scrollPosition;
  }, [scrollPosition]);
  

  useEffect(() => {
    // Calculate the total number of messages in Firestore
    messagesRef.get().then((querySnapshot) => {
      setTotalMessageCount(querySnapshot.size);
    });
  }, []);
  
  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      userName
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>

    <main ref={messageContainerRef}>
    {initialLoadCount < totalMessageCount && (
        <button onClick={loadMoreMessages}>Load More Messages</button>
      )}      {messages && messages.slice(-initialLoadCount).reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>
    <form onSubmit={sendMessage}>
    <input className="username-input" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Tên của bạn" /> {/* Input field for the user's name */}
    <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Lời cầu nguyện" />
        <button type="submit" disabled={!formValue || !userName}>🙏</button> {/* Ensure both message and name are provided */}
    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, userName } = props.message;

  return (<>
    <div className="message">
    <p className="username">{userName}</p> {/* Display the username here */}
      <p>{text}</p>
    </div>
  </>)
}


export default App;
