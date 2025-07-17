import { ArrowLeft, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createChatRoom,
  deleteChatRoom,
  fetchChatRooms,
  setSearchTerm,
} from "@/features/chatRooms/chatRoomsSlice";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logout } from "@/components/logout";

const newRoomSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title cannot be empty." })
    .max(50, { message: "Title cannot exceed 50 characters." }),
});

type NewRoomFormValues = z.infer<typeof newRoomSchema>;

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.phoneNumber);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userChatRoomsState = useAppSelector((state) =>
    currentUserId ? state.chatRooms.chatRoomsByUser[currentUserId] : undefined
  );

  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewRoomFormValues>({
    resolver: zodResolver(newRoomSchema),
    defaultValues: {
      title: "",
    },
  });

  const chatRooms = userChatRoomsState?.list || [];
  const searchTerm = userChatRoomsState?.searchTerm || "";
  const chatRoomsStatus = userChatRoomsState?.status || "idle";
  const chatRoomsError = userChatRoomsState?.error || null;

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast("Please login to access chat rooms");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (
      currentUserId &&
      (!userChatRoomsState || userChatRoomsState.status === "idle")
    ) {
      dispatch(fetchChatRooms(currentUserId));
    }
  }, [currentUserId, userChatRoomsState, dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentUserId && localSearchTerm !== searchTerm) {
        dispatch(
          setSearchTerm({ userId: currentUserId, searchTerm: localSearchTerm })
        );
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, currentUserId, dispatch, searchTerm]);

  const handleCreateRoom = async (data: NewRoomFormValues) => {
    const { title: newRoomTitle } = data;
    const actionResult = await dispatch(
      createChatRoom({
        userId: currentUserId,
        newRoomData: { title: newRoomTitle, createdAt: Date.now() },
      })
    );

    if (createChatRoom.fulfilled.match(actionResult)) {
      const newId = actionResult.payload.room.id;
      reset();
      navigate(`/chatrooms/${newId}`);
      toast("New chat room created");
    } else {
      toast.error("Failed to create chat room.");
    }
  };

  const handleDeleteRoom = async (roomId: string, title: string) => {
    if (window.confirm("Are you sure you want to delete this chat room?")) {
      await dispatch(deleteChatRoom({ userId: currentUserId, roomId }));
      toast("Deleted chat room: " + title);
    }
  };

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const filteredChatRooms = chatRooms.filter((room) =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-svh w-full">
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="text-foreground">Dashboard</div>

        <div className="ml-auto flex items-center gap-2">
          <Logout />
          <ModeToggle />
        </div>
      </header>

      <div className="flex-1 w-full p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-center text-primary mb-5">
            Chat Rooms
          </h2>

          <form
            onSubmit={handleSubmit(handleCreateRoom)}
            className="mb-4 pb-4 border-b flex gap-2 items-start"
          >
            <div className="flex flex-col flex-1">
              <Input
                type="text"
                placeholder="New chat room title"
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-destructive text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="outline"
              className="flex items-center gap-2"
            >
              <span>Create Room</span>
            </Button>
          </form>

          <Input
            className="bg-transparent mb-4"
            type="text"
            placeholder="Search chat rooms..."
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
          />

          {(chatRoomsStatus === "loading" || chatRoomsStatus === "idle") && (
            <p className="italic text-muted-foreground">
              Loading chat rooms...
            </p>
          )}
          {chatRoomsStatus === "failed" && (
            <p className="italic text-muted-foreground">
              Error: {chatRoomsError}
            </p>
          )}

          {chatRoomsStatus === "succeeded" && (
            <div className="divide-y divide-primary/20">
              {filteredChatRooms.length === 0 ? (
                <p className="italic text-muted-foreground">
                  No chat rooms found.
                </p>
              ) : (
                [...filteredChatRooms]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((chatroom) => {
                    return (
                      <React.Fragment key={chatroom.id}>
                        <div className="flex justify-between items-center py-3 px-0 group transition duration-200 ease-in-out">
                          <Link
                            to={`/chatrooms/${chatroom.id}`}
                            className="flex-grow opacity-85 pr-3 hover:opacity-100 font-medium"
                          >
                            {chatroom.title}
                          </Link>
                          <Button
                            className=" opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteRoom(chatroom.id, chatroom.title)
                            }
                            aria-label={`Delete ${chatroom.title}`}
                          >
                            <Trash className="size-4" />
                          </Button>
                        </div>
                      </React.Fragment>
                    );
                  })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
