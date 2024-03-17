import {tasksReducer} from '../features/TodolistsList/tasks-reducer';
import {todolistsReducer} from '../features/TodolistsList/todolists-reducer';
import {applyMiddleware, combineReducers, createStore} from 'redux'
import {ThunkAction, ThunkDispatch, thunk as thunkMiddleware} from 'redux-thunk'
import {appReducer} from './app-reducer'
import {authReducer} from '../features/Login/auth-reducer'
import {configureStore, UnknownAction} from "@reduxjs/toolkit";
import logger from "redux-logger";

const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})

// ❗старая запись, с новыми версиями не работает
//  const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .prepend(
                thunkMiddleware
            )
            // .concat(logger),
},)

export type AppRootStateType = ReturnType<typeof rootReducer>

// ❗ UnknownAction вместо AnyAction
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootStateType, unknown, UnknownAction>

// export type AppDispatch = typeof store.dispatch
// ❗ UnknownAction вместо AnyAction
export type AppDispatch = ThunkDispatch<AppRootStateType, unknown, UnknownAction>
