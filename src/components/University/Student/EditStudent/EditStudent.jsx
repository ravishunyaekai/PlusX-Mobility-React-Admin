import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditStudent.module.css";
import { MdOutlineCloudUpload } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import {
  postRequestWithToken,
  postRequestWithTokenAndFile,
} from "../../../../api/Requests";
import CustomDropdown from "../../../SharedComponent/UI/CustomDropdown/CustomDropdown";
import Loader from "../../../SharedComponent/Loader/Loader";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
  const [errors, setErrors] = useState({});

  const [studentName, setStudentName] = useState("");
  const [contact, setContact] = useState("");
  const [emailID, setEmailID] = useState("");
  const [university, setUniversity] = useState(null);
  const [universityOptions, setUniversityOptions] = useState([]);
  const [studentID, setStudentID] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  const userObj = {
    userId: userDetails?.user_id,
    email: userDetails?.email,
    riderId: id,
  };

  // -------- FETCH STUDENT DETAILS --------
  const fetchDetails = () => {
    setShowLoader(true);
    postRequestWithToken("rider-details", { ...userObj, riderId: id }, (response) => {
      if (response.code === 200 && response.status === 1) {
        const rider = response.data?.rider;
        const base = response.data?.base_url || "";
        setBaseUrl(base);

        setStudentName(rider?.rider_name || "");
        setContact(rider?.rider_mobile || "");
        setEmailID(rider?.rider_email || "");
        setStudentID(rider?.student_id || "");
        setUniversity({
          label: rider?.university_name || "",
          value: rider?.university || "",
        });

        if (rider?.id_image) setFile(`${base}${rider.id_image}`);
        else setFile(null);
      } else {
        console.error("Error fetching details:", response);
      }
      setShowLoader(false);
    });
  };

  // -------- FETCH UNIVERSITIES --------
  const getUniversities = () => {
    setShowLoader(true);
    postRequestWithToken(
      "university-list-for-select",
      { ...userObj, requirement: "university" },
      (response) => {
        // console.log(response, "response");
        if (response.code === 200) {
          const list = (response.data || []).map((item) => ({
            label: item.name,
            value: item.university_id,
          }));
          setUniversityOptions(list);
        }
        setShowLoader(false);
      }
    );
  };

  const validateForm = () => {
    const fields = [
      { name: "studentName", value: studentName, errorMessage: "Student Name is required." },
      { name: "contact", value: contact, errorMessage: "Contact Number is required." },
      { name: "emailID", value: emailID, errorMessage: "Email ID is required." },
      { name: "university", value: university?.value, errorMessage: "University is required.", isArray: true },
      { name: "studentID", value: studentID, errorMessage: "Student ID is required." },
      { name: "file", value: file, errorMessage: "Student ID Image is required." },
    ];

    const newErrors = fields.reduce((errors, { name, value, errorMessage, isArray }) => {
      if ((isArray && (!value || value.length === 0)) || (!isArray && !value)) {
        errors[name] = errorMessage;
      }
      return errors;
    }, {});

    if (contact && !/^\d{10}$/.test(contact)) {
      newErrors.contact = "Contact Number must be 10 digits only.";
    }

    if (emailID && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailID)) {
      newErrors.emailID = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- HANDLE EDIT SUBMIT --------
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (validateForm()) {
      const formData = new FormData();
      formData.append("student_id", studentID);
      formData.append("first_name", studentName);
      formData.append("rider_email", emailID);
      formData.append("rider_mobile", contact);
      formData.append("university_id", university?.value || "");
      formData.append("rider_id", id);
      formData.append("userId", userDetails?.user_id);
      formData.append("email", userDetails?.email);

      if (file && typeof file !== "string") {
        formData.append("id_image", file);
      }

      postRequestWithTokenAndFile("edit-student", formData, (response) => {
        if (response.status === 1) {
          toast.success(response.message || "Student updated successfully");

          if (response.data?.id_image) {
            const updatedImgUrl = `${baseUrl}${response.data.id_image}`;
            setFile(updatedImgUrl);
          }

          setTimeout(() => {
            setLoading(false);
            navigate("/mobility/universities/student-list");
          }, 1000);
        } else {
          toast.error(response.message || "Error updating student");
          console.error("Edit student error:", response);
          setLoading(false);
        }
      });
    } else {
      toast.error("Some fields are missing");
      setLoading(false);
    }
  };

  // -------- LIFECYCLE --------
  useEffect(() => {
    if (!userDetails || !userDetails.access_token) {
      navigate("/login");
      return;
    }
    if (id) fetchDetails();
    getUniversities();
  }, [id]);

  // -------- FILE HANDLERS --------
  const handleRemoveImage = () => setFile(null);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleCancel = () => navigate("/mobility/universities/student-list");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault();
  };

  return (
    <div className={styles.addStationContainer}>
      {showLoader ? (
        <Loader />
      ) : (
        <>
          <div className={styles.addHeading}>Edit Student</div>
          <div className={styles.addStationFormSection}>
            <ToastContainer />
            <form className={styles.formSection} onSubmit={handleSubmit} onKeyDown={handleKeyDown}
            >
              <div className="row">
                <div className="col-lg-6">
                  <div className="col-xl-10 col-lg-12">
                    <input type="text" placeholder="Student Name" className={styles.inputField} value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                    {errors.studentName && studentName === '' && <p className={styles.error} style={{ color: 'red' }}>{errors.studentName}</p>}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="col-xl-10 col-lg-12">
                    <input type="text" placeholder="Contact Number" className={styles.inputField} value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                    {errors.contact && <p className={styles.error} style={{ color: 'red' }}>{errors.contact}</p>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-6">
                  <div className="col-xl-10 col-lg-12">
                    <input type="email" placeholder="E-mail ID" className={styles.inputField} value={emailID}
                      onChange={(e) => setEmailID(e.target.value)}
                    />
                    {errors.emailID && <p className={styles.error} style={{ color: 'red' }}>{errors.emailID}</p>}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="col-xl-10 col-lg-12">
                    <CustomDropdown options={universityOptions} value={university} onChange={setUniversity} placeholder="Select University" isDisabled={false}
                    />
                    {errors.university && university.length === 0 && <p className={styles.error} style={{ color: 'red' }}>{errors.university}</p>}
                  </div>
                </div>
              </div>

              {/* Upload image */}
              <div className="col-lg-6">
                <div className="row">
                  <div className="col-xl-10 col-lg-12">
                    <div className={styles.uploadContainer}>
                      <span className={styles.uploadLabel}>
                        {file
                          ? typeof file === "string"
                            ? file.split("/").pop()
                            : file.name
                          : "Upload Student ID"}
                      </span>

                      <label
                        htmlFor="coverImage"
                        className={styles.uploadButton}
                      >
                        <MdOutlineCloudUpload /> Upload
                      </label>
                      <input type="file" id="coverImage" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className={styles.hiddenInput}
                      />
                      {errors.file && <p className={styles.error} style={{ color: 'red' }}>{errors.file}</p>}

                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-10 col-lg-12">
                    <div className={styles.galleryContainer}>
                      {file && (
                        <div className={styles.imageContainer}>
                          <img
                            alt="Preview"
                            className={styles.previewImage}
                            src={
                              typeof file === "string"
                                ? file
                                : URL.createObjectURL(file)
                            }
                          />
                          <button
                            type="button" className={styles.removeButton} onClick={handleRemoveImage}
                          >
                            <AiOutlineClose size={20} style={{ padding: "2px" }} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-11 col-lg-12">
                  <div className="row">
                    <div className={`col-lg-12 ${styles.editButton}`}>
                      <button className={styles.editCancelBtn} onClick={handleCancel}>Cancel</button>
                      <button disabled={loading} type="submit" className={styles.editSubmitBtn}>
                        {loading ? (
                          <> <span className="spinner-border spinner-border-sm me-2"></span> Submit... </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default EditStudent;
