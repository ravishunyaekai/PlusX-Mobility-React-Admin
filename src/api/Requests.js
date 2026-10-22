import axios from 'axios';
axios.defaults.baseURL                       = process.env.REACT_APP_API_URL;
axios.defaults.headers.post['Content-Type']  = 'application/json';
axios.defaults.headers.post['authorization'] = process.env.REACT_APP_Authorization;
// axios.defaults.withCredentials               = true

export const postRequest = async (URL, requestData, callback) => {
    try {
        // if (!requestData.country_code) {
        // requestData.country_code = "+91";
        //          }
        const response  = await axios.post(URL, requestData);
        // return response.data;
        

        return callback(response.data);

    } catch (err) {
        return callback({code : 500, message : 'Connection faild, please start node server'});
    }
}

export const postRequestWithFile = async (URL, requestData, callback) => {
    try {
        const response = await axios.post(URL, requestData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // return response.data;
        return callback(response.data);
    } catch (err) {
        
        return callback({code : 500, message : 'Connection faild, please start node server'});
        // throw err;
    }
};

// POST request with token
export const getRequestWithToken = async (URL, requestData, callback) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));

    if (!userDetails) {
        return callback({
            code: 401,
            message: 'Session expired. Please login again.',
        });
    }

    try {
        const response = await axios.post(URL, requestData, {
            headers: {
                accesstoken: userDetails.access_token,
                userId: userDetails.user_id,
                departmentId: userDetails.departmentId,
                'Content-Type': 'application/json',
            },
        });

        return callback(response.data);
    } catch (err) {
        return callback({
            code: err.response?.status || 500,
            message: err.response?.status === 403 ||
                     err.response?.status === 401
                ? 'Session expired. Please login again.'
                : 'Connection failed, please start node server',
        });
    }
};

// POST request with token and default country/city
export const postRequestWithToken = async (
    URL,
    requestData,
    callback
) => {
    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails') || 'null'
    );

    if (!userDetails) {
        return callback({
            code: 401,
            message: 'Session expired. Please login again.',
        });
    }

    try {
        if (!requestData.country_id && !requestData.city_id) {
            requestData.country_id = userDetails.country_id;
            requestData.city_id = userDetails.city_id;
        }

        const response = await axios.post(URL, requestData, {
            withCredentials: true,
            headers: {
                accesstoken: userDetails.access_token,
                userId: userDetails.user_id,
                departmentId: userDetails.departmentId,
                'Content-Type': 'application/json',
            },
        });

        return callback(response.data);
    } catch (err) {
        return callback({
            code: err.response?.status || 500,
            message: err.response?.status === 403 ||
                     err.response?.status === 401
                ? 'Session expired. Please login again.'
                : 'Connection failed, please start node server',
        });
    }
};

// POST request with token and file
export const postRequestWithTokenAndFile = async (URL, requestData, callback) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails')); 

    if (!userDetails) {
        return callback({
            code: 401,
            message: 'Session expired. Please login again.',
        });
    }

    try {
        if (!requestData.country_id) {
            requestData.country_id = userDetails.country_id;
        }

        if (!requestData.city_id) {
            requestData.city_id = userDetails.city_id;
        }

        const response = await axios.post(URL, requestData, {
            withCredentials: true,
            headers: {
                accesstoken: userDetails.access_token,
                userId: userDetails.user_id,
                departmentId: userDetails.departmentId,
                'Content-Type': 'multipart/form-data',
            },
        });

        return callback(response.data);
    } catch (err) {
        return callback({
            code: err.response?.status || 500,
            message: err.response?.status === 403 ||
                     err.response?.status === 401
                ? 'Session expired. Please login again.'
                : 'Connection failed, please start node server',
        });
    }
};

// Get address from latitude and longitude
export const getAddressFromLatLong = async (
    latitude,
    longitude,
    callback
) => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API Key

    const url =
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const results = response.data.results;

        if (results && results.length > 0) {
            return callback(results[0].formatted_address);
        }

        return callback('No address found');
    } catch (error) {
        console.error('Geocoding error:', error);
        return callback('No address found');
    }
};