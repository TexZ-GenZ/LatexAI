import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 mb-24">
      {messages.map((msg, index) => (
        <div key={index} className="space-y-4 animate-fadeIn">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300">{msg.question}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg relative group">
            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
              {msg.solution}
            </pre>
            <button
              onClick={() => copyToClipboard(msg.solution, index)}
              className="absolute top-2 right-2 p-2 bg-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-500"
              title="Copy to clipboard"
            >
              {copiedId === index ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}