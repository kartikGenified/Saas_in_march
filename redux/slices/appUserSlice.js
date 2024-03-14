import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: [],
  manualApproval : [],
  autoApproval : [],
  registrationRequired : [],
  appUsersData:[]
  
}

export const appUserSlice = createSlice({
  name: 'appusers',
  initialState,
  reducers: {
    
    setAppUsers: (state, action) => {
      state.value = action.payload
    },
    deleteAppUsers:(state, action) =>{
        state.value = []
    },
    setManualApproval:(state,action) =>{
      state.manualApproval = action.payload
    },
    setAutoApproval : (state,action) =>{
      state.autoApproval = action.payload
    },
    setRegistrationRequired : (state,action) =>{
      state.registrationRequired = action.payload
    },
    setAppUsersData : (state,action) =>{
      state.appUsersData = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setAppUsers, deleteAppUsers,setManualApproval,setAutoApproval,setRegistrationRequired,setAppUsersData} = appUserSlice.actions

export default appUserSlice.reducer