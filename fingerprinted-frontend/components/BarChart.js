"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const BarChart = ({ rates }) => {
  const total_students = rates.map((rate) => rate.total_students);
  const student_attendance = rates.map((rate) => rate.student_attendance);
  const categories = rates.map(
    (rate) => rate.course_code + " " + rate.checkInDate
  );

  const [state, setState] = useState({
    series: [
      {
        name: "Students Enrolled",
        data: total_students,
      },
      {
        name: "Student Attendance",
        data: student_attendance,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 300,
      },
      legend: {
        fontSize: "16px",
      },
      colors: ["#B583E7", "#9750DD"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded",
          borderRadius: 6,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            fontSize: "14px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        title: {
          text: "No. of students",
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
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          },
        },
      },
    },
  });
  return (
    <>
      {typeof window !== "undefined" && (
        <Chart
          options={state.options}
          series={state.series}
          type="bar"
          height={300}
        />
      )}
    </>
  );
};

export default BarChart;
