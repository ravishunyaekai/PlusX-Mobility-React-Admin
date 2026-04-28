import { useEffect, useState } from 'react';
import axios from 'axios';
import List from '../../../SharedComponent/List/List'
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { postRequestWithToken } from '../../../../api/Requests';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';

const StudentList = () => {
    const userDetails                             = JSON.parse(sessionStorage.getItem('userDetails')); 
    const navigate                                = useNavigate();
    const [studentList, setStudentList]           = useState([]);
    const [currentPage, setCurrentPage]           = useState(1);
    const [totalPages, setTotalPages]             = useState(1);
    const [totalCount, setTotalCount]             = useState(null);
    const [filters, setFilters]                   = useState({start_date: null,end_date: null});
    const [loading, setLoading]                   = useState(false);
    const [dynamicFilters, setDynamicFilters]     = useState([
        { label  : 'University', name   : 'university_id', type   : 'select', options: [] },
        { label  : 'State',      name   : 'state_id',      type   : 'select', options: [] },
        { label  : 'City',       name   : 'city_id',       type   : 'select', options: [] },
    ]);
    const [loadingFilters, setLoadingFilters] = useState({ university_id: false, state_id: false, city_id: false });

    const userObj = {
        userId      : userDetails?.user_id,
        email       : userDetails?.email,
        country_id  :userDetails?.country_id,
    };

    const searchTerm = [
        {
            label : 'search', 
            name  : 'search_text', 
            type  : 'text'
        }
    ]

    const addButtonProps = {
        heading : "Add Student",
        link    : "/mobility/universities/add-student"
    };

    function getStates() {
        setLoadingFilters(prev => ({ ...prev, state_id: true }));
        postRequestWithToken('state-country-list', { ...userObj, requirement: "state" }, (response) => {
            if (response.code === 200) {
                const stateList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.state_id
                }));

                setDynamicFilters(prev =>
                    prev.map(f => f.name === 'state_id' ? { ...f, options: stateList } : f )
                );
                setLoadingFilters(prev => ({ ...prev, state_id: false }));
            } else {
                console.log('error in state-country-list API', response);
                setLoadingFilters(prev => ({ ...prev, state_id: false }));
            }
        });
    }
    
    function getCities(stateId) {
        setLoadingFilters(prev => ({ ...prev, city_id: true }));
        postRequestWithToken('state-country-list', { ...userObj, requirement: "city", station_state_id: stateId }, (response) => {
            if (response.code === 200) {
                const cityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.city_id
                }));

                setDynamicFilters(prev =>
                    prev.map(f => f.name === 'city_id' ? { ...f, options: cityList } : f )
                );
                setLoadingFilters(prev => ({ ...prev, city_id: false }));
            } else {
                console.log('error in state-country-city-list API', response);
                setLoadingFilters(prev => ({ ...prev, city_id: false }));
            }
        });
    }
    
    function getUniversities() {
        setLoadingFilters(prev => ({ ...prev, university_id: true }));
        postRequestWithToken('university-list-for-select', { ...userObj, requirement: "university" }, (response) => {
            if (response.code === 200) {
                const universityList = (response?.data || []).map(item => ({
                    label: item.name,
                    value: item.university_id
                }));

                setDynamicFilters(prev =>
                    prev.map(f => f.name === 'university_id' ? { ...f, options: universityList } : f )
                );
                setLoadingFilters(prev => ({ ...prev, university_id: false }));
            } else {
                console.log('error in university-list API', response);
                setLoadingFilters(prev => ({ ...prev, university_id: false }));
            }
        });
    }

    function handleStateChange(selectedState) {
        if (selectedState) {
            getCities(selectedState);
        }
    }

    function handleFilterChange(name, value) {
        console.log("name",name)
        if (name === 'university_id_open') {
            getUniversities();
        }
        else if (name === 'state_id_open') {
            getStates();
        }
        else if (name === 'state_id') {
            handleStateChange(value);
        }
    }
    
    const fetchStudentsList = (page, appliedFilters = {}) => {
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

        postRequestWithToken('student-list', obj, (response) => {
            if (response.code === 200) {
                setStudentList(response?.data || []);  
                setTotalPages(response?.total_page || 1);  
                setTotalCount(response?.total || 0)
            } else {
                toast(response.message || response.message[0], { type: 'error' });
                console.log('error in student-list API', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login'); 
            return; 
        }
        fetchStudentsList(currentPage, filters);
    }, [currentPage, filters]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);  
        setCurrentPage(1); 
    };
    
    return (
        <div className='main-container'>
            <ToastContainer/>
            <SubHeader 
                heading             = "List of Students"
                addButtonProps      = {addButtonProps}
                fetchFilteredData   = {fetchFilteredData} 
                dynamicFilters      = {dynamicFilters} 
                filterValues        = {filters}
                searchTerm          = {searchTerm}
                count               = {totalCount}
                onFilterChange      = {handleFilterChange}
                isLoading           = {loadingFilters}
                // handleDownloadClick = {handleDownloadClick}
            />
            {loading ? <Loader /> :
                studentList.length === 0 ? 
                    <EmptyList
                        tableHeaders={["Student ID", "Student Name",  "University Name","State", "City",  "Action"]}
                        message="No data available"
                    />
                : <>
                    <List
                        tableHeaders={["Student ID", "Student Name",  "University Name","State", "City",  "Action"]}
                        pageHeading="List of Students"
                        listData={studentList}
                        // onDeleteSlot={handleDeleteSlot}
                        keyMapping={[
                                // { 
                                //     key: 'created_at', 
                                //     label: 'Date', 
                                //     format: (date) => moment(date).format('DD MMM YYYY') 
                                // },
                                { key: 'rider_id',    label: 'Student ID' },
                                { key: 'rider_name',  label: 'Student Name' },
                                { key: 'university',  label: 'University Name' },
                                { key: 'state', label: 'State' },
                                { key: 'city', label: 'City' },
                            ]}
                    />
                    
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </> 
            }
        </div>
    );
};


export default StudentList;
