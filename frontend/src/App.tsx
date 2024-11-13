import { useState } from 'react';
// import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import Input from './components/Input';
import { Message } from './types';
import { Analytics } from "@vercel/analytics/react";

const API_URL = 'https://server-gilt-five-10.vercel.app';
// const API_URL = 'http://localhost:3000';


function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const generateSolution = async () => {
  if (!input.trim() || isLoading) return;

  setIsLoading(true);
  let currentSolution = '';

  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: input }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader?.read() || {};
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      currentSolution += chunk;  // Accumulate chunks into currentSolution

      setMessages((prevMessages) => {
        const newMessage = {
          question: input,
          solution: currentSolution,
          timestamp: new Date().toISOString(),
        };
        // Replace the message or add the new one.
        return [...prevMessages.filter(msg => msg.question !== input), newMessage];
      });
    }
  } catch (error) {
    console.error('Error generating solution:', error);
  } finally {
    setIsLoading(false);
  }
};


  const handleSelectMessage = (message: Message) => {
    setInput(message.question);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        messages={messages}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectMessage={handleSelectMessage}
      />
      <main className="max-w-4xl mx-auto p-4 pt-6 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-24">
          <MessageList messages={messages} />
        </div>
        <Input
          value={input}
          onChange={setInput}
          onSubmit={generateSolution}
          isLoading={isLoading}
        />
      </main>
      <Analytics />
    </div>
  );
}

export default App;
