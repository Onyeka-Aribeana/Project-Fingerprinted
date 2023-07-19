<?php
class Student
{
    private $conn;
    private $table = 'students';

    public $id;
    public $first_name;
    public $last_name;
    public $matric_no;
    public $email;
    public $gender;
    public $device_id;
    public $courses;
    public $fingerprint_id;
    public $add_fingerid;
    public $del_fingerid;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT students.id, students.first_name, students.last_name, students.email, students.matric_no, students.gender, devices.name, students.fingerprint_id, students.add_fingerid FROM " . $this->table . " JOIN devices ON students.device_id = devices.id WHERE del_fingerid = 0 ORDER BY students.id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_single()
    {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->id = $row['id'];
        $this->first_name = $row['first_name'];
        $this->last_name = $row['last_name'];
        $this->email = $row['email'];
        $this->matric_no = $row['matric_no'];
        $this->gender = $row['gender'];
        $this->device_id = $row['device_id'];
        $this->fingerprint_id = $row['fingerprint_id'];
        $this->add_fingerid = $row['add_fingerid'];
    }

    public function get_id($matric)
    {
        $query = "SELECT id FROM " . $this->table . " WHERE matric_no = :m";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":m", $matric);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->id = $row['id'];
        }
    }

    public function fetch_enrolled_courses($id)
    {
        $query = "SELECT course_id, attendance_count FROM enrolled WHERE student_id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $courses;
    }

    public function does_matric_exist($matric)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE matric_no = :matric_no AND del_fingerid = 0";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":matric_no", $matric);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }
        return false;
    }

    public function does_email_exist($email)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email AND del_fingerid = 0";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }
        return false;
    }

    public function add_student()
    {
        $query = "INSERT INTO " . $this->table . " (first_name, last_name, matric_no, email, gender, device_id) VALUES (:first_name, :last_name, :matric_no, :email, :gender, :device_id)";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->first_name) && !empty($this->last_name) && !empty($this->matric_no) && !empty($this->email)  && !empty($this->gender)  && $this->device_id >= 0) {
            $this->first_name = htmlspecialchars(strip_tags($this->first_name));
            $this->last_name = htmlspecialchars(strip_tags($this->last_name));
            $this->matric_no = htmlspecialchars(strip_tags($this->matric_no));
            $this->gender = htmlspecialchars(strip_tags($this->gender));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->device_id = htmlspecialchars(strip_tags($this->device_id));
            $courses = $this->courses;

            if ($this->does_email_exist($this->email)) {
                return array("error" => "Email '" . $this->email . "' already exists");
            }
            if ($this->does_matric_exist($this->matric_no)) {
                return array("error" => "Matric No. '" . $this->matric_no . "' already exists");
            }

            if (!$this->does_email_exist($this->email) && !$this->does_matric_exist($this->matric_no)) {
                $stmt->bindParam(':first_name', $this->first_name);
                $stmt->bindParam(':last_name', $this->last_name);
                $stmt->bindParam(':matric_no', $this->matric_no);
                $stmt->bindParam(':email', $this->email);
                $stmt->bindParam(':gender', $this->gender);
                $stmt->bindParam(':device_id', $this->device_id);

                if ($stmt->execute()) {
                    $this->get_id($this->matric_no);
                    foreach ($courses as $course) {
                        $query = "INSERT INTO enrolled (course_id, student_id) VALUES (:cid, :id)";
                        $stmt = $this->conn->prepare($query);
                        $stmt->bindParam(':cid', $course->id);
                        $stmt->bindParam(':id', $this->id);
                        $stmt->execute();
                    }
                    return true;
                }
                printf("Error: %s.\n", $stmt->error);
                return false;
            }
        } else {
            return array("error" => "Please fill all required fields");
        }
    }

    public function update_student()
    {
        $query = "UPDATE " . $this->table . " SET first_name = :first_name, last_name = :last_name, matric_no = :matric_no, email = :email, gender = :gender, device_id = :device_id WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->first_name) && !empty($this->last_name) && !empty($this->matric_no) && !empty($this->email)  && !empty($this->gender)  && $this->device_id >= 0 && !empty($this->id)) {
            $this->first_name = htmlspecialchars(strip_tags($this->first_name));
            $this->last_name = htmlspecialchars(strip_tags($this->last_name));
            $this->matric_no = htmlspecialchars(strip_tags($this->matric_no));
            $this->gender = htmlspecialchars(strip_tags($this->gender));
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->device_id = htmlspecialchars(strip_tags($this->device_id));
            $this->id = htmlspecialchars(strip_tags($this->id));
            $courses = json_decode(json_encode($this->courses), true);
            $courses = array_map(function ($item) {
                return $item['id'];
            }, $courses);

            $email_exists = $this->does_email_exist($this->email);
            $matric_exists = $this->does_matric_exist($this->matric_no);

            if ($email_exists && $email_exists['id'] != $this->id) {
                return array("error" => "Email '" . $this->email . "' already exists");
            }
            if ($matric_exists && $matric_exists['id'] != $this->id) {
                return array("error" => "Matric No. '" . $this->matric_no . "' already exists");
            }

            if ((!$matric_exists || ($matric_exists && $matric_exists['id'] == $this->id)) && (!$email_exists || ($email_exists && $email_exists['id'] == $this->id))) {
                $stmt->bindParam(':first_name', $this->first_name);
                $stmt->bindParam(':last_name', $this->last_name);
                $stmt->bindParam(':matric_no', $this->matric_no);
                $stmt->bindParam(':email', $this->email);
                $stmt->bindParam(':gender', $this->gender);
                $stmt->bindParam(':device_id', $this->device_id);
                $stmt->bindValue(':id', $this->id);

                if ($stmt->execute()) {
                    $enrolled_courses = $this->fetch_enrolled_courses($this->id);
                    $enrolled_courses = array_map(function ($item) {
                        return $item['course_id'];
                    }, $enrolled_courses);
                    $del_diff = array_diff($enrolled_courses, $courses);
                    $add_diff = array_diff($courses, $enrolled_courses);
                    if (!empty($del_diff)) {
                        foreach ($del_diff as $course) {
                            $query = "DELETE FROM enrolled WHERE course_id = :cid";
                            $stmt = $this->conn->prepare($query);
                            $stmt->bindParam(':cid', $course);
                            $stmt->execute();
                        }
                    }
                    if (!empty($add_diff)) {
                        foreach ($add_diff as $course) {
                            $query = "INSERT INTO enrolled (course_id, student_id) VALUES (:cid, :id)";
                            $stmt = $this->conn->prepare($query);
                            $stmt->bindParam(':cid', $course);
                            $stmt->bindParam(':id', $this->id);
                            $stmt->execute();
                        }
                    }
                    return true;
                }
                printf("Error: %s.\n", $stmt->error);
                return false;
            }
        }
    }

    public function delete_student()
    {
        $query = "UPDATE  " . $this->table . " SET del_fingerid = 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        $this->read_single();

        if ($stmt->execute()) {
            return true;
        }
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    public function add_fingerprint()
    {
        $query = "UPDATE " . $this->table . " SET add_fingerid = 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        $this->read_single();

        if ($stmt->execute()) {
            return true;
        }
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    public function cancel_add()
    {
        $query = "UPDATE " . $this->table . " SET add_fingerid = 0 WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        $this->read_single();

        if ($stmt->execute()) {
            return true;
        }
        printf("Error: %s.\n", $stmt->error);
        return false;
    }
}
