import React, { useEffect, useState , useRef} from "react";
import { FaChevronUp } from "react-icons/fa";
import { AiFillWechat } from "react-icons/ai";
import { MdClear } from "react-icons/md"; 
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import useOutsideClose from "../../hooks/useOutsideClose";

const ChatBot = () => {
  const API_KEY = import.meta.env.VITE_API_KEY;

  if (!API_KEY) {
    console.error("API_KEY is missing in environment variables");
    return null;
  }

  const INTRO_WORDS = ["hi", "Hi", "hii", "hello", "hey", "namaste"];

  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, This is MediBot!!! Ask me anything!",
      sentTime: "just now",
      sender: "gemini-pro",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleScroll = () =>
      window.scrollY >= 100 ? setIsVisible(true) : setIsVisible(false);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSend = async (msg) => {
    if (!msg.trim()) return;
    const sanitizedMessage = msg.replace(/&nbsp;/g, "").trim();

    const newMessage = {
      message: sanitizedMessage,
      direction: "outgoing",
      sender: "user",
    };

    if (INTRO_WORDS.includes(sanitizedMessage.toLowerCase())) {
      setMessages((prevMessages) => [
        ...prevMessages,
        newMessage,
        {
          message: "Hello!! Welcome to Medicare!!!",
          sender: "gemini-pro",
        },
      ]);
      return;
    }

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      await processMessageToGemini(updatedMessages);
    } catch (error) {
      console.error("Error processing message:", error);
      setIsTyping(false);
    }
  };

  const processMessageToGemini = async (chatMessages) => {

    const systemMessage = {
      text : "You are MediBot, an AI-powered medical assistant. Your job is to provide medically accurate, context-aware, and professional responses to user queries while aligning with ethical and medical guidelines. Avoid off-topic responses."
    };

    const formattedMessages = [{
      parts: [
        { text: systemMessage.text }, // System message first
        ...chatMessages.map((message) => ({ text: message.message })), // User and bot messages
      ]
    }];
    
    const apiRequestBody = { contents: formattedMessages };

  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );
  
      // Log full response body for further debugging
      const responseData = await response.json();
      console.log('Full API Response:', responseData);
  
      if (!response.ok || !responseData || !responseData.candidates || !responseData.candidates[0]?.content?.parts) {
        console.error("API Error:", response.status, response.statusText);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: "Oopps !!! It's overload for today, Please try again later.",
            sender: "gemini-pro",
          },
        ]);
        setIsTyping(false);
        return;
      }
  
      const botResponse = responseData.candidates[0].content.parts[0].text;
  
      if (botResponse) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: botResponse,
            sender: "gemini-pro",
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            message: "I'm sorry, I couldn't generate a response. Please try again.",
            sender: "gemini-pro",
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: "An error occurred while connecting to the server. Please try again later.",
          sender: "gemini-pro",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const chatbotRef = useRef(null);
  useOutsideClose(chatbotRef, () => {
    if (open) {
      setOpen(false);
    }
  });
  

  return (
    <>
      {!open && (
        <div
          className={`fixed bottom-[13vh] mb-3 md:mb-0 right-[1.7vw] z-30 bg-blue-9 text-white-1 text-[1.4rem] p-2 cursor-pointer rounded-[3px] transform ${
            isVisible ? "scale-100 opacity-100 visible" : "scale-0 opacity-0 invisible"
          } transition-all duration-300 hover:bg-blue-8 max-lg:bottom-[11vh] max-lg:right-[2vw]`}
          title="Back to top"
          onClick={handleBackTop}
        >
          <FaChevronUp />
        </div>
      )}
      <div
        onClick={() => setOpen(!open)}
        className="fixed bottom-[5vh] right-[1.3vw] z-30 bg-blue-9 text-white-1 text-[2rem] p-2 cursor-pointer rounded-[50%] transition-all duration-300 hover:bg-blue-8"
        title="Wanna Chat?"
      >
        {open ? <MdClear /> : <AiFillWechat />}
      </div>
      <div
        ref={chatbotRef}
        className={`fixed right-[1.5vw] bg-white-1 z-40 border-[2px] border-blue-2 rounded-[10px] pt-4 transition-all duration-300 ease-in-out ${
          open
            ? "bottom-[13vh] w-[300px] h-[450px] opacity-100 visible"
            : "bottom-[10vh] w-0 h-0 opacity-0 invisible"
        }`}
      >
        <div className="w-full h-full bg-white overflow-auto rounded-[10px]">
          <MainContainer style={{ border: 0, borderRadius: 10 }}>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="MediBot is typing" />
                  ) : null
                }
              >
                {messages.map((message, i) => (
                  <Message key={i} model={message} />
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
