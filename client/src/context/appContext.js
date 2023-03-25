import React, { useReducer, useContext,useEffect } from 'react';
import reducer from './reducer';
import axios from 'axios';
import {
  DISPLAY_ALERT,
  CLEAR_ALERT,
  SETUP_USER_BEGIN,
  SETUP_USER_SUCCESS,
  SETUP_USER_ERROR,
  TOGGLE_SIDEBAR,
  LOGOUT_USER,
  UPDATE_USER_BEGIN,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_ERROR,
  HANDLE_CHANGE,
  CLEAR_VALUES,
  CREATE_JOB_BEGIN,
  CREATE_JOB_SUCCESS,
  CREATE_JOB_ERROR,
  GET_JOB_BEGİN,
  GET_JOB_SUCCESS,
  SET_EDIT_JOB,
  DELETE_JOB_BEGİN,
  EDIT_JOB_BEGIN,
  EDIT_JOB_SUCCESS,
  EDIT_JOB_ERROR,
  SHOW_STATS_BEGIN,
  SHOW_STATS_SUCCESS,
  CLEAR_FILTERS,
  CHANGE_PAGE,
  DELETE_JOB_ERROR,
    GET_CURRENT_USER_BEGIN,
  GET_CURRENT_USER_SUCCESS,
} from './action';

/* // with cookies we dont need token any more
 const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
const userLocation = localStorage.getItem('location'); */

const initialState = {
  userLoading:true,
  isLoading: false,
  showAlert: false,
  alertText: '',
  alertType: '',
/*  // with cookies we dont need token any more
 user: user ? JSON.parse(localStorage.getItem('user')) : null,
  token: token,
  userLocation: userLocation || '', */
  user:null,
  userLocation:"",
  showSidebar: false,
  isEditing: false,
  editJobId: '',
  position: '',
  company: '',
  /* jobLocation: userLocation || '', */
  jobLocation:"",
  jobTypeOptions: ['full-time', 'part-time', 'remote', 'internship'],
  jobType: 'full-time',
  statusOptions: ['interview', 'declined', 'pending'],
  status: 'pending',
  jobs: [],
  totalJobs: 0,
  numOfPages: 1,
  page: 1,
  stats: {},
  monthlyApplications: [],
  search: '',
  searchStatus: 'all',
  searchType: 'all',
  sort: 'latest',
  sortOptions: ['latest', 'oldest', 'a-z', 'z-a'],
};

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // axios (Global setup)
  // axios.defaults.headers["Authorization"] = `Bearer ${state.token}`
  // const {data} = await axios.patch("/api/v1/auth/updateUser",currentUser,)

  // axios Custom Instance
  // const authFetch = axios.create({
  //   baseURL: '/api/v1',
  //   headers:{
  //     Authorization: `Bearer ${state.token}`
  //   }
  // })
  //  const {data} = await authFetch.patch('/auth/updateUser',currentUser)

  const authFetch = axios.create({
    baseURL: '/api/v1',
  });

