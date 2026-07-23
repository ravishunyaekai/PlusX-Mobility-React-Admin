import { useEffect, useState } from 'react';
import List from '../../../SharedComponent/List/List'
import styles from './addpackage.module.css';
import SubHeader from '../../../SharedComponent/SubHeader/SubHeader'
import Pagination from '../../../SharedComponent/Pagination/Pagination'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { getRequestWithToken, postRequestWithToken } from '../../../../api/Requests';
import Loader from "../../../SharedComponent/Loader/Loader";
import EmptyList from '../../../SharedComponent/EmptyList/EmptyList';
import { FiEdit2 } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import AddEditChargingPackage from "./AddChargingPackage";

const ChargingPackageList = () => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    const navigate = useNavigate();
    const [chargerList, setChargerList] = useState([]);
    const [editingData, setEditingData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(null);
    const [filters, setFilters] = useState({ start_date: null, end_date: null });
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(false);

    //     const initialForm = {
    //     package_name: "",
    //     charging_capacity: "",
    //     price_per_unit: "",
    //     service_fee: ""
    // };

    // const [formData, setFormData] = useState(initialForm);
    // const [editingId, setEditingId] = useState(null);

    // const handleEdit = (row) => {
    //     setEditingId(row.package_id);

    //     setFormData({
    //         package_name: row.package_name,
    //         charging_capacity: row.charging_capacity,
    //         price_per_unit: row.price_per_unit,
    //         service_fee: row.service_fee,
    //     });

    //     window.scrollTo({
    //         top: document.body.scrollHeight,
    //         behavior: "smooth",
    //     });
    // };
    const handleEdit = (row) => {
        console.log("Row =>", row);

        setEditingData(row);

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    };
    const searchTerm = [
        {
            label: 'search',
            name: 'search_text',
            type: 'text'
        }
    ]
    const addButtonProps = {
        heading: "Add New Package",
        onClick: () => {

            setEditingData(null);

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });

        }
    };
    const fetchPackages = (page, appliedFilters = {}) => {
        if (page === 1 && Object.keys(appliedFilters).length === 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            page_no: page,
            ...appliedFilters,
        };

        postRequestWithToken('charging-package-list', obj, (response) => {
            if (response.code === 200) {
                setChargerList(response?.data || []);
                setTotalPages(response?.total_page || 1);
                setTotalCount(response?.total || 0)
            } else {
                console.log('error in charging-package-list API', response);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!userDetails || !userDetails.access_token) {
            navigate('/login');
            return;
        }
        fetchPackages(currentPage, filters);
    }, [currentPage, filters, refresh]);

    const fetchFilteredData = (newFilters = {}) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };



    const handleDeleteSlot = (packageId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this?");

        if (confirmDelete) {
            const obj = {
                userId: userDetails?.user_id,
                email: userDetails?.email,
                package_id: packageId
            };

            postRequestWithToken("delete-charging-package", obj, (response) => {
                if (response.code === 200) {
                    setRefresh(prev => !prev);
                    toast.success(response.message);

                    setTimeout(() => {
                        fetchPackages(currentPage);
                    }, 1000);
                } else {
                    toast.error(response.message);
                }
            });
        }
    };

    return (
        <div className='main-container'>
<SubHeader
    heading="Home EV Charging Package List"
    addButtonProps={addButtonProps}
    filterValues={filters}
    fetchFilteredData={fetchFilteredData}
    searchTerm={searchTerm}
    count={totalCount}
    hideSearch={true}
    hideFilter={true}
/>
            <ToastContainer />

            {loading ? <Loader /> :
                chargerList.length === 0 ? (
                    <EmptyList
                        tableHeaders={["Package Name", "Charging Capacity(KW)", "Price Per Unit", "Service Fee", "Status", "Action"]}
                        message="No data available"
                    />
                ) : (
                    <>
                        <List
                            tableHeaders={["Package Name", "Charging Capacity(KW)", "Price Per Unit", "Service Fee", "Status", "Action"]}
                            pageHeading="Home EV Charging Package List"
                            listData={chargerList}
                            onDeleteSlot={handleDeleteSlot}
                            keyMapping={[
                                {
                                    key: "package_name",
                                    label: "Package Name"
                                },
                                {
                                    key: "charging_capacity",
                                    label: "Charging Capacity(KW)",
                                    format: (value) => `${value} kW`
                                },
                                {
                                    key: "price_per_unit",
                                    label: "Price Per Unit",
                                    format: (value) => `₹${value}`
                                },
                                {
                                    key: "service_fee",
                                    label: "Service Fee",
                                    format: (value) => `₹${value}`
                                },
                                {
                                    key: "status",
                                    label: "Status",
                                    format: (status) => (
                                        <span className={styles.activeBadge}>
                                            {status === 1 ? "Active" : "Inactive"}
                                        </span>
                                    )
                                },
                                {
                                    key: "package_id",
                                    label: "Action",
                                    format: (_, row) => (
                                        <div className={styles.actionBtn}>
                                            <button onClick={() => handleEdit(row)}>
                                                <FiEdit2 />
                                            </button>

                                            <button onClick={() => handleDeleteSlot(row.package_id)}>
                                                <RiDeleteBinLine />
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                        />
                        <AddEditChargingPackage
                            editingData={editingData}
                            userDetails={userDetails}
                            refreshList={() => setRefresh(prev => !prev)}
                            clearEdit={() => setEditingData(null)}
                        />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
        </div>
    );
};


export default ChargingPackageList;
