<?php
class Admin
{
    private $conn;
    private $table = 'admin';

    public $id;
    public $first_name;
    public $last_name;
    public $email;
    public $password;
    public $role;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_single()
    {
        $query = "SELECT * FROM " . $this->table . " WHERE email = :email";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            if (!password_verify($this->password, $row['password'])) {
                return array("error" => "Incorrect password");
            } else {
                $this->email = $row['email'];
                $this->password = $row['password'];
                $this->id = $row['id'];
                $this->first_name = $row['first_name'];
                $this->last_name = $row['last_name'];
                $this->role = $row['role'];
            }
        } else {
            return array("error" => "This account does not exist");
        }
    }
}
