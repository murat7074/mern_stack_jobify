import React, { useReducer, useContext } from 'react';
import reducer from './reducer';
import axios from 'axios';
import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  REGISTER_USER_BEGIN,
  REGISTER_USER_SUCCESS,
  REGISTER_USER_ERROR,
  LOGIN_USER_BEGIN,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_ERROR,
} from './action';

const token = localStorage.getItem("token")
const user = localStorage.getItem("user")
const userLocation = localStorage.getItem("location")

const initialState = {
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
  user: user ? JSON.parse(localStorage.getItem("user")):null,
  token: token,
  userLocation: userLocation || "",
  jobLocation: userLocation || "",
};

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const displayAlert = () => {
    dispatch({ type: DISPLAY_ALERT });
    clearAlert();
  };
  const clearAlert = () => {
    setTimeout(() => {
      dispatch({ type: CLEAR_ALERT });
    }, 3000);
  };
//---------LOCALSTORAGE --------------//
  const addUserToLocalStorage = ({user,token,location})=>{
    localStorage.setItem("user",JSON.stringify(user))
    localStorage.setItem("token",token)
    localStorage.setItem("location",location)
  }

  const removeUserFromLocalStorage = ()=>{
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("location")
  }
//---------LOCALSTORAGE --------------//

//---------REGISTER USER --------------//
  const registerUser = async (currentUser) => {
    // "currentUser" Register.js den geliyor
    dispatch({ type: REGISTER_USER_BEGIN });
    try {
      const response = await axios.post('/api/v1/auth/register', currentUser); // "currentUser" ı server a gönderdik
      // console.log(response);
      const { user, token, location } = response.data; // "user, token, location" ı response.data ile server dan aldık

      dispatch({
        type: REGISTER_USER_SUCCESS,
        payload: { user, token, location },
      }); // "user, token, location" reducer.js de kullanacağız
      /* localstorage */
      addUserToLocalStorage({user,token,location}) // sayfayı yenilediğimizde artık "state" deki bilgiler silinmeyecek
    } catch (error) {
      // console.log(error.response);
      dispatch({
        type: REGISTER_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };

//---------LOGIN USER --------------//
 const loginUser = async (currentUser)=>{
      // "currentUser" Register.js den geliyor
    dispatch({ type: LOGIN_USER_BEGIN });
    try {
      const {data} = await axios.post('/api/v1/auth/login', currentUser); // "currentUser" ı server a gönderdik
    
      const { user, token, location } = data; // "user, token, location" ı response.data ile server dan aldık

      dispatch({
        type: LOGIN_USER_SUCCESS,
        payload: { user, token, location },
      }); 
      /* localstorage */
      addUserToLocalStorage({user,token,location}) // sayfayı yenilediğimizde artık "state" deki bilgiler silinmeyecek
    } catch (error) {
      
      dispatch({
        type: LOGIN_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
 }



  return (
    <AppContext.Provider
      value={{ ...state, displayAlert, clearAlert, registerUser, loginUser }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, initialState, useAppContext };
