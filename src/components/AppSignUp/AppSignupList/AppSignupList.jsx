import { useEffect, useState } from 'react';
import axios from 'axios';
import List from '../../SharedComponent/List/List'
import SubHeader from '../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../SharedComponent/Loader/Loader";
import EmptyList from '../../SharedComponent/EmptyList/EmptyList';

const SignupList = () => {
    const userDetails                     = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                        = useNavigate();
    const [signupList, setSignupList]     = useState([]);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalCount, setTotalCount]     = useState(null);
    const [filters, setFilters]           = useState({start_date: null,end_date: null});
    const [refresh, setRefresh]           = useState(false);
    const [emiratesList, setEmiratesList] = useState([]);
    const [loading, setLoading]           = useState(false);
    
    const fetchSignupUsers = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        } 

        const obj = {
            userId  : userDetails?.user_id,
            email   : userDetails?.email,
            page_no : page,
            ...appliedFilters,
        };

        postRequestWithToken('mobility-rider-list', obj, (response) => {
            if (response.code === 200) {
                setSignupList(response?.data || []);  
                setEmiratesList(response.emirates || []);
                setTotalPages(response?.total_page || 1);  
                setTotalCount(response?.total || 0)
            } else {
                toast(response.message || response.message[0], { type: 'error' });
                console.log('error inmobility-rider-list API', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchSignupUsers(currentPage, filters);
    }, [currentPage, filters, refresh]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };

    const handleDeleteSlot = (riderId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");
        if (confirmDelete) {
            const obj = { 
                userId   : userDetails?.user_id,
                email    : userDetails?.email,
                rider_id : riderId 
            };
            postRequestWithToken('delete-rider', obj, async (response) => {
                if (response.code === 200) {
                    setRefresh(prev => !prev);
                    toast(response.message[0], { type: "success" });
                } else {
                    toast(response.message, { type: 'error' });
                    console.log('error in delete-rider api', response);
                }
            });
        }
    };

    const dynamicFilters = [
        {
            label : 'Location', 
            name  : 'emirates', 
            type  : 'select', 
            options: [
                { value: '', label: 'Select Location' },
                ...emiratesList.map(emirate => ({
                    value: emirate.emirates,
                    label: emirate.emirates
                }))
            ]
        },
        {
            label : 'Device By', 
            name  : 'addedFrom', 
            type  : 'select', 
            options: [
                { value: '',        label: 'Select Device' },
                { value: 'Android', label: 'Android' },
                { value: 'iOS',     label: 'iOS' }
            ]
        },
        
    ]
    
    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

    const handleDownloadClick = async() => {
        const { start_date, end_date, emirates, addedFrom } = filters;
        
        let url = process.env.REACT_APP_SERVER_URL+'admin/user-signup-list-download';
    
        // Append query parameters only if they are not null or undefined
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        if (emirates) params.append('emirates', emirates);
        if (addedFrom) params.append('addedFrom', addedFrom);
    
        // // If any query parameters were added, append them to the URL
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await axios.get(url, { responseType: 'blob', headers : {"authorization" : process.env.REACT_APP_Authorization, } });
            // const response = axios.get(url, {
            //     responseType: 'blob',
            //     headers : {
            //         "accesstoken"  : userDetails.access_token,
            //         "userId"       : userDetails.user_id,
            //         "authorization" : process.env.REACT_APP_Authorization,                  
            //     }, 
            // });
            console.log(response.data)
            const blob = new Blob([response.data], {
                type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link    = document.createElement('a');
            link.href     = window.URL.createObjectURL(blob);
            link.download = 'user_signup_list.xlsx';
            link.click(); 
        } catch (error) {
            console.error('Error downloading file:', error);
        }      
    }

    return (
        <div className='main-container'>
            <ToastContainer/>
            <SubHeader 
                heading             = "Total App Signup List"
                fetchFilteredData   = {fetchFilteredData} 
                dynamicFilters      = {dynamicFilters} 
                filterValues        = {filters}
                searchTerm          = {searchTerm}
                count               = {totalCount}
                handleDownloadClick = {handleDownloadClick}
            />
            {loading ? <Loader /> :
                signupList.length === 0 ? 
                    <EmptyList
                    //Date Rider ID Rider Name Student /Individual Phone No. State City Action
                        // tableHeaders={["Date", "Rider ID", "Rider Name","Student /Individual" ,"Phone No." ,"State", "City" , "Action"]}
                        tableHeaders={["Date", "Customer ID", "Customer Name" ,"Phone No." ,"State", "City" , "Action"]}
                        message="No data available"
                    />
                : <>
                    <List
                        // tableHeaders={["Date", "Customer ID", "Customer Name", "Student/Individual", "Phone No.","State", "City",  "Action"]}
                        tableHeaders={["Date", "Customer ID", "Customer Name",  "Phone No.","State", "City",  "Action"]}
                       
                        pageHeading="Total App Signup List"
                        listData={signupList}
                        onDeleteSlot={handleDeleteSlot}
                        keyMapping={[
                                { 
                                    key: 'created_at', 
                                    label: 'Date', 
                                    format: (date) => moment(date).format('DD MMM YYYY') 
                                },
                                { key: 'rider_id',    label: 'Customer ID' },
                                
                                { key: 'rider_name',  label: 'Customer Name' },
                                // { key: 'account_type',  label: 'Student /Individual' },
                                
                                { key: 'rider_mobile', label: 'Phone' },
                                // { key: 'rider_email', label: 'Email' },
                                
                                { key: 'state', label: 'State' },
                                { key: 'city', label: 'City' },
                                // { key: '', label: 'City' },

                            ]}
                    />
                    
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
                </> 
            }
        </div>
    );
};


export default SignupList;
