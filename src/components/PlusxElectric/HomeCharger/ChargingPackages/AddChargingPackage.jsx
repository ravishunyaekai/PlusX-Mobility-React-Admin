import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./addpackage.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postRequestWithToken } from "../../../../api/Requests";
import Loader from "../../../SharedComponent/Loader/Loader";

const AddEditChargingPackage = () => {

    const navigate = useNavigate();
    const { id } = useParams();

    const userDetails = JSON.parse(
        sessionStorage.getItem('userDetails')
    );

    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    const [formData, setFormData] = useState({
        package_name: "",
        charging_capacity: "",
        price_per_unit: "",
        service_fee: "",
    });

    const [errors, setErrors] = useState({});

    // -----------------------------------------
    // Fetch Package Details For Edit
    // -----------------------------------------
    useEffect(() => {

        if (!userDetails || !userDetails.access_token) {

            navigate('/login');
            return;

        }

        if (isEditMode) {

            fetchPackageDetails();

        }

    }, [id]);

    const fetchPackageDetails = () => {

        setFetchingData(true);

        const body = {
            userId: userDetails?.user_id,
            email: userDetails?.email,
            id: id
        };

        /*
         * Replace "charging-package-details"
         * with your actual package details API.
         */
        postRequestWithToken(
            "charging-package-details",
            body,
            (response) => {

                setFetchingData(false);

                if (response.code === 200) {

                    const data = response?.data?.[0];

                    setFormData({
                        package_name:
                            data?.package_name || "",

                        charging_capacity:
                            data?.charging_capacity || "",

                        price_per_unit:
                            data?.price_per_unit || "",

                        service_fee:
                            data?.service_fee || "",
                    });

                } else {

                    toast.error(response.message);

                    // navigate(
                    //     "/electric/mobile-ev-charging/charging-package-list"
                    // );

                }

            }
        );
    };

    // -----------------------------------------
    // Validation
    // -----------------------------------------
    const validate = () => {

        let err = {};

        if (!formData.package_name.trim()) {
            err.package_name = "Package Name required";
        }

        if (!formData.charging_capacity) {
            err.charging_capacity =
                "Charging Capacity required";
        }

        if (!formData.price_per_unit) {
            err.price_per_unit = "Price required";
        }

        if (!formData.service_fee) {
            err.service_fee = "Service Fee required";
        }

        setErrors(err);

        return Object.keys(err).length === 0;
    };

    // -----------------------------------------
    // Submit
    // -----------------------------------------
    const handleSubmit = (e) => {

        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        const body = {
            ...formData,

            created_by: userDetails?.user_id,
            userId: userDetails?.user_id,
            email: userDetails?.email,
        };

        if (isEditMode) {

            body.package_id = id;

        }

        postRequestWithToken(
            isEditMode
                ? "update-charging-package"
                : "add-charging-package",

            body,

            (response) => {

                setLoading(false);

                if (response.code === 200) {

                    toast.success(response.message);

                    setTimeout(() => {

                        navigate(
                            "/electric/mobile-ev-charging/charging-package-list"
                        );

                    }, 800);

                } else {

                    toast.error(response.message);

                }

            }
        );
    };

    // -----------------------------------------
    // Cancel
    // -----------------------------------------
    const handleCancel = () => {

        navigate(
            "/electric/mobile-ev-charging"
        );

    };

    if (fetchingData) {

        return <Loader />;

    }
    return (
        <div className={styles.addStationContainer}>

            <h2 className={styles.addHeading}>
                {isEditMode
                    ? "Edit Charging Package"
                    : "Add Charging Package"}
            </h2>

            <div className={styles.addStationFormSection}>

                <ToastContainer />

                <form
                    className={styles.formSection}
                    onSubmit={handleSubmit}
                >

                    {/* Package Name + Charging Capacity */}
                    <div className="row">

                        <div className="col-lg-6">

                            <label
                                htmlFor="package_name"
                                className={styles.labelText}
                            >
                                Package Name*
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="package_name"
                                        placeholder="Package Name"
                                        className={styles.inputField}
                                        value={formData.package_name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                package_name: e.target.value
                                            })
                                        }
                                    />

                                    {errors.package_name &&
                                        formData.package_name === "" && (
                                            <p className={styles.error}>
                                                {errors.package_name}
                                            </p>
                                        )}

                                </div>

                            </div>

                        </div>


                        <div className="col-lg-6">

                            <label
                                htmlFor="charging_capacity"
                                className={styles.labelText}
                            >
                                Charging Capacity (kW)*
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="charging_capacity"
                                        placeholder="Charging Capacity (kW)"
                                        className={styles.inputField}
                                        value={formData.charging_capacity}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                charging_capacity:
                                                    e.target.value.replace(/\D/g, "")
                                            })
                                        }
                                    />

                                    {errors.charging_capacity &&
                                        formData.charging_capacity === "" && (
                                            <p className={styles.error}>
                                                {errors.charging_capacity}
                                            </p>
                                        )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Price + Service Fee */}
                    <div className="row">

                        <div className="col-lg-6">

                            <label
                                htmlFor="price_per_unit"
                                className={styles.labelText}
                            >
                                Price Per Unit (₹)*
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="price_per_unit"
                                        placeholder="Price Per Unit"
                                        className={styles.inputField}
                                        value={formData.price_per_unit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price_per_unit:
                                                    e.target.value.replace(
                                                        /[^\d.]/g,
                                                        ""
                                                    )
                                            })
                                        }
                                    />

                                    {errors.price_per_unit &&
                                        formData.price_per_unit === "" && (
                                            <p className={styles.error}>
                                                {errors.price_per_unit}
                                            </p>
                                        )}

                                </div>

                            </div>

                        </div>


                        <div className="col-lg-6">

                            <label
                                htmlFor="service_fee"
                                className={styles.labelText}
                            >
                                Service Fee (₹)*
                            </label>

                            <div className="row">

                                <div className="col-xl-10 col-lg-12">

                                    <input
                                        type="text"
                                        autoComplete="off"
                                        id="service_fee"
                                        placeholder="Service Fee"
                                        className={styles.inputField}
                                        value={formData.service_fee}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                service_fee:
                                                    e.target.value.replace(
                                                        /[^\d.]/g,
                                                        ""
                                                    )
                                            })
                                        }
                                    />

                                    {errors.service_fee &&
                                        formData.service_fee === "" && (
                                            <p className={styles.error}>
                                                {errors.service_fee}
                                            </p>
                                        )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Buttons */}
                    <div className="row">

                        <div className="col-xl-11 col-lg-12">

                            <div className="row">

                                <div
                                    className={`col-lg-12 ${styles.editButton}`}
                                >

                                    <button
                                        type="button"
                                        className={styles.editCancelBtn}
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className={styles.editSubmitBtn}
                                    >

                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                {isEditMode
                                                    ? "Updating..."
                                                    : "Submitting..."}
                                            </>
                                        ) : (
                                            isEditMode
                                                ? "Update"
                                                : "Submit"
                                        )}

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );

    return (

        <div className='main-container'>

            <ToastContainer />

            <div className={styles.packageCard}>

                <h3 className={styles.heading}>
                    {isEditMode
                        ? "Edit Charging Package"
                        : "Add Charging Package"}
                </h3>

                <form onSubmit={handleSubmit}>

                    <div className="row">

                        {/* Package Name */}
                        <div className="col-lg-3">

                            <label className={styles.labelText}>
                                Package Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter package name"
                                value={formData.package_name}

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        package_name:
                                            e.target.value
                                    })
                                }
                            />

                            {errors.package_name &&
                                !formData.package_name && (

                                    <span className="error">
                                        {errors.package_name}
                                    </span>

                                )}

                        </div>

                        {/* Charging Capacity */}
                        <div className="col-lg-3">

                            <label className={styles.labelText}>
                                Charging Capacity (kW)
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter capacity (kW)"
                                value={
                                    formData.charging_capacity
                                }

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        charging_capacity:
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                    })
                                }
                            />

                            {errors.charging_capacity &&
                                !formData.charging_capacity && (

                                    <span className="error">
                                        {errors.charging_capacity}
                                    </span>

                                )}

                        </div>

                        {/* Price */}
                        <div className="col-lg-3">

                            <label className={styles.labelText}>
                                Price per unit (₹)
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter price"
                                value={
                                    formData.price_per_unit
                                }

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price_per_unit:
                                            e.target.value.replace(
                                                /[^\d.]/g,
                                                ""
                                            )
                                    })
                                }
                            />

                            {errors.price_per_unit &&
                                !formData.price_per_unit && (

                                    <span className="error">
                                        {errors.price_per_unit}
                                    </span>

                                )}

                        </div>

                        {/* Service Fee */}
                        <div className="col-lg-3">

                            <label className={styles.labelText}>
                                Service Fee (₹)
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Enter service fee"
                                value={
                                    formData.service_fee
                                }

                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        service_fee:
                                            e.target.value.replace(
                                                /[^\d.]/g,
                                                ""
                                            )
                                    })
                                }
                            />

                            {errors.service_fee &&
                                !formData.service_fee && (

                                    <span className="error">
                                        {errors.service_fee}
                                    </span>

                                )}

                        </div>

                    </div>

                    <div className={styles.buttonSection}>

                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Package"
                                    : "Save Package"}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
};

export default AddEditChargingPackage;