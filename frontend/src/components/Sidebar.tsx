import React from 'react';
import { X } from 'lucide-react';
import { Message } from '../types';

interface SidebarProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMessage: (message: Message) => void;
}

export default function Sidebar({ messages, isOpen, onClose, onSelectMessage }: SidebarProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-gray-800 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-30 overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">History</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <button
                key={msg.id || index}
                onClick={() => onSelectMessage(msg)}
                className="w-full p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-left"
              >
                <p className="text-sm line-clamp-2">{msg.question}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(msg.timestamp)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}