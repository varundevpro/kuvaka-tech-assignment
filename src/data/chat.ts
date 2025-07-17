import { v4 as uuidv4 } from "uuid";

export const longChatForPagination = [
  {
    id: uuidv4(),
    role: "user",
    content: "Hi there! How are you doing today?",
    createdAt: Date.now() - 600000, // 10 minutes ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "Hello! I'm doing great, thank you for asking. How can I assist you?",
    createdAt: Date.now() - 580000, // 9 minutes 40 seconds ago
  },
  {
    id: uuidv4(),
    role: "user",
    content: "I'm looking for some information about your products.",
    createdAt: Date.now() - 500000, // ~8.3 minutes ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "Certainly! We offer a range of products including software solutions, hardware devices, and consulting services. Could you tell me which category you're interested in?",
    createdAt: Date.now() - 480000, // 8 minutes ago
  },
  {
    id: uuidv4(),
    role: "user",
    content:
      "I'm particularly interested in your software solutions. Do you have a brochure?",
    createdAt: Date.now() - 400000, // ~6.6 minutes ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "Yes, we do! Here is our latest software solutions brochure. It covers all our offerings in detail.",
    files: [
      {
        name: "SoftwareSolutions_Brochure.pdf",
        url: "/path/to/SoftwareSolutions_Brochure.pdf",
        type: "application/pdf",
      },
    ],
    createdAt: Date.now() - 380000, // ~6.3 minutes ago
  },
  {
    id: uuidv4(),
    role: "user",
    content:
      "Great, thanks! I'll take a look. Also, what are your operating hours?",
    createdAt: Date.now() - 300000, // 5 minutes ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "Our customer support is available Monday to Friday, from 9 AM to 6 PM IST. You can also visit our website for more information anytime.",
    createdAt: Date.now() - 280000, // ~4.6 minutes ago
  },
  {
    id: uuidv4(),
    role: "user",
    content:
      "Can I get a quick overview of your pricing model for the 'Pro' software package?",
    createdAt: Date.now() - 200000, // ~3.3 minutes ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "The 'Pro' package costs $99/month, offering unlimited users and premium features. A detailed pricing sheet is also available for download.",
    files: [
      {
        name: "Pricing_Sheet_Pro.xlsx",
        url: "/path/to/Pricing_Sheet_Pro.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
    createdAt: Date.now() - 180000, // 3 minutes ago
  },
  {
    id: uuidv4(),
    role: "user",
    content: "I need technical support. Can you connect me to a human agent?",
    createdAt: Date.now() - 100000, // ~1.6 minutes ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "I can help with basic queries, but for technical support, I'll transfer you. Please hold while I connect you to an agent.",
    createdAt: Date.now() - 80000, // ~1.3 minutes ago
  },
  {
    id: uuidv4(),
    role: "user",
    content: "Thanks for your help!",
    createdAt: Date.now() - 20000, // 20 seconds ago
  },
  {
    id: uuidv4(),
    role: "assistant",
    content:
      "You're welcome! Is there anything else I can assist you with today?",
    createdAt: Date.now() - 5000, // 5 seconds ago
  },
]