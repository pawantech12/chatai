import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { IoSend } from "react-icons/io5";
import { TbPlayerStopFilled } from "react-icons/tb";
const Chatai = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendPrompt();
    }
  };

  const handleSendPrompt = async () => {
    if (!inputValue.trim()) return; // Avoid empty prompts

    const newMessage = {
      user: "You",
      text: inputValue,
      date: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue(""); // Clear input field

    if (!currentSessionId) {
      const sessionId = new Date().toISOString();
      const sessionTitle = newMessage.text || "New Chat";
      setCurrentSessionId(sessionId);
      setSearchHistory((prev) => [
        ...prev,
        { id: sessionId, title: sessionTitle, messages: [newMessage] },
      ]);
    } else {
      setSearchHistory((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, newMessage] }
            : session
        )
      );
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputValue }),
      });

      const data = await response.json();

      const responseMessage = {
        user: "Gemini",
        text:
          data.response?.candidates[0]?.content?.parts[0]?.text ||
          "No response",
        date: new Date(),
        isAnimating: true,
      };

      let i = 0;
      const responseText = responseMessage.text;
      setMessages((prev) => [...prev, { ...responseMessage, text: "" }]);

      const intervalId = setInterval(() => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex].text = responseText.substring(
            0,
            i + 1
          );

          if (i === responseText.length - 1) {
            updatedMessages[lastMessageIndex].isAnimating = false;
          }

          return updatedMessages;
        });

        i++;
        if (i >= responseText.length) {
          clearInterval(intervalId);
        }
      }, 5);

      setSearchHistory((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, responseMessage] }
            : session
        )
      );
    } catch (error) {
      console.error("Error calling backend API:", error);

      const errorMessage = {
        user: "Gemini",
        text: "Sorry, something went wrong!",
        date: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSearchHistory((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
    } finally {
      setLoading(false);
    }
  };
  const handleEditSendPrompt = async (prompt, editingIndex) => {
    if (!prompt.trim()) return; // Avoid empty prompts

    const newMessage = {
      user: "You",
      text: prompt,
      date: new Date(),
    };

    // Remove previous response if editing a message
    if (editingIndex !== null) {
      const updatedMessages = [...messages];
      updatedMessages[editingIndex] = newMessage;
      setMessages(updatedMessages);
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }

    if (!currentSessionId) {
      const sessionId = new Date().toISOString();
      const sessionTitle = prompt || "New Chat";
      setCurrentSessionId(sessionId);
      setSearchHistory((prev) => [
        ...prev,
        { id: sessionId, title: sessionTitle, messages: [newMessage] },
      ]);
    } else {
      setSearchHistory((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                title:
                  editingIndex === 0
                    ? prompt // Update title if the first message is edited
                    : session.title,
                messages:
                  editingIndex !== null
                    ? session.messages.map((msg, index) =>
                        index === editingIndex ? newMessage : msg
                      )
                    : [...session.messages, newMessage],
              }
            : session
        )
      );
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      const responseMessage = {
        user: "Gemini",
        text:
          data.response?.candidates[0]?.content?.parts[0]?.text ||
          "No response",
        date: new Date(),
        isAnimating: true,
      };

      let i = 0;
      const responseText = responseMessage.text;
      setMessages((prev) => {
        // Remove the previous response before appending the new one
        const filteredMessages = prev.filter((msg) => msg.user !== "Gemini");
        return [...filteredMessages, { ...responseMessage, text: "" }];
      });

      const intervalId = setInterval(() => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex].text = responseText.substring(
            0,
            i + 1
          );

          if (i === responseText.length - 1) {
            updatedMessages[lastMessageIndex].isAnimating = false; // Animation complete
          }

          return updatedMessages;
        });

        i++;
        if (i >= responseText.length) {
          clearInterval(intervalId);
        }
      }, 5);

      setSearchHistory((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, responseMessage] }
            : session
        )
      );
    } catch (error) {
      console.error("Error calling backend API:", error);

      const errorMessage = {
        user: "Gemini",
        text: "Sorry, something went wrong!",
        date: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSearchHistory((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, errorMessage] }
            : session
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateResponse = async (index) => {
    const message = messages[index - 1];

    // Check if the message is a user message (i.e., the typed input, not the generated response)
    if (message.user === "You") {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: message.text }), // Use the user's original input (not the generated response)
        });

        const data = await response.json();
        const responseMessage = {
          user: "Gemini",
          text:
            data.response?.candidates[0]?.content?.parts[0]?.text ||
            "No response",
          date: new Date(),
          isAnimating: true,
        };

        let i = 0;
        const responseText = responseMessage.text;
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[index] = { ...responseMessage, text: "" }; // Clear previous text before animation

          const intervalId = setInterval(() => {
            setMessages((prev) => {
              const updatedMessages = [...prev];
              updatedMessages[index].text = responseText.substring(0, i + 1);

              if (i === responseText.length - 1) {
                updatedMessages[index].isAnimating = false;
              }

              return updatedMessages;
            });

            i++;
            if (i >= responseText.length) {
              clearInterval(intervalId);
            }
          }, 5);

          return updatedMessages;
        });
      } catch (error) {
        console.error("Error regenerating response:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  const handleSessionClick = (sessionId) => {
    const selectedSession = searchHistory.find(
      (session) => session.id === sessionId
    );
    if (selectedSession) {
      setMessages(selectedSession.messages);
      setCurrentSessionId(sessionId);
    }
  };

  const handleRenameSession = (sessionId, newTitle) => {
    setSearchHistory((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, title: newTitle } : session
      )
    );
  };
  return (
    <>
      <div className="flex h-screen">
        <Sidebar
          searchHistory={searchHistory}
          onSessionClick={handleSessionClick}
          onRenameSession={handleRenameSession}
          onNewChat={handleNewChat}
        />
        <div className="flex flex-col flex-grow w-3/4">
          <ChatBox
            messages={messages}
            loading={loading}
            onRegenerate={handleRegenerateResponse}
            onSendPrompt={handleEditSendPrompt}
          />
          <div className="p-3 shadow-[0px_0px_4px_0px_#00000040]">
            <div className="flex border border-gray-200 rounded-lg h-14 px-3 items-center bg-gray-100">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask me something..."
                className="outline-none w-full bg-transparent h-full"
              />
              <button
                onClick={handleSendPrompt}
                disabled={messages[messages.length - 1]?.isAnimating}
                className={`bg-neutral-800 px-3 py-2 rounded-md h-fit`}
              >
                {messages[messages.length - 1]?.isAnimating ? (
                  <TbPlayerStopFilled className="w-5 h-5 text-white" />
                ) : (
                  <IoSend className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatai;
