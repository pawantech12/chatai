import React, { useState, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
// import rehypeRaw from "rehype-raw";
// import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";

const ChatBox = ({ messages, loading, onRegenerate }) => {
  const [processedMessages, setProcessedMessages] = useState([]);

  useEffect(() => {
    const processMessages = async () => {
      const promises = messages.map(async (message) => {
        try {
          const file = await unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypePrettyCode, {
              theme: "one-dark-pro",
              transformers: [
                transformerCopyButton({
                  visibility: "always",
                  feedbackDuration: 3_000,
                }),
              ],
            })
            .use(rehypeStringify);

          const htmlContent = (await file.process(message.text)).toString();
          return { ...message, htmlContent };
        } catch (error) {
          console.error("Error processing message:", error);
          return { ...message, htmlContent: message.text };
        }
      });

      const processed = await Promise.all(promises);
      setProcessedMessages(processed);
    };

    processMessages();
  }, [messages]);

  return (
    <div className="max-w-full p-6 overflow-y-auto bg-gray-50 h-full flex flex-col gap-4">
      {processedMessages.length ? (
        processedMessages.map((message, index) => (
          <div
            key={index}
            className={`${message.user === "You" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block rounded-md px-4 py-1 text-sm ${
                message.user === "You"
                  ? "bg-gray-100 border border-gray-200 w-fit"
                  : "w-full max-w-[1000px]"
              }`}
            >
              {message.user === "You" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                  className="prose prose-lg w-full max-w-none"
                ></div>
              ) : (
                <div className="flex gap-2">
                  <figure className="w-8 h-8">
                    <img
                      src="/logo.png"
                      alt="ai logo"
                      className={`w-full h-full object-cover rounded-full ${
                        message.isAnimating ? "animate-spin" : ""
                      }`}
                    />
                  </figure>
                  <div
                    dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                    className="prose prose-lg w-[90%] max-w-none"
                  ></div>
                </div>
              )}
            </div>

            {message.user === "Gemini" && !loading && (
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
                onClick={() => onRegenerate(index)}
              >
                Regenerate
              </button>
            )}

            {loading && index === messages.length - 1 && (
              <div className="flex justify-center items-center mt-10">
                <figure className="w-12 h-12">
                  <img
                    src="/logo.png"
                    alt="ai logo"
                    className={`w-full h-full object-cover rounded-full ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                </figure>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center">
          No conversation yet. Send a prompt to start!
        </p>
      )}
    </div>
  );
};

export default ChatBox;
