import React, { useState, useEffect, useRef } from 'react';
import { Code2, Sparkles, Loader2, FileCode, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const CodeReviewer = () => {
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  // Prism.js syntax highlighting loader
  useEffect(() => {
    const loadPrism = async () => {
      if (window.Prism) return;

      // Load Prism CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
      document.head.appendChild(link);

      // Load Prism core
      const coreScript = document.createElement('script');
      coreScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      coreScript.onload = () => {
        if (window.Prism) {
          window.Prism.manual = true;
          const languages = ['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'typescript'];
          let loadedCount = 0;

          languages.forEach(lang => {
            const langScript = document.createElement('script');
            langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
            langScript.onload = () => {
              loadedCount++;
              if (loadedCount === languages.length && code) {
                highlightCode();
              }
            };
            document.head.appendChild(langScript);
          });
        }
      };
      document.head.appendChild(coreScript);
    };

    loadPrism();
  }, []);

  // Highlight code when code or language changes
  useEffect(() => {
    const highlightCode = () => {
      if (
        window.Prism &&
        window.Prism.languages &&
        window.Prism.languages[language] &&
        code
      ) {
        try {
          const grammar = window.Prism.languages[language];
          const highlighted = window.Prism.highlight(code, grammar, language);
          setHighlightedCode(highlighted);
        } catch {
          setHighlightedCode(code);
        }
      } else {
        setHighlightedCode(code);
      }
    };

    const timeoutId = setTimeout(highlightCode, 100);
    return () => clearTimeout(timeoutId);
  }, [code, language]);

  // Sync scroll between textarea and pre
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Call your API to review code
  const handleReviewCode = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code });
      setReview(response.data);
    } catch (error) {
      setReview('Error occurred while reviewing the code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 shadow-2xl">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent truncate">
                Code Reviewer
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">AI-powered code analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-gray-700/50 rounded-full">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-gray-300">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Code Input */}
        <div className="flex flex-col bg-gray-900/50 border-r border-gray-700/50 flex-1 min-h-0">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/30 border-b border-gray-700/30 flex-shrink-0">
            <div className="flex items-center gap-2 text-gray-300 min-w-0">
              <FileCode className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">Code Input</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 sm:px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-xs sm:text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-shrink-0"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 relative overflow-hidden min-h-0">
              {/* Code editor container */}
              <div className="absolute inset-0 flex flex-col">
                <pre
                  ref={preRef}
                  className="absolute inset-0 p-4 sm:p-6 lg:p-8 font-mono text-sm sm:text-base leading-relaxed sm:leading-loose pointer-events-none overflow-auto"
                  style={{
                    color: 'transparent',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    tabSize: '4',
                  }}
                >
                  <code
                    className={`language-${language}`}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </pre>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleScroll}
                  placeholder={`Enter your ${language} code here...

// Example:
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));`}
                  className="absolute inset-0 w-full h-full p-4 sm:p-6 lg:p-8 bg-transparent text-transparent caret-cyan-400 font-mono text-sm sm:text-base leading-relaxed sm:leading-loose resize-none outline-none overflow-auto placeholder-gray-500"
                  spellCheck={false}
                />
              </div>

              {/* Review Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8 border-t border-gray-700/30 bg-gradient-to-t from-gray-900/90 to-transparent backdrop-blur-sm">
                <button
                  onClick={handleReviewCode}
                  disabled={!code.trim() || isLoading}
                  className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-sm sm:text-base lg:text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="hidden xs:inline">Reviewing Code...</span>
                      <span className="xs:hidden">Reviewing...</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">Review My Code</span>
                      <span className="xs:hidden">Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Review Output */}
        <div className="flex flex-col bg-gray-900/30 flex-1 min-h-0">
          <div className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/30 border-b border-gray-700/30 text-gray-300 flex-shrink-0">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">Code Review</span>
          </div>

          <div className="flex-1 overflow-auto min-h-0 p-4 sm:p-6 lg:p-8">
            {review ? (
              <div className="prose prose-invert prose-blue max-w-none text-sm sm:text-base leading-relaxed">
                <ReactMarkdown>{review}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 p-4">
                <div className="text-center max-w-sm">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 opacity-50" />
                  <p className="text-lg sm:text-xl mb-2 sm:mb-3">No review yet</p>
                  <p className="text-sm sm:text-base mb-4 sm:mb-6">
                    Enter your code and click "Review My Code" to get started
                  </p>
                  <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                    <p>✨ AI-powered code analysis</p>
                    <p>🔍 Best practices suggestions</p>
                    <p>🚀 Performance improvements</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeReviewer;
