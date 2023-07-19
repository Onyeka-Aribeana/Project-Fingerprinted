import "@/styles/globals.css";
import { createTheme, NextUIProvider, useSSR } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import styled from "styled-components";

const StyledToastContainer = styled(ToastContainer)`
  &&&.Toastify__toast-container {
    width: 420px;
    z-index: 99999999;
  }

  .Toastify__toast {
    border-radius: 10px;
  }

  .Toastify__toast.Toastify__toast--error {
    border: 4px solid var(--toastify-color-error);
  }

  .Toastify__toast.Toastify__toast--info {
    border: 4px solid var(--toastify-color-info);
  }

  .Toastify__toast.Toastify__toast--success {
    border: 4px solid var(--toastify-color-success);
  }

  .Toastify__toast.Toastify__toast--warning {
    border: 4px solid var(--toastify-color-warning);
  }

  @media only screen and (max-width: 480px) {
    &&&.Toastify__toast-container {
      width: 100vw;
      padding: 0;
      left: 0;
      margin: 0;
    }

    .Toastify__toast {
      border: 0;
      border-radius: 0;
    }

    &&&.Toastify__toast-container--top-left,
    &&&.Toastify__toast-container--top-center,
    &&&.Toastify__toast-container--top-right {
      top: 0;
      transform: translateX(0);
    }

    &&&.Toastify__toast-container--bottom-left,
    &&&.Toastify__toast-container--bottom-center,
    &&&.Toastify__toast-container--bottom-right {
      bottom: 0;
      transform: translateX(0);
    }

    &&&.Toastify__toast-container--rtl {
      right: 0;
      left: initial;
    }

    .Toastify__toast.Toastify__toast--warning,
    .Toastify__toast.Toastify__toast--success,
    .Toastify__toast.Toastify__toast--info,
    .Toastify__toast.Toastify__toast--error {
      border: 0;
    }
  }
`;

function MyApp({ Component, pageProps }) {
  const { isBrowser } = useSSR();

  const myTheme = createTheme({
    type: "light",
    theme: {
      breakpoints: {
        xxs: "480px",
        xs: "600px",
        sm: "768px",
        md: "960px",
        lg: "1280px",
        xl: "1440px",
      },
    },
  });

  return (
    isBrowser && (
      <SessionProvider session={pageProps.session}>
        <NextUIProvider theme={myTheme}>
          <StyledToastContainer />
          <Component {...pageProps} />
        </NextUIProvider>
      </SessionProvider>
    )
  );
}

export default MyApp;
