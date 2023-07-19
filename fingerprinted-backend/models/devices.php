<?php
class Device
{
    private $conn;
    private $table = 'devices';

    public $id;
    public $name;
    public $uid;
    public $mode;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT * FROM " . $this->table . " WHERE id <> 0 ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_all()
    {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function read_single()
    {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND id <> 0";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->id = $row['id'];
        $this->name = $row['name'];
        $this->uid = $row['uid'];
        $this->mode = $row['mode'];
    }

    public function does_name_exist($name)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE name = :name";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return true;
        }
        return false;
    }

    public function generate_token()
    {
        $token = random_bytes(4);
        $dev_token = bin2hex($token);
        $flag = true;
        while ($flag) {
            $query = "SELECT * FROM " . $this->table . " WHERE uid = :uid";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":uid", $dev_token);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $token = random_bytes(4);
                $dev_token = bin2hex($token);
            } else {
                $flag = false;
            }
        }
        return $dev_token;
    }

    public function add_new()
    {
        $query = "INSERT INTO " . $this->table . " (name, uid, mode) VALUES (:name, :uid, :mode)";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->name)) {
            $this->name = htmlspecialchars(strip_tags($this->name));

            if (!$this->does_name_exist($this->name)) {
                $dev_token = $this->generate_token();

                $stmt->bindParam(':name', $this->name);
                $stmt->bindParam(':uid', $dev_token);
                $stmt->bindValue(':mode', 0);

                if ($stmt->execute()) {
                    return true;
                }
                printf("Error: %s.\n", $stmt->error);
                return false;
            } else {
                return array("error" => "Name '" . $this->name . "' already exists");
            }
        } else {
            return array("error" => "Please fill all required fields");
        }
    }

    public function reset_token()
    {
        $query = "UPDATE " . $this->table . " SET uid = :uid WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $token = random_bytes(4);
        $dev_token = bin2hex($token);
        $stmt->bindParam(":uid", $dev_token);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    public function delete_device()
    {
        $query = "UPDATE " . $this->table . " SET del_device = 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->read_single();
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    public function switch_mode()
    {
        $query = "UPDATE " . $this->table . " SET mode = :mode WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->mode = htmlspecialchars(strip_tags($this->mode));

        $new_mode = (int)$this->mode === 1 ? 0 : 1;
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":mode", $new_mode);

        if ($stmt->execute()) {
            $this->read_single();
            return true;
        }
        printf("Error: %s.\n", $stmt->error);
        return false;
    }

    public function update_device()
    {
        $query = "UPDATE " . $this->table . " SET name = :name WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        if (!empty($this->name)) {
            $this->name = htmlspecialchars(strip_tags($this->name));
            if (!$this->does_name_exist($this->name)) {
                $stmt->bindParam(":id", $this->id);
                $stmt->bindParam(':name', $this->name);

                if ($stmt->execute()) {
                    return true;
                }
                printf("Error: %s.\n", $stmt->error);
                return false;
            } else {
                return array("error" => "Name '" . $this->name . "' already exists");
            }
        } else {
            return array("error" => "Please fill all required fields");
        }
    }
}
