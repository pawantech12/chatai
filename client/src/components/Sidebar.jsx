import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { IoMdSave } from "react-icons/io";

const Sidebar = ({
  searchHistory,
  onSessionClick,
  onRenameSession,
  onNewChat,
}) => {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRename = (sessionId) => {
    onRenameSession(sessionId, newTitle);
    setEditingSessionId(null);
    setNewTitle("");
  };

  return (
    <div className="w-1/5 bg-gray-100  p-4 border-r border-gray-200 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <figure className="w-10 h-10">
          <img
            src="/logo.png"
            alt="logo"
            className="object-cover w-full h-full rounded-full"
          />
        </figure>
        <h2 className="text-xl text-neutral-700 font-semibold ">ChatAI</h2>
      </div>
      <button
        onClick={onNewChat}
        className="w-full mb-4 px-2 py-3 bg-neutral-700 text-white text-lg font-medium hover:bg-neutral-800  rounded-md flex gap-2 items-center justify-center"
      >
        <FaPlus />
        New Chat
      </button>
      <div className="space-y-4">
        {searchHistory.length > 0 ? (
          searchHistory.map((session) => (
            <div key={session.id} className="">
              {editingSessionId === session.id ? (
                <div className="flex items-center border border-gray-200 py-2 px-3 rounded-md bg-white">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-sm bg-transparent text-black rounded-md outline-none "
                  />
                  <button
                    onClick={() => handleRename(session.id)}
                    className="p-2 rounded-md bg-neutral-700 text-white"
                  >
                    <IoMdSave className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between bg-gray-200 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-300"
                  onClick={() => onSessionClick(session.id)}
                >
                  <div className="flex-grow">
                    <p className="text-sm">{session.title}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionId(session.id);
                      setNewTitle(session.title);
                    }}
                    className="p-2 rounded-md bg-neutral-700 text-white"
                  >
                    <MdEdit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No history yet!</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
