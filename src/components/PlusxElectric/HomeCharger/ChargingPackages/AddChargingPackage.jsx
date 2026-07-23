import { useEffect, useState } from "react";
import styles from "./addpackage.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postRequestWithToken } from "../../../../api/Requests";

const AddEditChargingPackage = ({
    editingData,
    refreshList,
    clearEdit,
    userDetails,
}) => {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        package_name: "",
        charging_capacity: "",
        price_per_unit: "",
        service_fee: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {

        if (editingData) {

            setFormData({
                package_name: editingData.package_name || "",
                charging_capacity: editingData.charging_capacity || "",
                price_per_unit: editingData.price_per_unit || "",
                service_fee: editingData.service_fee || "",
            });

        } else {

            setFormData({
                package_name: "",
                charging_capacity: "",
                price_per_unit: "",
                service_fee: "",
            });

        }

    }, [editingData]);

    const validate = () => {

        let err = {};

        if (!formData.package_name.trim())
            err.package_name = "Package Name required";

        if (!formData.charging_capacity)
            err.charging_capacity = "Charging Capacity required";

        if (!formData.price_per_unit)
            err.price_per_unit = "Price required";

        if (!formData.service_fee)
            err.service_fee = "Service Fee required";

        setErrors(err);

        return Object.keys(err).length === 0;

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        const body = {
            ...formData,
            created_by: userDetails.user_id,
            userId: userDetails.user_id,
            email: userDetails.email,
        };


        if (editingData) {
            body.package_id = editingData.package_id;
        }

        postRequestWithToken(
            editingData
                ? "update-charging-package"
                : "add-charging-package",
            body,
            (response) => {

                setLoading(false);

                if (response.code === 200) {

                    toast.success(response.message);

                    refreshList();

                    clearEdit();

                    setFormData({
                        package_name: "",
                        charging_capacity: "",
                        price_per_unit: "",
                        service_fee: "",
                    });

                } else {

                    toast.error(response.message);

                }

            }
        );

    };
    const handleCancel = () => {

        clearEdit();

        setFormData({
            package_name: "",
            charging_capacity: "",
            price_per_unit: "",
            service_fee: "",
        });

        setErrors({});
    };
    return (
        <div className={styles.packageCard}>

            <h3 className={styles.heading}>Add / Edit Package</h3>

            <form onSubmit={handleSubmit}>

                <div className="row">

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
                                    package_name: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="col-lg-3">
                        <label className={styles.labelText}>
                            Charging Capacity (kW) <span>*</span>
                        </label>

                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Enter capacity (kW)"
                            value={formData.charging_capacity}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    charging_capacity: e.target.value.replace(/\D/g, "")
                                })
                            }
                        />
                    </div>

                    <div className="col-lg-3">
                        <label className={styles.labelText}>
                            Price per unit (₹) <span>*</span>
                        </label>

                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Enter price"
                            value={formData.price_per_unit}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    price_per_unit: e.target.value.replace(/[^\d.]/g, "")
                                })
                            }
                        />
                    </div>

                    <div className="col-lg-3">
                        <label className={styles.labelText}>
                            Service Fee (₹) <span>*</span>
                        </label>

                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Enter service fee"
                            value={formData.service_fee}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    service_fee: e.target.value.replace(/[^\d.]/g, "")
                                })
                            }
                        />
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
                            : editingData
                                ? "Update Package"
                                : "Save Package"}
                    </button>
                </div>

            </form>

        </div>
    );

};

export default AddEditChargingPackage;