import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postRequestWithToken } from "../api/Requests";

export const fetchDashboardDetails = createAsyncThunk( "dashboard/fetchDashboardDetails",
    async (_, { rejectWithValue }) => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        const requestData = {
            userId : userDetails?.user_id,
            email  : userDetails?.email,
        };
        try {
            const response = await new Promise((resolve) => {
                postRequestWithToken("dashboard", requestData, resolve);
            });
            if (response.logout === 1) {
                sessionStorage.clear();
                localStorage.clear();
            }
            if (response.code === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (error) {
            return rejectWithValue("Connection failed, please start node server");
        }
    }
);

const dashboardSlice = createSlice({
    name         : "dashboard",
    initialState : {
        details         : [],
        activeCardIndex : null,
        timeRange       : "Weekly",
        status          : "idle",
        error           : null,
    },
    reducers : {
        setActiveCardIndex(state, action) {
            state.activeCardIndex = action.payload;
        },
        setTimeRange(state, action) {
            state.timeRange = action.payload;
        },
    },
    extraReducers : (builder) => {
        builder.addCase(fetchDashboardDetails.pending, (state) => {
            state.status = "loading";
        })
        .addCase(fetchDashboardDetails.fulfilled, (state, action) => {
            state.status  = "succeeded";
            state.details = action.payload;
        })
        .addCase(fetchDashboardDetails.rejected, (state, action) => {
            state.status = "failed";
            state.error  = action.payload;
        });
    },
});

export const { setActiveCardIndex, setTimeRange  } = dashboardSlice.actions;
export default dashboardSlice.reducer;
