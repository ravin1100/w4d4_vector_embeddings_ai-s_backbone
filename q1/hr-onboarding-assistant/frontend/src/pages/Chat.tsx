import { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../utils/api';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askQuestion(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.data.answer,
        citations: response.data.citations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chat Panel */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center px-6">
              <h1 className="text-2xl font-semibold text-white">HR Assistant</h1>
            </div>
            
            <div className="flex flex-col h-[calc(100vh-16rem)]">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-lg">👋 Hi! How can I help you today?</p>
                    <p className="text-sm mt-2">Ask me anything about HR policies and procedures.</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                        message.type === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                      {message.citations && (
                        <div className="mt-3 border-t border-gray-200 pt-2">
                          <p className="text-xs font-semibold mb-1">Sources:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {message.citations.map((citation, index) => (
                              <li key={index} className="text-xs">{citation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="flex gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm md:text-base focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-colors"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      loading || !input.trim()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                    }`}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Features Panel */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Instant Answers</h3>
                  <p className="text-sm text-gray-500">Get immediate responses to your HR-related questions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Source Citations</h3>
                  <p className="text-sm text-gray-500">All answers are backed by official HR documentation</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Real-time Updates</h3>
                  <p className="text-sm text-gray-500">Always get the latest HR policy information</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-2">Pro Tip</h3>
              <p className="text-sm text-gray-500">
                Ask specific questions to get more accurate answers. For example, instead of "vacation policy", try "What's the annual leave policy for new employees?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 