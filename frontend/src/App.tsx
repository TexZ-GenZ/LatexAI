// App.tsx
import React, { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import Input from './components/Input';
import { Message } from './types';

const API_URL = 'http://localhost:3000';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const generateSolution = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post<Message>(`${API_URL}/generate`, { question: input });
      const newMessage = {
        question: input,
        solution: response.data.solution,
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput('');
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
    </div>
  );
}

export default App;
