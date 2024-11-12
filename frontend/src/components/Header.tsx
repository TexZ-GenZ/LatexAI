import React from 'react';
import { MessageSquare, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <div className="bg-gray-800 p-6 border-b border-gray-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            LaTeX Solution Generator
          </h1>
        </div>
      </div>
    </div>
  );
}