import { toast } from "react-toastify";

export const makeAPIRequest = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
};

export const showNotification = (data) => {
  if (data["error"]) {
    toast.error(data["error"], {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    });
    return;
  } else if (data["success"]) {
    toast.success(data["success"], {
      position: toast.POSITION.BOTTOM_RIGHT,
      hideProgressBar: true,
    });
  }
};

export const validateEmail = (value) => {
  return value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
};

export const fetchCourses = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/courses/read_by_code.php"
  );
  const data = await response.json();
  return data;
};

export const fetchValidCourses = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/courses/read_valid_code.php"
  );
  const data = await response.json();
  return data;
};

export const fetchStudentPercentages = async () => {
  const response = await fetch(
    "http://localhost/fingerprinted/api/attendance/student_percentages.php"
  );
  const data = await response.json();
  return data;
};
