import React, { useState, useRef, useEffect } from "react";

export default function ChatScreen({
  tutorName = "Amara Bekele",
  onBack,
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "them",
      text: "Hi! Looking forward to our upcoming session on Wednesday.",
      time: "2:15 PM",
    },
    {
      id: 2,
      sender: "me",
      text: "Great, thank you! Should I prepare any specific materials?",
      time: "2:16 PM",
    },
    {
      id: 3,
      sender: "them",
      text: "Just bring your last physics test and notes, we'll go through the tricky questions together step-by-step.",
      time: "2:18 PM",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: inputVal.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");

    // Simulate friendly tutor reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "them",
          text: "Got it! See you soon. Feel free to send over any practice problems beforehand.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200);
  };

  return (
    <div className="tm-screen flex flex-col justify-between !pb-2 h-[calc(100%-60px)]" id="s-chat">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="tm-backbar mb-2 border-b border-tm-border/60 pb-2">
          <i className="ti ti-arrow-left" onClick={onBack} title="Back" />
          <div className="flex items-center gap-2">
            <div className="tm-avatar !bg-tm-coral w-7 h-7 text-xs">
              {tutorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </div>
            <span className="text-sm font-semibold text-tm-navy">{tutorName}</span>
          </div>
          <span className="tm-badge tm-badge-green ml-auto text-[10px]">Online</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-2.5 max-h-[420px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`tm-msg-bubble shadow-2xs ${
                m.sender === "me" ? "tm-msg-me" : "tm-msg-them"
              }`}
            >
              <div>{m.text}</div>
              <div
                className={`text-[9px] mt-1 text-right ${
                  m.sender === "me" ? "text-white/80" : "text-tm-muted"
                }`}
              >
                {m.time}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-tm-border mt-auto">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-white border border-tm-border rounded-full text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue transition-colors shadow-2xs"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-tm-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-tm-blue/90 active:scale-95 transition-all"
          title="Send message"
        >
          <i className="ti ti-send text-sm" />
        </button>
      </form>
    </div>
  );
}
