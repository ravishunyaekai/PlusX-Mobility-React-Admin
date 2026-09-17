import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PublicCharger.module.css'
import BookingDetailsHeader from '../../SharedComponent/Details/BookingDetails/BookingDetailsHeader.jsx'
import BookingImageSection from '../../SharedComponent/Details/BookingDetails/BookingImageSection.jsx'
import BookingMultipleImages from '../../SharedComponent/Details/BookingDetails/BookingMultipleImages.jsx';
import { postRequestWithToken } from '../../../api/Requests.js';
import BookingLeftDetails from '../../SharedComponent/BookingDetails/BookingLeftDetails.jsx'
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../SharedComponent/Loader/Loader.jsx';
import EmptyList from '../../SharedComponent/EmptyList/EmptyList.jsx';
import Pagination from '../../SharedComponent/Pagination/Pagination'
import List from '../../SharedComponent/List/List.jsx';
import SubHeader from '../../SharedComponent/SubHeader/SubHeader.jsx';
// import { List } from 'rsuite';

const formatTime = (timeStr) => {
    if (timeStr === "Closed") return "Closed";
    const [start, end] = timeStr?.split('-');
    const format12Hour = (time) => {
        const [hour, minute] = time?.split(':');
        const date = new Date();
        date.setHours(hour);
        date.setMinutes(minute);

        // Format the time to always show two digits for minute and ensure AM/PM
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(':', ':');
    };

    return `${format12Hour(start)} - ${format12Hour(end)}`;
};

const getFormattedOpeningHours = (details) => {
    if (details?.always_open === 1) {
        return "Always Open";
    }
    if (!details?.open_days || !details?.open_timing) {
        return "No opening hours available";
    }
    const days = details?.open_days.split('_').map((day) => {
        // Capitalize the first letter of each day
        return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    });
    const timings = details?.open_timing.split('_').map(formatTime);

    // Check if all the timings are the same
    const allSameTimings = timings.every(time => time === timings[0]);

    if (allSameTimings) {
        // If all days have the same timings, return a consolidated range for the whole week
        return `${days[0]}-${days[days.length - 1]}: ${timings[0]}`;
    }
    // Otherwise, show each day with its corresponding timings
    const formattedOpeningHours = [];
    let i = 0;
    while (i < days.length) {
        let startDay = days[i];
        let currentTiming = timings[i];
        let j = i;

        while (j < days.length - 1 && timings[j + 1] === currentTiming) {
            j++;
        }
        const dayRange = startDay + (i === j ? "" : `-${days[j]}`);
        formattedOpeningHours.push(`${dayRange}: ${currentTiming}`);
        i = j + 1;
    }
    return formattedOpeningHours.join(', ');
};


