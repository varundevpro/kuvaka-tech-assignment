import { type ChatMessage } from '@/features/chatRooms/chatRoomsSlice'; // Assuming ChatMessage is defined here
import { v4 as uuidv4 } from 'uuid';

export interface AssistantResponseTemplate {
  keywords: string[]; // Keywords to match in the user's prompt (case-insensitive)
  response: string; // The assistant's text response
  files?: ChatMessage['files']; // Optional files to attach
}

const responseTemplates: AssistantResponseTemplate[] = [
  {
    keywords: ["hi", "hello", "hey", "how are you"],
    response: "Hello! I'm doing great, thank you for asking. How can I assist you today?",
  },
  {
    keywords: ["product", "products", "offerings", "solution", "solutions"],
    response: "Certainly! We offer a range of products including software solutions, hardware devices, and consulting services. Could you tell me which category you're interested in?",
  },
  {
    keywords: ["brochure", "download", "document", "info"],
    response: "Yes, we do! Here is our latest software solutions brochure. It covers all our offerings in detail.",
    files: [
      { name: "SoftwareSolutions_Brochure.pdf", url: "/assets/SoftwareSolutions_Brochure.pdf", type: "application/pdf" },
    ],
  },
  {
    keywords: ["price", "cost", "pricing", "how much"],
    response: "To give you the most accurate pricing, could you specify which product or service you're interested in? Generally, our solutions are tailored to your needs.",
  },
  {
    keywords: ["hours", "open", "closing", "operating"],
    response: "Our customer support is available Monday to Friday, from 9 AM to 6 PM IST. Our website is available 24/7!",
  },
  {
    keywords: ["support", "help", "agent", "human"],
    response: "I can help with many common questions. For more complex technical support, I'll connect you to a human agent. Please hold while I check availability.",
  },
  {
    keywords: ["thank", "thanks", "appreciate"],
    response: "You're most welcome! Is there anything else I can assist you with today?",
  },
  {
    keywords: ["goodbye", "bye", "see you"],
    response: "Goodbye! Have a great day.",
  },
  {
    keywords: ["account", "login", "password"],
    response: "For account-related queries, please visit our 'My Account' section on the website or contact support directly for security reasons.",
  },
  {
    keywords: ["feature", "features", "what does it do"],
    response: "Our products come with a wide array of features designed to boost your productivity. Could you specify which product you're curious about?",
  },
];

export const getAssistantResponse = (userPrompt: string): ChatMessage => {
  const lowerCasePrompt = userPrompt.toLowerCase();

  // Try to find a matching response based on keywords
  for (const template of responseTemplates) {
    if (template.keywords.some(keyword => lowerCasePrompt.includes(keyword))) {
      return {
        id: uuidv4(),
        role: "assistant",
        content: template.response,
        files: template.files, // Include files if present
        createdAt: Date.now(),
      };
    }
  }

  // Fallback / default response if no specific match is found
  return {
    id: uuidv4(),
    role: "assistant",
    content: "I'm not quite sure how to answer that. Could you please rephrase your question or ask about a specific topic like products, pricing, or support?",
    createdAt: Date.now(),
  };
};