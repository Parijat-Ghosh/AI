import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import hljs from 'highlight.js/lib/core';
// Import only the languages you need for smaller bundle
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('html', html);
hljs.registerLanguage('xml', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('c#', csharp);

function MessageBubble({ message }) {
  const [previewImage, setPreviewImage] = useState(null);
  const isUser = message.role === "user";
  const hasImages = message.images && message.images.length > 0;

  const openImagePreview = (imageSrc) => {
    setPreviewImage(imageSrc);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  // Custom component for code blocks with direct highlight.js integration
  const CodeBlock = ({ children, className }) => {
    const codeRef = React.useRef(null);
    
    useEffect(() => {
      if (codeRef.current) {
        const code = codeRef.current;
        const text = code.textContent || code.innerText || '';
        
        // Extract language from className (format: language-xxx)
        const match = className ? className.match(/language-(\w+)/) : null;
        const language = match ? match[1] : null;
        
        if (language && hljs.getLanguage(language)) {
          // Highlight with specific language
          const result = hljs.highlight(text, { language });
          code.innerHTML = result.value;
          code.classList.add('hljs');
        } else {
          // Auto-detect language
          const result = hljs.highlightAuto(text);
          code.innerHTML = result.value;
          code.classList.add('hljs');
        }
      }
    }, [children, className]);

    return (
      <code ref={codeRef} className={className}>
        {children}
      </code>
    );
  };

  const userContent = (
    <div className="flex justify-end mb-4">
      <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-purple-700 text-white">
        {/* Images */}
        {hasImages && (
          <div className="mb-3">
            <div className="grid grid-cols-2 gap-2">
              {message.images.map((img, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer rounded-lg overflow-hidden"
                  onClick={() => openImagePreview(img.url || img.preview)}
                >
                  <img
                    src={img.url || img.preview}
                    alt={`Image ${index + 1}`}
                    className="w-full h-32 object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-sm">Click to view</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text */}
        {message.text && (
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        )}

        {/* Timestamp */}
        <p className="text-xs mt-2 opacity-70">
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  const botContent = (
    <div className="mb-6 w-full">
      {/* Images */}
      {hasImages && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {message.images.map((img, index) => (
              <div
                key={index}
                className="relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => openImagePreview(img.url || img.preview)}
              >
                <img
                  src={img.url || img.preview}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-sm">Click to view</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text - Full width with markdown support */}
      {message.text && (
        <div className="text-white/90 leading-relaxed">
          <div className="max-w-none markdown-content">
            <ReactMarkdown 
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return (
                      <code className="bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                },
                pre: ({ node, children, ...props }) => (
                  <pre className="hljs-pre rounded-lg overflow-x-auto my-4 p-4 bg-[#0d1117] border border-gray-700" {...props}>
                    {children}
                  </pre>
                ),
                // Style other markdown elements for dark theme
                h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-white/90 mb-3">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside text-white/90 mb-3 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-white/90 mb-3 ml-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-500 pl-4 italic text-white/80 mb-3">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic text-white/90">{children}</em>,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs mt-3 opacity-50 text-white/60">
        {new Date(message.createdAt).toLocaleTimeString()}
      </p>
    </div>
  );

  return (
    <>
      {isUser ? userContent : botContent}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeImagePreview}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImagePreview}
              className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Ensure highlight.js styles work properly */}
      <style jsx global>{`
        .hljs-pre {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace !important;
        }

        .hljs {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.45 !important;
        }
      `}</style>
    </>
  );
}

export default MessageBubble;