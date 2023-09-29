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
            localStorage.setItem(`user`, JSON.stringify(action.payload.user));
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isAdmin = action.payload.user.role === roles.admin;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
            state.currentAccount = null;
        },
        selectIsAuthenticated(state) {
            return state.isAuthenticated;
        },
        selectIsAdmin(state) {
            return state.isAdmin;
        },
        setCurrentAccount(state, action) {
            state.currentAccount = action.payload;
        },

        addAccountToList(state, action) {
            // state.
            console.log(action.payload);
            state.user.accounts.push(action.payload);
        },
        updateAccountList(state, action) {
            console.log("before", action.payload);
            state.user.accounts = action.payload;
            console.log("after", state.user.accounts)
        },
        updateAccount(state, action) {
            const currAccounts = state.user.accounts.filter(account => account._id !== action.payload._id);
            currAccounts.push(action.payload);
            state.user.accounts = currAccounts;
        },
        removeAccount(state, action) {
            const currAccounts = state.user.accounts.filter(account => account._id !== action.payload.accountId);
            state.user.accounts = currAccounts;
        },
        setTradesList(state, action) {
            state.currentAccount.trades = action.payload;
        },
    },
});

export const { login, logout, selectIsAdmin, setCurrentAccount, addAccountToList, removeAccount, setTradesList, updateAccountList } = authSlice.actions;

//Selectors
export const selectUserAccounts = (state) => state.auth.user?.accounts;
export const selectCurrentAccount = (state) => state.auth.currentAccount;
export const selectTradesOfCurrentAccount = (state) => state.auth.currentAccount.trades;
export const selectUserName = (state) => state.auth.user?.username;
export const selectUser = (state) => state.auth.user;
export const selectUserAdmin = (state) => state.auth.isAdmin;
export const isUserAuthenticated = (state) => state.auth.isAuthenticated;



export default authSlice.reducer;