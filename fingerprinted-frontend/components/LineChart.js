"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const LineChart = ({ rates, id }) => {
  const related = rates.filter((rate) => rate.course_id === id);
  const student_attendance = related.map((rate) => rate.student_attendance);
  const categories = related.map((rate) => rate.checkInDate);
  const code = related.length === 0 ? "NA" : related[0]['course_code'];

  const [state, setState] = useState({
    series: [
      {
        name: "Student Attendance",
        data: student_attendance,
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        dropShadow: {
          enabled: true,
          color: "#000",
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ["#B583E7"],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        text: "Attendance Rate - " + code,
        align: "left",
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          opacity: 0.5,
        },
      },
      markers: {
        size: 1,
      },
      xaxis: {
        categories: categories,
        title: {
          text: "Lecture Dates",
          style: {
            fontSize: "18px",
          },
        },
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        title: {
          text: "No. of Students",
          style: {
            fontSize: "18px",
          },
        },
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
  });

  return (
    <>
      {typeof window !== "undefined" && (
        <Chart
          options={state.options}
          series={state.series}
          type="line"
          height={350}
        />
      )}
    </>
  );
};

export default LineChart;
