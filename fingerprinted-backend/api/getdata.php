<?php
include_once "../config/Database.php";

$database = new Database();
$db = $database->connect();

function selection($array)
{
    $n = count($array);
    for ($i = 0; $i < $n; $i++) {
        $num = abs($array[$i]);
        if ($num <= $n) {
            $array[$num - 1] = -abs($array[$num - 1]);
        }
    }

    for ($i = 0; $i < $n; $i++) {
        if ($array[$i] > 0) {
            return $i + 1;
        }
    }

    return $n + 1;
}

function getIDs($db)
{
    $sql = "SELECT fingerprint_id FROM `students` WHERE fingerprint_id > 0";
    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $result = array_map(function ($item) {
        return $item['fingerprint_id'];
    }, $rows);
    return $result;
}

if (isset($_GET['check_mode']) && isset($_GET['device_token'])) {

    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && $_GET['check_mode'] == "get_mode") {
        echo "mode" . $row['mode'];
    } else {
        echo "Nothing";
    }
}

if (isset($_GET['check_reset']) && isset($_GET['device_token'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $device = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($device && $device['del_device'] == 1) {
        echo "yes";
    } else {
        echo "Nothing";
    }
}

if (isset($_GET['confirm_reset']) && isset($_GET['device_token'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $device = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($device && $device['del_device'] == 1 && $_GET['confirm_reset'] == 'check') {
        $sql = "UPDATE students SET fingerprint_id = 0 where device_id = :d";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(
            ':d' => $device['id'],
        ));
        if ($stmt) {
            echo "yes";
            $sql = "UPDATE devices SET del_device = 0 where id = :d";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                ':d' => $device['id'],
            ));
        } else {
            echo "Nothing";
        }
    } else {
        echo "Nothing";
    }
}

if (isset($_GET['get_id']) && isset($_GET['device_token'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($device && $_GET['get_id'] == "get_id") {
        $sql = "SELECT * FROM students WHERE add_fingerid = 1 AND device_id = :d";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(':d' => $device['id']));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && $row['fingerprint_id'] == 0) {
            $id = selection(getIDs($db));
            echo $id;

            $sql = "UPDATE students SET fingerprint_id = :fi WHERE device_id = :d AND id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                ':id' => $row['id'],
                ':d' => $device['id'],
                ':fi' => $id
            ));
        } elseif ($row && $row['fingerprint_id'] > 0) {
            echo $row['fingerprint_id'];
        } else {
            echo "Nothing";
        }
    } else {
        echo "Nothing";
    }
} 

if (isset($_GET['device_token']) && isset($_GET['finger_id']) && !empty($_GET['confirm_add'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));
    $finger_id = htmlspecialchars(stripslashes(trim($_GET['finger_id'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $sql = "UPDATE students SET add_fingerid = 0 WHERE device_id = :d AND fingerprint_id = :fi";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(
            ':d' => $row['id'],
            ':fi' => $finger_id,
        ));
        if ($stmt) {
            $sql = "SELECT first_name FROM students WHERE fingerprint_id = :i";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                ':i' => $finger_id
            ));
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                echo $row['first_name'];
            } else {
                echo "Nothing";
            }
        }
    } else {
        echo "Nothing";
    }
}

if (isset($_GET['delete_id']) && isset($_GET['device_token'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($device && $_GET['delete_id'] == "check") {
        $sql = "SELECT id, first_name, fingerprint_id FROM students WHERE del_fingerid = 1 AND device_id = :d AND add_fingerid = 0";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(':d' => $device['id']));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            echo $row['fingerprint_id'];
        } else {
            echo "Nothing";
        }
    } else {
        echo "Nothing";
    }
}

