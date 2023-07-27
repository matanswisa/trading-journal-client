import { roles } from '../utils/roles';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    currentAccount: null,
    role: 0,
    isAuthenticated: false,
    isAdmin: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isAdmin = action.payload.user.role === roles.admin;
            console.log(action.payload.user)
            if (action.payload.user.accounts && action.payload.user.accounts.length) state.currentAccount = action.payload.user.accounts[0];
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
        },
        selectIsAuthenticated(state) {
            return state.isAuthenticated;
        },
        selectIsAdmin(state) {
            return state.isAdmin;
        },
        initializeUser(state) {
            const persistedUser = JSON.parse(localStorage.getItem('user'));
            if (persistedUser) {
                state.user = persistedUser;
                state.isAuthenticated = true;
                state.isAdmin = persistedUser.role === roles.admin;
            }
        },
        setCurrentAccount(state, action) {
            state.currentAccount = action.payload;
        },
    },
});

export const { login, logout, selectIsAdmin, initializeUser, setCurrentAccount } = authSlice.actions;
export const selectUserAccounts = (state) => state.user.accounts;
export const selectCurrentAccount = (state) => state.auth.currentAccount;
export const selectUserName = (state) => state.auth.user?.username;
export const selectUser = (state) => state.auth.user;
export const selectUserAdmin = (state) => state.auth.isAdmin;
export const isUserAuthenticated = (state) => state.auth.isAuthenticated;



export default authSlice.reducer;
