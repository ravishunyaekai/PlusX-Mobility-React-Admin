import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAxiosInterceptor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let isLoggingOut = false;

        const logout = () => {
            if (isLoggingOut) return;

            isLoggingOut = true;

            sessionStorage.clear();
            localStorage.removeItem('buyer_token');

            navigate('/login', { replace: true });
        };

        const interceptorId = axios.interceptors.response.use(
            (response) => {
                const status = response.data?.status;

                if (status === 403 || status === 401) {
                    logout();
                }

                return response;
            },
            (error) => {
                const status = error.response?.status;

                if (status === 403 || status === 401) {
                    logout();
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptorId);
        };
    }, [navigate]);
};

export default useAxiosInterceptor;
