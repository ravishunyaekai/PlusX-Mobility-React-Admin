import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    toast,
    ToastContainer,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithToken,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

import CustomDropdown, { CustomDropdownForResidents } from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";


const AddInvoice = () => {
    const navigate = useNavigate();

    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails")
    );

    // =========================================================
    // COMMUNITY
    // =========================================================

    const [community, setCommunity] = useState(null);

    const [communityOptions, setCommunityOptions] =
        useState([]);

    const [communityLoading, setCommunityLoading] =
        useState(false);


    // =========================================================
    // AREA
    // =========================================================

    const [area, setArea] = useState(null);

    const [areaOptions, setAreaOptions] =
        useState([]);

    const [areaLoading, setAreaLoading] =
        useState(false);


    // =========================================================
    // RESIDENT
    // =========================================================

    const [resident, setResident] = useState(null);

    const [residentOptions, setResidentOptions] =
        useState([]);

    const [residentLoading, setResidentLoading] =
        useState(false);

    const [residentSearch, setResidentSearch] =
        useState("");

    /*
     * Used to prevent unnecessary duplicate API calls
     * when react-select fires onInputChange multiple times.
     */
    const residentSearchRef = useRef("");


    // =========================================================
    // BILLING MONTH
    // =========================================================

    const [billingMonth, setBillingMonth] =
        useState(() => {
            const date = new Date();

            const year =
                date.getFullYear();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            return `${year}-${month}`;
        });


    // =========================================================
    // INVOICE DETAILS
    // =========================================================

    const [invoiceData, setInvoiceData] =
        useState({
            residentName: "",
            kwhUsed: "",
            kwhAllocated: "",
            energyCharge: "",
            overTime: "",
            totalAmount: "",
        });


    // =========================================================
    // GENERAL STATE
    // =========================================================

    const [errors, setErrors] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [invoiceLoading, setInvoiceLoading] =
        useState(false);


    // =========================================================
    // AUTHENTICATION
    // =========================================================

    useEffect(() => {
        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate("/login");
        }
    }, [navigate]);


    // =========================================================
    // CLEAR INVOICE DATA
    // =========================================================

    const clearInvoiceData = () => {
        setInvoiceData({
            residentName: "",
            kwhUsed: "",
            kwhAllocated: "",
            energyCharge: "",
            overTime: "",
            totalAmount: "",
        });
    };


    // =========================================================
    // GET ALL COMMUNITY LIST
    // =========================================================

    const getAllCommunityList = () => {
        if (!userDetails?.user_id) {
            return;
        }

        setCommunityLoading(true);

        const obj = {
            userId:
                userDetails.user_id,

            email:
                userDetails.email,
        };

        console.log(
            "all-community-list request:",
            obj
        );

        postRequestWithToken(
            "all-community-list",
            obj,
            (response) => {
                console.log(
                    "all-community-list response:",
                    response
                );

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    const options =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];

                    setCommunityOptions(
                        options
                    );
                } else {
                    setCommunityOptions([]);

                    toast.error(
                        response?.message ||
                        "Unable to fetch community list."
                    );
                }

                setCommunityLoading(false);
            }
        );
    };


    // =========================================================
    // GET COMMUNITY AREA LIST
    // =========================================================

    const getCommunityAreaList = (
        selectedCommunity
    ) => {
        if (
            !selectedCommunity?.label ||
            !userDetails?.user_id
        ) {
            setAreaOptions([]);
            setArea(null);

            return;
        }

        setAreaLoading(true);

        setArea(null);
        setAreaOptions([]);

        const obj = {
            userId:
                userDetails.user_id,

            email:
                userDetails.email,

            community:
                selectedCommunity.label,
        };

        console.log(
            "community-area-list request:",
            obj
        );

        postRequestWithToken(
            "community-area-list",
            obj,
            (response) => {
                console.log(
                    "community-area-list response:",
                    response
                );

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    const options =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];

                    setAreaOptions(
                        options
                    );

                    if (
                        options.length === 0
                    ) {
                        toast.info(
                            "No areas found for this community."
                        );
                    }
                } else {
                    setAreaOptions([]);
                    setArea(null);

                    toast.error(
                        response?.message ||
                        "Unable to fetch area list."
                    );
                }

                setAreaLoading(false);
            }
        );
    };


    // =========================================================
    // RESIDENT SEARCH API
    // =========================================================

    const searchResidents = (
        searchValue
    ) => {
        if (
            !community?.value ||
            !userDetails?.user_id
        ) {
            setResidentOptions([]);

            return;
        }

        const search =
            searchValue?.trim() || "";

        /*
         * Don't search with empty value.
         */
        if (!search) {
            setResidentOptions([]);

            return;
        }

        /*
         * Prevent duplicate request for exactly
         * the same search text.
         */
        if (
            residentSearchRef.current ===
            search
        ) {
            return;
        }

        residentSearchRef.current =
            search;

        setResidentLoading(true);

        const obj = {
            userId:
                userDetails.user_id,

            email:
                userDetails.email,

            search,

            community_id:
                community.value,
        };

        console.log(
            "resident-search request:",
            obj
        );

        postRequestWithToken(
            "resident-search",
            obj,
            (response) => {
                console.log(
                    "resident-search response:",
                    response
                );

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    const residents =
                        Array.isArray(
                            response?.data
                        )
                            ? response.data
                            : [];

                    /*
                     * Convert backend residents
                     * into react-select options.
                     */
                    // const options =
                    //     residents.map(
                    //         (item) => ({
                    //             value:
                    //                 item.resident_id,

                    //             label:
                    //                 `${item.resident_id} - ${item.resident_name} - ${item.resident_mobile}`,

                    //             resident_id:
                    //                 item.resident_id,

                    //             resident_name:
                    //                 item.resident_name,

                    //             resident_mobile:
                    //                 item.resident_mobile,

                    //             residentData:
                    //                 item,
                    //         })
                    //     );
                    const options = residents.map((item) => ({
                        value: item.resident_id,

                        label: item.resident_id,

                        resident_id: item.resident_id,
                        resident_name: item.resident_name,
                        resident_mobile: item.resident_mobile,

                        residentData: item,
                    }));

                    setResidentOptions(
                        options
                    );
                } else {
                    setResidentOptions([]);

                    if (
                        response?.message
                    ) {
                        toast.error(
                            response.message
                        );
                    }
                }

                setResidentLoading(false);
            }
        );
    };


    // =========================================================
    // RESIDENT SEARCH INPUT CHANGE
    // =========================================================

    const handleResidentSearch = (
        inputValue,
        actionMeta
    ) => {
        /*
         * Only perform API search when the user
         * actually types something.
         */
        if (
            actionMeta?.action !== "input-change"
        ) {
            return inputValue;
        }

        const value = inputValue || "";

        setResidentSearch(value);

        /*
         * IMPORTANT:
         *
         * react-select automatically clears its internal
         * search input after an option is selected.
         *
         * Do NOT clear residentOptions here if a resident
         * has already been selected.
         */
        if (!value.trim()) {
            residentSearchRef.current = "";

            if (!resident) {
                setResidentOptions([]);
            }

            return value;
        }

        searchResidents(value);

        return value;
    };


    // =========================================================
    // RESIDENT CHANGE
    // =========================================================

    const handleResidentChange = (
        selectedOption
    ) => {
        console.log(
            "Selected Resident:",
            selectedOption
        );

        /*
         * Save selected resident.
         */
        setResident(selectedOption);

        /*
         * Clear validation errors.
         */
        setErrors((prev) => ({
            ...prev,
            resident: "",
            residentName: "",
        }));

        /*
         * Immediately populate resident name.
         *
         * This happens before the invoice API response.
         */
        setInvoiceData({
            residentName:
                selectedOption?.resident_name || "",

            kwhUsed: "",
            kwhAllocated: "",
            energyCharge: "",
            overTime: "",
            totalAmount: "",
        });

        if (selectedOption) {

            /*
             * Keep selected resident in options.
             */
            setResidentOptions((prev) => {
                const exists = prev.some(
                    (item) =>
                        item.resident_id ===
                        selectedOption.resident_id
                );

                if (exists) {
                    return prev;
                }

                return [
                    selectedOption,
                    ...prev,
                ];
            });

            /*
             * Fetch invoice data.
             *
             * IMPORTANT:
             * Pass resident name directly.
             * Don't wait for resident state to update.
             */
            if (
                billingMonth &&
                selectedOption.resident_mobile
            ) {
                getInvoiceData(
                    billingMonth,
                    selectedOption.resident_mobile,
                    selectedOption.resident_name
                );
            }
        }
    };

    // =========================================================
    // GET INVOICE DATA
    // =========================================================

    const getInvoiceData = (
        selectedMonth = billingMonth,
        selectedResidentMobile = resident?.resident_mobile,
        selectedResidentName = resident?.resident_name
    ) => {
        if (
            !selectedMonth ||
            !selectedResidentMobile ||
            !userDetails?.user_id
        ) {
            clearInvoiceData();

            return;
        }

        setInvoiceLoading(true);

        /*
         * HTML month:
         *
         * 2026-09
         *
         * Backend:
         *
         * 2026-09-01
         */
        const invoiceDate =
            `${selectedMonth}-01`;

        const obj = {
            userId:
                userDetails.user_id,

            email:
                userDetails.email,

            resident_mobile:
                selectedResidentMobile,

            invoice_month:
                invoiceDate,
        };

        console.log(
            "get-invoice-data request:",
            obj
        );

        postRequestWithToken(
            "get-invoice-data",
            obj,
            (response) => {
                console.log(
                    "get-invoice-data response:",
                    response
                );

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    const data =
                        response?.data || {};

                    /*
                     * IMPORTANT:
                     *
                     * Use the resident name passed to this
                     * function instead of resident state.
                     *
                     * This prevents the name from becoming
                     * empty because setResident() is async.
                     */
                    const updatedResidentName =
                        data?.resident_name ||
                        selectedResidentName ||
                        "";

                    setInvoiceData({
                        residentName:
                            updatedResidentName,

                        kwhUsed:
                            data?.total_consumption ??
                            "",

                        kwhAllocated:
                            data?.kwh_allocated ??
                            "",

                        energyCharge:
                            data?.energy_price ??
                            "",

                        overTime:
                            data?.extra_charge ??
                            "",

                        totalAmount:
                            data?.total_amount ??
                            "0.00",
                    });

                    setErrors((prev) => ({
                        ...prev,

                        residentName: "",
                        kwhUsed: "",
                        kwhAllocated: "",
                        energyCharge: "",
                        overTime: "",
                    }));
                } else {
                    /*
                     * Don't remove the selected resident name
                     * when invoice data isn't available.
                     */
                    setInvoiceData({
                        residentName:
                            selectedResidentName || "",

                        kwhUsed: "",
                        kwhAllocated: "",
                        energyCharge: "",
                        overTime: "",
                        totalAmount: "",
                    });

                    toast.error(
                        response?.message ||
                        "Unable to fetch invoice data."
                    );
                }

                setInvoiceLoading(false);
            }
        );
    };


    // =========================================================
    // LOAD COMMUNITY LIST
    // =========================================================

    useEffect(() => {
        if (
            userDetails?.user_id &&
            userDetails?.access_token
        ) {
            getAllCommunityList();
        }
    }, []);


    // =========================================================
    // COMMUNITY CHANGE
    // =========================================================

    const handleCommunityChange = (
        selectedOption
    ) => {
        console.log(
            "Selected Community:",
            selectedOption
        );

        setCommunity(selectedOption);

        // Reset area
        setArea(null);
        setAreaOptions([]);

        // Reset resident
        setResident(null);
        setResidentOptions([]);
        setResidentSearch("");
        residentSearchRef.current = "";

        // Reset invoice
        clearInvoiceData();

        setErrors((prev) => ({
            ...prev,
            community: "",
            area: "",
            resident: "",
            residentName: "",
        }));

        if (selectedOption) {
            getCommunityAreaList(
                selectedOption
            );
        }
    };


    // =========================================================
    // AREA CHANGE
    // =========================================================

    const handleAreaChange = (
        selectedOption
    ) => {
        console.log(
            "Selected Area:",
            selectedOption
        );

        setArea(
            selectedOption
        );

        setErrors((prev) => ({
            ...prev,
            area: "",
        }));
    };


    // =========================================================
    // RESIDENT NAME CHANGE
    // =========================================================

    const handleResidentNameChange = (
        e
    ) => {
        const value =
            e.target.value;

        setInvoiceData((prev) => ({
            ...prev,
            residentName:
                value,
        }));

        setErrors((prev) => ({
            ...prev,
            residentName: "",
        }));
    };


    // =========================================================
    // BILLING MONTH CHANGE
    // =========================================================

    const handleBillingMonthChange = (e) => {
        const value = e.target.value;

        setBillingMonth(value);

        setErrors((prev) => ({
            ...prev,
            billingMonth: "",
        }));

        if (
            value &&
            resident?.resident_mobile
        ) {
            getInvoiceData(
                value,
                resident.resident_mobile,
                resident.resident_name
            );
        }
    };

    // =========================================================
    // INVOICE FIELD CHANGE
    // =========================================================

    const handleInvoiceChange = (
        field,
        value
    ) => {
        setInvoiceData((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };


    // =========================================================
    // NUMERIC INPUT
    // =========================================================

    const handleNumericChange = (
        field,
        value
    ) => {
        if (
            /^\d*\.?\d*$/.test(
                value
            )
        ) {
            handleInvoiceChange(
                field,
                value
            );
        }
    };


    // =========================================================
    // TOTAL
    // =========================================================

    const calculateTotal = () => {
        return (
            invoiceData.totalAmount ||
            "0.00"
        );
    };


    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        if (!community?.value) {
            newErrors.community =
                "Community is required.";
        }

        if (!area?.value) {
            newErrors.area =
                "Area is required.";
        }

        if (!resident?.resident_id) {
            newErrors.resident =
                "Resident is required.";
        }

        if (!invoiceData.residentName?.trim()) {
            newErrors.residentName =
                "Resident Name is required.";
        }

        if (!billingMonth) {
            newErrors.billingMonth =
                "Billing Month is required.";
        }

        if (!invoiceData.kwhUsed) {
            newErrors.kwhUsed =
                "kWh Used is required.";
        }

        if (!invoiceData.kwhAllocated) {
            newErrors.kwhAllocated =
                "kWh Allocated is required.";
        }

        if (!invoiceData.energyCharge) {
            newErrors.energyCharge =
                "Energy Charge is required.";
        }

        if (!invoiceData.overTime) {
            newErrors.overTime =
                "Over Time is required.";
        }

        setErrors(
            newErrors
        );

        return (
            Object.keys(
                newErrors
            ).length === 0
        );
    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = (
        e
    ) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error(
                "Some fields are missing."
            );

            return;
        }

        setLoading(true);

        const invoiceDate =
            `${billingMonth}-01`;

        const payload = {
            userId:
                userDetails?.user_id ||
                "",

            email:
                userDetails?.email ||
                "",

            community:
                community?.value ||
                "",

            area:
                area?.value ||
                "",

            /*
             * Actual resident ID.
             */
            resident_id:
                resident?.resident_id ||
                "",

            /*
             * Resident mobile can also be
             * sent if your create-invoice
             * API needs it.
             */
            resident_mobile:
                resident?.resident_mobile ||
                "",

            resident_name:
                invoiceData.residentName ||
                resident?.resident_name ||
                "",

            billing_month:
                invoiceDate,

            kwh_used:
                invoiceData.kwhUsed,

            kwh_allocated:
                invoiceData.kwhAllocated,

            energy_charge:
                invoiceData.energyCharge,

            over_time:
                invoiceData.overTime,

            total_amount:
                calculateTotal(),
        };

        console.log(
            "Create Invoice Payload =>",
            payload
        );


        // =====================================================
        // CREATE INVOICE API
        // =====================================================

        /*
        postRequestWithToken(
            "create-invoice",
            payload,
            (response) => {
                console.log(
                    "create-invoice response:",
                    response
                );

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    toast.success(
                        response?.message ||
                        "Invoice created successfully."
                    );

                    setTimeout(() => {
                        setLoading(false);

                        navigate(
                            "/electric/community-charger/invoice"
                        );
                    }, 1000);
                } else {
                    toast.error(
                        response?.message ||
                        "Something went wrong."
                    );

                    setLoading(false);
                }
            }
        );
        */


        // Temporary UI testing
        setTimeout(() => {
            setLoading(false);

            toast.success(
                "Invoice submitted successfully."
            );
        }, 500);
    };


    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {
        navigate(-1);
    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className={
                styles.addStationContainer
            }
        >
            <ToastContainer />

            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <div
                className={
                    styles.invoicePageTitle
                }
            >
                Create Invoice
            </div>


            {/* =================================================
                FORM SECTION
            ================================================= */}

            <div
                className={
                    styles.addStationFormSection
                }
            >
                <form
                    className={
                        styles.formSection
                    }
                    onSubmit={
                        handleSubmit
                    }
                >

                    {/* =================================================
                        COMMUNITY + AREA
                    ================================================= */}

                    <div
                        className={
                            styles.invoiceTopRow
                        }
                    >

                        {/* COMMUNITY */}

                        <div
                            className={
                                styles.invoiceField
                            }
                        >
                            <label
                                htmlFor="community"
                                className={
                                    styles.labelText
                                }
                            >
                                Community
                            </label>

                            <CustomDropdown
                                options={
                                    communityOptions
                                }
                                value={
                                    community
                                }
                                onChange={
                                    handleCommunityChange
                                }
                                placeholder="Select Community"
                                isLoading={
                                    communityLoading
                                }
                            />

                            {errors.community && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        errors.community
                                    }
                                </p>
                            )}
                        </div>


                        {/* AREA */}

                        <div
                            className={
                                styles.invoiceField
                            }
                        >
                            <label
                                htmlFor="area"
                                className={
                                    styles.labelText
                                }
                            >
                                Area
                            </label>

                            <CustomDropdown
                                options={
                                    areaOptions
                                }
                                value={
                                    area
                                }
                                onChange={
                                    handleAreaChange
                                }
                                placeholder={
                                    community
                                        ? "Select Area"
                                        : "Select Community First"
                                }
                                isLoading={
                                    areaLoading
                                }
                                isDisabled={
                                    !community ||
                                    areaLoading
                                }
                            />

                            {errors.area && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        errors.area
                                    }
                                </p>
                            )}
                        </div>
                    </div>


                    {/* =================================================
                        RESIDENT + BILLING MONTH
                    ================================================== */}

                    <div
                        className={
                            styles.invoiceResidentRow
                        }
                    >

                        {/* =================================================
                            RESIDENT DROPDOWN
                        ================================================= */}

                        <div
                            className={
                                styles.invoiceField
                            }
                        >
                            <label
                                htmlFor="resident"
                                className={
                                    styles.labelText
                                }
                            >
                                Resident
                            </label>

                            <CustomDropdownForResidents
                                options={
                                    residentOptions
                                }
                                value={
                                    resident
                                }
                                onChange={
                                    handleResidentChange
                                }
                                onInputChange={
                                    handleResidentSearch
                                }
                                placeholder={
                                    community
                                        ? "Search Resident ID / Name / Mobile"
                                        : "Select Community First"
                                }
                                isLoading={
                                    residentLoading
                                }
                                isDisabled={
                                    !community
                                }
                            />

                            {errors.resident && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        errors.resident
                                    }
                                </p>
                            )}
                        </div>


                        {/* =================================================
                            RESIDENT NAME
                        ================================================= */}

                        <div
                            className={
                                styles.invoiceField
                            }
                        >
                            <label
                                htmlFor="residentName"
                                className={
                                    styles.labelText
                                }
                            >
                                Resident Name
                            </label>

                            <input
                                type="text"
                                id="residentName"
                                autoComplete="off"
                                placeholder="Resident Name"
                                value={
                                    invoiceData.residentName
                                }
                                onChange={
                                    handleResidentNameChange
                                }
                                className={
                                    styles.inputField
                                }
                            />

                            {errors.residentName && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        errors.residentName
                                    }
                                </p>
                            )}
                        </div>


                        {/* =================================================
                            BILLING MONTH
                        ================================================= */}

                        <div
                            className={
                                styles.invoiceField
                            }
                        >
                            <label
                                htmlFor="billingMonth"
                                className={
                                    styles.labelText
                                }
                            >
                                Billing Month
                            </label>

                            <input
                                type="month"
                                id="billingMonth"
                                value={
                                    billingMonth
                                }
                                onChange={
                                    handleBillingMonthChange
                                }
                                className={
                                    styles.inputField
                                }
                            />

                            {errors.billingMonth && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        errors.billingMonth
                                    }
                                </p>
                            )}
                        </div>
                    </div>


                    {/* =================================================
                        INVOICE DETAILS
                    ================================================= */}

                    <div
                        className={
                            styles.invoiceDetailsSection
                        }
                    >

                        {/* RESIDENT NAME */}

                        <div
                            className={
                                styles.invoiceDetailRow
                            }
                        >
                            <label
                                className={
                                    styles.invoiceDetailLabel
                                }
                            >
                                Resident Name
                            </label>

                            <div
                                className={
                                    styles.invoiceDetailValueWrapper
                                }
                            >
                                <input
                                    type="text"
                                    autoComplete="off"
                                    value={
                                        invoiceData.residentName
                                    }
                                    onChange={(e) =>
                                        handleInvoiceChange(
                                            "residentName",
                                            e.target.value
                                        )
                                    }
                                    className={
                                        styles.invoiceDetailInput
                                    }
                                />
                            </div>
                        </div>


                        {/* KWH USED / ALLOCATED */}

                        <div
                            className={
                                styles.invoiceDetailRow
                            }
                        >
                            <label
                                className={
                                    styles.invoiceDetailLabel
                                }
                            >
                                Kwh Used / Allocated
                            </label>

                            <div
                                className={
                                    styles.invoiceDetailValueWrapper
                                }
                            >
                                <div
                                    className={
                                        styles.kwhWrapper
                                    }
                                >
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={
                                            invoiceData.kwhUsed
                                        }
                                        onChange={(e) =>
                                            handleNumericChange(
                                                "kwhUsed",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            styles.kwhInput
                                        }
                                    />

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={
                                            invoiceData.kwhAllocated
                                        }
                                        onChange={(e) =>
                                            handleNumericChange(
                                                "kwhAllocated",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            styles.kwhInput
                                        }
                                    />

                                    <span
                                        className={
                                            styles.invoiceUnit
                                        }
                                    >
                                        /kWh
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* ENERGY CHARGE */}

                        <div
                            className={
                                styles.invoiceDetailRow
                            }
                        >
                            <label
                                className={
                                    styles.invoiceDetailLabel
                                }
                            >
                                Energy Charge ( kWh )
                            </label>

                            <div
                                className={
                                    styles.invoiceDetailValueWrapper
                                }
                            >
                                <div
                                    className={
                                        styles.amountWrapper
                                    }
                                >
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={
                                            invoiceData.energyCharge
                                        }
                                        onChange={(e) =>
                                            handleNumericChange(
                                                "energyCharge",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            styles.amountInput
                                        }
                                    />

                                    <span
                                        className={
                                            styles.invoiceUnit
                                        }
                                    >
                                        INR
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* OVER TIME */}

                        <div
                            className={
                                styles.invoiceDetailRow
                            }
                        >
                            <label
                                className={
                                    styles.invoiceDetailLabel
                                }
                            >
                                Over Time ( Min )
                            </label>

                            <div
                                className={
                                    styles.invoiceDetailValueWrapper
                                }
                            >
                                <div
                                    className={
                                        styles.amountWrapper
                                    }
                                >
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={
                                            invoiceData.overTime
                                        }
                                        onChange={(e) =>
                                            handleNumericChange(
                                                "overTime",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            styles.amountInput
                                        }
                                    />

                                    <span
                                        className={
                                            styles.invoiceUnit
                                        }
                                    >
                                        INR
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* TOTAL AMOUNT */}

                        <div
                            className={`
                                ${styles.invoiceDetailRow}
                                ${styles.invoiceTotalRow}
                            `}
                        >
                            <label
                                className={
                                    styles.invoiceTotalLabel
                                }
                            >
                                Total Amount :
                            </label>

                            <div
                                className={
                                    styles.invoiceDetailValueWrapper
                                }
                            >
                                <div
                                    className={
                                        styles.amountWrapper
                                    }
                                >
                                    <span
                                        className={
                                            styles.totalAmount
                                        }
                                    >
                                        {
                                            calculateTotal()
                                        }
                                    </span>

                                    <span
                                        className={
                                            styles.invoiceUnit
                                        }
                                    >
                                        INR
                                    </span>
                                </div>
                            </div>
                        </div>


                        {/* LOADING */}

                        {invoiceLoading && (
                            <div
                                style={{
                                    textAlign:
                                        "center",
                                    padding:
                                        "10px",
                                }}
                            >
                                <span className="spinner-border spinner-border-sm me-2"></span>

                                Fetching invoice data...
                            </div>
                        )}
                    </div>


                    {/* =================================================
                        BUTTONS
                    ================================================= */}

                    <div
                        className={
                            styles.editButton
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles.editCancelBtn
                            }
                            onClick={
                                handleCancel
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                invoiceLoading
                            }
                            className={
                                styles.editSubmitBtn
                            }
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Submit...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInvoice;