import { useCallback } from "react";
import { useEffect, useState } from "react";
import styles from "../styles/Toast.module.css";
import { useTheme } from "@nextui-org/react";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";
import { AiOutlineInfoCircle, AiOutlineWarning } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

const Toast = ({ type, message }) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;
  const [toast, setToast] = useState({});
  let toastProperties = {};

  switch (type) {
    case "success":
      toastProperties = {
        description: message,
        backgroundColor: colors.success.value,
        icon: <BsCheckCircle fill={colors.success.value} size={25} />,
      };
      setToast(toastProperties);
      break;
    case "error":
      toastProperties = {
        description: message,
        backgroundColor: colors.error.value,
        icon: <BsXCircle fill={colors.error.value} size={25} />,
      };
      setToast(toastProperties);
      break;
    case "info":
      toastProperties = {
        description: message,
        backgroundColor: colors.primary.value,
        icon: <AiOutlineInfoCircle fill={colors.primary.value} size={25} />,
      };
      setToast(toastProperties);
      break;
    case "warning":
      toastProperties = {
        description: message,
        backgroundColor: colors.warning.value,
        icon: <AiOutlineWarning fill={colors.warning.value} size={25} />,
      };
      setToast(toastProperties);
      break;
    default:
      toastProperties = [];
  }

  return (
    <div
      className={`${styles.container}`}
      style={{ color: colors.text.value, lineHeight: "0.8" }}
    >
      <div
        className={`${styles.notification} ${styles.toast}`}
        style={{
          border: `3px solid ${toast.backgroundColor}`,
          background: colors.background.value,
          boxShadow: shadows.md.value,
        }}
      >
        <div className={styles.icon}>{toast.icon}</div>
        <div>
          <p
            className={styles.description}
            style={{ color: toast.backgroundColor }}
          >
            {toast.description}
          </p>
        </div>
        <button
          style={{ color: toast.backgroundColor }}
        >
          <IoMdClose fill="currentColor" size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toast;