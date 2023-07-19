// #include <WiFiClientSecure.h>
#include <WiFiClient.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include <ESP8266HTTPClient.h>
#include <SimpleTimer.h>
#include <SPI.h>
#include <Wire.h>
#include "icons.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_Fingerprint.h>

// defining pins for fingerprint sensor and OLED
#define Finger_Rx 14
#define Finger_Tx 12
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET 0
#define SCL_PIN SCL
#define SDA_PIN SDA

// creating instance of wificlient for the esp8266
WiFiClient client;

// creating instance of the timer
SimpleTimer timer;

// defining the serial pins of fingerprint sensor and creating instance of fingerprint sensor
SoftwareSerial mySerial(Finger_Rx, Finger_Tx);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

// Initializing pins of OLED display
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// defining wifi parameters
const char *ssid = "Nokia 5.3";
const char *password = "pinkberry";

// defining API endpoint
String URL = "http://192.168.215.1/fingerprinted/api/getdata.php";

// defining device token
const char *device_token = "c2f3ef97";

// declaring varibles for data obtained from server and api endpoint
String getData, Link;

// initialising fingerid for attendance and decalring the controllable timers
int FingerID = 0, t1, t2;

// setting intial device mode and connect condition
bool device_Mode = false;
bool firstConnect = false;

// declaring id for addition of fingerprint
int id;

// setting reconnection time for WiFi
unsigned long previousMillis = 0;

// Initializing buzzer pin
const int buzzer = 15;


void setup() {
  // Initializing the serial monitor
  Serial.begin(115200);

  // for insecure SSL connection or https
  // client.setInsecure();

  // setting pin of buzzer output
  pinMode(buzzer, OUTPUT);

  // Initializing the OLED display
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;)
      ;
  }

  // Print on OLED display
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(10, 20);
  display.print(F("Power On"));
  display.display();

  // call to WiFi connection function
  connectToWiFi();

  // Initializing the fingerprint sensor
  finger.begin(57600);
  Serial.println("\n\nAdafruit finger detect test");

  // checking if fingerprint sensor is active or responding
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
    display.display();
    delay(400);
    display.clearDisplay();
  } else {
    // if fingerprint sensor is not connected
    Serial.println("Did not find fingerprint sensor :(");
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_invalid_bits, FinPr_invalid_width, FinPr_invalid_height, WHITE);
    display.display();
    while (1) {
      delay(1);
    }
  }

  // Get no. of templates  in the fingerprint sensor
  finger.getTemplateCount();
  Serial.print("Sensor contains ");
  Serial.print(finger.templateCount);
  Serial.println(" templates");
  Serial.println("Waiting for valid finger...");

  // set timer for mode check, reset check, addition and deletion of ids functions
  timer.setInterval(10000L, CheckMode);
  timer.setInterval(15000L, CheckReset);
  t1 = timer.setInterval(6000L, ChecktoAddID);
  t2 = timer.setInterval(10000L, ChecktoDeleteID);

  // calling mode check initially (for the first time)
  CheckMode();
}

void loop() {
  // start the timed functions
  timer.run();

  //Retry to connect to Wi-Fi
  if (!WiFi.isConnected()) {
    if (millis() - previousMillis >= 10000) {
      previousMillis = millis();
      connectToWiFi();
    }
  }

  // device mode is attendance, that is true.
  if (device_Mode) {
    CheckFingerprint();
  }
  delay(10);
}

void CheckFingerprint() {
  // find fingerprint in database and return the id
  FingerID = getFingerprintID();

  // display icon and send id to website database if a match is found, else display corresponding icon
  DisplayFingerprintID();
}

void DisplayFingerprintID() {
  // if a match is found in the sensor's database
  if (FingerID > 0) {
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
    display.display();
    // send fingerprint id to website to mark attendance
    SendFingerprintID(FingerID);
    delay(100);
  }

  // if there is no finger on the sensor
  else if (FingerID == 0) {
    display.clearDisplay();
    display.drawBitmap(32, 0, FinPr_start_bits, FinPr_start_width, FinPr_start_height, WHITE);
    display.display();
  }

  // if the finger on the sensor has no match in the database
  else if (FingerID == -2) {
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_invalid_bits, FinPr_invalid_width, FinPr_invalid_height, WHITE);
    display.display();
  }

  // else {
  //   // One with padlock just in case
  //   display.drawBitmap(32, 0, FinPr_failed_bits, FinPr_failed_width, FinPr_failed_height, WHITE);
  // }
}

