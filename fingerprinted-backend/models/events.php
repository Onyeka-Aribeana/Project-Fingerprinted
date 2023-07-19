<?php
class Event
{
    private $conn;
    private $table = 'events';

    public $id;
    public $description;
    public $type;
    public $course;
    public $startDate;
    public $endDate;
    public $startTime;
    public $endTime;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT events.id, events.description, courses.course_code, events.type, events.startDate, events.endDate, events.startTime, events.endTime FROM " . $this->table . " JOIN courses ON events.course = courses.id ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_single()
    {
        $query = "SELECT id, description, course, type, startDate, endDate, startTime, endTime FROM " . $this->table . " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->id = $row['id'];
        $this->description = $row['description'];
        return $row;
    }

    public function add_event()
    {
        $query = "INSERT INTO " . $this->table . " (description, type, course, startDate, endDate, startTime, endTime, uid) VALUES (:description, :type, :course, :startDate, :endDate, :startTime, :endTime, :uid)";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->description) && !empty($this->type) && $this->course >= 0 && !empty($this->startDate)  && !empty($this->endDate)  && !empty($this->startTime) && !empty($this->endTime)) {
            $this->description = htmlspecialchars(strip_tags($this->description));
            $this->type = htmlspecialchars(strip_tags($this->type));
            $this->course = htmlspecialchars(strip_tags($this->course));
            $this->endDate = htmlspecialchars(strip_tags($this->endDate));
            $this->startDate = htmlspecialchars(strip_tags($this->startDate));
            $this->startTime = htmlspecialchars(strip_tags($this->startTime));
            $this->endTime = htmlspecialchars(strip_tags($this->endTime));
            $uid = bin2hex(random_bytes(5));

            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':type', $this->type);
            $stmt->bindParam(':course', $this->course);
            $stmt->bindParam(':startDate', $this->startDate);
            $stmt->bindParam(':endDate', $this->endDate);
            $stmt->bindParam(':startTime', $this->startTime);
            $stmt->bindParam(':endTime', $this->endTime);
            $stmt->bindParam(':uid', $uid);

            if ($stmt->execute()) {
                return true;
            }
            printf("Error: %s.\n", $stmt->error);
            return false;
        }
    }

    public function update_event()
    {
        $query = "UPDATE " . $this->table . " SET description = :description, type = :type, course = :course, startDate = :startDate, endDate = :endDate, startTime = :startTime, endTime = :endTime, uid = :uid WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->description) && !empty($this->type) && $this->course >= 0 && !empty($this->startDate)  && !empty($this->endDate)  && !empty($this->startTime) && !empty($this->endTime) && !empty($this->id)) {
            $this->description = htmlspecialchars(strip_tags($this->description));
            $this->type = htmlspecialchars(strip_tags($this->type));
            $this->course = htmlspecialchars(strip_tags($this->course));
            $this->endDate = htmlspecialchars(strip_tags($this->endDate));
            $this->startDate = htmlspecialchars(strip_tags($this->startDate));
            $this->startTime = htmlspecialchars(strip_tags($this->startTime));
            $this->endTime = htmlspecialchars(strip_tags($this->endTime));
            $this->id = htmlspecialchars(strip_tags($this->id));
            $uid = bin2hex(random_bytes(5));

            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':type', $this->type);
            $stmt->bindParam(':course', $this->course);
            $stmt->bindParam(':startDate', $this->startDate);
            $stmt->bindParam(':endDate', $this->endDate);
            $stmt->bindParam(':startTime', $this->startTime);
            $stmt->bindParam(':endTime', $this->endTime);
            $stmt->bindValue(':id', $this->id);
            $stmt->bindParam(':uid', $uid);

            if ($stmt->execute()) {
                return true;
            }
            printf("Error: %s.\n", $stmt->error);
            return false;
        }
    }

    public function delete_event()
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
