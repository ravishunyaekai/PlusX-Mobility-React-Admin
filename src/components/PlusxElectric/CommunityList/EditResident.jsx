import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditResident = () => {
    const navigate = useNavigate();
    const { stationId } = useParams();

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

    const [countryCode, setCountryCode] =
        useState("+91");

    const [residentName, setResidentName] =
        useState("");

    const [mobileNumber, setMobileNumber] =
        useState("");

    const [residentEmail, setResidentEmail] =
        useState("");

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
    // API / FORM STATE
    // =========================================================

    const [errors, setErrors] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [fetchingDetails, setFetchingDetails] =
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
    // GET COMMUNITY LIST
    // =========================================================

    useEffect(() => {
        if (!userDetails?.user_id) {
            return;
        }

        getAllCommunityList();
    }, [userDetails]);

    // =========================================================
    // GET RESIDENT DETAILS
    // =========================================================

    useEffect(() => {
        if (
            !userDetails?.user_id ||
            !stationId
        ) {
            return;
        }

        fetchDetails();
    }, [userDetails, stationId]);

    // =========================================================
    // COMMUNITY LIST API
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
            "========== ALL COMMUNITY LIST REQUEST =========="
        );

        console.log(obj);

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
                        Array.isArray(response?.data)
                            ? response.data
                            : [];

                    setCommunityOptions(options);
                } else {
                    setCommunityOptions([]);

                    toast.error(
                        Array.isArray(response?.message)
                            ? response.message.join(", ")
                            : response?.message ||
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
    // RESIDENT DETAILS API
    // =========================================================

    const fetchDetails = () => {
        if (!stationId) {
            toast.error(
                "Resident ID is missing."
            );
            return;
        }

        setFetchingDetails(true);

        const obj = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            resident_id: stationId,
        };

        console.log(
            "========== RESIDENT DETAILS REQUEST =========="
        );

        console.log(obj);

        postRequestWithToken(
            "resident-details",
            obj,
            (response) => {
                console.log(
                    "========== RESIDENT DETAILS RESPONSE =========="
                );

                console.log(response);

                if (
                    response?.status === 1 &&
                    response?.code === 200
                ) {
                    const resident =
                        response?.data || {};

                    console.log(
                        "Resident data:",
                        resident
                    );

                    // =================================================
                    // RESIDENT NAME
                    // =================================================

                    setResidentName(
                        resident?.resident_name ||
                        ""
                    );

                    // =================================================
                    // MOBILE
                    // =================================================

                    setMobileNumber(
                        resident?.resident_mobile ||
                        resident?.mobile_number ||
                        ""
                    );

                    // =================================================
                    // COUNTRY CODE
                    // =================================================

                    setCountryCode(
                        resident?.country_code ||
                        "+91"
                    );

                    // =================================================
                    // EMAIL
                    // =================================================

                    setResidentEmail(
                        resident?.resident_email ||
                        ""
                    );

                    // =================================================
                    // ADDRESS
                    // =================================================

                    setAddress(
                        resident?.address ||
                        ""
                    );

                    // =================================================
                    // MONTHLY SESSION ALLOCATION
                    // =================================================

                    setMonthlySessionAllocation(
                        resident?.monthly_session_allocation !==
                            null &&
                        resident?.monthly_session_allocation !==
                            undefined
                            ? String(
                                  resident.monthly_session_allocation
                              )
                            : ""
                    );

                    // =================================================
                    // ALLOTED TIME
                    // =================================================

                    setAllotedTime(
                        resident?.alloted_time !==
                            null &&
                        resident?.alloted_time !==
                            undefined
                            ? String(
                                  resident.alloted_time
                              )
                            : ""
                    );

                    // =================================================
                    // KWH ALLOCATED
                    // =================================================

                    setKwhAllocated(
                        resident?.kwh_allocated !==
                            null &&
                        resident?.kwh_allocated !==
                            undefined
                            ? String(
                                  resident.kwh_allocated
                              )
                            : ""
                    );

                    // =================================================
                    // PER KWH CHARGE
                    // =================================================

                    setPerKwhCharge(
                        resident?.per_kwh_charge !==
                            null &&
                        resident?.per_kwh_charge !==
                            undefined
                            ? String(
                                  resident.per_kwh_charge
                              )
                            : ""
                    );

                    // =================================================
                    // EXTRA CHARGE
                    // =================================================

                    setExtraCharge(
                        resident?.extra_charge !==
                            null &&
                        resident?.extra_charge !==
                            undefined
                            ? String(
                                  resident.extra_charge
                              )
                            : ""
                    );

                    // =================================================
                    // COMMUNITY DETAILS
                    // =================================================

                    /*
                     * Backend detail API can return communities
                     * in the resident data.
                     *
                     * Expected example:
                     *
                     * communities: [
                     *   {
                     *      community_id: "CMT0026",
                     *      community_name: "Green Valley"
                     *   }
                     * ]
                     */

                    const residentCommunities =
                        Array.isArray(
                            resident?.communities
                        )
                            ? resident.communities
                            : Array.isArray(
                                  response?.communities
                              )
                            ? response.communities
                            : [];

                    console.log(
                        "Resident communities:",
                        residentCommunities
                    );

                    /*
                     * Convert backend community data into
                     * MultiSelectDropdown format.
                     */

                    if (
                        residentCommunities.length > 0
                    ) {
                        const selectedCommunities =
                            residentCommunities
                                .map((community) => {
                                    const communityId =
                                        community?.community_id ||
                                        community?.communityId ||
                                        community?.id ||
                                        community?.value ||
                                        "";

                                    const communityName =
                                        community?.community_name ||
                                        community?.communityName ||
                                        community?.name ||
                                        community?.label ||
                                        communityId;

                                    if (!communityId) {
                                        return null;
                                    }

                                    return {
                                        value: String(
                                            communityId
                                        ),
                                        label: String(
                                            communityName
                                        ),
                                    };
                                })
                                .filter(Boolean);

                        setCommunityIds(
                            selectedCommunities
                        );
                    } else {
                        /*
                         * Some APIs may return only IDs.
                         *
                         * Example:
                         * community_ids: "CMT0026,CMT0027"
                         */

                        const rawCommunityIds =
                            resident?.community_ids ||
                            resident?.communityIds ||
                            resident?.primary_community_id ||
                            resident?.community_id ||
                            "";

                        let ids = [];

                        if (
                            Array.isArray(
                                rawCommunityIds
                            )
                        ) {
                            ids =
                                rawCommunityIds;
                        } else if (
                            typeof rawCommunityIds ===
                            "string"
                        ) {
                            ids =
                                rawCommunityIds
                                    .split(",")
                                    .map(
                                        (id) =>
                                            id.trim()
                                    )
                                    .filter(Boolean);
                        } else if (
                            rawCommunityIds
                        ) {
                            ids = [
                                String(
                                    rawCommunityIds
                                ),
                            ];
                        }

                        const selectedCommunities =
                            ids
                                .map((id) => {
                                    const matchingOption =
                                        communityOptions.find(
                                            (option) =>
                                                String(
                                                    option?.value
                                                ) ===
                                                String(
                                                    id
                                                )
                                        );

                                    return (
                                        matchingOption || {
                                            value: String(
                                                id
                                            ),
                                            label: String(
                                                id
                                            ),
                                        }
                                    );
                                });

                        setCommunityIds(
                            selectedCommunities
                        );
                    }

                    setErrors({});
                } else {
                    console.error(
                        "Error in resident-details API:",
                        response
                    );

                    toast.error(
                        Array.isArray(response?.message)
                            ? response.message.join(", ")
                            : response?.message ||
                              "Failed to fetch resident details."
                    );
                }

                setFetchingDetails(false);
            }
        );
    };

    // =========================================================
    // WHEN COMMUNITY LIST + RESIDENT DETAILS BOTH LOAD
    // =========================================================

    /*
     * If resident-details returns only community IDs,
     * this effect converts those IDs into the proper
     * MultiSelectDropdown option objects once the community
     * list becomes available.
     */

    useEffect(() => {
        if (
            !Array.isArray(communityOptions) ||
            communityOptions.length === 0
        ) {
            return;
        }

        if (
            !Array.isArray(communityIds) ||
            communityIds.length === 0
        ) {
            return;
        }

        const updatedSelectedCommunities =
            communityIds.map((selected) => {
                const matchingOption =
                    communityOptions.find(
                        (option) =>
                            String(option?.value) ===
                            String(selected?.value)
                    );

                return (
                    matchingOption || selected
                );
            });

        setCommunityIds(
            updatedSelectedCommunities
        );
    }, [communityOptions]);

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
    // SUBMIT / EDIT RESIDENT
    // =========================================================

    const handleSubmit = (e) => {
        e.preventDefault();

        // =====================================================
        // RESIDENT ID CHECK
        // =====================================================

        if (!stationId) {
            toast.error(
                "Resident ID is missing."
            );
            return;
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        if (!validateForm()) {
            toast.error(
                "Some fields are missing."
            );
            return;
        }

        // =====================================================
        // USER CHECK
        // =====================================================

        if (!userDetails) {
            toast.error(
                "User session expired."
            );

            navigate("/login");
            return;
        }

        // =====================================================
        // PREVENT DOUBLE SUBMIT
        // =====================================================

        if (loading) {
            return;
        }

        setLoading(true);

        // =====================================================
        // FORM DATA
        // =====================================================

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
        // IMPORTANT:
        // BACKEND editResidentMulti REQUIRES resident_id
        // =====================================================

        formData.append(
            "resident_id",
            stationId
        );

        // =====================================================
        // RESIDENT DETAILS
        // =====================================================

        formData.append(
            "resident_name",
            residentName.trim()
        );

        formData.append(
            "mobile_number",
            mobileNumber.trim()
        );

        formData.append(
            "country_code",
            countryCode || "+91"
        );

        formData.append(
            "resident_email",
            residentEmail.trim()
        );

        // =====================================================
        // COMMUNITY IDS
        // =====================================================

        /*
         * MultiSelectDropdown gives:
         *
         * [
         *   {
         *      value: "CMT0026",
         *      label: "Green Valley"
         *   },
         *   {
         *      value: "CMT0027",
         *      label: "Palm Residency"
         *   }
         * ]
         *
         * Backend parseCommunityIds() receives:
         *
         * CMT0026,CMT0027
         */

        const selectedCommunityIds =
            communityIds
                .map(
                    (community) =>
                        community?.value
                )
                .filter(Boolean)
                .join(",");

        formData.append(
            "community_ids",
            selectedCommunityIds
        );

        // =====================================================
        // ADDRESS
        // =====================================================

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
            "========== RESIDENT EDIT REQUEST =========="
        );

        for (
            const [key, value]
            of formData.entries()
        ) {
            console.log(
                `${key}:`,
                value
            );
        }

        // =====================================================
        // EDIT API
        // =====================================================

        postRequestWithToken(
            "resident-edit",
            formData,
            (response) => {
                console.log(
                    "========== RESIDENT EDIT RESPONSE =========="
                );

                console.log(response);

                // =================================================
                // SUCCESS
                // =================================================

                if (
                    response?.status === 1
                ) {
                    toast.success(
                        response?.message ||
                        "Resident updated successfully!"
                    );

                    setTimeout(() => {
                        setLoading(false);

                        navigate(-1);
                    }, 1000);

                    return;
                }

                // =================================================
                // ERROR
                // =================================================

                const errorMessage =
                    Array.isArray(
                        response?.message
                    )
                        ? response.message.join(", ")
                        : response?.message ||
                          "Failed to update resident.";

                toast.error(
                    errorMessage
                );

                console.error(
                    "Error in resident-edit API:",
                    response
                );

                setLoading(false);
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
                Edit Resident
            </div>

            <div
                className={
                    styles.addStationFormSection
                }
            >
                <ToastContainer />

                {/* =================================================
                    LOADING DETAILS
                ================================================= */}

                {fetchingDetails ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "30px",
                        }}
                    >
                        Loading resident details...
                    </div>
                ) : (
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
                                COMMUNITY
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
                                            options={
                                                communityOptions
                                            }
                                            value={
                                                communityIds
                                            }
                                            onChange={
                                                handleCommunityChange
                                            }
                                            labelledBy="Select Community"
                                            closeOnChangedValue={
                                                false
                                            }
                                            closeOnSelect={
                                                false
                                            }
                                            enableSelectAll
                                        />

                                        {!communityLoading &&
                                            communityOptions.length ===
                                                0 && (
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
                                    Per kWh Charge (AED)
                                </label>

                                <div className="row">
                                    <div className="col-xl-10 col-lg-12">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            autoComplete="off"
                                            id="perKwhCharge"
                                            placeholder="Per kWh Charge (AED)"
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
                                    Extra Charge/Min Over Allocated Time (AED)
                                </label>

                                <div className="row">
                                    <div className="col-xl-10 col-lg-12">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            autoComplete="off"
                                            id="extraCharge"
                                            placeholder="Extra Charge/Min Over Allocated Time (AED)"
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
                                disabled={
                                    loading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                disabled={
                                    loading ||
                                    fetchingDetails
                                }
                                type="submit"
                                className={
                                    styles.editSubmitBtn
                                }
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Updating...
                                    </>
                                ) : (
                                    "Update Resident"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditResident;
