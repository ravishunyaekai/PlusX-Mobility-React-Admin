import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithTokenAndFile,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

const EditCommunity = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ---------------------------------------------------
    // User Details
    // ---------------------------------------------------

    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails") || "null"
    );

    // ---------------------------------------------------
    // Existing Community Data
    // ---------------------------------------------------

    const communityData =
        location.state?.community ||
        location.state?.communityData ||
        location.state?.data ||
        null;

    // ---------------------------------------------------
    // Community ID
    // ---------------------------------------------------

    const communityId =
        communityData?.community_id ||
        communityData?.communityId ||
        communityData?.id ||
        location.state?.communityId ||
        location.state?.community_id ||
        "";

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
    // Load Existing Community Data
    // ---------------------------------------------------

    useEffect(() => {
        if (!communityData) {
            toast.error("Community data not found.");

            setTimeout(() => {
                // navigate(
                //     "/electric/public-charger-station/public-charger-station-list"
                // );
            }, 1000);

            return;
        }

        // ---------------------------------------------------
        // Community Details
        // ---------------------------------------------------

        setCommunityName(
            communityData?.community_name ||
                communityData?.communityName ||
                ""
        );

        setAreaName(
            communityData?.area_name ||
                communityData?.areaName ||
                ""
        );

        setTotalResidents(
            communityData?.total_residents ??
                communityData?.totalResidents ??
                ""
        );

        // ---------------------------------------------------
        // Manager Details
        // ---------------------------------------------------

        setManagerName(
            communityData?.manager_name ||
                communityData?.managerName ||
                ""
        );

        setManagerEmail(
            communityData?.manager_email ||
                communityData?.managerEmail ||
                ""
        );

        setManagerContact(
            communityData?.manager_contact ||
                communityData?.managerContact ||
                ""
        );

        // ---------------------------------------------------
        // Charger Details
        // ---------------------------------------------------

        let existingChargers =
            communityData?.charger_details ||
            communityData?.chargerDetails ||
            communityData?.chargers ||
            [];

        // If API sends charger_details as JSON string
        if (typeof existingChargers === "string") {
            try {
                existingChargers = JSON.parse(
                    existingChargers
                );
            } catch (error) {
                console.error(
                    "Unable to parse charger details:",
                    error
                );

                existingChargers = [];
            }
        }

        if (
            Array.isArray(existingChargers) &&
            existingChargers.length > 0
        ) {
            setChargerDetails(
                existingChargers.map((charger) => ({
                    chargerId:
                        charger?.chargerId ||
                        charger?.charger_id ||
                        "",
                    kWh:
                        charger?.kWh ??
                        charger?.kwh ??
                        charger?.kwH ??
                        "",
                }))
            );
        } else {
            setChargerDetails([
                {
                    chargerId: "",
                    kWh: "",
                },
            ]);
        }
    }, [communityData, navigate]);

    // ---------------------------------------------------
    // Cancel
    // ---------------------------------------------------

    const handleCancel = () => {
        navigate(
            "/electric/public-charger-station/public-charger-station-list"
        );
    };

    // ---------------------------------------------------
    // Charger Details - Change
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

        // Clear field-specific error
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
        // At least one charger should remain
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

        // ---------------------------------------------------
        // Community Name
        // ---------------------------------------------------

        if (!communityName.trim()) {
            newErrors.communityName =
                "Community Name is required.";
        }

        // ---------------------------------------------------
        // Area Name
        // ---------------------------------------------------

        if (!areaName.trim()) {
            newErrors.areaName =
                "Area Name is required.";
        }

        // ---------------------------------------------------
        // Total Residents
        // ---------------------------------------------------

        if (!totalResidents) {
            newErrors.totalResidents =
                "Total No. of Residents is required.";
        }

        // ---------------------------------------------------
        // Manager Name
        // ---------------------------------------------------

        if (!managerName.trim()) {
            newErrors.managerName =
                "Manager Name is required.";
        }

        // ---------------------------------------------------
        // Manager Email
        // ---------------------------------------------------

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

        // ---------------------------------------------------
        // Password
        // ---------------------------------------------------

        // Password is optional during edit.
        // If user enters password, confirm password is required.

        if (password && !confirmPassword) {
            newErrors.confirmPassword =
                "Confirm Password is required.";
        }

        // ---------------------------------------------------
        // Password Match
        // ---------------------------------------------------

        if (
            password &&
            confirmPassword &&
            password !== confirmPassword
        ) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        // ---------------------------------------------------
        // Charger Details
        // ---------------------------------------------------

        const chargerErrors = [];

        chargerDetails.forEach((charger) => {
            const rowErrors = {};

            if (!charger.chargerId.trim()) {
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

            chargerErrors.push(rowErrors);
        });

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

    // ---------------------------------------------------
    // Submit
    // ---------------------------------------------------

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Some fields are missing");
            return;
        }

        if (!communityId) {
            toast.error(
                "Community ID is missing."
            );
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
        // Community ID
        // ---------------------------------------------------

        formData.append(
            "community_id",
            communityId
        );

        // ---------------------------------------------------
        // Community Details
        // ---------------------------------------------------

        formData.append(
            "community_name",
            communityName.trim()
        );

        formData.append(
            "area_name",
            areaName.trim()
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
            managerName.trim()
        );

        formData.append(
            "manager_email",
            managerEmail.trim()
        );

        if (managerContact) {
            formData.append(
                "manager_contact",
                managerContact
            );
        }

        // ---------------------------------------------------
        // Password
        // ---------------------------------------------------

        // Only send password if user wants to change it.
        if (password) {
            formData.append(
                "password",
                password
            );

            formData.append(
                "confirm_password",
                confirmPassword
            );
        }

        // ---------------------------------------------------
        // Charger Details
        // ---------------------------------------------------

        const formattedChargerDetails =
            chargerDetails.map((charger) => ({
                chargerId:
                    charger.chargerId.trim(),
                kWh: charger.kWh,
            }));

        formData.append(
            "charger_details",
            JSON.stringify(
                formattedChargerDetails
            )
        );

        // ---------------------------------------------------
        // Debug
        // ---------------------------------------------------

        console.log(
            "Updating Community:",
            communityId
        );

        console.log(
            "Charger Details:",
            formattedChargerDetails
        );

        // ---------------------------------------------------
        // API
        // ---------------------------------------------------

        /*
         * Change this endpoint if your backend
         * uses a different update API name.
         *
         * Current endpoint:
         * public-charger-edit-station
         */

        postRequestWithTokenAndFile(
            "public-charger-edit-station",
            formData,
            async (response) => {
                if (response.status === 1) {
                    toast.success(
                        response.message ||
                            "Community updated successfully."
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

                    console.error(
                        "Error in public-charger-edit-station API:",
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
    }, [navigate]);

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    return (
        <div className={styles.addStationContainer}>
            {/* =====================================================
                HEADING
            ====================================================== */}

            <div className={styles.addHeading}>
                Edit Community
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
                                        placeholder="+91 Contact No"
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
                                New Password (Optional)
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        id="password"
                                        placeholder="New Password"
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
                                Confirm New Password
                            </label>

                            <div className="row">
                                <div className="col-xl-10 col-lg-12">
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        id="confirmPassword"
                                        placeholder="Confirm New Password"
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

                    <div
                        className={
                            styles.chargerSection
                        }
                    >
                        {/* Charger Header */}
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

                        {/* Charger List */}
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
                                        {/* =================================================
                                            CHARGER ID
                                        ================================================== */}

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

                                        {/* =================================================
                                            KWH
                                        ================================================== */}

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

                                        {/* =================================================
                                            REMOVE BUTTON
                                        ================================================== */}

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
                                                    aria-label={`Remove charger ${
                                                        index + 1
                                                    }`}
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
                                    Update...
                                </>
                            ) : (
                                "Update"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCommunity;
