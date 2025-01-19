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
import { TbRefresh } from "react-icons/tb";
import { LuCopy } from "react-icons/lu";
import { MdEdit } from "react-icons/md";

const ChatBox = ({ messages, loading, onRegenerate, onSendPrompt }) => {
  const [processedMessages, setProcessedMessages] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null); // Track the message being edited
  const [inputValue, setInputValue] = useState("");
  const [tooltipText, setTooltipText] = useState(""); // State for tooltip text
  const [showTooltip, setShowTooltip] = useState(false); // State for showing/hiding tooltip

  const [showEditBtn, setShowEditBtn] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text); // Copy to clipboard
    setTooltipText("Text Copied!"); // Set tooltip text
    setShowTooltip(true); // Show tooltip

    // Hide tooltip after 2 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

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

  const handleEditPrompt = (index) => {
    console.log("editing message:", messages[index]);

    setEditingIndex(index); // Set the index of the message being edited
    setInputValue(messages[index].text); // Pre-fill the input field with the message text
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendPrompt();
    }
  };

  const handleSendPrompt = () => {
    if (inputValue.trim()) {
      onSendPrompt(inputValue, editingIndex); // Pass input and editingIndex to parent
      setInputValue(""); // Clear the input field
      setEditingIndex(null); // Reset editing mode
    }
  };

  return (
    <div className="max-w-full p-6 overflow-y-auto bg-gray-50 h-full flex flex-col gap-4">
      {processedMessages.length ? (
        processedMessages.map((message, index) => (
          <div
            key={index}
            className={`${message.user === "You" ? "text-right" : "text-left"}`}
            onMouseEnter={
              message.user === "You" ? () => setShowEditBtn(true) : undefined
            }
            onMouseLeave={
              message.user === "You" ? () => setShowEditBtn(false) : undefined
            }
          >
            <div
              className={`inline-block rounded-md px-4 py-1 text-sm ${
                message.user === "You"
                  ? "bg-gray-100 border border-gray-200 w-fit"
                  : "w-full max-w-[1000px]"
              }`}
            >
              {editingIndex === index ? (
                <div className="flex flex-col gap-2 py-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-2 outline-none text-lg bg-transparent rounded-md w-full"
                    placeholder="Edit your message..."
                  />
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => setEditingIndex(null)}
                      className=" bg-white border border-neutral-500 px-3 py-2  rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendPrompt}
                      className="bg-neutral-700 hover:bg-neutral-800 text-white px-3 py-2 rounded-md"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : message.user === "You" ? (
                <div className="relative">
                  <div
                    dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                    className="prose prose-lg w-full max-w-none"
                  ></div>
                  {showEditBtn && (
                    <button
                      className="p-2 absolute -top-[2px] rounded-md border border-gray-200 -left-[57px]"
                      onClick={() => handleEditPrompt(index)}
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
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
                  <div className="w-[90%] ">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: message.htmlContent,
                      }}
                      className="prose prose-lg max-w-none"
                    ></div>
                    {!loading && !message.isAnimating && (
                      <div className="flex items-center gap-2">
                        {/* Regenerate Button with Tooltip */}
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            setTooltipText("Regenerate");
                            setShowTooltip(true);
                          }}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          <button
                            className="mt-2 p-2 hover:bg-zinc-100 border border-gray-200 rounded-md"
                            onClick={() => onRegenerate(index)}
                          >
                            <TbRefresh className="w-4 h-4" />
                          </button>
                          {showTooltip && tooltipText === "Regenerate" && (
                            <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded">
                              {tooltipText}
                            </div>
                          )}
                        </div>

                        {/* Copy Button with Tooltip */}
                        <div
                          className="relative"
                          onMouseEnter={() => {
                            setTooltipText("Copy");
                            setShowTooltip(true);
                          }}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          <button
                            className="mt-2 p-2 hover:bg-zinc-100 border border-gray-200 rounded-md"
                            onClick={() => handleCopy(message.text)}
                          >
                            <LuCopy className="w-4 h-4" />
                          </button>
                          {showTooltip && tooltipText === "Copy" && (
                            <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded">
                              {tooltipText}
                            </div>
                          )}
                          {showTooltip && tooltipText === "Text Copied!" && (
                            <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded w-[90px] ">
                              {tooltipText}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