/* // with cookies we dont need token any more
  //request interceptor // interceptor ile ayrıntılı hata yakalayabiliriz
  authFetch.interceptors.request.use(
    (config) => {
      config.headers['Authorization'] = `Bearer ${state.token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  ); */

  // response interceptor
  authFetch.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // console.log(error.response);
      if (error.response.status === 401) {
        logoutUser(); // when the token expires
      }
      return Promise.reject(error);
    }
  );

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
/*  // with cookies we dont need token any more
 const addUserToLocalStorage = ({ user, token, location }) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('location', location);
  }; */

 /* // with cookies we dont need token any more
  const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('location');
  }; */
  //---------LOCALSTORAGE --------------//

  // delete "token" in setupUser
  const setupUser = async ({ currentUser, endPoint, alertText }) => {
    // "currentUser" Register.js den geliyor
    dispatch({ type: SETUP_USER_BEGIN });
    try {
      const { data } = await axios.post(
        `/api/v1/auth/${endPoint}`,
        currentUser
      ); // "currentUser" ı server a gönderdik

      const { user, location } = data; // "user, token, location" ı data ile server dan aldık

      dispatch({
        type: SETUP_USER_SUCCESS,
        payload: { user, location, alertText },
      });
      /* localstorage */
      // addUserToLocalStorage({ user, token, location }); // sayfayı yenilediğimizde artık "state" deki bilgiler silinmeyecek
    } catch (error) {
      dispatch({
        type: SETUP_USER_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };

  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };
//---------LOGOUT USER --------------//
  const logoutUser = async () => {
    await authFetch.get("/auth/logout")
    dispatch({ type: LOGOUT_USER });
    // removeUserFromLocalStorage();
  };

  // ------UPDATE USER --------//
  // delete "token" in updateUser
  const updateUser = async (currentUser) => {
    dispatch({ type: UPDATE_USER_BEGIN });
    try {
      const { data } = await authFetch.patch('/auth/updateUser', currentUser);
      const { user, location } = data;
      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: { user, location },
      });
      // addUserToLocalStorage({ user, token, location });
    } catch (error) {
      // console.log(error);
      if (error.response.status !== 401) {
        // when the token expires The user logs out and no error message shows
        dispatch({
          type: UPDATE_USER_ERROR,
          payload: { msg: error.response.data.msg },
        });
      }
    }
    clearAlert();
  };

  //---- HANDLECHANGE---- //
  const handleChange = ({ name, value }) => {
    dispatch({ type: HANDLE_CHANGE, payload: { name, value } });
  };

  //--- CLEAR VALUES---- //
  const clearValues = () => {
    dispatch({ type: CLEAR_VALUES });
  };

  //--- CREATE JOB---- //
  const createJob = async () => {
    dispatch({ type: CREATE_JOB_BEGIN });

    try {
      const { position, company, jobLocation, jobType, status } = state;
      // response almayacağız çünkü başka bir request ile (getAllJob) bunu yapıcaz
      await authFetch.post('/jobs', {
        position,
        company,
        jobLocation,
        jobType,
        status,
      });
      dispatch({ type: CREATE_JOB_SUCCESS });
      dispatch({ type: CLEAR_VALUES });
    } catch (error) {
      if (error.response.status === 401) return;

      dispatch({
        type: CREATE_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };

  //--- GET JOBS---- //
  const getJobs = async () => {
    const {page,search,searchStatus,searchType,sort } =state

    let url = `/jobs?page=${page}&status=${searchStatus}&jobType=${searchType}&sort=${sort}`;

    if(search){
      url = url + `&search=${search}`
    }

    dispatch({ type: GET_JOB_BEGİN });
    try {
      const { data } = await authFetch(url); // get (yazmaya gerek yok)

      const { jobs, totalJobs, numOfPages } = data;

      dispatch({
        type: GET_JOB_SUCCESS,
        payload: { jobs, totalJobs, numOfPages },
      });
    } catch (error) {
     
      logoutUser()
    }
    clearAlert();
  };

/*   //--- GET JOBS---- BEFORE SEARCH //
  const getJobs = async () => {
    let url = `/jobs`;
    dispatch({ type: GET_JOB_BEGİN });
    try {
      const { data } = await authFetch(url); // get (yazmaya gerek yok)

      const { jobs, totalJobs, numOfPages } = data;

      dispatch({
        type: GET_JOB_SUCCESS,
        payload: { jobs, totalJobs, numOfPages },
      });
    } catch (error) {
      console.log(error.response);
      // logoutUser()
    }
    clearAlert();
  }; */





  //--- SET EDİT  JOB----//
  /* edit e tıklayınce add job a gideceğiz ve add job da edit edilecek
    job bilgileri olucak ve değiştirilen değerler state e kaydedilecek  */
  const setEditJob = (id) => {
    dispatch({ type: SET_EDIT_JOB, payload: { id } });
  };

  //--- EDİT  JOB---- //
  const editJob = async () => {
    dispatch({ type: EDIT_JOB_BEGIN });
    try {
      const { position, company, jobLocation, jobType, status } = state;
      await authFetch.patch(`/jobs/${state.editJobId}`, {
        position,
        company,
        jobLocation,
        jobType,
        status,
      });

      dispatch({ type: EDIT_JOB_SUCCESS });
      dispatch({ type: CLEAR_VALUES });
    } catch (error) {
      if (error.response.status === 401) return;
      dispatch({
        type: EDIT_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
    }
    clearAlert();
  };

  //--- DELETE  JOB---- //
  const deleteJob = async (jobId) => {
    // console.log(`delete job : ${jobId}`);
    dispatch({ type: DELETE_JOB_BEGİN });
    try {
      await authFetch.delete(`/jobs/${jobId}`);
      getJobs(); // silinenlerden sonra güncel jobs ları getirelim
    } catch (error) {
       if (error.response.status === 401) return;
      dispatch({
        type: DELETE_JOB_ERROR,
        payload: { msg: error.response.data.msg },
      });
      // logoutUser()
    }
    clearAlert()
  };

  // --------------SHOW STATS------------------//
  const showStats = async () => {
    dispatch({ type: SHOW_STATS_BEGIN });
    try {
      const { data } = await authFetch('/jobs/stats');
      dispatch({
        type: SHOW_STATS_SUCCESS,
        payload: {
          stats: data.defaultStats,
          monthlyApplications: data.monthlyApplications,
        },
      });
    } catch (error) {
      logoutUser();
    }
    clearAlert();
  };

  const clearFilters = () =>{
   dispatch({type:CLEAR_FILTERS})
  }

  // -------CHANGE PAGE (pagination)---------//

  const changePage = (page) =>{
    dispatch({type:CHANGE_PAGE,payload:{page}})
  }


//  her sayfa yenilendiğinde "getCurrentUser" ile request de bulunucaz ve user ile location u alıcaz
  
// GET----------------- CURRENT USER------------------- //
const getCurrentUser = async () => {
  dispatch({ type: GET_CURRENT_USER_BEGIN });
  try {
    const { data } = await authFetch('/auth/getCurrentUser');
    const { user, location } = data;

    dispatch({
      type: GET_CURRENT_USER_SUCCESS,
      payload: { user, location },
    });
  } catch (error) {
    if (error.response.status === 401) return;
    logoutUser();
  }
};

useEffect(() => {
  getCurrentUser();
}, []);




  return (
    <AppContext.Provider
      value={{
        ...state,
        displayAlert,
        clearAlert,
        setupUser,
        toggleSidebar,
        logoutUser,
        updateUser,
        handleChange,
        clearValues,
        createJob,
        getJobs,
        setEditJob,
        deleteJob,
        editJob,
        showStats,
        clearFilters,
        changePage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { AppProvider, initialState, useAppContext };
