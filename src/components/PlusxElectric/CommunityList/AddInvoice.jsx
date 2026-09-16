import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    postRequestWithToken,
} from "../../../api/Requests";

import styles from "./AddCommunity.module.css";

const AddInvoice = () => {
    const navigate = useNavigate();

    const userDetails = JSON.parse(
        sessionStorage.getItem("userDetails")
    );

    // =========================================================
    // FORM STATE
    // =========================================================

    const [community, setCommunity] = useState("");
    const [area, setArea] = useState("");

    const [residentId, setResidentId] = useState("");
    const [residentName, setResidentName] = useState("");

    const [billingMonth, setBillingMonth] = useState(() => {
        const date = new Date();

        return date.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });
    });

    // =========================================================
    // INVOICE DETAILS
    // =========================================================

    const [invoiceData, setInvoiceData] = useState({
        residentName: "",
        kwhUsed: "",
        kwhAllocated: "",
        energyCharge: "",
        overTime: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
    }, [navigate, userDetails]);

    // =========================================================
    // COMMUNITY
    // =========================================================

    const handleCommunityChange = (e) => {
        setCommunity(e.target.value);

        setErrors((prev) => ({
            ...prev,
            community: "",
        }));
    };

    // =========================================================
    // AREA
    // =========================================================

    const handleAreaChange = (e) => {
        setArea(e.target.value);

        setErrors((prev) => ({
            ...prev,
            area: "",
        }));
    };

    // =========================================================
    // RESIDENT ID
    // =========================================================

    const handleResidentIdChange = (e) => {
        const value = e.target.value;

        setResidentId(value);

        setErrors((prev) => ({
            ...prev,
            residentId: "",
        }));
    };

    // =========================================================
    // RESIDENT NAME
    // =========================================================

    const handleResidentNameChange = (e) => {
        const value = e.target.value;

        setResidentName(value);

        // Keep lower invoice resident name synchronized
        setInvoiceData((prev) => ({
            ...prev,
            residentName: value,
        }));

        setErrors((prev) => ({
            ...prev,
            residentName: "",
        }));
    };

    // =========================================================
    // INVOICE FIELD CHANGE
    // =========================================================

    const handleInvoiceChange = (field, value) => {
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

    const handleNumericChange = (field, value) => {
        if (/^\d*\.?\d*$/.test(value)) {
            handleInvoiceChange(field, value);
        }
    };

    // =========================================================
    // TOTAL
    // =========================================================

    const calculateTotal = () => {
        const energyCharge =
            parseFloat(invoiceData.energyCharge) || 0;

        const overTime =
            parseFloat(invoiceData.overTime) || 0;

        return (
            energyCharge + overTime
        ).toFixed(2);
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        if (!community.trim()) {
            newErrors.community =
                "Community is required.";
        }

        if (!area.trim()) {
            newErrors.area =
                "Area is required.";
        }

        if (!residentId.trim()) {
            newErrors.residentId =
                "Resident ID is required.";
        }

        if (!residentName.trim()) {
            newErrors.residentName =
                "Resident Name is required.";
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

        setLoading(true);

        const payload = {
            userId:
                userDetails?.user_id || "",

            email:
                userDetails?.email || "",

            community,
            area,

            resident_id:
                residentId,

            resident_name:
                residentName,

            billing_month:
                billingMonth,

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
        // CONNECT YOUR ACTUAL API HERE
        // =====================================================

        /*
        postRequestWithToken(
            "create-invoice",
            payload,
            (response) => {

                if (response.status === 1) {

                    toast.success(
                        response.message ||
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
                        response.message ||
                        "Something went wrong."
                    );

                    setLoading(false);
                }
            }
        );
        */

        // Temporary success for UI testing
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
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        COMMUNITY + AREA
                    ================================================= */}

                    <div
                        className={
                            styles.invoiceTopRow
                        }
                    >

                        {/* Community */}

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

                            <select
                                id="community"
                                value={community}
                                onChange={
                                    handleCommunityChange
                                }
                                className={
                                    styles.inputField
                                }
                            >

                                <option value="">
                                    Select Community
                                </option>

                                <option value="Community 1">
                                    Community 1
                                </option>

                                <option value="Community 2">
                                    Community 2
                                </option>

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


                        {/* Area */}

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

                            <select
                                id="area"
                                value={area}
                                onChange={
                                    handleAreaChange
                                }
                                className={
                                    styles.inputField
                                }
                            >

                                <option value="">
                                    Select Area
                                </option>

                                <option value="Area 1">
                                    Area 1
                                </option>

                                <option value="Area 2">
                                    Area 2
                                </option>

                            </select>

                            {errors.area && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {errors.area}
                                </p>
                            )}

                        </div>

                    </div>


                    {/* =================================================
                        RESIDENT ID + RESIDENT NAME + BILLING MONTH
                    ================================================== */}

                    <div
                        className={
                            styles.invoiceResidentRow
                        }
                    >

                        {/* Resident ID */}

                        <div
                            className={
                                styles.invoiceField
                            }
                        >

                            <label
                                htmlFor="residentId"
                                className={
                                    styles.labelText
                                }
                            >
                                Resident ID
                            </label>

                            <input
                                type="text"
                                id="residentId"
                                autoComplete="off"
                                placeholder="Search resident ID..."
                                value={residentId}
                                onChange={
                                    handleResidentIdChange
                                }
                                className={
                                    styles.inputField
                                }
                            />

                            {errors.residentId && (
                                <p
                                    className={
                                        styles.error
                                    }
                                >
                                    {
                                        errors.residentId
                                    }
                                </p>
                            )}

                        </div>


                        {/* Resident Name */}

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
                                placeholder="Search resident name..."
                                value={residentName}
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


                        {/* Billing Month */}

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
                                type="text"
                                id="billingMonth"
                                value={billingMonth}
                                placeholder="Billing Month"
                                readOnly
                                className={
                                    styles.inputField
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        INVOICE DETAILS BOX
                    ================================================== */}

                    <div
                        className={
                            styles.invoiceDetailsSection
                        }
                    >

                        {/* =================================================
                            RESIDENT NAME
                        ================================================== */}

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
                                    // placeholder="Enter resident name"
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


                        {/* =================================================
                            KWH USED / ALLOCATED
                        ================================================== */}

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
                                Kwh Used/ Allocated
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
                                        // placeholder="Used"
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
{/* 
                                    <span
                                        className={
                                            styles.kwhSlash
                                        }
                                    >
                                    </span> */}

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        // placeholder="Allocated"
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


                        {/* =================================================
                            ENERGY CHARGE
                        ================================================== */}

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
                                        // placeholder="Enter energy charge"
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


                        {/* =================================================
                            OVER TIME
                        ================================================== */}

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
                                        // placeholder="Enter overtime charge"
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


                        {/* =================================================
                            TOTAL AMOUNT
                        ================================================== */}

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
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
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