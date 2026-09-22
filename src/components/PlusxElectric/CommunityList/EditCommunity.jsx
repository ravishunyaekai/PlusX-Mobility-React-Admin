import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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


const EditCommunity = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { stationId } = useParams();

    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails") || "null"
    );


    // =========================================================
    // COMMUNITY ID
    // =========================================================

    const communityId =
        stationId ||
        "";


    // =========================================================
    // COMMUNITY DETAILS
    // =========================================================

    const [communityName, setCommunityName] =
        useState("");

    const [areaName, setAreaName] =
        useState("");

    const [totalResidents, setTotalResidents] =
        useState("");


    // =========================================================
    // MANAGER DETAILS
    // =========================================================

    const [managerName, setManagerName] =
        useState("");

    const [managerEmail, setManagerEmail] =
        useState("");

    const [countryCode, setCountryCode] =
        useState("+91");

    const [managerContact, setManagerContact] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");


    // =========================================================
    // CHARGER DETAILS
    // =========================================================

    const [chargerDetails, setChargerDetails] =
        useState([
            {
                chargerId: "",
                kWh: "",
            },
        ]);


    // =========================================================
    // COMMON STATE
    // =========================================================

    const [errors, setErrors] =
        useState({});

    const [loading, setLoading] =
        useState(false);

    const [fetchingDetails, setFetchingDetails] =
        useState(false);


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
                        displayNames.of(country) ||
                        country;

                } catch (error) {

                    countryName = country;

                }

                const callingCode =
                    `+${getCountryCallingCode(country)}`;

                return {
                    value: callingCode,
                    label: `${countryName} (${callingCode})`,
                    countryName,
                };

            })
            .sort((a, b) =>
                a.countryName.localeCompare(
                    b.countryName
                )
            );

    }, []);


    // =========================================================
    // SELECTED COUNTRY CODE
    // =========================================================

    const selectedCountryCode =
        countryCodeOptions.find(
            (option) =>
                option.value === countryCode
        ) || null;


    // =========================================================
    // FETCH COMMUNITY DETAILS
    // =========================================================

    const fetchDetails = () => {

        if (!communityId) {

            toast.error(
                "Community ID is missing."
            );

            return;

        }

        setFetchingDetails(true);

        const obj = {

            userId:
                userDetails?.user_id || "",

            email:
                userDetails?.email || "",

            community_id:
                communityId,

        };


        console.log(
            "community-details request:",
            obj
        );


        postRequestWithToken(
            "community-details",
            obj,
            (response) => {

                console.log(
                    "community-details response:",
                    response
                );


                if (
                    response?.code === 200 ||
                    response?.status === 1
                ) {

                    // =================================================
                    // COMMUNITY DATA
                    // =================================================

                    const community =
                        response?.data || {};


                    setCommunityName(
                        community?.community_name || ""
                    );


                    setAreaName(
                        community?.area_name || ""
                    );


                    setTotalResidents(
                        community?.total_residence !== null &&
                            community?.total_residence !== undefined
                            ? String(
                                community.total_residence
                            )
                            : ""
                    );


                    // =================================================
                    // MANAGER DATA
                    //
                    // Backend can return:
                    //
                    // name / email / contact
                    //
                    // OR
                    //
                    // manager_name / manager_email /
                    // manager_contact
                    // =================================================

                    const manager =
                        response?.manager || {};


                    setManagerName(
                        manager?.manager_name ||
                        manager?.name ||
                        ""
                    );


                    setManagerEmail(
                        manager?.manager_email ||
                        manager?.email ||
                        ""
                    );


                    setCountryCode(
                        manager?.country_code ||
                        "+91"
                    );


                    setManagerContact(
                        manager?.manager_contact ||
                        manager?.contact ||
                        ""
                    );


                    // =================================================
                    // CHARGER DATA
                    //
                    // Backend:
                    //
                    // charger_id
                    // kw
                    //
                    // Form:
                    //
                    // chargerId
                    // kWh
                    // =================================================

                    const chargers =
                        Array.isArray(
                            response?.chargers
                        )
                            ? response.chargers
                            : [];


                    if (chargers.length > 0) {

                        const formattedChargers =
                            chargers.map(
                                (charger) => ({

                                    chargerId:
                                        charger?.charger_id ||
                                        charger?.chargerId ||
                                        "",

                                    kWh:
                                        charger?.kw !== null &&
                                            charger?.kw !== undefined
                                            ? String(
                                                charger.kw
                                            )
                                            : charger?.kWh !== null &&
                                                charger?.kWh !== undefined
                                                ? String(
                                                    charger.kWh
                                                )
                                                : "",

                                })
                            );


                        setChargerDetails(
                            formattedChargers
                        );

                    } else {

                        // Keep at least one row
                        setChargerDetails([
                            {
                                chargerId: "",
                                kWh: "",
                            },
                        ]);

                    }


                    // Clear previous errors
                    setErrors({});

                } else {

                    console.error(
                        "Error in community-details API:",
                        response
                    );


                    toast.error(
                        response?.message ||
                        "Unable to fetch community details."
                    );

                }

                setFetchingDetails(false);

            }
        );

    };


    // =========================================================
    // AUTHENTICATION + FETCH DETAILS
    // =========================================================

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {

            navigate("/login");

            return;

        }


        if (!communityId) {

            toast.error(
                "Community ID is missing."
            );

            return;

        }


        fetchDetails();

    }, [communityId]);


    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {

        navigate(-1);

    };


    // =========================================================
    // CHARGER CHANGE
    // =========================================================

    const handleChargerChange = (
        index,
        field,
        value
    ) => {

        setChargerDetails((prev) =>
            prev.map(
                (charger, i) =>
                    i === index
                        ? {
                            ...charger,
                            [field]: value,
                        }
                        : charger
            )
        );


        setErrors((prev) => {

            const updatedErrors = {
                ...prev,
            };


            if (
                updatedErrors
                    .chargerDetails?.[index]?.[field]
            ) {

                const chargerErrors = [
                    ...(updatedErrors.chargerDetails || []),
                ];


                chargerErrors[index] = {
                    ...(chargerErrors[index] || {}),
                    [field]: "",
                };


                updatedErrors.chargerDetails =
                    chargerErrors;

            }


            return updatedErrors;

        });

    };


    // =========================================================
    // ADD CHARGER
    // =========================================================

    const addCharger = () => {

        setChargerDetails((prev) => [

            ...prev,

            {
                chargerId: "",
                kWh: "",
            },

        ]);

    };


    // =========================================================
    // REMOVE CHARGER
    // =========================================================

    const removeCharger = (index) => {

        if (chargerDetails.length === 1) {

            return;

        }


        setChargerDetails((prev) =>
            prev.filter(
                (_, i) =>
                    i !== index
            )
        );


        setErrors((prev) => {

            const updatedErrors = {
                ...prev,
            };


            if (
                updatedErrors.chargerDetails
            ) {

                updatedErrors.chargerDetails =
                    updatedErrors
                        .chargerDetails
                        .filter(
                            (_, i) =>
                                i !== index
                        );

            }


            return updatedErrors;

        });

    };


    // =========================================================
    // FORM VALIDATION
    // =========================================================

    const validateForm = () => {

        const newErrors = {};


        // =====================================================
        // COMMUNITY NAME
        // =====================================================

        if (!communityName.trim()) {

            newErrors.communityName =
                "Community Name is required.";

        }


        // =====================================================
        // AREA NAME
        // =====================================================

        if (!areaName.trim()) {

            newErrors.areaName =
                "Area Name is required.";

        }


        // =====================================================
        // TOTAL RESIDENTS
        // =====================================================

        if (!totalResidents) {

            newErrors.totalResidents =
                "Total No. of Residents is required.";

        }


        // =====================================================
        // MANAGER NAME
        // =====================================================

        if (!managerName.trim()) {

            newErrors.managerName =
                "Manager Name is required.";

        }


        // =====================================================
        // MANAGER EMAIL
        // =====================================================

        if (!managerEmail.trim()) {

            newErrors.managerEmail =
                "Email ID is required.";

        } else {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailRegex.test(
                    managerEmail.trim()
                )
            ) {

                newErrors.managerEmail =
                    "Please enter a valid Email ID.";

            }

        }


        // =====================================================
        // MANAGER CONTACT
        // =====================================================

        if (managerContact) {

            if (
                !/^\d{6,15}$/.test(
                    managerContact
                )
            ) {

                newErrors.managerContact =
                    "Please enter a valid contact number.";

            }

        }


        // =====================================================
        // PASSWORD
        //
        // IMPORTANT:
        // In EDIT mode password is optional.
        //
        // If user enters password, confirm it.
        // =====================================================

        if (password) {

            if (password.length < 6) {

                newErrors.password =
                    "Password must be at least 6 characters.";

            }


            if (!confirmPassword) {

                newErrors.confirmPassword =
                    "Confirm Password is required.";

            } else if (
                password !== confirmPassword
            ) {

                newErrors.confirmPassword =
                    "Passwords do not match.";

            }

        }


        // =====================================================
        // CHARGER DETAILS
        // =====================================================

        const chargerErrors = [];


        chargerDetails.forEach(
            (charger) => {

                const rowErrors = {};


                if (
                    !charger.chargerId.trim()
                ) {

                    rowErrors.chargerId =
                        "Charger ID is required.";

                }


                if (
                    charger.kWh === "" ||
                    charger.kWh === null ||
                    charger.kWh === undefined
                ) {

                    rowErrors.kWh =
                        "kWh is required.";

                }


                chargerErrors.push(
                    rowErrors
                );

            }
        );


        const hasChargerErrors =
            chargerErrors.some(
                (error) =>
                    Object.keys(error)
                        .length > 0
            );


        if (hasChargerErrors) {

            newErrors.chargerDetails =
                chargerErrors;

        }


        setErrors(
            newErrors
        );


        return (
            Object.keys(newErrors)
                .length === 0
        );

    };


    // =========================================================
    // SUBMIT EDIT COMMUNITY
    // =========================================================

    const handleSubmit = (e) => {

        e.preventDefault();

        // ---------------------------------------------------------
        // Community ID
        // ---------------------------------------------------------

        if (!communityId) {

            toast.error(
                "Community ID is missing."
            );

            return;

        }


        // ---------------------------------------------------------
        // Validate form
        // ---------------------------------------------------------

        const isValid =
            validateForm();

        if (!isValid) {

            toast.error(
                "Some fields are missing or invalid."
            );

            return;

        }


        // ---------------------------------------------------------
        // Prevent multiple submissions
        // ---------------------------------------------------------

        if (loading) {

            return;

        }


        setLoading(true);


        // ---------------------------------------------------------
        // Create FormData
        // ---------------------------------------------------------

        const formData =
            new FormData();


        // =========================================================
        // AUTHENTICATION
        // =========================================================

        formData.append(
            "userId",
            userDetails?.user_id || ""
        );

        formData.append(
            "email",
            userDetails?.email || ""
        );


        // =========================================================
        // COMMUNITY ID
        // =========================================================

        formData.append(
            "community_id",
            communityId
        );


        // =========================================================
        // COMMUNITY DETAILS
        // =========================================================

        formData.append(
            "community_name",
            communityName.trim()
        );

        formData.append(
            "area_name",
            areaName.trim()
        );

        formData.append(
            "total_residence",
            totalResidents
        );


        // =========================================================
        // CHARGER DETAILS
        //
        // Backend expects:
        //
        // chargers = JSON array
        // kwValues = JSON array
        //
        // Example:
        //
        // chargers = ["CH001", "CH002"]
        // kwValues = ["7", "11"]
        // =========================================================

        const chargers =
            chargerDetails.map(
                (charger) =>
                    charger.chargerId.trim()
            );

        const kwValues =
            chargerDetails.map(
                (charger) =>
                    charger.kWh
            );


        formData.append(
            "chargers",
            JSON.stringify(chargers)
        );

        formData.append(
            "kwValues",
            JSON.stringify(kwValues)
        );


        // =========================================================
        // MANAGER DETAILS
        // =========================================================

        formData.append(
            "manager_name",
            managerName.trim()
        );

        formData.append(
            "manager_email",
            managerEmail.trim()
        );

        formData.append(
            "manager_contact",
            managerContact || ""
        );

        formData.append(
            "country_code",
            countryCode || "+91"
        );


        // =========================================================
        // PASSWORD
        //
        // Backend allows password to be optional during edit.
        //
        // If blank:
        // existing password remains unchanged.
        //
        // If entered:
        // backend will hash and update it.
        // =========================================================

        if (password) {

            formData.append(
                "password",
                password
            );

        }


        // =========================================================
        // DEBUG
        // =========================================================

        console.log(
            "========== COMMUNITY EDIT REQUEST =========="
        );

        for (
            const [key, value]
            of formData.entries()
        ) {

            console.log(
                key,
                ":",
                value
            );

        }


        // =========================================================
        // API CALL
        // =========================================================

        postRequestWithToken(
            "community-edit",
            formData,
            (response) => {

                console.log(
                    "community-edit response:",
                    response
                );


                // =====================================================
                // SUCCESS
                // =====================================================

                if (
                    response?.status === 1
                ) {

                    toast.success(
                        response?.message ||
                        "Community updated successfully."
                    );


                    setTimeout(() => {

                        setLoading(false);

                        navigate(
                            "/electric/community/community-list"
                        );

                    }, 1000);


                    return;

                }


                // =====================================================
                // ERROR
                // =====================================================

                toast.error(
                    Array.isArray(response?.message)
                        ? response.message.join(", ")
                        : response?.message ||
                        "Failed to update community."
                );


                console.error(
                    "community-edit API error:",
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
            ================================================== */}

            <div
                className={
                    styles.addHeading
                }
            >
                Edit Community
            </div>


            <div
                className={
                    styles.addStationFormSection
                }
            >

                <ToastContainer />


                {/* =================================================
                    LOADING COMMUNITY DETAILS
                ================================================== */}

                {fetchingDetails ? (

                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{
                            minHeight: "300px",
                        }}
                    >

                        <div
                            className="spinner-border"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

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

                        {/* =================================================
                            COMMUNITY DETAILS
                        ================================================== */}

                        <div className="row">

                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Community Details
                            </label>


                            {/* Community Name */}

                            <div className="col-lg-6">

                                <label
                                    htmlFor="communityName"
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Community Name
                                </label>


                                <div className="row">

                                    <div className="col-xl-10 col-lg-12">

                                        <input
                                            type="text"
                                            autoComplete="off"
                                            id="communityName"
                                            placeholder="Community Name"
                                            className={
                                                styles.inputField
                                            }
                                            value={
                                                communityName
                                            }
                                            onChange={(e) =>
                                                setCommunityName(
                                                    e.target.value.slice(
                                                        0,
                                                        50
                                                    )
                                                )
                                            }
                                        />


                                        {errors.communityName && (

                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.communityName
                                                }
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* Area Name */}

                            <div className="col-lg-6">

                                <label
                                    htmlFor="areaName"
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Area Name
                                </label>


                                <div className="row">

                                    <div className="col-xl-10 col-lg-12">

                                        <input
                                            type="text"
                                            autoComplete="off"
                                            id="areaName"
                                            placeholder="Area Name"
                                            className={
                                                styles.inputField
                                            }
                                            value={
                                                areaName
                                            }
                                            onChange={(e) =>
                                                setAreaName(
                                                    e.target.value.slice(
                                                        0,
                                                        50
                                                    )
                                                )
                                            }
                                        />


                                        {errors.areaName && (

                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.areaName
                                                }
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* Total Residents */}

                            <div className="col-lg-6">

                                <label
                                    htmlFor="totalResidents"
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Total No. of Residents
                                </label>


                                <div className="row">

                                    <div className="col-xl-10 col-lg-12">

                                        <input
                                            type="text"
                                            autoComplete="off"
                                            id="totalResidents"
                                            placeholder="Total No. of Residents"
                                            className={
                                                styles.inputField
                                            }
                                            value={
                                                totalResidents
                                            }
                                            onChange={(e) => {

                                                const value =
                                                    e.target.value;


                                                if (
                                                    /^\d{0,6}$/.test(
                                                        value
                                                    )
                                                ) {

                                                    setTotalResidents(
                                                        value
                                                    );

                                                }

                                            }}
                                        />


                                        {errors.totalResidents && (

                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.totalResidents
                                                }
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            MANAGER DETAILS
                        ================================================== */}

                        <div className="row">

                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Manager Details
                            </label>


                            {/* Manager Name */}

                            <div className="col-lg-6">

                                <label
                                    htmlFor="managerName"
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Manager Name
                                </label>


                                <div
                                    className={
                                        styles.managerFieldInner
                                    }
                                >

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="managerName"
                                        placeholder="Manager Name"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            managerName
                                        }
                                        onChange={(e) =>
                                            setManagerName(
                                                e.target.value.slice(
                                                    0,
                                                    50
                                                )
                                            )
                                        }
                                    />


                                    {errors.managerName && (

                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.managerName
                                            }
                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* Manager Email */}

                            <div className="col-lg-6">

                                <label
                                    htmlFor="managerEmail"
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Email ID
                                </label>


                                <div
                                    className={
                                        styles.managerFieldInner
                                    }
                                >

                                    <input
                                        type="email"
                                        autoComplete="off"
                                        id="managerEmail"
                                        placeholder="Email ID"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            managerEmail
                                        }
                                        onChange={(e) =>
                                            setManagerEmail(
                                                e.target.value
                                            )
                                        }
                                    />


                                    {errors.managerEmail && (

                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.managerEmail
                                            }
                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* Contact Details */}

                            <div className="col-lg-6">

                                <label
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Contact Details
                                </label>


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

                                        {/* Country Code */}

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
                                                onChange={(
                                                    selectedOption
                                                ) => {

                                                    setCountryCode(
                                                        selectedOption?.value ||
                                                        ""
                                                    );

                                                }}
                                                placeholder="+91"
                                            />

                                        </div>


                                        {/* Contact Number */}

                                        <div
                                            className={
                                                styles.managerContactColumn
                                            }
                                        >

                                            <label
                                                htmlFor="managerContact"
                                                className={
                                                    styles.labelText
                                                }
                                            >
                                                Contact No
                                            </label>


                                            <input
                                                type="text"
                                                autoComplete="off"
                                                id="managerContact"
                                                placeholder="Contact Number"
                                                className={
                                                    styles.inputField
                                                }
                                                value={
                                                    managerContact
                                                }
                                                onChange={(e) => {

                                                    const value =
                                                        e.target.value;


                                                    if (
                                                        /^\d{0,15}$/.test(
                                                            value
                                                        )
                                                    ) {

                                                        setManagerContact(
                                                            value
                                                        );

                                                    }

                                                }}
                                            />


                                            {errors.managerContact && (

                                                <p
                                                    className={
                                                        styles.error
                                                    }
                                                >
                                                    {
                                                        errors.managerContact
                                                    }
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* Password */}

                            <div className="col-lg-6">

                                <div
                                    className={
                                        styles.managerPasswordField
                                    }
                                >

                                    <label
                                        htmlFor="password"
                                        className={
                                            styles.labelText
                                        }
                                    >
                                        Password
                                    </label>


                                    <div
                                        className={
                                            styles.managerFieldInner
                                        }
                                    >

                                        <input
                                            type="password"
                                            autoComplete="new-password"
                                            id="password"
                                            placeholder="Leave blank to keep existing password"
                                            className={
                                                styles.inputField
                                            }
                                            value={
                                                password
                                            }
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }
                                        />


                                        {errors.password && (

                                            <p
                                                className={
                                                    styles.error
                                                }
                                            >
                                                {
                                                    errors.password
                                                }
                                            </p>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* Confirm Password */}

                            <div className="col-lg-6">

                                <label
                                    htmlFor="confirmPassword"
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Confirm Password
                                </label>


                                <div
                                    className={
                                        styles.managerFieldInner
                                    }
                                >

                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        id="confirmPassword"
                                        placeholder="Confirm new password"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                    />


                                    {errors.confirmPassword && (

                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.confirmPassword
                                            }
                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            CHARGER DETAILS
                        ================================================== */}

                        <div
                            className={
                                styles.chargerSection
                            }
                        >

                            <div
                                className={
                                    styles.chargerHeader
                                }
                            >

                                <label
                                    className={
                                        styles.labelText
                                    }
                                >
                                    Charger Details
                                </label>


                                <button
                                    type="button"
                                    className={
                                        styles.addChargerBtn
                                    }
                                    onClick={
                                        addCharger
                                    }
                                >
                                    + Add
                                </button>

                            </div>


                            <div
                                className={
                                    styles.chargerList
                                }
                            >

                                {chargerDetails.map(
                                    (
                                        charger,
                                        index
                                    ) => (

                                        <div
                                            className={
                                                styles.chargerRow
                                            }
                                            key={index}
                                        >

                                            {/* Charger ID */}

                                            <div
                                                className={
                                                    styles.chargerField
                                                }
                                            >

                                                <label
                                                    htmlFor={`chargerId-${index}`}
                                                    className={
                                                        styles.labelText
                                                    }
                                                >
                                                    Charger ID
                                                </label>


                                                <input
                                                    type="text"
                                                    autoComplete="off"
                                                    id={`chargerId-${index}`}
                                                    placeholder="Charger ID"
                                                    className={
                                                        styles.inputField
                                                    }
                                                    value={
                                                        charger.chargerId
                                                    }
                                                    onChange={(e) =>
                                                        handleChargerChange(
                                                            index,
                                                            "chargerId",
                                                            e.target.value
                                                        )
                                                    }
                                                />


                                                {errors
                                                    .chargerDetails?.[
                                                    index
                                                ]?.chargerId && (

                                                        <p
                                                            className={
                                                                styles.error
                                                            }
                                                        >
                                                            {
                                                                errors
                                                                    .chargerDetails[
                                                                    index
                                                                ]
                                                                    .chargerId
                                                            }
                                                        </p>

                                                    )}

                                            </div>


                                            {/* kWh */}

                                            <div
                                                className={
                                                    styles.chargerField
                                                }
                                            >

                                                <label
                                                    htmlFor={`kWh-${index}`}
                                                    className={
                                                        styles.labelText
                                                    }
                                                >
                                                    kWh
                                                </label>


                                                <input
                                                    type="text"
                                                    autoComplete="off"
                                                    id={`kWh-${index}`}
                                                    placeholder="kWh"
                                                    className={
                                                        styles.inputField
                                                    }
                                                    value={
                                                        charger.kWh
                                                    }
                                                    onChange={(e) => {

                                                        const value =
                                                            e.target.value;


                                                        if (
                                                            /^\d*\.?\d*$/.test(
                                                                value
                                                            )
                                                        ) {

                                                            handleChargerChange(
                                                                index,
                                                                "kWh",
                                                                value
                                                            );

                                                        }

                                                    }}
                                                />


                                                {errors
                                                    .chargerDetails?.[
                                                    index
                                                ]?.kWh && (

                                                        <p
                                                            className={
                                                                styles.error
                                                            }
                                                        >
                                                            {
                                                                errors
                                                                    .chargerDetails[
                                                                    index
                                                                ]
                                                                    .kWh
                                                            }
                                                        </p>

                                                    )}

                                            </div>


                                            {/* Remove Charger */}

                                            <div
                                                className={
                                                    styles.chargerAction
                                                }
                                            >

                                                <label
                                                    className={
                                                        styles.labelText
                                                    }
                                                    style={{
                                                        visibility:
                                                            "hidden",
                                                    }}
                                                >
                                                    Action
                                                </label>


                                                {chargerDetails.length >
                                                    1 ? (

                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.removeChargerBtn
                                                        }
                                                        onClick={() =>
                                                            removeCharger(
                                                                index
                                                            )
                                                        }
                                                        aria-label={`Remove charger ${index + 1}`}
                                                    >
                                                        X
                                                    </button>

                                                ) : (

                                                    <div
                                                        className={
                                                            styles.removePlaceholder
                                                        }
                                                    />

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            BUTTONS
                        ================================================== */}

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
                                        Updating...
                                    </>

                                ) : (

                                    "Update"

                                )}

                            </button>

                        </div>

                    </form>

                )}

            </div>

        </div>

    );

};


export default EditCommunity;