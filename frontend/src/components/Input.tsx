import { Send } from 'lucide-react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function Input({ value, onChange, onSubmit, isLoading }: InputProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-900/90 p-4 border-t border-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your question here..."
            className="w-full bg-gray-800 text-gray-100 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border border-gray-700"
            rows={3}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
              isLoading || !value.trim()
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to submit, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}