// find id in fingerprint database
int getFingerprintID() {
  // get image of fingerprint on sensor
  uint8_t p = finger.getImage();
  switch (p) {
    case FINGERPRINT_OK:
      break;
    case FINGERPRINT_NOFINGER:
      return 0;
    case FINGERPRINT_PACKETRECIEVEERR:
      return -2;
    case FINGERPRINT_IMAGEFAIL:
      return -2;
    default:
      return -2;
  }

  // convert image taken to template
  p = finger.image2Tz();
  switch (p) {
    case FINGERPRINT_OK:
      break;
    case FINGERPRINT_IMAGEMESS:
      return -1;
    case FINGERPRINT_PACKETRECIEVEERR:
      return -2;
    case FINGERPRINT_FEATUREFAIL:
      return -2;
    case FINGERPRINT_INVALIDIMAGE:
      return -2;
    default:
      return -2;
  }

  // search for fingerprint features that matched the saved templates
  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    return -2;
  } else if (p == FINGERPRINT_NOTFOUND) {
    return -1;
  } else {
    return -2;
  }

  // print the finger ID and confidence level
  Serial.print("Found ID #");
  Serial.print(finger.fingerID);
  Serial.print(" with confidence of ");
  Serial.println(finger.confidence);
  return finger.fingerID;
}

void SendFingerprintID(int finger) {
  Serial.println("Sending the Fingerprint ID");
  // if esp8266 is connected to WiFi
  if (WiFi.isConnected()) {
    // Initialize http client
    HTTPClient http;
    // assign new queries to getData
    getData = "?check_att=attend&finger_id=" + String(finger) + "&device_token=" + device_token;

    // Add getdata to api endpoint to create a new link
    Link = URL + getData;
    // begin connection to website using link
    http.begin(client, Link);
    // get http code using using http get function
    int httpCode = http.GET();
    // get the returned data
    String payload = http.getString();

    // Print the received information
    Serial.println(httpCode);
    Serial.println(payload);
    Serial.println(finger);

    // if the first 7 characters of payload is checkIn, print a welcome message to confirm marking
    if (payload.substring(0, 7) == "checkIn") {
      // get user'name from payload sttring
      String user_name = payload.substring(7);

      // Print welcome message on OLED
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(20, 0);
      display.print(F("Welcome"));
      display.setCursor(0, 20);
      display.print(user_name);
      display.display();
      delay(400);
      // set buzzer pin to high to indicate marking
      digitalWrite(buzzer, HIGH);
      delay(200);
      digitalWrite(buzzer, LOW);
    }  // if attendance is already marked for user, print that attendance is already marked
    else if (payload.substring(0, 7) == "Already") {
      // get user's name from payload string
      String user_name = payload.substring(7);
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(0, 0);
      display.print(F("Already"));
      display.setCursor(0, 20);
      display.print(F("logged for"));
      display.setCursor(0, 40);
      display.print(user_name);
      display.display();
      Serial.println(user_name);
      delay(400);
    }  // if user is not enrolled for course, indicate by printing message
    else if (payload.substring(0, 3) == "Not") {
      // Get course code from payload
      String course = payload.substring(3);

      // Print on OLED
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(0, 0);
      display.print(F("Not enroll"));
      display.setCursor(0, 20);
      display.print(F("ed for"));
      display.setCursor(0, 40);
      display.print(course);
      display.display();
      Serial.println(course);
      delay(400);
    }  // if no lecture is holding, print no lecture ongoing on OLED
    else if (payload.substring(0, 4) == "none") {
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(0, 0);
      display.print(F("No"));
      display.setCursor(0, 20);
      display.print(F("lectures"));
      display.setCursor(0, 40);
      display.print(F("ongoing"));
      display.display();
      delay(400);
    }
    // Terminate http client
    http.end();
  }
}

// check if website requested for device reset
void CheckReset() {
  Serial.println("Check Reset");
  // check if esp8266 is connected.
  if (WiFi.isConnected()) {
    // initialize new http client
    HTTPClient http;

    // Form new api endpoint
    getData = "?check_reset=get_reset&device_token=" + String(device_token);
    Link = URL + getData;

    // begin connection to website using link
    http.begin(client, Link);
    // get http code, 200 for success
    int httpCode = http.GET();
    // get data returned from website
    String payload = http.getString();

    // if payload is yes, reset the database and indicate reset
    if (payload == "yes") {
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(0, 0);
      display.print(F("Resetting"));
      display.setCursor(0, 20);
      display.print(F("Database"));
      display.display();
      Serial.println("Resetting Database");
      delay(400);
      // empty database in fingerprint sensor
      finger.emptyDatabase();
      // call to confirm reset
      confirmReset();
    }
    // end http connection
    http.end();
  }
}

