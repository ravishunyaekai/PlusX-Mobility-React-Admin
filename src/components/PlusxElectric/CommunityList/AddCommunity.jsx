import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithToken,
    postRequestWithTokenAndFile,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

import {
    getCountries,
    getCountryCallingCode,
} from "libphonenumber-js";

import CustomDropdown from "../../SharedComponent/UI/CustomDropdown/CustomDropdown";


const AddCommunity = () => {

    const navigate = useNavigate();

    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails")
    );


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


    // =========================================================
    // SELECTED COUNTRY CODE
    // =========================================================

    const selectedCountryCode =
        countryCodeOptions.find(
            (option) =>
                option.value === countryCode
        ) || null;


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
            prev.map((charger, i) =>
                i === index
                    ? {
                        ...charger,
                        [field]: value,
                    }
                    : charger
            )
        );


        // Clear field-specific error
        setErrors((prev) => {

            const updatedErrors = {
                ...prev,
            };

            if (
                updatedErrors.chargerDetails?.[index]?.[field]
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

        // At least one charger is required
        if (chargerDetails.length === 1) {
            return;
        }

        setChargerDetails((prev) =>
            prev.filter((_, i) => i !== index)
        );


        setErrors((prev) => {

            const updatedErrors = {
                ...prev,
            };

            if (updatedErrors.chargerDetails) {

                updatedErrors.chargerDetails =
                    updatedErrors.chargerDetails.filter(
                        (_, i) => i !== index
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


        // -----------------------------------------------------
        // Community Name
        // -----------------------------------------------------

        if (!communityName.trim()) {

            newErrors.communityName =
                "Community Name is required.";

        }


        // -----------------------------------------------------
        // Area Name
        // -----------------------------------------------------

        if (!areaName.trim()) {

            newErrors.areaName =
                "Area Name is required.";

        }


        // -----------------------------------------------------
        // Total Residents
        // -----------------------------------------------------

        if (!totalResidents) {

            newErrors.totalResidents =
                "Total No. of Residents is required.";

        }


        // -----------------------------------------------------
        // Manager Name
        // -----------------------------------------------------

        if (!managerName.trim()) {

            newErrors.managerName =
                "Manager Name is required.";

        }


        // -----------------------------------------------------
        // Manager Email
        // -----------------------------------------------------

        if (!managerEmail.trim()) {

            newErrors.managerEmail =
                "Email ID is required.";

        } else {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(managerEmail)) {

                newErrors.managerEmail =
                    "Please enter a valid Email ID.";

            }

        }


        // -----------------------------------------------------
        // Manager Contact
        //
        // Backend does NOT require manager_contact,
        // so this remains optional.
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // Password
        // -----------------------------------------------------

        if (!password) {

            newErrors.password =
                "Password is required.";

        } else if (password.length < 6) {

            newErrors.password =
                "Password must be at least 6 characters.";

        }


        // -----------------------------------------------------
        // Confirm Password
        //
        // Frontend only.
        // Not sent to backend.
        // -----------------------------------------------------

        if (!confirmPassword) {

            newErrors.confirmPassword =
                "Confirm Password is required.";

        } else if (
            password &&
            confirmPassword &&
            password !== confirmPassword
        ) {

            newErrors.confirmPassword =
                "Passwords do not match.";

        }


        // -----------------------------------------------------
        // Charger Details
        // -----------------------------------------------------

        const chargerErrors = [];

        chargerDetails.forEach(
            (charger) => {

                const rowErrors = {};


                if (!charger.chargerId.trim()) {

                    rowErrors.chargerId =
                        "Charger ID is required.";

                }


                if (!charger.kWh) {

                    rowErrors.kWh =
                        "kWh is required.";

                }


                chargerErrors.push(rowErrors);

            }
        );


        const hasChargerErrors =
            chargerErrors.some(
                (error) =>
                    Object.keys(error).length > 0
            );


        if (hasChargerErrors) {

            newErrors.chargerDetails =
                chargerErrors;

        }


        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );

    };


    // =========================================================
    // SUBMIT COMMUNITY
    // =========================================================

    const handleSubmit = (e) => {

        e.preventDefault();


        // -----------------------------------------------------
        // Validate
        // -----------------------------------------------------

        const isValid = validateForm();

        if (!isValid) {

            toast.error(
                "Some fields are missing or invalid."
            );

            return;

        }


        // -----------------------------------------------------
        // Prevent multiple submissions
        // -----------------------------------------------------

        if (loading) {
            return;
        }


        setLoading(true);


        // =====================================================
        // CREATE FORMDATA
        // =====================================================

        const formData = new FormData();


        // -----------------------------------------------------
        // Authentication Details
        // -----------------------------------------------------

        formData.append(
            "userId",
            userDetails?.user_id || ""
        );

        formData.append(
            "email",
            userDetails?.email || ""
        );


        // -----------------------------------------------------
        // Community Details
        //
        // Backend:
        // community_name
        // area_name
        // total_residence
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // Charger Details
        //
        // Backend expects:
        //
        // chargers = JSON string array
        // kwValues = JSON string array
        //
        // Example:
        // chargers = ["CH001","CH002"]
        // kwValues = ["7","11"]
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // Manager Details
        // -----------------------------------------------------

        formData.append(
            "manager_name",
            managerName.trim()
        );

        formData.append(
            "manager_email",
            managerEmail.trim()
        );


        // -----------------------------------------------------
        // Country Code
        //
        // Backend:
        // country_code = '+971' by default
        //
        // Frontend sends selected value.
        // Example:
        // +91
        // -----------------------------------------------------

        formData.append(
            "country_code",
            countryCode || "+971"
        );


        // -----------------------------------------------------
        // Manager Contact
        //
        // Backend does not require this field, but we ALWAYS
        // send it as an empty string when not provided.
        //
        // This is important because MySQL2 does not accept
        // undefined bind parameters.
        // -----------------------------------------------------

        formData.append(
            "manager_contact",
            managerContact || ""
        );


        // -----------------------------------------------------
        // Password
        // -----------------------------------------------------

        formData.append(
            "password",
            password
        );


        // -----------------------------------------------------
        // confirm_password is NOT sent.
        //
        // It is only used by frontend validation.
        // -----------------------------------------------------


        // =====================================================
        // DEBUG FORMDATA
        // =====================================================

        console.log(
            "Community Add Form Data:"
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
        // COMMUNITY ADD API
        // =====================================================

        postRequestWithToken(
            "community-add",
            formData,
            async (response) => {

                console.log(
                    "community-add response:",
                    response
                );


                // -------------------------------------------------
                // SUCCESS
                // Backend:
                // { status: 1, message: "..." }
                // -------------------------------------------------

                if (
                    response?.status === 1
                ) {

                    toast.success(
                        response?.message ||
                        "Community added successfully."
                    );


                    setTimeout(() => {

                        setLoading(false);

                        navigate(
                            "/electric/community/community-list"
                        );

                    }, 1000);


                    return;

                }


                // -------------------------------------------------
                // API VALIDATION / ERROR
                // -------------------------------------------------

                toast.error(
                    response?.message ||
                    "Failed to add community."
                );

                console.error(
                    "community-add API error:",
                    response
                );


                setLoading(false);

            }
        );

    };


    // =========================================================
    // AUTHENTICATION CHECK
    // =========================================================

    useEffect(() => {

        if (
            !userDetails ||
            !userDetails.access_token
        ) {

            navigate("/login");

        }

    }, [navigate, userDetails]);


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
                Add Community
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
                    onSubmit={handleSubmit}
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
                                        placeholder="Password"
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
                                    placeholder="Confirm Password"
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
                        SUBMIT / CANCEL
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
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            disabled={loading}
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

                                "Submit"

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};


export default AddCommunity;
