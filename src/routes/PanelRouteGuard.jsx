import { Navigate, useLocation } from "react-router-dom";

const PanelRouteGuard = ({ children, panel }) => {
  const location = useLocation();

  const storedUser = sessionStorage.getItem("userDetails");

  let userDetails = {};

  try {
    userDetails = storedUser
      ? JSON.parse(storedUser)
      : {};
  } catch {
    userDetails = {};
  }

  const departmentId = Number(
    userDetails.departmentId ?? userDetails.department_id
  );

  const allowedDepartments = {
    electric: [1, 2],
    mobility: [1, 3],
  };

  const isAllowed =
    allowedDepartments[panel]?.includes(departmentId);

  if (!isAllowed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default PanelRouteGuard;