// confirm the device has been reset
void confirmReset() {
  Serial.println("Confirm Reset");
  // if esp8266 is connected to the internet
  if (WiFi.isConnected()) {
    // Instantiate new http client
    HTTPClient http;

    // create new api endpoint
    getData = "?confirm_reset=check&device_token=" + String(device_token);
    Link = URL + getData;

    // begin http connection
    http.begin(client, Link);
    // get http code after GET request
    int httpCode = http.GET();
    // get payload from string
    String payload = http.getString();

    // if payload is yes, indicate that the database has been reset on OLED
    if (payload == "yes") {
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(0, 0);
      display.print(F("Database"));
      display.setCursor(0, 20);
      display.print(F("Reset"));
      display.display();
      delay(400);
    }
    // end http connection
    http.end();
  }
}

// Switches mode of device from attendance to enrollment
void CheckMode() {
  Serial.println("Check Mode");
  // if esp8266 is connected to the internet
  if (WiFi.isConnected()) {
    // Instantiate new http client
    HTTPClient http;

    // create new api endpoint
    getData = "?check_mode=get_mode&device_token=" + String(device_token);
    Link = URL + getData;

    // begin http connection, get status code and returned data
    http.begin(client, Link);
    int httpCode = http.GET();
    String payload = http.getString();

    // if the first 4 characters of the string is mode
    if (payload.substring(0, 4) == "mode") {
      // get mode from the rest of the string
      String dev_mode = payload.substring(4);
      // convert data to integer
      int devMode = dev_mode.toInt();

      // if connected to the website for the first time
      if (!firstConnect) {
        device_Mode = devMode;
        firstConnect = true;
      }

      // if devMode is 0, switch to attendance
      if (!device_Mode && !devMode) {
        // switch device mode flag
        device_Mode = true;

        // disable the add and delete function timers
        timer.disable(t1);
        timer.disable(t2);

        // Print on OLED
        display.clearDisplay();
        display.setTextSize(2);
        display.setTextColor(WHITE);
        display.setCursor(40, 0);
        display.print(F("MODE"));
        display.setCursor(0, 20);
        display.print(F("Attendance"));
        display.display();
        Serial.println("Mode: Attendance");
        delay(400);
      }  // if devMode is 1, switch to enrollment
      else if (device_Mode && devMode) {
        // switch device mode flag
        device_Mode = false;

        // enable the add and delete function timers
        timer.enable(t1);
        timer.enable(t2);

        // print on OLED
        display.clearDisplay();
        display.setTextSize(2);
        display.setTextColor(WHITE);
        display.setCursor(40, 0);
        display.print(F("MODE"));
        display.setCursor(0, 20);
        display.print(F("Enrollment"));
        display.display();
        Serial.println("Mode: Enrollment");
        delay(400);
      }
      // end http connection
      http.end();
    }
    // end http connection
    http.end();
  }
}

void ChecktoAddID() {
  // print fingerprint icon
  display.clearDisplay();
  display.drawBitmap(32, 0, FinPr_start_bits, FinPr_start_width, FinPr_start_height, WHITE);
  display.display();
  Serial.println("Check to Add ID");
  // if esp8266 is connected to the internet
  if (WiFi.isConnected()) {
    // Instantiate WiFi client
    HTTPClient http;

    // create api endpoint
    getData = "?get_id=get_id&device_token=" + String(device_token);
    Link = URL + getData;

    // begin http connection, get status code and returned data
    http.begin(client, Link);
    int httpCode = http.GET();
    String payload = http.getString();

    // if payload is not equal to Nothing, that is if an id/number is returned
    if (payload != "Nothing") {
      String add_id = payload;
      Serial.println(add_id);

      // convert id to number
      id = add_id.toInt();
      Serial.println(id);
      // end http connection
      http.end();
      // disable delete function timer
      timer.disable(t2);
      // call function to enroll fingerprint
      getFingerprintEnroll();
    }
    http.end();
  }
}

// Enrollment of fingerprint
uint8_t getFingerprintEnroll() {
  int p = -1;
  // print icon for scanning fingerprint
  display.clearDisplay();
  display.drawBitmap(34, 0, FinPr_scan_bits, FinPr_scan_width, FinPr_scan_height, WHITE);
  display.display();
  // while fingerprint is not scanned
  while (p != FINGERPRINT_OK) {
    // get fingerprint image fron sensor
    p = finger.getImage();
    switch (p) {
      // if image is ok
      case FINGERPRINT_OK:
        display.clearDisplay();
        display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
        display.display();
        break;
        // if no finger id on sensor
      case FINGERPRINT_NOFINGER:
        display.setTextSize(1);
        display.setTextColor(WHITE);
        display.setCursor(0, 0);
        display.print(F("scanning"));
        display.display();
        break;
        // if image is invalid
      case FINGERPRINT_PACKETRECIEVEERR:
        display.clearDisplay();
        display.drawBitmap(34, 0, FinPr_invalid_bits, FinPr_invalid_width, FinPr_invalid_height, WHITE);
        display.display();
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }
  }

  // convert image to template
  p = finger.image2Tz(1);
  switch (p) {
    // if successful
    case FINGERPRINT_OK:
      display.clearDisplay();
      display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
      display.display();
      break;
    // if image is messy
    case FINGERPRINT_IMAGEMESS:
      display.clearDisplay();
      display.drawBitmap(34, 0, FinPr_invalid_bits, FinPr_invalid_width, FinPr_invalid_height, WHITE);
      display.display();
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  }
  // Print on OLED
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(20, 0);
  display.print(F("Remove"));
  display.setCursor(20, 20);
  display.print(F("finger"));
  display.display();
  delay(1000);
  p = 0;

  // if finger is still on sensor, wait
  while (p != FINGERPRINT_NOFINGER) {
    // get fingerprint image
    p = finger.getImage();
  }
  Serial.print("ID ");
  Serial.println(id);
  p = -1;
  // print scan icon on OLED
  display.clearDisplay();
  display.drawBitmap(34, 0, FinPr_scan_bits, FinPr_scan_width, FinPr_scan_height, WHITE);
  display.display();
  while (p != FINGERPRINT_OK) {
    // scan fingerprint image again
    p = finger.getImage();
    switch (p) {
      // if image was taken
      case FINGERPRINT_OK:
        display.clearDisplay();
        display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
        display.display();
        break;
        // if no finger is on the sensor
      case FINGERPRINT_NOFINGER:
        display.setTextSize(1);
        display.setTextColor(WHITE);
        display.setCursor(0, 0);
        display.print(F("scanning"));
        display.display();
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }
  }

  // OK success!

  // convert image to template
  p = finger.image2Tz(2);
  switch (p) {
    // if successful
    case FINGERPRINT_OK:
      display.clearDisplay();
      display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
      display.display();
      break;
      // image is too messy
    case FINGERPRINT_IMAGEMESS:
      display.clearDisplay();
      display.drawBitmap(34, 0, FinPr_invalid_bits, FinPr_invalid_width, FinPr_invalid_height, WHITE);
      display.display();
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  }


  Serial.print("Creating model for #");
  Serial.println(id);
  // create fingerprint model for converted images/templates
  p = finger.createModel();
  // if successful
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
    display.display();
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Fingerprints did not match");
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_invalid_bits, FinPr_invalid_width, FinPr_invalid_height, WHITE);
    display.display();
    return p;
  } else {
    Serial.println("Unknown error");
    return p;
  }

  Serial.print("ID ");
  Serial.println(id);
  // store model with id on sensor database
  p = finger.storeModel(id);

  // if successful
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
    display.clearDisplay();
    display.drawBitmap(34, 0, FinPr_valid_bits, FinPr_valid_width, FinPr_valid_height, WHITE);
    display.display();
    // confirm addition of new fingerprint
    confirmAdding(id);
    return p;
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("Could not store in that location");
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("Error writing to flash");
    return p;
  } else {
    Serial.println("Unknown error");
    timer.enable(t2);
    return p;
  }
}

// confirm new fingerprint addition
void confirmAdding(int id) {
  Serial.println("confirm Adding");
  // if esp8266 is connected to wifi
  if (WiFi.status() == WL_CONNECTED) {
    // Instantaite http client
    HTTPClient http;

    // create new api endpoint
    getData = "?confirm_add=add&device_token=" + String(device_token) + "&finger_id=" + String(id);
    Link = URL + getData;

    // begin http connection, get status code and returned data
    http.begin(client, Link);
    int httpCode = http.GET();
    String payload = http.getString();

    // if sucessful
    if (httpCode == 200) {
      // Print confirmation on OLED
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(0, 0);
      display.print(F("Prints"));
      display.setCursor(0, 20);
      display.print(F("Added for"));
      display.setCursor(0, 40);
      display.print(payload);
      display.display();
      Serial.println(payload);
      delay(400);
      // beep buzzer
      digitalWrite(buzzer, HIGH);
      delay(100);
      digitalWrite(buzzer, LOW);
      // enable disable timer
      timer.enable(t2);
    } else {
      Serial.println("Error Confirm!!");
    }
    http.end();
  }
}

