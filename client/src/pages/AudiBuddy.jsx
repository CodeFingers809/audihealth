import React, { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white mr-2">
          AB
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "order-1" : "order-2"}`}>
        <div className="flex flex-col">
          <div
            className={`p-3 rounded-lg ${
              isUser ? "bg-pink-500 text-white" : "bg-pink-50"
            }`}
          >
            <ReactMarkdown className={`markdown ${isUser ? "text-white" : "text-gray-900"}`}>
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{message.timestamp}</span>
            {message.status && <span className="text-xs text-pink-500">✓</span>}
          </div>
        </div>
      </div>
      {isUser && <div className="w-8 h-8 rounded-full bg-gray-200 ml-2" />}
    </div>
  );
};

const AudiBuddy = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = {
        type: "text",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: true,
      };
  
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
  
      try {
        const response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: inputValue }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        const botMessage = {
          type: "text",
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: false,
        };
  
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = {
          type: "text",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full mx-auto">
      <div className="flex items-center justify-between p-4 border-b border-pink-100">
        <div className="flex items-center gap-4">
          <Mic className="w-6 h-6 text-pink-500" />
          <h1 className="text-xl font-bold text-gray-900">AudiBuddy</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} isUser={index % 2 === 0} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-pink-100 p-4">
        <div className="flex items-center gap-2 bg-pink-50 rounded-lg p-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your voice health..."
            className="flex-1 bg-transparent outline-none placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className={`p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudiBuddy;