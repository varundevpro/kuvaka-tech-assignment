import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistConfig,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from '@/features/auth/authSlice';
import countriesReducer from '@/features/countries/countriesSlice';
import chatRoomsReducer from '@/features/chatRooms/chatRoomsSlice';



const rootReducer = combineReducers({
  auth: authReducer,
  countries: countriesReducer,
  chatRooms: chatRoomsReducer,
})

const persistConfig: PersistConfig = {
  version: 1,
  key: "root", // Key for the persisted state in storage
  storage, // Storage engine (e.g., localStorage)
  whitelist: ["auth", "chatRooms"], // Array of reducers to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