void ChecktoDeleteID() {
  // print fingerprint icon
  display.clearDisplay();
  display.drawBitmap(32, 0, FinPr_start_bits, FinPr_start_width, FinPr_start_height, WHITE);
  display.display();
  Serial.println("Check to Delete ID");
  // if esp8266 is connected to the internet
  if (WiFi.isConnected()) {
    // Instatiate http client
    HTTPClient http;

    // create new api endpoint
    getData = "?delete_id=check&device_token=" + String(device_token);
    Link = URL + getData;

    // begin http connection, get status code and returned data
    http.begin(client, Link);
    int httpCode = http.GET();
    String payload = http.getString();
    Serial.println(payload);

    // if returned string is an id
    if (payload != "Nothing") {
      String del_id = payload;
      Serial.println(del_id);
      // end http connection
      http.end();

      // convert to number
      int d = del_id.toInt();
      // call function to delete fingerprint
      deleteFingerprint(d);
    }
    // end http connection
    http.end();
  }
}

// function to delete fingerprint
uint8_t deleteFingerprint(int id) {
  uint8_t p = -1;

  // deleting fingerprint model
  p = finger.deleteModel(id);

  // if successful
  if (p == FINGERPRINT_OK) {
    Serial.println("Deleted!");
    confirmDelete(id);
    return p;
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.print(F("Communication error!\n"));
    display.display();
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.print(F("Could not delete in that location!\n"));
    display.display();
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.print(F("Error writing to flash!\n"));
    display.display();
    return p;
  } else {
    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.print(F("Unknown error:\n"));
    display.display();
    return p;
  }
}

// function to confirm deletion
void confirmDelete(int id) {
  // if esp8266 is connected to Wifi
  if (WiFi.isConnected()) {
    // Instantiate http client
    HTTPClient http;

    // create new api endpoint
    getData = "?confirm_delete=check&device_token=" + String(device_token) + "&id=" + String(id);
    Link = URL + getData;

    // begin http connection, get status code and returned string
    http.begin(client, Link);
    int httpCode = http.GET();
    String payload = http.getString();
    Serial.println(payload);

    // if payload is not equal to nothing, that is a name
    if (payload != "Nothing") {
      String name = payload;
      // end http connection
      http.end();
      // Print on OLED to indicate deletion
      display.clearDisplay();
      display.setTextSize(2);
      display.setTextColor(WHITE);
      display.setCursor(20, 0);
      display.print(F("Deleted"));
      display.setCursor(0, 20);
      display.print(F("prints for"));
      display.setCursor(0, 40);
      display.print(name);
      display.display();
      delay(400);
    }
    // end http connection
    http.end();
  }
}

void connectToWiFi() {
  // Initialize Wifi connection
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_STA);
  Serial.print("Connecting to ");  // print on serial monitor
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  // set display on OLED to show connection attempt
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.print(F("Connecting to \n"));
  display.setCursor(0, 50);
  display.setTextSize(2);
  display.print(ssid);
  display.drawBitmap(73, 10, Wifi_start_bits, Wifi_start_width, Wifi_start_height, WHITE);
  display.display();

  // setting  connection period of 30 seconds
  uint32_t periodToConnect = 30000L;
  for (uint32_t StartToConnect = millis(); (millis() - StartToConnect) < periodToConnect;) {
    if (WiFi.status() != WL_CONNECTED) {
      delay(400);
      Serial.print(".");
    } else {
      break;
    }
  }

  // if the esp8266 is connected to the Wifi
  if (WiFi.isConnected()) {
    Serial.println("");
    Serial.println("Connected");

    // Print connected on OLED
    display.clearDisplay();
    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(8, 0);
    display.print(F("Connected \n"));
    display.drawBitmap(33, 15, Wifi_connected_bits, Wifi_connected_width, Wifi_connected_height, WHITE);
    display.display();

    // Print IP Address on serial monitor
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");  // print 'Not Connected' on serial monitor
    Serial.println("Not Connected");
    WiFi.mode(WIFI_OFF);
    delay(1000);
  }
  delay(1000);
}
