import React from "react";
import Devices from "../components/devices";
import Courses from "../components/courses";
import Meta from "../components/Meta";
import Layout from "../components/Layout";
import Calendar from "../components/Calendar";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const manage_attendance = () => {
  const { status, data } = useSession();
  const route = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      route.replace("/auth/signIn");
    }
  }, [status]);
  return (
    <>
      <Meta
        title="Manage Attendance"
        desc="Manage Attendance, Devices, Courses, and Enrollments"
      />
      <Layout>
        <Devices />
        <Courses />
        <Calendar />
      </Layout>
    </>
  );
};

export default manage_attendance;
