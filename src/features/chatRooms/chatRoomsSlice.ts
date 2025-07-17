import { longChatForPagination } from '@/data/chat';
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// Define the types for your chat room and message
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: { name: string; url: string; type: string }[]; // Add files array
  createdAt: number;
}

export interface ChatRoom {
  id: string;
  title: string; // Renamed from 'name' to 'title' to match your data
  createdAt: number; // Using number for timestamp
  messages: ChatMessage[]; // Optional, if messages are part of the room structure
}

interface ChatRoomsDataForUser {
  list: ChatRoom[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchTerm: string;
}

interface ChatRoomsState {
  chatRoomsByUser: {
    [userId: string]: ChatRoomsDataForUser;
  };
}

const initialState: ChatRoomsState = {
  chatRoomsByUser: {},
};

// Async Thunks
// --- Fetch Chat Rooms ---
export const fetchChatRooms = createAsyncThunk(
  'chatRooms/fetchChatRooms',
  async (userId: string) => {
    // Simulate API call to fetch chat rooms for a specific user
    const response = await new Promise<ChatRoom[]>((resolve) =>
      setTimeout(() => {
        // Dummy data based on your provided format, filtered or generated for the specific userId
        const dummyRooms: ChatRoom[] = [
          { id: '1', title: 'General Chat', createdAt: Date.now() - 300000, messages: longChatForPagination },
          // Add more user-specific dummy data if needed
        ];
        // In a real app, your API would return only the rooms for the given userId
        resolve(dummyRooms);
      }, 500)
    );
    return { userId, rooms: response };
  }
);

// --- Create Chat Room ---
export const createChatRoom = createAsyncThunk(
  'chatRooms/createChatRoom',
  async ({ userId, newRoomData }: { userId: string; newRoomData: Omit<ChatRoom, 'id'> }) => {
    // Simulate API call to create a new room
    const response = await new Promise<ChatRoom>((resolve) =>
      setTimeout(() => {
        const createdRoom: ChatRoom = {
          ...newRoomData,
          id: `room-${Date.now()}`,
          createdAt: Date.now(), // Ensure createdAt is set
          messages: []
        };
        resolve(createdRoom);
      }, 500)
    );
    return { userId, room: response };
  }
);

// --- Delete Chat Room ---
export const deleteChatRoom = createAsyncThunk(
  'chatRooms/deleteChatRoom',
  async ({ userId, roomId }: { userId: string; roomId: string }) => {
    // Simulate API call to delete a room
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
    return { userId, roomId }; // Return the userId and ID of the deleted room
  }
);

export const chatRoomsSlice = createSlice({
  name: 'chatRooms',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<{ userId: string; searchTerm: string }>) => {
      const { userId, searchTerm } = action.payload;
      if (!state.chatRoomsByUser[userId]) {
        state.chatRoomsByUser[userId] = {
          list: [],
          status: 'idle',
          error: null,
          searchTerm: '',
        };
      }
      state.chatRoomsByUser[userId].searchTerm = searchTerm;
    },
    // Add message to a specific room for a specific user
    addMessageToRoom: (state, action: PayloadAction<{ userId: string; roomId: string; message: ChatMessage }>) => {
      const { userId, roomId, message } = action.payload;
      const userRooms = state.chatRoomsByUser[userId]?.list;
      if (userRooms) {
        const room = userRooms.find((r) => r.id === roomId);
        if (room) {
          if (!room.messages) {
            room.messages = [];
          }
          room.messages.push(message);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chat Rooms
      .addCase(fetchChatRooms.pending, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.chatRoomsByUser[userId]) {
          state.chatRoomsByUser[userId] = { list: [], status: 'idle', error: null, searchTerm: '' };
        }
        state.chatRoomsByUser[userId].status = 'loading';
      })
      .addCase(fetchChatRooms.fulfilled, (state, action: PayloadAction<{ userId: string; rooms: ChatRoom[] }>) => {
        const { userId, rooms } = action.payload;
        if (!state.chatRoomsByUser[userId]) {
          state.chatRoomsByUser[userId] = { list: [], status: 'idle', error: null, searchTerm: '' };
        }
        state.chatRoomsByUser[userId].status = 'succeeded';
        state.chatRoomsByUser[userId].list = rooms;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.chatRoomsByUser[userId]) {
          state.chatRoomsByUser[userId] = { list: [], status: 'idle', error: null, searchTerm: '' };
        }
        state.chatRoomsByUser[userId].status = 'failed';
        state.chatRoomsByUser[userId].error = action.error.message || 'Failed to fetch chat rooms';
      })
      // Create Chat Room
      .addCase(createChatRoom.fulfilled, (state, action: PayloadAction<{ userId: string; room: ChatRoom }>) => {
        const { userId, room } = action.payload;
        if (state.chatRoomsByUser[userId]) {
          state.chatRoomsByUser[userId].list.push(room);
        }
      })
      // Delete Chat Room
      .addCase(deleteChatRoom.fulfilled, (state, action: PayloadAction<{ userId: string; roomId: string }>) => {
        const { userId, roomId } = action.payload;
        if (state.chatRoomsByUser[userId]) {
          state.chatRoomsByUser[userId].list = state.chatRoomsByUser[userId].list.filter(
            (room) => room.id !== roomId
          );
        }
      });
  },
});

export const { setSearchTerm, addMessageToRoom } = chatRoomsSlice.actions;

export default chatRoomsSlice.reducer;