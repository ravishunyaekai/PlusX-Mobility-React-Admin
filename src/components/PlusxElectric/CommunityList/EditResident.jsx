import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithTokenAndFile,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

const EditResident = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ---------------------------------------------------
    // User Details
    // ---------------------------------------------------

    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails") || "null"
    );

    // ---------------------------------------------------
    // Existing Resident Data
    // ---------------------------------------------------

    const residentData =
        location.state?.resident ||
        location.state?.community ||
        location.state?.residentData ||
        location.state?.data ||
        null;

    // ---------------------------------------------------
    // Resident ID
    // ---------------------------------------------------

    const residentId =
        residentData?.resident_id ||
        residentData?.residentId ||
        residentData?.id ||
        location.state?.residentId ||
        location.state?.resident_id ||
        "";

    // ---------------------------------------------------
    // Form State
    // ---------------------------------------------------

    const [residentName, setResidentName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [community, setCommunity] = useState("");
    const [fullAddress, setFullAddress] = useState("");

    const [monthlySessionAllocation, setMonthlySessionAllocation] =
        useState("");

    const [allocatedTimeInMinute, setAllocatedTimeInMinute] =
        useState("");

    const [kwhAllocationPerMonth, setKwhAllocationPerMonth] =
        useState("");

    const [perKwhCharge, setPerKwhCharge] = useState("");

    const [extraChargePerMin, setExtraChargePerMin] = useState("");

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ---------------------------------------------------
    // Load Existing Resident Data
    // ---------------------------------------------------

    useEffect(() => {
        if (!residentData) {
            toast.error("Resident data not found.");
            return;
        }

        console.log("Existing Resident Data:", residentData);

        // ---------------------------------------------------
        // Resident Name
        // ---------------------------------------------------

        setResidentName(
            residentData?.resident_name ??
                residentData?.residentName ??
                residentData?.name ??
                ""
        );

        // ---------------------------------------------------
        // Mobile Number
        // ---------------------------------------------------

        setMobileNumber(
            residentData?.mobile_number ??
                residentData?.mobileNumber ??
                residentData?.resident_contact ??
                residentData?.residentContact ??
                residentData?.contact_no ??
                ""
        );

        // ---------------------------------------------------
        // Email Address
        // ---------------------------------------------------

        setEmailAddress(
            residentData?.email_address ??
                residentData?.email ??
                residentData?.resident_email ??
                residentData?.residentEmail ??
                ""
        );

        // ---------------------------------------------------
        // Community
        // ---------------------------------------------------

        setCommunity(
            residentData?.community ??
                residentData?.community_name ??
                residentData?.communityName ??
                residentData?.community_id ??
                residentData?.communityId ??
                ""
        );

        // ---------------------------------------------------
        // Full Address
        // ---------------------------------------------------

        setFullAddress(
            residentData?.full_address ??
                residentData?.fullAddress ??
                residentData?.address ??
                ""
        );

        // ---------------------------------------------------
        // Monthly Session Allocation
        // ---------------------------------------------------

        setMonthlySessionAllocation(
            residentData?.monthly_session_allocation ??
                residentData?.monthlySessionAllocation ??
                ""
        );

        // ---------------------------------------------------
        // Allocated Time In Minute
        // ---------------------------------------------------

        setAllocatedTimeInMinute(
            residentData?.allocated_time_in_minute ??
                residentData?.allocatedTimeInMinute ??
                residentData?.allocated_time ??
                residentData?.allocatedTime ??
                ""
        );

        // ---------------------------------------------------
        // kWh Allocation/Month
        // ---------------------------------------------------

        setKwhAllocationPerMonth(
            residentData?.kwh_allocation_per_month ??
                residentData?.kwhAllocationPerMonth ??
                residentData?.kwh_allocation ??
                residentData?.kwhAllocation ??
                ""
        );

        // ---------------------------------------------------
        // Per kWh Charge
        // ---------------------------------------------------

        setPerKwhCharge(
            residentData?.per_kwh_charge ??
                residentData?.perKwhCharge ??
                residentData?.price_per_kwh ??
                residentData?.pricePerKwh ??
                ""
        );

        // ---------------------------------------------------
        // Extra Charge/Min
        // ---------------------------------------------------

        setExtraChargePerMin(
            residentData?.extra_charge_per_min ??
                residentData?.extraChargePerMin ??
                residentData?.extra_charge_per_minute ??
                residentData?.extraChargePerMinute ??
                ""
        );
    }, [residentData]);

    // ---------------------------------------------------
    // Cancel
    // ---------------------------------------------------

    const handleCancel = () => {
        navigate(-1);
    };

    // ---------------------------------------------------
    // Clear Field Error
    // ---------------------------------------------------

    const clearError = (field) => {
        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    // ---------------------------------------------------
    // Form Validation
    // ---------------------------------------------------

    const validateForm = () => {
        const newErrors = {};

        // ---------------------------------------------------
        // Resident Name
        // ---------------------------------------------------

        if (!residentName.trim()) {
            newErrors.residentName =
                "Resident Name is required.";
        }

        // ---------------------------------------------------
        // Mobile Number
        // ---------------------------------------------------

        if (!mobileNumber.trim()) {
            newErrors.mobileNumber =
                "Mobile Number is required.";
        }

        // ---------------------------------------------------
        // Email Address
        // ---------------------------------------------------

        if (!emailAddress.trim()) {
            newErrors.emailAddress =
                "Email Address is required.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailAddress.trim())) {
                newErrors.emailAddress =
                    "Please enter a valid Email Address.";
            }
        }

        // ---------------------------------------------------
        // Community
        // ---------------------------------------------------

        if (!community) {
            newErrors.community =
                "Community is required.";
        }

        // ---------------------------------------------------
        // Full Address
        // ---------------------------------------------------

        if (!fullAddress.trim()) {
            newErrors.fullAddress =
                "Full Address is required.";
        }

        // ---------------------------------------------------
        // Monthly Session Allocation
        // ---------------------------------------------------

        if (!monthlySessionAllocation) {
            newErrors.monthlySessionAllocation =
                "Monthly Session Allocation is required.";
        }

        // ---------------------------------------------------
        // Allocated Time In Minute
        // ---------------------------------------------------

        if (!allocatedTimeInMinute) {
            newErrors.allocatedTimeInMinute =
                "Allocated Time is required.";
        }

        // ---------------------------------------------------
        // kWh Allocation/Month
        // ---------------------------------------------------

        if (!kwhAllocationPerMonth) {
            newErrors.kwhAllocationPerMonth =
                "kWh Allocation/Month is required.";
        }

        // ---------------------------------------------------
        // Per kWh Charge
        // ---------------------------------------------------

        if (!perKwhCharge) {
            newErrors.perKwhCharge =
                "Per kWh charge is required.";
        }

        // ---------------------------------------------------
        // Extra Charge/Min
        // ---------------------------------------------------

        if (!extraChargePerMin) {
            newErrors.extraChargePerMin =
                "Extra Charge/Min Over Allocated Time is required.";
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

        if (!residentId) {
            toast.error("Resident ID is missing.");
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
        // Resident ID
        // ---------------------------------------------------

        formData.append(
            "resident_id",
            residentId
        );

        // ---------------------------------------------------
        // Resident Details
        // ---------------------------------------------------

        formData.append(
            "resident_name",
            residentName.trim()
        );

        formData.append(
            "mobile_number",
            mobileNumber.trim()
        );

        formData.append(
            "email_address",
            emailAddress.trim()
        );

        formData.append(
            "community",
            community
        );

        formData.append(
            "full_address",
            fullAddress.trim()
        );

        formData.append(
            "monthly_session_allocation",
            monthlySessionAllocation
        );

        formData.append(
            "allocated_time_in_minute",
            allocatedTimeInMinute
        );

        formData.append(
            "kwh_allocation_per_month",
            kwhAllocationPerMonth
        );

        formData.append(
            "per_kwh_charge",
            perKwhCharge
        );

        formData.append(
            "extra_charge_per_min",
            extraChargePerMin
        );

        // ---------------------------------------------------
        // Debug
        // ---------------------------------------------------

        console.log(
            "Updating Resident:",
            residentId
        );

        console.log(
            "Resident Form Data:",
            {
                resident_id: residentId,
                resident_name: residentName,
                mobile_number: mobileNumber,
                email_address: emailAddress,
                community: community,
                full_address: fullAddress,
                monthly_session_allocation:
                    monthlySessionAllocation,
                allocated_time_in_minute:
                    allocatedTimeInMinute,
                kwh_allocation_per_month:
                    kwhAllocationPerMonth,
                per_kwh_charge: perKwhCharge,
                extra_charge_per_min:
                    extraChargePerMin,
            }
        );

        // ---------------------------------------------------
        // API
        // ---------------------------------------------------

        postRequestWithTokenAndFile(
            "public-charger-edit-station",
            formData,
            async (response) => {
                if (response.status === 1) {
                    toast.success(
                        response.message ||
                            "Resident updated successfully."
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
    }, [navigate, userDetails]);

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    return (
        <div className={styles.addStationContainer}>

            {/* =====================================================
                HEADING
            ====================================================== */}

            <div className={styles.addHeading}>
                Edit Resident
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
                        RESIDENT DETAILS
                    ====================================================== */}

                    <div className="row">

                        {/* -------------------------------------------------
                            Resident Name
                        -------------------------------------------------- */}

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
                                        onChange={(e) => {
                                            setResidentName(
                                                e.target.value.slice(
                                                    0,
                                                    50
                                                )
                                            );

                                            clearError(
                                                "residentName"
                                            );
                                        }}
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

                        {/* -------------------------------------------------
                            Mobile Number
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="mobileNumber"
                                className={
                                    styles.labelText
                                }
                            >
                                Mobile Number
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="mobileNumber"
                                        placeholder="+91"
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
                                                /^\+?\d{0,15}$/.test(
                                                    value
                                                )
                                            ) {
                                                setMobileNumber(
                                                    value
                                                );

                                                clearError(
                                                    "mobileNumber"
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

                        {/* -------------------------------------------------
                            Email Address
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="emailAddress"
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
                                        id="emailAddress"
                                        placeholder="Email ID"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            emailAddress
                                        }
                                        onChange={(e) => {
                                            setEmailAddress(
                                                e.target.value
                                            );

                                            clearError(
                                                "emailAddress"
                                            );
                                        }}
                                    />

                                    {errors.emailAddress && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.emailAddress
                                            }
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* -------------------------------------------------
                            Community
                        -------------------------------------------------- */}

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

                                    <select
                                        id="community"
                                        className={
                                            styles.inputField
                                        }
                                        value={community}
                                        onChange={(e) => {
                                            setCommunity(
                                                e.target.value
                                            );

                                            clearError(
                                                "community"
                                            );
                                        }}
                                    >
                                        <option value="">
                                            Select...
                                        </option>

                                        {/* 
                                            Add your community
                                            options/API here.
                                        */}

                                    </select>

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

                            </div>

                        </div>

                        {/* -------------------------------------------------
                            Full Address
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="fullAddress"
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
                                        id="fullAddress"
                                        placeholder="Enter full address"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            fullAddress
                                        }
                                        onChange={(e) => {
                                            setFullAddress(
                                                e.target.value.slice(
                                                    0,
                                                    250
                                                )
                                            );

                                            clearError(
                                                "fullAddress"
                                            );
                                        }}
                                    />

                                    {errors.fullAddress && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.fullAddress
                                            }
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* -------------------------------------------------
                            Monthly Session Allocation
                        -------------------------------------------------- */}

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

                                                clearError(
                                                    "monthlySessionAllocation"
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

                        {/* -------------------------------------------------
                            Allocated Time In Minute
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="allocatedTimeInMinute"
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
                                        autoComplete="off"
                                        id="allocatedTimeInMinute"
                                        placeholder="Allocated Time"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            allocatedTimeInMinute
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setAllocatedTimeInMinute(
                                                    value
                                                );

                                                clearError(
                                                    "allocatedTimeInMinute"
                                                );
                                            }
                                        }}
                                    />

                                    {errors.allocatedTimeInMinute && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.allocatedTimeInMinute
                                            }
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* -------------------------------------------------
                            kWh Allocation/Month
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="kwhAllocationPerMonth"
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
                                        autoComplete="off"
                                        id="kwhAllocationPerMonth"
                                        placeholder="kWh Allocation/Month"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            kwhAllocationPerMonth
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*\.?\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setKwhAllocationPerMonth(
                                                    value
                                                );

                                                clearError(
                                                    "kwhAllocationPerMonth"
                                                );
                                            }
                                        }}
                                    />

                                    {errors.kwhAllocationPerMonth && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.kwhAllocationPerMonth
                                            }
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* -------------------------------------------------
                            Per kWh Charge
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="perKwhCharge"
                                className={
                                    styles.labelText
                                }
                            >
                                Per kWh charge (AED)
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="perKwhCharge"
                                        placeholder="Per kWh charge (AED)"
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

                                                clearError(
                                                    "perKwhCharge"
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

                        {/* -------------------------------------------------
                            Extra Charge/Min
                        -------------------------------------------------- */}

                        <div className="col-lg-6">

                            <label
                                htmlFor="extraChargePerMin"
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
                                        autoComplete="off"
                                        id="extraChargePerMin"
                                        placeholder="Extra Charge/Min Over Allocated Time (AED)"
                                        className={
                                            styles.inputField
                                        }
                                        value={
                                            extraChargePerMin
                                        }
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            if (
                                                /^\d*\.?\d*$/.test(
                                                    value
                                                )
                                            ) {
                                                setExtraChargePerMin(
                                                    value
                                                );

                                                clearError(
                                                    "extraChargePerMin"
                                                );
                                            }
                                        }}
                                    />

                                    {errors.extraChargePerMin && (
                                        <p
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                errors.extraChargePerMin
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

export default EditResident;