if (isset($_GET['confirm_delete']) && $_GET['confirm_delete'] == "check" && isset($_GET['id']) && isset($_GET['device_token'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));
    $id = htmlspecialchars(stripslashes(trim($_GET['id'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($device) {
        $sql = "SELECT id, first_name, device_id FROM students WHERE del_fingerid = 1 AND fingerprint_id = :id AND device_id = :d";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(':id' => $id, ':d' => $device['id']));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            echo $row['first_name'];
            $sql = "DELETE FROM students WHERE (del_fingerid = 1 AND id = :i AND device_id = :d) OR (del_fingerid = 1 AND fingerprint_id = 0)";
            $stmt = $db->prepare($sql);
            $stmt->execute(array(
                ':d' => $row['device_id'],
                ':i' => $row['id']
            ));
        } else {
            echo "Nothing";
        }
    } else {
        echo "Nothing";
    }
}

function get_event($db)
{
    $sql = "SELECT events.id, events.description, events.course, courses.course_code, events.type, events.uid, events.startDate, events.endDate, events.startTime, events.endTime FROM events JOIN courses ON events.course = courses.id WHERE course <> 1 AND type = 'Daily' AND (startDate <= CURDATE() AND endDate >= CURDATE()) AND (startTime <= CURTIME() AND endtime >= CURTIME())";
    $stmt = $db->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        return $row;
    } else {
        $sql = "SELECT events.id, events.description, events.course, courses.course_code, events.type, events.uid, events.startDate, events.endDate, events.startTime, events.endTime FROM events JOIN courses ON events.course = courses.id WHERE course <> 1 AND type = 'Weekly' AND (startDate <= CURDATE() AND endDate >= CURDATE()) AND (startTime <= CURTIME() AND endtime >= CURTIME()) AND (WEEKDAY(startDate) = WEEKDAY(CURDATE()))";
        $stmt = $db->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        } else {
            return false;
        }
    }
}

function is_enrolled($db, $sid, $cid)
{
    $sql = "SELECT * FROM enrolled where student_id = :sid AND course_id = :cid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':sid' => $sid, ':cid' => $cid));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        return $row;
    } else {
        return false;
    }
}

if (isset($_GET['check_att']) && isset($_GET['finger_id']) && isset($_GET['device_token'])) {
    $device_uid = htmlspecialchars(stripslashes(trim($_GET['device_token'])));
    $finger_id = htmlspecialchars(stripslashes(trim($_GET['finger_id'])));

    $sql = "SELECT * FROM devices WHERE uid = :uid";
    $stmt = $db->prepare($sql);
    $stmt->execute(array(':uid' => $device_uid));
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($device && $_GET['check_att'] == "attend") {
        $sql = "SELECT * FROM students WHERE fingerprint_id = :f AND device_id = :d";
        $stmt = $db->prepare($sql);
        $stmt->execute(array(':d' => $device['id'], ':f' => $finger_id));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $event = get_event($db);

            if ($event) {
                $sql = "SELECT * FROM attendance_log WHERE student_id = :sid AND course_id = :cid AND checkInDate = CURDATE() AND (checkInTime >= :st AND checkInTime <= :et) AND lecture_id = :ln";
                $stmt = $db->prepare($sql);
                $stmt->execute(array(':sid' => $row['id'], ':cid' => $event['course'], ':st' => $event['startTime'], ':et' => $event['endTime'], ':ln' => $event['uid']));
                $isLogged = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($isLogged) {
                    echo "Already" . $row['first_name'];
                } else {
                    $isenrolled = is_enrolled($db, $row['id'], $event['course']);
                    if ($isenrolled) {
                        $sql = "INSERT INTO attendance_log (student_id, course_id, lecture_id, startTime, endTime, checkInTime, checkInDate) VALUES (:sid, :cid, :lid, :st, :et, CURTIME(), CURDATE())";
                        $stmt = $db->prepare($sql);
                        $stmt->execute(array(':sid' => $row['id'], ':cid' => $event['course'], ':lid' => $event['uid'], ':st' => $event['startTime'], ':et' => $event['endTime']));
                        if ($stmt) {
                            echo "checkIn" . $row['first_name'];
                            $sql = "UPDATE enrolled SET attendance_count = :p WHERE student_id = :sid AND course_id = :cid";
                            $stmt = $db->prepare($sql);
                            $stmt->execute(array(
                                ':sid' => $row['id'],
                                ':cid' => $event['course'],
                                ':p' => (int)$isenrolled['attendance_count'] + 1
                            ));
                        } else {
                            echo "Error adding log";
                        }
                    } else {
                        echo "Not" . $event['course_code'];
                    }
                }
            } else {
                echo "none";
            }
        } else {
            echo "Nothing";
        }
    } else {
        echo "Nothing";
    }
}
