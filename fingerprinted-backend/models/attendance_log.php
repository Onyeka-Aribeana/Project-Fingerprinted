<?php
class Log
{
    private $conn;
    private $table = 'attendance_log';

    public $id;
    public $full_name;
    public $matric_no;
    public $device_name;
    public $checkInTime;
    public $checkInDate;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT s.first_name, s.last_name, s.matric_no, d.name, checkInTime, checkInDate, c.course_code FROM " . $this->table . " as a INNER JOIN students as s ON a.student_id = s.id INNER JOIN devices as d ON s.device_id = d.id INNER JOIN courses as c ON a.course_id = c.id WHERE checkInDate = CURDATE() ORDER BY checkInDate";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_lecture()
    {
        $query = "SELECT DISTINCT lecture FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function select_by_lecture($lecture, $lecture_id)
    {
        $query = "SELECT s.first_name, s.last_name, s.matric_no, d.name, checkInTime, checkInDate, c.course_code FROM " . $this->table . " as a INNER JOIN students as s ON a.student_id = s.id INNER JOIN devices as d ON s.device_id = d.id INNER JOIN courses as c ON a.course_id = c.id WHERE course_id = :l AND lecture_id = :ln ORDER BY checkInTime";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":l", $lecture);
        $stmt->bindParam(':ln', $lecture_id);
        $stmt->execute();
        return $stmt;
    }

    public function read_distinct_today()
    {
        $query = "SELECT DISTINCT lecture_id, course_id, c.course_code, checkInDate FROM " . $this->table . " as a INNER JOIN courses as c ON a.course_id = c.id WHERE checkInDate = CURRENT_DATE ORDER BY checkInTime DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function recent_reports()
    {
        $query = "SELECT DISTINCT lecture_id, course_id, c.course_code, checkInDate FROM " . $this->table . " as a INNER JOIN courses as c ON a.course_id = c.id WHERE checkInDate < CURRENT_DATE ORDER BY checkInDate DESC LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function generate_report($date, $course)
    {
        $query = "SELECT DISTINCT lecture_id, course_id, c.course_code, checkInDate FROM " . $this->table . " as a INNER JOIN courses as c ON a.course_id = c.id WHERE course_id = :l AND checkInDate = :c ORDER BY checkInTime";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":l", $course);
        $stmt->bindParam(':c', $date);
        $stmt->execute();
        return $stmt;
    }

    public function get_attendance_rates()
    {
        $query = "SELECT DISTINCT a.checkInDate, a.startTime, a.endTime, a.course_id, c.course_code, COUNT(*) AS student_attendance, e.total_students FROM attendance_log AS a INNER JOIN( SELECT DISTINCT course_id, COUNT(*) AS total_students FROM enrolled GROUP BY course_id ) AS e ON a.course_id = e.course_id INNER JOIN courses AS c ON a.course_id = c.id GROUP BY lecture_id, course_id ORDER BY checkInDate, startTime LIMIT 20";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function student_percentages()
    {
        $query = "SELECT s.first_name, s.last_name, s.matric_no, e.course_id, RAND() as 'key', c.course_code, e.attendance_count / a.course_appearances AS average_attendance FROM enrolled as e JOIN students AS s ON e.student_id = s.id JOIN courses AS c ON e.course_id = c.id INNER JOIN ( SELECT course_id, checkInDate, COUNT(DISTINCT lecture_id) AS course_appearances FROM attendance_log GROUP BY course_id ) AS a WHERE e.course_id = a.course_id ORDER BY `average_attendance` DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function attendance_by_id($id)
    {
        $query = "SELECT c.course_code, e.attendance_count / a.course_appearances AS average_attendance FROM enrolled as e JOIN courses AS c ON e.course_id = c.id INNER JOIN ( SELECT course_id, checkInDate, COUNT(DISTINCT lecture_id) AS course_appearances FROM attendance_log GROUP BY course_id ) AS a ON e.course_id = a.course_id WHERE e.student_id = :id ORDER BY average_attendance, e.student_id, e.course_id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt;
    }
}
