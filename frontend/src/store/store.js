import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import feedSlice from '../reducer/feedSlice';
import nudgeSlice from '../reducer/nudgeSlice';

const reducers = combineReducers({
  feed: feedSlice,
  nudge: nudgeSlice,
});

const persistConfig = {
  key: 'nudge-community',
  storage,
  whitelist: ['feed'],
  blacklist: ['nudge'],
};

const persist = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persist,
  middleware: (defaultMiddleware) =>
    defaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