const CommunityDetails = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const [totalCount, setTotalCount] = useState(null);
    const [totalCount2, setTotalCount2] = useState(null);
    const [filters, setFilters] = useState({ start_date: null, end_date: null });
    const dynamicFilters = [
        // { label: 'Name', name: 'search', type: 'text' },
    ]
    const navigate = useNavigate();
    const { stationId } = useParams();
    const [bookingDetails, setBookingDetails] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [imageGallery, setImageGallery] = useState();
    const [imageGalleryId, setImageGalleryId] = useState();
    const [baseUrl, setBaseUrl] = useState();
    const [loading, setLoading] = useState(false);
    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };
    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading: "Create Invoice",
        link: "/electric/community/create-invoice"
    };

    const fetchDetails = () => {
        setLoading(true);
        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            station_id: stationId
        };

        postRequestWithToken('public-charger-station-details', obj, (response) => {
            if (response.code === 200) {
                setBookingDetails(response?.data || {});
                setImageGallery(response.gallery_data)
                setImageGalleryId(response.gallery_id)
                setBaseUrl(response.base_url)
            } else {
                console.log('error in public-charger-station-details API', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchDetails();
    }, []);

    const handleRemoveGalleryImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                gallery_id: galleryId
            };
            postRequestWithToken('chargers-gallery-del', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });

                    setTimeout(() => {
                        fetchDetails();
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                }
            });
        }
    };
    const handleRemoveCoverImage = (galleryId) => {
        const confirmDelete = window.confirm("Do you want to delete this item?");
        if (confirmDelete) {
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                gallery_id: galleryId
            };
            postRequestWithToken('chargers-cover-del', obj, async (response) => {
                if (response.code === 200) {
                    toast(response.message, { type: "success" });
                    setTimeout(() => {
                        fetchDetails();
                    }, 1000);
                } else {
                    toast(response.message, { type: 'error' });
                }
            });
        }
    };
    const headerTitles = {
        bookingIdTitle: "Community ID",
        stationDetailsTitle: "Community Name",
        // feeDetailsTitle: "Price",
    };
    const sectionTitles1 = {
        managerId: "Manager Id",
        managerName: "Manager Name",
        emailId: "Email Id",
        contactNo: "Contact No",
    }
    const sectionTitles2 = {
        // chargingFor : "Charger For",
        // slotDate    : "Slot Date",
        areaName: "Area Name",
        totalResidents: "Total Residents",
        status: "Status",
    }
    const sectionTitles4 = {
        description: "Description"
    }
    const imageTitles = {
        coverImage: "Cover Gallery",
        galleryImages: "Community Gallery",
    }

    const content = {
        bookingId: bookingDetails?.station_id || "Test",
        createdAt: moment(bookingDetails?.created_at).format('DD MMM YYYY') || "Test",
        stationName: bookingDetails?.station_name || "Test",
        price: bookingDetails?.price || "Test",
        chargingPoint: bookingDetails?.charging_point || "Test",
    };
    const sectionContent1 = {
        managerId: bookingDetails?.address || "test",
        managerName: bookingDetails?.charger_type || "test",
        emailId: bookingDetails?.charging_for || "test",
        contactNo: bookingDetails?.contact_no || "test"
    }
    const sectionContent2 = {
        // slotDate     : moment(bookingDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
        areaName: bookingDetails?.area_name || "Test",
        totalResidents: bookingDetails?.total_residents || 0,
        status: bookingDetails?.status === 1 ? "Active" : "Un-Active",
    }
    const sectionContent4 = {
        description: bookingDetails?.description,
    }
    const imageContent = {
        coverImage: bookingDetails?.station_image,
        galleryImages: imageGallery,
        galleryImagesId: imageGalleryId,
        baseUrl: baseUrl,
        // slotDate        : moment(bookingDetails?.slot_date_time).format('DD MMM YYYY h:mm A'),
    }
    return (
        <div className='main-container'>
            <ToastContainer />
            {loading ? <Loader /> :
                <>
                    <BookingDetailsHeader content={content} titles={headerTitles} type='communityDetails' />
                    <div className={styles.ChargerDetailsSection}>
                        <BookingLeftDetails titles={sectionTitles1} content={sectionContent1} sectionTitles2={{}} sectionContent2={{}}
                            sectionTitles4={{}} sectionContent4={{}} type='communityDetails' />
                        <BookingLeftDetails titles={sectionTitles2} content={sectionContent2} sectionTitles2={{}} sectionContent2={{}}
                            sectionTitles4={{}} sectionContent4={{}} type='communityDetails' />
                    </div>
                    <SubHeader heading="Charger List"
                        addButtonProps={addButtonProps}
                        fetchFilteredData={fetchFilteredData}
                        dynamicFilters={dynamicFilters} filterValues={filters}
                        searchTerm={searchTerm}
                        count={totalCount}
                    />
                    {
                        [].length === 0 ? (
                            <EmptyList
                                tableHeaders={["Sr No", "Charger Id", "KW",]}
                                message="No data available"
                            />
                        ) : (
                            <>
                                <List
                                    tableHeaders={["Sr No", "Charger Id", "KW",]}
                                    listData={[]}
                                    pageHeading="Charger List"
                                    onDeleteSlot={{}}
                                    keyMapping={[
                                        { key: 'station_name', label: 'Sr No' },
                                        { key: 'charging_for', label: 'Charger Id' },
                                        { key: 'charger_type', label: 'KW' },
                                    ]}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={{}}
                                />
                            </>
                        )
                    }
                    <SubHeader heading="Resident List"
                        addButtonProps={addButtonProps}
                        fetchFilteredData={fetchFilteredData}
                        dynamicFilters={dynamicFilters} filterValues={filters}
                        searchTerm={searchTerm}
                        count={totalCount2}
                    />
                    {
                        [].length === 0 ? (
                            <EmptyList
                                tableHeaders={["Sr No", "Redident Id", "Mobile", "Email", "Session Allocated", "Session Used", "kWh Allocated", "kWh Used", "Action"]}
                                message="No data available"
                            />
                        ) : (
                            <>
                                <List
                                    tableHeaders={["Sr No", "Redident Id", "Mobile", "Email", "Session Allocated", "Session Used", "kWh Allocated", "kWh Used", "Action"]}
                                    listData={[]}
                                    pageHeading="Resident List"
                                    onDeleteSlot={{}}
                                    keyMapping={[
                                        { key: 'station_name', label: 'Sr No' },
                                        { key: 'charging_for', label: 'Charger Id' },
                                        { key: 'charger_type', label: 'KW' },
                                    ]}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={{}}
                                />
                            </>
                        )
                    }
                </>
            }
        </div>
    )
}

export default CommunityDetails