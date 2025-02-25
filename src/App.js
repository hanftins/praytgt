import React, { useRef, useState, useEffect } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import headerImage from './THDCHN.jpg';
import headerImage2 from './THDCHN2.jpg';


firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API,
  authDomain: "praytgt.firebaseapp.com",
  projectId: "praytgt",
  storageBucket: "praytgt.appspot.com",
  messagingSenderId: "691132041579",
  appId: "1:691132041579:web:2a48aa29b5e8912e17242e",
  measurementId: "G-PSGR1KKEPR"
})

const firestore = firebase.firestore();

function adjustHeaderHeight() {
  const header = document.querySelector('.App header');
  const headerText = document.querySelector('.HeaderText');
  if (header && headerText) {
    header.style.height = headerText.clientHeight + 'px';
  }
}

// Call the adjustHeaderHeight function when the window is resized
window.addEventListener('resize', adjustHeaderHeight);

function adjustMainHeight() {
  const main = document.querySelector('main');
  const header = document.querySelector('.App header');
  const formContainer = document.querySelector('.form-container');

  if (main && header && formContainer) {
    const windowHeight = window.innerHeight;
    const headerHeight = header.clientHeight;
    const formContainerHeight = formContainer.clientHeight;
    main.style.height = `${windowHeight - headerHeight - formContainerHeight - 21}px`;
  }
}

// Call the adjustMainHeight function when the window is resized
window.addEventListener('resize', adjustMainHeight);

function setMainMargin() {
  const main = document.querySelector('main');
  const header = document.querySelector('.App header');

  if (main && header) {
    const headerHeight = header.clientHeight;

    main.style.marginTop = `${headerHeight}px`;
  }
}

function App() {
  useEffect(() => {
    adjustHeaderHeight();
    adjustMainHeight();
    setMainMargin()
  });

  return (
    <div className="App">
      <header>
      <img src={headerImage2} alt="" class="imageStyle"/>
      <div class="HeaderText">
        <p class="line1">"Ở đâu có hai ba người hợp nhau nhân danh Thầy, thì Thầy sẽ ở giữa họ" (Mt. 18-20)</p>
        <p class="line2">THĐC CÙNG HỢP LỜI CẦU NGUYỆN CHO NHAU<br/>Xin Mẹ Đồng Công và Anh Quorum Primus chuyển cầu lên Thiên Chúa cho chúng con.</p>
      </div>
        <img src={headerImage} alt="" class="imageStyle"/>
      </header>

      <section>
        {<ChatRoom />}
      </section>

    </div>
  );
}


function ChatRoom() {
  const dummy = useRef();
  const messageContainerRef = useRef(); // Reference for the message container

  const messagesRef = firestore.collection('messages');
  const [initialLoadCount, setInitialLoadCount] = useState(25);
  const [messages, setMessages] = useState([]);

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
    setInitialLoadCount(initialLoadCount + 10); // Increase the limit
  };


  useEffect(() => {
    // Scroll to the preserved position after loading more messages
    messageContainerRef.current.scrollTop = scrollPosition;
  }, [scrollPosition]);
  
  useEffect(() => {
    // Fetch the new messages based on the updated limit
    const query = messagesRef
      .orderBy('createdAt', 'desc')
      .limit(initialLoadCount);

    // Use setMessages to update the messages with the new query result
    query.onSnapshot((snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(newMessages);
    });
  }, [initialLoadCount]);

  useEffect(() => {
    // Calculate the total number of messages in Firestore
    messagesRef.get().then((querySnapshot) => {
      setTotalMessageCount(querySnapshot.size);
    });
  });
  
  const sendMessage = async (e) => {
    e.preventDefault();

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userName
    })

    setFormValue('');
    // dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>

    <main ref={messageContainerRef}>
      {initialLoadCount < totalMessageCount && (
        <button className="load-more" onClick={loadMoreMessages}>
          Tải thêm
        </button>
      )}
        {messages && messages.slice(-initialLoadCount).reverse().map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>
    <form onSubmit={sendMessage} className="form-container">
    <div className="input-container">

    <input className="username-input" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Điền tên người cầu nguyện" /> {/* Input field for the user's name */}
    <textarea
    className="message-input"
  value={formValue}
  onChange={(e) => {
    setFormValue(e.target.value);
  }}
  placeholder="Điền nội dung lời cầu nguyện"
  rows={1}
/>
</div>

        <button type="submit" disabled={!formValue || !userName}>🙏</button> {/* Ensure both message and name are provided */}
    </form>
  </>)
}


function ChatMessage(props) {
  const { text, userName, createdAt  } = props.message;
  const formattedText = text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </React.Fragment>
  ));
  const messageDate = createdAt ? createdAt.toDate() : null;
  const formattedMessageDate = messageDate
  ? messageDate.toLocaleDateString('vi-VN')
  : null;
  return (<>
   <div className="message">
      <p className="username">{userName}</p>
      <p>{formattedText}</p>
      <p className="message-date">{formattedMessageDate}</p> {/* Display the message date */}
    </div>
  </>)
}


export default App;
