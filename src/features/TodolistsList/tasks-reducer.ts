import {
    addTodolistAC,
    AddTodolistActionType, removeTodolistAC,
    RemoveTodolistActionType, setTodolistsAC,
    SetTodolistsActionType
} from './todolists-reducer'
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Action, Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setAppErrorAC, SetAppErrorActionType, setAppStatusAC, SetAppStatusActionType} from '../../app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, current, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "../../common/actions/common.actions";

const initialState: TasksStateType = {}

const slice = createSlice({
    name: "task",
    initialState,
    reducers: {
        removeTaskAC(state,
                     action: PayloadAction<{
                         taskId: string,
                         todolistId: string
                     }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t =>
                t.id === action.payload.taskId
            )
            if (index > -1) {
                tasks.splice(index, 1)
            }
        },
        addTaskAC(state,
                  action: PayloadAction<{ task: TaskType }>) {
            const tasks = state[action.payload.task.todoListId]
            tasks.unshift(action.payload.task)
        },
        updateTaskAC(state,
                     action: PayloadAction<{
                         taskId: string,
                         model: UpdateDomainTaskModelType,
                         todolistId: string
                     }>) {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t =>
                t.id === action.payload.taskId
            )
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        },
        setTasksAC(state,
                   action: PayloadAction<{
                       tasks: Array<TaskType>,
                       todolistId: string
                   }>) {
            state[action.payload.todolistId] = action.payload.tasks
        },
        // cleatTasksAC() {
        //     return {}
        // }
    },
    extraReducers: builder => {
        builder
            .addCase(addTodolistAC, (state, action) => {
                    state[action.payload.todolist.id] = []
                }
            )
            .addCase(removeTodolistAC, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(setTodolistsAC, (state, action) => {
                action.payload.todolists.forEach(tl => {
                    state[tl.id] = []
                })
            })
            .addCase(clearTasksAndTodolists, ()=>{
                return {}
            })
    }
})


export const {
    removeTaskAC,
    addTaskAC,
    updateTaskAC,
    setTasksAC,
    // cleatTasksAC
} = slice.actions

export const tasksReducer = slice.reducer

// export const _tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//     switch (action.type) {
//         case removeTaskAC.type:
//             return {
//                 ...state,
//                 [action.payload.todolistId]: state[action.payload.todolistId].filter(t => t.id != action.payload.taskId)
//             }
//         case addTaskAC.type:
//             return {
//                 ...state,
//                 [action.payload.task.todoListId]: [action.payload.task, ...state[action.payload.task.todoListId]]
//             }
//         case updateTaskAC.type:
//             return {
//                 ...state,
//                 [action.payload.todolistId]: state[action.payload.todolistId]
//                     .map(t => t.id === action.payload.taskId ? {...t, ...action.payload.model} : t)
//             }
//         case setTasksAC.type:
//             return {...state, [action.payload.todolistId]: action.payload.tasks}
//         case 'todolist/addTodolistAC':
//             return {...state, [action.payload.todolist.id]: []}
//         case 'todolist/removeTodolistAC':
//             const copyState = {...state}
//             delete copyState[action.payload.id]
//             return copyState
//         case 'todolist/setTodolistsAC': {
//             const copyState = {...state}
//             action.payload.todolists.forEach(tl => {
//                 copyState[tl.id] = []
//             })
//             return copyState
//         }
//         default:
//             return state
//     }
// }

// actions
// export const removeTaskAC = (taskId: string, todolistId: string) =>
//     ({type: 'REMOVE-TASK', taskId, todolistId} as const)
// export const addTaskAC = (task: TaskType) =>
//     ({type: 'ADD-TASK', task} as const)
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
//     ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
//     ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({tasks, todolistId}))
            dispatch(setAppStatusAC({status: 'succeeded'}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatusAC({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC({task})
                dispatch(action)
                dispatch(setAppStatusAC({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...model
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
// type ActionsType =
//     | ReturnType<typeof removeTaskAC>
//     | ReturnType<typeof addTaskAC>
//     | ReturnType<typeof updateTaskAC>
//     | AddTodolistActionType
//     | RemoveTodolistActionType
//     | SetTodolistsActionType
//     | ReturnType<typeof setTasksAC>
