import React, { useState } from "react";

const PromptInput = ({ onSendPrompt }) => {
  const [prompt, setPrompt] = useState("");

  const handleSend = () => {
    if (prompt.trim()) {
      onSendPrompt(prompt);
      setPrompt("");
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 flex">
      <input
        type="text"
        className="flex-grow p-2 border rounded-lg mr-2 focus:outline-none"
        placeholder="Ask ChatGPT anything..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
};

export default PromptInput;
