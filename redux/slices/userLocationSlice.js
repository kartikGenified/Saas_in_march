import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  location:{}
  
}

export const userLocationSlice = createSlice({
  name: 'userLocation',
  initialState,
  reducers: {
    
    setLocation: (state, action) => {
        console.log("dispatched location is",action.payload)
      state.location = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { setLocation} = userLocationSlice.actions

export default userLocationSlice.reducer