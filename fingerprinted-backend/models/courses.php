<?php
class Course
{
    private $conn;
    private $table = 'courses';

    public $id;
    public $course_name;
    public $course_code;
    public $dept;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT * FROM " . $this->table . " WHERE id <> 1 ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_single()
    {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->id = $row['id'];
        $this->course_name = $row['course_name'];
        $this->course_code = $row['course_code'];
        $this->dept = $row['dept'];
    }

    public function read_by_code()
    {
        $query = "SELECT id, course_code FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_valid_code()
    {
        $query = "SELECT id, course_code FROM " . $this->table . " WHERE id <> 1 ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function does_code_exist($code)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE course_code = :course_code";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":course_code", $code);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }
        return false;
    }

    public function add_new()
    {
        $query = "INSERT INTO " . $this->table . " (course_name, course_code, dept) VALUES (:course_name, :course_code, :dept)";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->course_name) && !empty($this->course_code) && !empty($this->dept)) {
            $this->course_name = htmlspecialchars(strip_tags($this->course_name));
            $this->course_code = htmlspecialchars(strip_tags($this->course_code));
            $this->dept = htmlspecialchars(strip_tags($this->dept));

            if (!$this->does_code_exist($this->course_code)) {
                $stmt->bindParam(':course_name', $this->course_name);
                $stmt->bindParam(':course_code', $this->course_code);
                $stmt->bindValue(':dept', $this->dept);

                if ($stmt->execute()) {
                    return true;
                }
                printf("Error: %s.\n", $stmt->error);
                return false;
            } else {
                return array("error" => "Course code: '" . $this->course_code . "' already exists");
            }
        } else {
            return array("error" => "Please fill all required fields");
        }
    }

    public function update_course()
    {
        $query = "UPDATE " . $this->table . " SET course_code = :course_code,  course_name = :course_name, dept = :dept WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->course_name) && !empty($this->course_code) && !empty($this->dept)) {
            $this->id = htmlspecialchars(strip_tags($this->id));
            $this->course_name = htmlspecialchars(strip_tags($this->course_name));
            $this->course_code = htmlspecialchars(strip_tags($this->course_code));
            $this->dept = htmlspecialchars(strip_tags($this->dept));

            $row = $this->does_code_exist($this->course_code);

            if ($row === false || (isset($row['id']) && $row['id'] == $this->id)) {
                $stmt->bindParam(":id", $this->id);
                $stmt->bindParam(':course_name', $this->course_name);
                $stmt->bindParam(':course_code', $this->course_code);
                $stmt->bindValue(':dept', $this->dept);

                if ($stmt->execute()) {
                    return true;
                }
                printf("Error: %s.\n", $stmt->error);
                return false;
            } else {
                return array("error" => "Course code: '" . $this->course_code . "' already exists");
            }
        } else {
            return array("error" => "Please fill all required fields");
        }
    }

    public function delete_course()
    {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
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
