import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithToken,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

import {
    getCountries,
    getCountryCallingCode,
} from "libphonenumber-js";

import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";

import MultiSelectDropdown from "../../SharedComponent/UI/CustomMultiDropdown/MultiSelectDropdown";

const AddResident = () => {
    const navigate = useNavigate();

    // =========================================================
    // USER DETAILS
    // =========================================================

    const [userDetails, setUserDetails] = useState(null);

    // =========================================================
    // COUNTRY CODE OPTIONS
    // =========================================================

    const countryCodeOptions = useMemo(() => {
        const displayNames = new Intl.DisplayNames(
            ["en"],
            {
                type: "region",
            }
        );

        return getCountries()
            .map((country) => {
                let countryName = country;

                try {
                    countryName =
                        displayNames.of(country) || country;
                } catch (error) {
                    countryName = country;
                }

                let callingCode = "";

                try {
                    callingCode =
                        `+${getCountryCallingCode(country)}`;
                } catch (error) {
                    console.error(
                        `Unable to get calling code for ${country}`,
                        error
                    );

                    return null;
                }

                return {
                    value: callingCode,
                    label: `${countryName} (${callingCode})`,
                    countryName,
                    country,
                };
            })
            .filter(Boolean)
            .sort((a, b) =>
                a.countryName.localeCompare(
                    b.countryName
                )
            );
    }, []);

    // =========================================================
    // FORM STATE
    // =========================================================

    // Default country code = India
    const [countryCode, setCountryCode] =
        useState("+91");

    const [residentName, setResidentName] =
        useState("");

    const [mobileNumber, setMobileNumber] =
        useState("");

    const [residentEmail, setResidentEmail] =
        useState("");

    /*
     * IMPORTANT:
     *
     * Community is now MULTI SELECT.
     *
     * Example:
     *
     * [
     *     {
     *         value: "CMT0026",
     *         label: "Green Valley"
     *     },
     *     {
     *         value: "CMT0027",
     *         label: "Palm Residency"
     *     }
     * ]
     */
    const [communityIds, setCommunityIds] =
        useState([]);

    const [address, setAddress] =
        useState("");

    const [
        monthlySessionAllocation,
        setMonthlySessionAllocation,
    ] = useState("");

    const [
        allotedTime,
        setAllotedTime,
    ] = useState("");

    const [
        kwhAllocated,
        setKwhAllocated,
    ] = useState("");

    const [
        perKwhCharge,
        setPerKwhCharge,
    ] = useState("");

    const [
        extraCharge,
        setExtraCharge,
    ] = useState("");

    // =========================================================
    // COMMUNITY STATE
    // =========================================================

    const [communityOptions, setCommunityOptions] =
        useState([]);

    const [communityLoading, setCommunityLoading] =
        useState(false);

    // =========================================================
    // FORM / API STATE
    // =========================================================

    const [errors, setErrors] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    // =========================================================
    // SELECTED COUNTRY CODE
    // =========================================================

    const selectedCountryCode =
        countryCodeOptions.find(
            (option) =>
                option.value === countryCode
        ) || null;

    // =========================================================
    // GET USER DETAILS
    // =========================================================

    useEffect(() => {
        try {
            const storedUserDetails =
                sessionStorage.getItem("userDetails");

            if (!storedUserDetails) {
                navigate("/login");
                return;
            }

            const parsedUserDetails =
                JSON.parse(storedUserDetails);

            if (!parsedUserDetails?.access_token) {
                navigate("/login");
                return;
            }

            setUserDetails(parsedUserDetails);
        } catch (error) {
            console.error(
                "Error parsing userDetails:",
                error
            );

            navigate("/login");
        }
    }, [navigate]);

    // =========================================================
    // GET ALL COMMUNITY LIST
    // =========================================================

    useEffect(() => {
        if (!userDetails?.user_id) {
            return;
        }

        getAllCommunityList();
    }, [userDetails]);

    // =========================================================
    // COMMUNITY API
    // =========================================================

    const getAllCommunityList = () => {
        if (!userDetails?.user_id) {
            return;
        }

        setCommunityLoading(true);

        const obj = {
            userId: userDetails.user_id,
            email: userDetails.email,
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
                    /*
                     * API response:
                     *
                     * {
                     *     status: 1,
                     *     code: 200,
                     *     data: [
                     *         {
                     *             value: "CMT0026",
                     *             label: "Green Valley"
                     *         }
                     *     ]
                     * }
                     */

                    const options =
                        Array.isArray(response?.data)
                            ? response.data
                            : [];

                    setCommunityOptions(options);

                    /*
                     * Clear previously selected values
                     * which are no longer available.
                     */
                    setCommunityIds(
                        (currentSelected) => {
                            if (
                                !Array.isArray(
                                    currentSelected
                                )
                            ) {
                                return [];
                            }

                            return currentSelected.filter(
                                (selected) =>
                                    options.some(
                                        (option) =>
                                            String(
                                                option.value
                                            ) ===
                                            String(
                                                selected.value
                                            )
                                    )
                            );
                        }
                    );
                } else {
                    setCommunityOptions([]);
                    setCommunityIds([]);

                    toast.error(
                        response?.message ||
                        "Unable to fetch community list."
                    );

                    console.error(
                        "Error in all-community-list API:",
                        response
                    );
                }

                setCommunityLoading(false);
            }
        );
    };

    // =========================================================
    // COUNTRY CODE CHANGE
    // =========================================================

    const handleCountryCodeChange = (
        selectedOption
    ) => {
        let selectedValue = "";

        if (
            selectedOption &&
            typeof selectedOption === "object"
        ) {
            selectedValue =
                selectedOption?.value || "";
        } else {
            selectedValue =
                selectedOption || "";
        }

        setCountryCode(selectedValue);

        if (selectedValue) {
            setErrors((prev) => ({
                ...prev,
                countryCode: "",
            }));
        }
    };

    // =========================================================
    // COMMUNITY CHANGE
    // =========================================================

    const handleCommunityChange = (
        selectedOptions
    ) => {
        /*
         * MultiSelectDropdown returns:
         *
         * [
         *     {
         *         value: "CMT0026",
         *         label: "Green Valley"
         *     }
         * ]
         */

        const selected =
            Array.isArray(selectedOptions)
                ? selectedOptions
                : [];

        setCommunityIds(selected);

        if (selected.length > 0) {
            setErrors((prev) => ({
                ...prev,
                communityIds: "",
            }));
        }
    };

    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {
        navigate(-1);
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        // -----------------------------------------------------
        // Resident Name
        // -----------------------------------------------------

        if (!residentName.trim()) {
            newErrors.residentName =
                "Resident Name is required.";
        }

        // -----------------------------------------------------
        // Country Code
        // -----------------------------------------------------

        if (!countryCode) {
            newErrors.countryCode =
                "Country Code is required.";
        }

        // -----------------------------------------------------
        // Mobile
        // -----------------------------------------------------

        if (!mobileNumber.trim()) {
            newErrors.mobileNumber =
                "Mobile Number is required.";
        } else if (
            !/^\d{7,15}$/.test(
                mobileNumber
            )
        ) {
            newErrors.mobileNumber =
                "Please enter a valid Mobile Number.";
        }

        // -----------------------------------------------------
        // Email
        // -----------------------------------------------------

        if (!residentEmail.trim()) {
            newErrors.residentEmail =
                "Email Address is required.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    residentEmail.trim()
                )
            ) {
                newErrors.residentEmail =
                    "Please enter a valid Email Address.";
            }
        }

        // -----------------------------------------------------
        // Community
        // -----------------------------------------------------

        if (
            !Array.isArray(communityIds) ||
            communityIds.length === 0
        ) {
            newErrors.communityIds =
                "Community is required.";
        }

        // -----------------------------------------------------
        // Address
        // -----------------------------------------------------

        if (!address.trim()) {
            newErrors.address =
                "Full Address is required.";
        }

        // -----------------------------------------------------
        // Monthly Session Allocation
        // -----------------------------------------------------

        if (!monthlySessionAllocation) {
            newErrors.monthlySessionAllocation =
                "Monthly Session Allocation is required.";
        }

        // -----------------------------------------------------
        // Allocated Time
        // -----------------------------------------------------

        if (!allotedTime) {
            newErrors.allotedTime =
                "Allocated Time is required.";
        }

        // -----------------------------------------------------
        // kWh Allocated
        // -----------------------------------------------------

        if (!kwhAllocated) {
            newErrors.kwhAllocated =
                "kWh Allocation/Month is required.";
        }

        // -----------------------------------------------------
        // Per kWh Charge
        // -----------------------------------------------------

        if (!perKwhCharge) {
            newErrors.perKwhCharge =
                "Per kWh Charge is required.";
        }

        // -----------------------------------------------------
        // Extra Charge
        // -----------------------------------------------------

        if (!extraCharge) {
            newErrors.extraCharge =
                "Extra Charge/Min Over Allocated Time is required.";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error(
                "Some fields are missing."
            );
            return;
        }

        if (!userDetails) {
            toast.error(
                "User session expired."
            );

            navigate("/login");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        // =====================================================
        // AUTH DETAILS
        // =====================================================

        formData.append(
            "userId",
            userDetails?.user_id || ""
        );

        formData.append(
            "email",
            userDetails?.email || ""
        );

        // =====================================================
        // RESIDENT DETAILS
        // =====================================================

        formData.append(
            "resident_name",
            residentName.trim()
        );

        formData.append(
            "country_code",
            countryCode
        );

        formData.append(
            "mobile_number",
            mobileNumber
        );

        formData.append(
            "resident_email",
            residentEmail.trim()
        );

        // =====================================================
        // COMMUNITY
        // =====================================================

        /*
         * Convert selected community objects into IDs.
         *
         * Example:
         *
         * [
         *   { value: "CMT0026", label: "Green Valley" },
         *   { value: "CMT0027", label: "Palm Residency" }
         * ]
         *
         * becomes:
         *
         * CMT0026,CMT0027
         */

        const selectedCommunityIds =
            communityIds
                .map(
                    (community) =>
                        community.value
                )
                .join(",");

        formData.append(
            "community_ids",
            selectedCommunityIds
        );

        formData.append(
            "address",
            address.trim()
        );

        // =====================================================
        // ALLOCATION DETAILS
        // =====================================================

        formData.append(
            "monthly_session_allocation",
            monthlySessionAllocation
        );

        formData.append(
            "alloted_time",
            allotedTime
        );

        formData.append(
            "kwh_allocated",
            kwhAllocated
        );

        formData.append(
            "per_kwh_charge",
            perKwhCharge
        );

        formData.append(
            "extra_charge",
            extraCharge
        );

        // =====================================================
        // DEBUG
        // =====================================================

        console.log(
            "Resident Form Data:"
        );

        for (
            const [key, value]
            of formData.entries()
        ) {
            console.log(
                key,
                value
            );
        }

        // =====================================================
        // API
        // =====================================================

        postRequestWithToken(
            "resident-add",
            formData,
            (response) => {
                console.log(
                    "resident-add response:",
                    response
                );

                if (
                    response?.status === 1 ||
                    response?.code === 200
                ) {
                    toast.success(
                        response?.message ||
                        "Resident added successfully."
                    );

                    setTimeout(() => {
                        setLoading(false);
                        navigate(-1);
                    }, 1000);
                } else {
                    toast.error(
                        response?.message ||
                        "Something went wrong."
                    );

                    console.error(
                        "Error in resident-add API:",
                        response
                    );

                    setLoading(false);
                }
            }
        );
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
            {/* =================================================
                HEADING
            ================================================= */}

            <div
                className={
                    styles.addHeading
                }
            >
                Add Resident
            </div>

            <div
                className={
                    styles.addStationFormSection
                }
            >
                <ToastContainer />

                <form
                    className={
                        styles.formSection
                    }
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="row">

                        {/* =================================================
                            RESIDENT NAME
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="residentName"
                                className={
                                    styles.labelText
                                }
                            >
                                Resident Name
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="residentName"
                                        placeholder="Resident Name"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            residentName
                                        }
                                        onChange={(e) =>
                                            setResidentName(
                                                e.target.value.slice(
                                                    0,
                                                    50
                                                )
                                            )
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
                            </div>
                        </div>

                        {/* =================================================
                            CONTACT DETAILS
                        ================================================= */}

                        <div className="col-lg-6">
                            <div
                                className={
                                    styles.managerContactField
                                }
                            >
                                <div
                                    className={
                                        styles.managerContactRow
                                    }
                                >

                                    {/* COUNTRY CODE */}

                                    <div
                                        className={
                                            styles.managerContactColumn
                                        }
                                    >
                                        <label
                                            htmlFor="countryCode"
                                            className={
                                                styles.labelText
                                            }
                                        >
                                            Country Code
                                        </label>

                                        <CustomDropdown
                                            options={
                                                countryCodeOptions
                                            }
                                            value={
                                                selectedCountryCode
                                            }
                                            onChange={
                                                handleCountryCodeChange
                                            }
                                            placeholder="+91"
                                        />

                                        {errors.countryCode && (
                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.countryCode
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* MOBILE NUMBER */}

                                    <div
                                        className={
                                            styles.managerContactColumn
                                        }
                                    >
                                        <label
                                            htmlFor="mobileNumber"
                                            className={
                                                styles.labelText
                                            }
                                        >
                                            Mobile No
                                        </label>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            id="mobileNumber"
                                            placeholder="Mobile Number"
                                            className={
                                                styles.inputField
                                            }
                                            value={
                                                mobileNumber
                                            }
                                            onChange={(e) => {
                                                const value =
                                                    e.target.value;

                                                if (
                                                    /^\d{0,15}$/.test(
                                                        value
                                                    )
                                                ) {
                                                    setMobileNumber(
                                                        value
                                                    );
                                                }
                                            }}
                                        />

                                        {errors.mobileNumber && (
                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.mobileNumber
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="residentEmail"
                                className={
                                    styles.labelText
                                }
                            >
                                Email Address
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="email"
                                        autoComplete="off"
                                        id="residentEmail"
                                        placeholder="Email ID"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            residentEmail
                                        }
                                        onChange={(e) =>
                                            setResidentEmail(
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.residentEmail && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.residentEmail
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            COMMUNITY - MULTI SELECT
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="community"
                                className={
                                    styles.labelText
                                }
                            >
                                Community
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">

                                    <MultiSelectDropdown
                                        options={communityOptions} value={communityIds} onChange={handleCommunityChange} labelledBy="Compatible" closeOnChangedValue={false} closeOnSelect={false} enableSelectAll
                                    />

                                    {!communityLoading &&
                                        communityOptions.length === 0 && (
                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                No communities available.
                                            </p>
                                        )}

                                    {errors.communityIds && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.communityIds
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            FULL ADDRESS
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="address"
                                className={
                                    styles.labelText
                                }
                            >
                                Full Address
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="address"
                                        placeholder="Enter full address"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            address
                                        }
                                        onChange={(e) =>
                                            setAddress(
                                                e.target.value.slice(
                                                    0,
                                                    250
                                                )
                                            )
                                        }
                                    />

                                    {errors.address && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.address
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            MONTHLY SESSION ALLOCATION
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="monthlySessionAllocation"
                                className={
                                    styles.labelText
                                }
                            >
                                Monthly Session Allocation
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        id="monthlySessionAllocation"
                                        placeholder="Monthly Session Allocation"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            monthlySessionAllocation
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setMonthlySessionAllocation(
                                                    value
                                                );
                                            }
                                        }}
                                    />

                                    {errors.monthlySessionAllocation && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.monthlySessionAllocation
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            ALLOCATED TIME
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="allotedTime"
                                className={
                                    styles.labelText
                                }
                            >
                                Allocated Time In Minute
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        id="allotedTime"
                                        placeholder="Allocated Time"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            allotedTime
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setAllotedTime(
                                                    value
                                                );
                                            }
                                        }}
                                    />

                                    {errors.allotedTime && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.allotedTime
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            KWH
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="kwhAllocated"
                                className={
                                    styles.labelText
                                }
                            >
                                kWh Allocation/Month
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        id="kwhAllocated"
                                        placeholder="kWh Allocation/Month"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            kwhAllocated
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*\.?\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setKwhAllocated(
                                                    value
                                                );
                                            }
                                        }}
                                    />

                                    {errors.kwhAllocated && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.kwhAllocated
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            PER KWH CHARGE
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="perKwhCharge"
                                className={
                                    styles.labelText
                                }
                            >
                                Per kWh Charge (INR)
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        id="perKwhCharge"
                                        placeholder="Per kWh Charge (INR)"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            perKwhCharge
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*\.?\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setPerKwhCharge(
                                                    value
                                                );
                                            }
                                        }}
                                    />

                                    {errors.perKwhCharge && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.perKwhCharge
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            EXTRA CHARGE
                        ================================================= */}

                        <div className="col-lg-6">
                            <label
                                htmlFor="extraCharge"
                                className={
                                    styles.labelText
                                }
                            >
                                Extra Charge/Min Over Allocated Time (INR)
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        id="extraCharge"
                                        placeholder="Extra Charge/Min Over Allocated Time (INR)"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            extraCharge
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*\.?\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setExtraCharge(
                                                    value
                                                );
                                            }
                                        }}
                                    />

                                    {errors.extraCharge && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.extraCharge
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        BUTTONS
                    ====================================================== */}

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
                            disabled={
                                loading
                            }
                            type="submit"
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
                                "Add Resident"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddResident;
