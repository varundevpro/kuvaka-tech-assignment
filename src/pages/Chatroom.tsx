// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useRef, useCallback } from "react";

import { v4 as uuidv4 } from "uuid";

import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUp,
  Copy,
  Paperclip,
  Square,
  X,
  CheckIcon,
} from "lucide-react";

import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

import { z } from "zod";
import { useNavigate, useParams } from "react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  addMessageToRoom,
  fetchChatRooms,
  type ChatMessage,
} from "@/features/chatRooms/chatRoomsSlice";
import { toast } from "sonner";
import { getAssistantResponse } from "@/utils/assistant";
import { formatMessageTimestamp } from "../utils/date";
import { Loader } from "@/components/ui/loader";
import { Logout } from "@/components/logout";
import { sleep } from "@/utils/sleep";

// Define the Zod schema for file validation
const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.type.startsWith("image/"),
    "Only image files are allowed."
  );

export function Chatroom() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.phoneNumber);
  const roomId = params.chatroom;
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userChatRoomsState = useAppSelector((state) =>
    userId ? state.chatRooms.chatRoomsByUser[userId] : undefined
  );

  const chatRoom = (userChatRoomsState?.list || []).find(
    (room) => room.id === roomId
  );

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<
    { file: File; url: string }[]
  >([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast("Please login to access chatroom");
      navigate("/login"); // Redirect if not authenticated
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Fetch chat rooms only if they haven't been fetched for this user yet
    if (
      userId &&
      (!userChatRoomsState || userChatRoomsState.status === "idle")
    ) {
      dispatch(fetchChatRooms(userId));
    }
  }, [userId, userChatRoomsState, dispatch]);

  useEffect(() => {
    if (!chatRoom) {
      navigate("/chatrooms");
      toast("Chat room not found");
    }
  }, [chatRoom, navigate]);

  // Effect to scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatRoom?.messages]);

  const handleSubmit = async () => {
    if (!prompt.trim() && files.length === 0) return;

    setIsLoading(true);

    // Process files to get Base64 URLs for storage in message
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        return new Promise<{ name: string; url: string; type: string }>(
          (resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                name: file.name,
                url: reader.result as string,
                type: file.type,
              });
            };
            reader.readAsDataURL(file);
          }
        );
      })
    );

    // Add user message immediately
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: prompt.trim(),
      files: processedFiles.length > 0 ? processedFiles : undefined,
      createdAt: Date.now(),
    };

    dispatch(addMessageToRoom({ userId, roomId, message: newUserMessage }));

    // Clear prompt and files
    setPrompt("");
    setFiles([]);
    setFilePreviews([]);

    // Simulate API response
    await sleep(1500);

    const assistantResponse = getAssistantResponse(prompt.trim());

    await dispatch(
      addMessageToRoom({ userId, roomId, message: assistantResponse })
    );

    setIsLoading(false);

    await sleep(300);

    const latestMessage = document.getElementById(assistantResponse.id);
    const scrollContainer = chatContainerRef.current;
    if (latestMessage && scrollContainer) {
      // Use scrollIntoView with 'start' to align the element to the top of the container
      latestMessage.scrollIntoView({
        behavior: "smooth", // For a smooth scrolling animation
        block: "start", // Aligns the top of the element to the top of the scroll container
        inline: "nearest", // Keeps the element in view horizontally if possible
      });
    } else {
      console.error("Element or Scroll Container not found.");
      console.log(assistantResponse.id, scrollContainer);
    }
  };

  const handleFilesAdded = (newFiles: File[]) => {
    const validatedFiles: File[] = [];
    const validatedPreviews: { file: File; url: string }[] = [];

    newFiles.forEach((file) => {
      const validationResult = imageFileSchema.safeParse(file);
      if (validationResult.success) {
        validatedFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          validatedPreviews.push({ file, url: reader.result as string });
          // Only update state after all files have been processed
          if (validatedPreviews.length === validatedFiles.length) {
            setFiles((prev) => [...prev, ...validatedFiles]);
            setFilePreviews((prev) => [...prev, ...validatedPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const errorMessage = z.prettifyError(validationResult.error);

        alert(errorMessage);
      }
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  if (!chatRoom) {
    return <div>Chat room not found.</div>;
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="text-foreground">{chatRoom.title}</div>

        <div className="ml-auto flex items-center gap-2">
          <Logout />
          <ModeToggle />
        </div>
      </header>

      <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-4 px-5 py-12">
            {chatRoom.messages.map((message) => {
              const isAssistant = message.role === "assistant";

              return (
                <Message
                  key={message.id}
                  className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6",
                    isAssistant ? "items-start" : "items-end"
                  )}
                >
                  {isAssistant ? (
                    <div className="group flex w-full flex-col gap-0">
                      <p className="text-sm opacity-70 mb-1">
                        <strong className="font-medium">AI</strong> •{" "}
                        <span className="opacity-80">
                          {formatMessageTimestamp(message.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </p>
                      <MessageContent
                        className="text-foreground prose flex-1 rounded-lg bg-transparent p-0"
                        markdown
                        id={message.id}
                      >
                        {message.content}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        )}
                      >
                        <CopyMessageAction text={message.content} />
                      </MessageActions>
                    </div>
                  ) : (
                    <div className="group flex flex-col items-end gap-1">
                      <p className="text-sm opacity-70 px-2">
                        <strong className="font-medium">You</strong> •{" "}
                        <span className="opacity-80">
                          {formatMessageTimestamp(message.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </p>
                      <MessageContent
                        className="bg-muted text-primary max-w-[85%] rounded-3xl px-5 py-2.5 sm:max-w-[75%]"
                        id={message.id}
                      >
                        {message.content}
                        {message.files && message.files.length > 0 && (
                          <div className="mt-2 grid grid-cols-[repeat(3,minmax(80px,1fr))] gap-2">
                            {message.files.map((file, index) => (
                              <div
                                key={index}
                                className="relative h-20 overflow-hidden rounded-md"
                              >
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="h-full w-full object-cover inline-flex"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </MessageContent>
                      <MessageActions
                        className={cn(
                          "flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        )}
                      >
                        <CopyMessageAction text={message.content} />
                      </MessageActions>
                    </div>
                  )}
                </Message>
              );
            })}

            {isLoading && (
              <Message className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 items-start">
                <div className="group flex w-full flex gap-2 items-center">
                  <Loader variant="loading-dots" text="Thinking" />
                </div>
              </Message>
            )}
          </ChatContainerContent>

          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <FileUpload
            onFilesAdded={handleFilesAdded}
            accept="image/*" // Restrict file types to images
          >
            <PromptInput
              isLoading={isLoading}
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={handleSubmit}
              className="border-input bg-popover relative z-10 w-full rounded-3xl border p-2 shadow-xs"
            >
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {filePreviews.map((filePreview, index) => (
                    <div
                      key={index}
                      className="bg-secondary flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        {/* Display image preview */}
                        <img
                          src={filePreview.url}
                          alt={filePreview.file.name}
                          className="size-8 rounded-md object-cover"
                        />
                        <span className="max-w-[80px] truncate text-sm">
                          {filePreview.file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="hover:bg-secondary/50 rounded-full p-1"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col">
                <PromptInputTextarea
                  placeholder="Ask anything"
                  className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
                />

                <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <PromptInputAction tooltip="Attach files">
                      <FileUploadTrigger asChild>
                        <div className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl">
                          <Paperclip className="text-primary size-5" />
                        </div>
                      </FileUploadTrigger>
                    </PromptInputAction>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      disabled={!prompt.trim() && files.length === 0} // Disable if no text and no files
                      onClick={handleSubmit}
                      className="size-9 rounded-full"
                    >
                      {!isLoading ? (
                        <ArrowUp size={18} />
                      ) : (
                        <Square className="size-5 fill-current" />
                      )}
                    </Button>
                  </div>
                </PromptInputActions>
              </div>
            </PromptInput>

            <FileUploadContent>
              <div className="flex min-h-[200px] w-full items-center justify-center backdrop-blur-sm">
                <div className="bg-background/90 m-4 w-full max-w-md rounded-lg border p-8 shadow-lg">
                  <div className="mb-4 flex justify-center">
                    <svg
                      className="text-muted size-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-center text-base font-medium">
                    Drop files to upload
                  </h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Release to add files to your message
                  </p>
                </div>
              </div>
            </FileUploadContent>
          </FileUpload>
        </div>
      </div>
    </main>
  );
}

function CopyMessageAction({ text }: { text: string }) {
  const copied = false;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  };

  return (
    <MessageAction tooltip={copied ? "Copied" : "Copy"} delayDuration={100}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckIcon className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
    </MessageAction>
  );
}
