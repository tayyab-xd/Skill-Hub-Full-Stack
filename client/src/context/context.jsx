import { useState, createContext, useReducer, useEffect, useRef } from "react"
import axios from "axios"
import { io } from "socket.io-client";
import { reducer } from "./reducer"
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const AppContext = createContext()
const socket = io(`${import.meta.env.VITE_API_URL}`);

const Appprovider = ({ children }) => {
    const navigate = useNavigate();
    const initialState = {
        courses: [],
        filterCourses: [],
        populerCourses: [],
        gigs: [],
        filterGigs: [],
        profileData: [],
        learnMode: true,
    }
    const [state, dispatch] = useReducer(reducer, initialState)
    const location = useLocation();
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(`${import.meta.env.VITE_API_URL}`);
        socketRef.current = socket;
        return () => {
            socket.disconnect();
        };
    }, []);
    useEffect(() => {
        if (location.pathname === "/" || location.pathname === "/home") {
            if (state.learnMode) {
                navigate("/courses", { replace: true });
            } else {
                navigate("/gig", { replace: true });
            }
        }
    }, [location.pathname, navigate]);

    // for courses
    useEffect(() => {
        if (!localStorage.getItem('token')) return
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/course/all-courses`);
                dispatch({ type: 'SET_COURSES', payload: response.data });
            } catch (error) {
                console.log(error);
            }
        }
        fetchData()
    }, []);

    //for gigs
    useEffect(() => {
        if (!localStorage.getItem('token')) return
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/gig/all-gigs`);
                dispatch({ type: 'SET_GIGS', payload: response.data });
            } catch (error) {
                console.log(error);
            }
        }
        fetchData()
    }, [])

    // for profile
    useEffect(() => {
        if (!state.loggedIn) return
        const fetchUser = async () => {
            try {
                const fetchData = await axios.get(`${API_URL}/user/profile/${localStorage.getItem('userId')}`)
                dispatch({ type: 'SET_PROFILE', payload: fetchData.data })
            } catch (error) {
                console.log(error)
            }
        }
        fetchUser()
    }, [state.loggedIn])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            dispatch({ type: 'LOGGED_IN', payload: true })
        }
    }, [])

    const setMode = () => {
        const newMode = !state.learnMode;
        dispatch({ type: 'SET_MODE', payload: newMode });
        navigate(newMode ? '/courses' : '/gigs');
    };



    return (
        <AppContext.Provider value={{ state, setMode, dispatch, socket }}>{children}</AppContext.Provider>
    )
}

export { AppContext, Appprovider }