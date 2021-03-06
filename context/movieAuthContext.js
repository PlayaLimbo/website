import createDataContext from "./index";
import movieAuth from "../api/movieAuth";
//
const authReducer = (state, action) => {
    switch (action.type) {
        case "login":
            // true state {token, credits, userEmail} coming from API
            return {
                errorMessage: "",
                token: action.payload.token,
                email: action.payload.email,
                credits: action.payload.credits,
                userMovies: action.payload.movies,
            };
        case "logout": //! ONLY ON iOS
            return { token: null, credits: 0, email: null, errorMessage: "" };
        case "add_error":
            return { errorMessage: action.payload };
        case "remove_error":
            return { ...state, errorMessage: null };
        case "loading":
            return { ...state, loading: action.payload };
        // case "add_to_list":
        //     return {
        //         ...state,
        //         userMovies: [state.userMovies, action.payload],
        //     };

        default:
            return state;
    }
};

const addToList = (dispatch) => async (movie, email) => {
    // to save to db we need an email and a movie object!
    // to save to db request must be a POST to "/save-movie",
    // dispatch should not modify state.

    try {
        // ?
        const res = await movieAuth.post("/save-movie", { email, movie });
        console.log("Save movie Response: ", res);
        dispatch({ type: "add_to_list", payload: res.data.movie });
    } catch (error) {
        console.log("Erorrrrr: ", error);
        return;
    }
};
const signIn = (dispatch) => {
    return async ({ email, password }) => {
        try {
            dispatch({ type: "loading", payload: "loading" });
            const res = await movieAuth.post("/signin", { email, password });
            dispatch({ type: "login", payload: res.data });
            dispatch({ type: "loading", payload: "done" });
        } catch (error) {
            // console.log(error.res.data);
            dispatch({
                type: "add_error",
                payload: "Something went wrong with sign in",
            });
        }
    };
};

const signUp = (dispatch) => {
    return async ({ email, password }) => {
        try {
            dispatch({ type: "loading", payload: "loading" });
            const res = await movieAuth.post("/signup", { email, password });
            dispatch({ type: "login", payload: res.data });
            dispatch({ type: "loading", payload: "done" });
        } catch (error) {
            // console.log(error.res.data);
            dispatch({
                type: "add_error",
                payload: "Something went wrong with sign up",
            });
        }
    };
};
const clearError = (dispatch) => () => dispatch({ type: "remove_error" });

const signOut = (dispatch) => async () => {
    try {
        await AsyncStorage.removeItem("token");
        dispatch({ type: "logout" });
    } catch (e) {
        // remove error
        console.log(e);
    }
};

const addCredits = (dispatch) => async (user) => {
    // authenticate password before making api request.
    try {
        console.log(user);
        // //
        dispatch({ type: "loading", payload: "loading" });
        // //
        const res = await movieAuth.post("add-credits", user, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        });
        console.log("addCredits => response: ", res.data);
        dispatch({ type: "login", payload: res.data });
        // //
        dispatch({ type: "loading", payload: "done" });
        // //
    } catch (error) {
        console.log("ERRRRRRR: ", error);
        dispatch({
            type: "add_error",
            payload: "Something went wrong =(",
        });
    }
};

const removeCredits =
    (dispatch) =>
    async ({ amount, email, token }) => {
        try {
            const res = await movieAuth.post("/remove-credits", {
                credits: amount,
                email,
                token,
            });
            // dispatch the login function because the response sends back the user object with updated credits
            dispatch({ type: "login", payload: res.data });
        } catch (error) {
            dispatch({ type: "add_error" });
        }
    };

export const { Context, Provider } = createDataContext(
    authReducer,
    {
        signIn,
        signUp,
        clearError,
        removeCredits,
        addCredits,
        addToList,
    }, // action Functions
    {
        token: null,
        credits: 0,
        email: null,
        errorMessage: "",
        loading: "",
        userMovies: [],
    } // init STATE
);
