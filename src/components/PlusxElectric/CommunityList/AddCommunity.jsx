import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithTokenAndFile,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

const AddCommunity = () => {
    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails")
    );

    const navigate = useNavigate();

    // ---------------------------------------------------
    // Form State
    // ---------------------------------------------------

    const [communityName, setCommunityName] = useState("");
    const [areaName, setAreaName] = useState("");
    const [totalResidents, setTotalResidents] = useState("");

    const [managerName, setManagerName] = useState("");
    const [managerEmail, setManagerEmail] = useState("");
    const [managerContact, setManagerContact] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ---------------------------------------------------
    // Charger Details
    // ---------------------------------------------------

    const [chargerDetails, setChargerDetails] = useState([
        {
            chargerId: "",
            kWh: "",
        },
    ]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ---------------------------------------------------
    // Cancel
    // ---------------------------------------------------

    const handleCancel = () => {
        navigate(
            "/electric/public-charger-station/public-charger-station-list"
        );
    };

    // ---------------------------------------------------
    // Charger Details Handlers
    // ---------------------------------------------------

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

        // Clear individual charger error
        setErrors((prev) => {
            const updatedErrors = {
                ...prev,
            };

            if (
                updatedErrors.chargerDetails?.[index]?.[
                field
                ]
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

    // ---------------------------------------------------
    // Add Charger
    // ---------------------------------------------------

    const addCharger = () => {
        setChargerDetails((prev) => [
            ...prev,
            {
                chargerId: "",
                kWh: "",
            },
        ]);
    };

    // ---------------------------------------------------
    // Remove Charger
    // ---------------------------------------------------

    const removeCharger = (index) => {
        // Do not allow removing the last charger
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

    // ---------------------------------------------------
    // Form Validation
    // ---------------------------------------------------

    const validateForm = () => {
        const newErrors = {};

        // Community Name
        if (!communityName.trim()) {
            newErrors.communityName =
                "Community Name is required.";
        }

        // Area Name
        if (!areaName.trim()) {
            newErrors.areaName =
                "Area Name is required.";
        }

        // Total Residents
        if (!totalResidents) {
            newErrors.totalResidents =
                "Total No. of Residents is required.";
        }

        // Manager Name
        if (!managerName.trim()) {
            newErrors.managerName =
                "Manager Name is required.";
        }

        // Manager Email
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

        // Password
        if (!password) {
            newErrors.password =
                "Password is required.";
        }

        // Confirm Password
        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Confirm Password is required.";
        }

        // Password Match
        if (
            password &&
            confirmPassword &&
            password !== confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        // ---------------------------------------------------
        // Charger Details Validation
        // ---------------------------------------------------

        const chargerErrors = [];

        chargerDetails.forEach((charger, index) => {
            const rowErrors = {};

            if (!charger.chargerId.trim()) {
                rowErrors.chargerId =
                    "Charger ID is required.";
            }

            if (!charger.kWh) {
                rowErrors.kWh =
                    "kWh is required.";
            }

            chargerErrors[index] = rowErrors;
        });

        const hasChargerErrors = chargerErrors.some(
            (error) =>
                Object.keys(error).length > 0
        );

        if (hasChargerErrors) {
            newErrors.chargerDetails = chargerErrors;
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ---------------------------------------------------
    // Submit
    // ---------------------------------------------------

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Some fields are missing");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        // ---------------------------------------------------
        // Existing User Details
        // ---------------------------------------------------

        formData.append(
            "userId",
            userDetails?.user_id || ""
        );

        formData.append(
            "email",
            userDetails?.email || ""
        );

        // ---------------------------------------------------
        // Community Details
        // ---------------------------------------------------

        formData.append(
            "community_name",
            communityName
        );

        formData.append(
            "area_name",
            areaName
        );

        formData.append(
            "total_residents",
            totalResidents
        );

        // ---------------------------------------------------
        // Manager Details
        // ---------------------------------------------------

        formData.append(
            "manager_name",
            managerName
        );

        formData.append(
            "manager_email",
            managerEmail
        );

        if (managerContact) {
            formData.append(
                "manager_contact",
                managerContact
            );
        }

        formData.append(
            "password",
            password
        );

        formData.append(
            "confirm_password",
            confirmPassword
        );

        // ---------------------------------------------------
        // Charger Details
        // ---------------------------------------------------

        formData.append(
            "charger_details",
            JSON.stringify(chargerDetails)
        );

        // ---------------------------------------------------
        // API
        // ---------------------------------------------------

        postRequestWithTokenAndFile(
            "public-charger-add-station",
            formData,
            async (response) => {
                if (response.status === 1) {
                    toast.success(
                        response.message ||
                        "Community added successfully."
                    );

                    setTimeout(() => {
                        setLoading(false);

                        navigate(
                            "/electric/public-charger-station/public-charger-station-list"
                        );
                    }, 1000);
                } else {
                    toast.error(
                        response.message ||
                        "Something went wrong."
                    );

                    console.log(
                        "Error in public-charger-add-station API:",
                        response
                    );

                    setLoading(false);
                }
            }
        );
    };

    // ---------------------------------------------------
    // Authentication Check
    // ---------------------------------------------------

    useEffect(() => {
        if (
            !userDetails ||
            !userDetails.access_token
        ) {
            navigate("/login");
        }
    }, [navigate, userDetails]);

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    return (
        <div className={styles.addStationContainer}>
            <div className={styles.addHeading}>
                Add Community
            </div>

            <div
                className={
                    styles.addStationFormSection
                }
            >
                <ToastContainer />

                <form
                    className={styles.formSection}
                    onSubmit={handleSubmit}
                >
                    {/* =====================================================
                        COMMUNITY DETAILS
                    ====================================================== */}

                    <div className="row">
                        {/* <div
                            className={
                                styles.chargerHeader
                            }
                        > */}
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Community Details
                            </label>

                        {/* </div> */}
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
                                        value={areaName}
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

                    {/* =====================================================
                        MANAGER DETAILS
                    ====================================================== */}

                    <div className="row">
                        {/* <div
                            className={
                                styles.chargerHeader
                            }
                        > */}
                            <label
                                className={
                                    styles.labelText
                                }
                            >
                                Manager Details
                            </label>

                        {/* </div> */}
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

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="managerName"
                                        placeholder="Manager Name"
                                        className={
                                            styles.inputField
                                        }
                                        value={managerName}
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

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="email"
                                        autoComplete="off"
                                        id="managerEmail"
                                        placeholder="Email ID"
                                        className={
                                            styles.inputField
                                        }
                                        value={managerEmail}
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
                        </div>

                        {/* Manager Contact */}
                        <div className="col-lg-6">
                            <label
                                htmlFor="managerContact"
                                className={
                                    styles.labelText
                                }
                            >
                                Contact No (Optional)
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="managerContact"
                                        placeholder="+971 Contact No"
                                        className={
                                            styles.inputField
                                        }
                                        value={managerContact}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\+?\d{0,15}$/.test(
                                                    value
                                                )
                                            ) {
                                                setManagerContact(
                                                    value
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="col-lg-6">
                            <label
                                htmlFor="password"
                                className={
                                    styles.labelText
                                }
                            >
                                Password
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        id="password"
                                        placeholder="Password"
                                        className={
                                            styles.inputField
                                        }
                                        value={password}
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

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
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
                    </div>

                    {/* =====================================================
                        CHARGER DETAILS
                    ====================================================== */}

                    <div className={styles.chargerSection}>
                        {/* Charger Heading + Add Button */}
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
                                onClick={addCharger}
                            >
                                + Add
                            </button>
                        </div>

                        {/* Charger Rows */}
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
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleChargerChange(
                                                        index,
                                                        "chargerId",
                                                        e
                                                            .target
                                                            .value
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
                                                onChange={(
                                                    e
                                                ) => {
                                                    const value =
                                                        e
                                                            .target
                                                            .value;

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

                                        {/* Remove Button */}
                                        <div
                                            className={
                                                styles.chargerAction
                                            }
                                        >
                                            <label
                                                className={
                                                    styles.labelText
                                                }
                                                style={{ visibility: "hidden" }}
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
                            onClick={handleCancel}
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
