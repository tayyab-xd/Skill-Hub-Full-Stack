export const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                messagesData: {
                    ...state.messagesData,
                    selectedUser: action.payload
                }
            }
        case 'SET_ORDERS':
            return {
                ...state,
                gigOrders: {
                    ...state.gigOrders,
                    allOrders: action.payload,

                }
            }
        case 'ALL_USERS':
            return {
                ...state,
                messagesData: {
                    ...state.messagesData,
                    allUsers: action.payload
                }
            }
        case 'LOAD_PREV_MSGS':
            return {
                ...state,
                messagesData: {
                    ...state.messagesData,
                    messages: Array.isArray(action.payload)
                        ? action.payload // for first load (previous messages)
                        : [...state.messagesData.messages, action.payload] // for new incoming single message
                }
            };


        case 'SET_COURSES':
            return {
                ...state,
                courses: action.payload,
                filterCourses: action.payload,
                populerCourses: action.payload.slice(0, 4)
            }
        case 'SET_GIGS':
            return {
                ...state,
                gigs: action.payload,
                filterGigs: action.payload,
            }
        case 'LOGGED_IN':
            return {
                ...state,
                loggedIn: action.payload
            }
        case 'SET_PROFILE':
            return {
                ...state,
                profileData: action.payload
            }
        case 'FILTER_TITLE':
            return {
                ...state,
                filterCourses: state.courses.filter((item) =>
                    item.title.toLowerCase().replace(/\s/g, '').includes(action.payload.toLowerCase().replace(/\s/g, '')
                    )
                )
            };
        case 'FILTER_CATEGORY':
            return {
                ...state,
                filterCourses: state.courses.filter((item) =>
                    item.category.toLowerCase().includes(action.payload.toLowerCase()))
            };
        case 'SET_MODE':
            return {
                ...state,
                learnMode: action.payload
            }


        default:
            return state
    }
}