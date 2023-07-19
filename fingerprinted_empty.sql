-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 19, 2023 at 02:30 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fingerprinted`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `first_name` varchar(40) DEFAULT NULL,
  `last_name` varchar(40) DEFAULT NULL,
  `email` varchar(40) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `first_name`, `last_name`, `email`, `password`, `role`) VALUES
(1, 'Onyeka', 'Aribeana', 'oaribeana@gmail.com', '$2y$10$OILD1IqTeoPVyqFuikKJk.ZlC73kVuLYsMIVTzZBR9WAVJ3l.EKSW', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_log`
--

CREATE TABLE `attendance_log` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `lecture_id` varchar(15) DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `checkInTime` time DEFAULT NULL,
  `checkInDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_name` varchar(100) DEFAULT NULL,
  `course_code` varchar(10) DEFAULT NULL,
  `dept` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_name`, `course_code`, `dept`) VALUES
(1, 'None', 'None', 'None');

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int(11) NOT NULL,
  `name` varchar(40) DEFAULT NULL,
  `uid` varchar(10) DEFAULT NULL,
  `mode` int(11) DEFAULT NULL,
  `del_device` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`id`, `name`, `uid`, `mode`, `del_device`) VALUES
(71, 'test device', 'c2f3ef97', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `enrolled`
--

CREATE TABLE `enrolled` (
  `course_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `attendance_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `type` varchar(10) DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `startTime` time DEFAULT NULL,
  `endTime` time DEFAULT NULL,
  `uid` varchar(15) DEFAULT NULL,
  `course` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `first_name` varchar(40) DEFAULT NULL,
  `last_name` varchar(40) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `matric_no` varchar(15) DEFAULT NULL,
  `gender` varchar(1) DEFAULT NULL,
  `device_id` int(11) DEFAULT 0,
  `fingerprint_id` int(11) DEFAULT 0,
  `add_fingerid` int(11) DEFAULT 0,
  `del_fingerid` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance_log`
--
ALTER TABLE `attendance_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `enrolled`
--
ALTER TABLE `enrolled`
  ADD PRIMARY KEY (`course_id`,`student_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course` (`course`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance_log`
--
ALTER TABLE `attendance_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_log`
--
ALTER TABLE `attendance_log`
  ADD CONSTRAINT `attendance_log_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_log_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrolled`
--
ALTER TABLE `enrolled`
  ADD CONSTRAINT `enrolled_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrolled_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`course`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
