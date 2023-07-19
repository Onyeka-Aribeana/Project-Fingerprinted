export const links = [
  {
    name: "Manage System",
    path: "/",
  },
  {
    name: "Student List",
    path: "/student_list",
  },
  {
    name: "Reports",
    path: "/attendance",
  },
];

export const tokens = (mode) => ({
  ...(mode === "Dark"
    ? {
        brand: {
          neutral: "#697177",
          primary: "#0072F5",
          secondary: "#9750DD",
          success: "#17C964",
          warning: "#F5A524",
          error: "#F31260",
          accent0: "#16181A",
          accent1: "#26292B",
          accent2: "#2B2F31",
          accent3: "#313538",
          accent4: "#3A3F42",
          aceent5: "#4C5155",
          accent6: "#697177",
          accent7: "#787F85",
          accent8: "#9BA1A6",
          accent9: "#ECEDEE",
          background: "#000000",
          backgroundContrat: "#16181A",
          foreground: "#ffffff",
          text: "#ECEDEE",
          textLight: "rgba(236,237,238,0.2)",
          border: "rgba(255, 255, 255, 0.15)",
          white: "#ffffff",
          black: "#000000",
        },
      }
    : {
        brand: {
          neutral: "#889096",
          primary: "#0072F5",
          secondary: "#7828C8",
          success: "#17C964",
          warning: "#F5A524",
          error: "#F31260",
          accent0: "#F1F3F5",
          accent1: "#ECEEF0",
          accent2: "#E6E8EB",
          accent3: "#DFE3E6",
          accent4: "#D7DBDF",
          aceent5: "#C1C8CD",
          accent6: "#889096",
          accent7: "#7E868C",
          accent8: "#687076",
          accent9: "#11181C",
          background: "#ffffff",
          backgroundContrast: "#ffffff",
          foreground: "#000000",
          text: "#11181C",
          textLight: "rgba(17,24,28,0.2)",
          border: "rgba(0, 0, 0, 0.15)",
          white: "#ffffff",
          black: "#000000",
        },
      }),
});
