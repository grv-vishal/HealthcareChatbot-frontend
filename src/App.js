import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { RiSearch2Fill } from "react-icons/ri";
import img from '../src/assets/doctor.png'

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const initialResponse="Hello, Welcome to AI-based Healthcare Chatbot. Please Ask Your Query related to Your Health Problems."
  const [messages, setMessages] = useState([{role: 'bot', text: initialResponse}]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    const newMessage = { role: 'user', text: query };
    setMessages((prev) => [...prev, newMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      setMessages((prev) => [...prev, { role: 'bot', text: '' }]);
      await typeBotResponse(data.error ? `Error: ${data.error}` : data.response);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Something went wrong while contacting the chatbot.' }]);
    }

    setLoading(false);
  };

  const typeBotResponse = (text) => {
    return new Promise((resolve) => {
      let index = 0;
      const typingSpeed = 25; // ms per character
  
      const interval = setInterval(() => {
        if (index >= text.length) {
          clearInterval(interval);
          resolve();
          return;
        }
  
        const char = text[index] ?? ''; // avoid undefined
  
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'bot') {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              text: last.text + char,
            };
            return updated;
          } else {
            return [...prev, { role: 'bot', text: char }];
          }
        });
  
        index++;
      }, typingSpeed);
    });
  };
  //typeBotResponse(initialResponse);



  const invalid=query==="";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg flex flex-col h-[85vh]">
        <div className="bg-slate-700 text-white text-2xl font-bold p-4 rounded-t-lg flex justify-start items-center gap-x-3">
          <div className='relative'>
            <img src={img} alt="doctor"  className='rounded-full max-w-[70px] max-w-h-[70px]' />
            <div className='h-3 w-3 rounded-full bg-green-400 absolute bottom-1 right-1 border-white border'></div>
          </div>
          
          <div>Healthcare Chatbot</div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 w-full flex flex-col">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-slate-700 text-white rounded-br-none'
                    : 'bg-gray-200 text-black rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-4 p-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuerySubmit();
              }
            }}
            placeholder="Type your query here...."
            rows={2}
            className="flex-1 p-3 border leading-4 border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
          <button
            onClick={handleQuerySubmit}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={loading || invalid}
          >
            {loading ? 
             <RiSearch2Fill className='text-3xl' /> :
             <IoMdSend className='text-2xl' />
             }
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
