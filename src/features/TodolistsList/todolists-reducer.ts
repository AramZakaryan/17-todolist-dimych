import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {AppThunk} from '../../app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TodolistsList} from "./TodolistsList";

const initialState: Array<TodolistDomainType> = []

// const slice = createSlice({
//     name: "todolist",
//     initialState,
//     reducers: {
//         removeTodolistAC(state,
//                          action: PayloadAction<{ todolistId: string }>) {
//             state = state.filter(tl => tl.id === action.payload.todolistId)
//         },
//         addTodolistAC(state,
//                       action: PayloadAction<{ todolist: TodolistType }>) {
//             state.push({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
//         },
//         changeTodolistTitleAC(state,
//                               action: PayloadAction<{
//                                   todolistId: string,
//                                   title: string
//                               }>) {
//             state.forEach(tl => tl.id === action.payload.todolistId ? tl.title = action.payload.title : tl)
//         },
//         changeTodolistFilterAC(state,
//                                action: PayloadAction<{
//                                    todolistId: string,
//                                    filter: FilterValuesType
//                                }>) {
//             state.forEach(tl => tl.id === action.payload.todolistId ? tl.filter === action.payload.filter : tl)
//         },
//         changeTodolistEntityStatusAC(state,
//                                      action: PayloadAction<{
//                                          todolistId: string,
//                                          status: RequestStatusType
//                                      }>) {
//             state.forEach(tl => tl.id === action.payload.status ? tl.entityStatus === action.payload.status : tl)
//
//         },
//         setTodolistsAC(state,
//                        action: PayloadAction<{
//                            todolists: TodolistType[]
//                        }>) {
//             state = action.payload.todolists.map(tl => ({
//                     ...tl,
//                     filter: 'all',
//                     entityStatus: 'idle'
//                 }) as TodolistDomainType
//             )
//         },
//     }
// })
//
//
// export const {
//     changeTodolistEntityStatusAC,
//     changeTodolistFilterAC,
//     addTodolistAC,
//     setTodolistsAC,
//     changeTodolistTitleAC,
//     removeTodolistAC
// } = slice.actions
//
// export const todolistsReducer = slice.reducer

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'todolist/removeTodolistAC':
            return state.filter(tl => tl.id != action.payload.todolistId)
        case 'todolist/addTodolistAC':
            return [{...action.payload.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
        case 'CHANGE-TODOLIST-TITLE':
            return state.map(tl => tl.id === action.payload.todolistId ? {...tl, title: action.payload.title} : tl)
        case 'CHANGE-TODOLIST-FILTER':

        case 'CHANGE-TODOLIST-ENTITY-STATUS':
            return state.map(tl => tl.id === action.payload.todolistId ? {...tl, entityStatus: action.payload.status} : tl)
        case 'todolist/setTodolistsAC':
            return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        default:
            return state
    }
}

// actions
export const removeTodolistAC = (arg: { todolistId: string }) => ({
    type: 'todolist/removeTodolistAC',
    payload: {
        todolistId: arg.todolistId
    }
} as const)

export const addTodolistAC = (arg: { todolist: TodolistType }) => ({
    type: 'todolist/addTodolistAC',
    payload: {
        todolist: arg.todolist
    }
} as const)
export const changeTodolistTitleAC = (arg: { todolistId: string, title: string }) => ({
    type: 'CHANGE-TODOLIST-TITLE',
    payload: {
        todolistId: arg.todolistId,
        title: arg.title
    }
} as const)
export const changeTodolistFilterAC = (arg:{todolistId: string, filter: FilterValuesType}) => ({
    type: 'CHANGE-TODOLIST-FILTER',
    payload: {
        todolistId: arg.todolistId,
        filter: arg.filter
    }
} as const)
export const changeTodolistEntityStatusAC = (arg:{todolistId: string, status: RequestStatusType}) => ({
    type: 'CHANGE-TODOLIST-ENTITY-STATUS',
    payload: {
        todolistId: arg.todolistId,
        status: arg.status
    }
} as const)
export const setTodolistsAC = (arg: { todolists: Array<TodolistType> }) => ({
    type: 'todolist/setTodolistsAC',
    payload: {
        todolists:arg.todolists
    }
} as const)

// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolistsAC({todolists: res.data}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: ThunkDispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(setAppStatusAC({status: 'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(changeTodolistEntityStatusAC({todolistId: todolistId, status: 'loading'}))
        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                dispatch(removeTodolistAC({todolistId: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: ThunkDispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist: res.data.data.item}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch<ActionsType>) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({todolistId: id, title: title}))
            })
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>;
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>;
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>;
type ActionsType =
    | RemoveTodolistActionType
    | AddTodolistActionType
    | ReturnType<typeof changeTodolistTitleAC>
    | ReturnType<typeof changeTodolistFilterAC>
    | SetTodolistsActionType
    | ReturnType<typeof changeTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
