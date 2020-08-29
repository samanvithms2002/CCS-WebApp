var express = require("express");
var path = require("path");
var mysql = require("mysql");
var nodemailer = require("nodemailer");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "siamproject1",
});

let transpoter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "meetingscheduler2000@gmail.com",
    pass: "test123@",
  },
});

con.connect(function (err) {
  if (err) throw err;
  console.log("database connected successfully");
});

var router = express.Router();

router.use(express.static(__dirname + "./public/"));

router.get("/", function (req, res) {
  res.render("home");
});

router.get("/form", function (req, res, next) {
  var getQuery = "select * from `registers`";
  con.query(getQuery, function (err, result) {
    if (err) throw err;

    res.render("index", {
      title: "Employee Records",
      records: result,
      success: "",
    });
  });
});

var top;

router.post("/", function (req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var regno = req.body.regno;
  var moblie = req.body.moblie;
  var whatsapp = req.body.whatsapp;
  var technical = req.body.technical;
  var managment = req.body.managment;
  var design = req.body.design;
  var gender = req.body.gender;

  if (technical == null) {
    technical = "";
  }
  if (managment == null) {
    managment = "";
  }
  if (design == null) {
    design = "";
  }

  var insertQuery =
    "insert into `registers` (`name`,`regno`,`moblie`,`whatsapp`,`email`,`technical`,`managment`,`design`,`gender`) VALUES (?,?,?,?,?,?,?,?,?)";
  var query = mysql.format(insertQuery, [
    name,
    regno,
    moblie,
    whatsapp,
    email,
    technical,
    managment,
    design,
    gender,
  ]);
  console.log(query);
  con.query(query, function (err, response) {
    if (err) throw err;
    res.render("landing");
  });
});

router.post("/search", function (req, res, next) {
  var flrtName = req.body.fitrname;
  if (req.body.fitrreg != "") {
    var flrtReg = "%" + req.body.fitrreg + "%";
  } else {
    var flrtReg = req.body.fitrreg;
  }

  var flrtDomain = req.body.filtrdomain;

  console.log(flrtName, flrtReg, flrtDomain);

  if (authenticated == false) {
    res.redirect("/login");
  } else {
    if (flrtDomain != "") {
      var getQuery =
        "select * from registers where status LIKE  ? OR regno LIKE  ? OR " +
        flrtDomain +
        " LIKE ? ";
      var query = mysql.format(getQuery, [flrtName, flrtReg, flrtDomain]);
    } else {
      var getQuery =
        "select * from registers where status LIKE  ? OR regno LIKE  ?";
      var query = mysql.format(getQuery, [flrtName, flrtReg]);
    }

    console.log(getQuery);
    con.query(query, function (err, result) {
      if (err) throw err;
      res.render("members", {
        title: "Employee Records",
        records: result,
        success: "Searching Successfully",
      });
    });
  }
});

router.get("/members", function (req, res) {
  if (authenticated == false) {
    res.redirect("/login");
  } else {
    var getQuery = "select * from `registers`";
    con.query(getQuery, function (err, result) {
      if (err) throw err;
      res.render("members", {
        title: "Employee Records",
        records: result,
        success: "Record Inserted Successfully",
      });
    });
  }
});

router.get("/edit/:id", function (req, res, next) {
  if (authenticated == false) {
    res.redirect("/login");
  } else {
    var id = req.params.id;
    var getQuery = "select * from `registers` where `id`=?";
    var query = mysql.format(getQuery, id);
    con.query(query, function (err, result) {
      if (err) throw err;
      var string = JSON.stringify(result);
      var json = JSON.parse(string);
      res.render("edit", {
        title: "Edit Status Records",
        records: json,
        success: "",
      });
    });
  }
});

router.post("/update/", function (req, res, next) {
  if (authenticated == false) {
    res.redirect("/login");
  } else {
    var status = req.body.status;
    var id = req.body.id;
    var email = req.body.email;
    var subject = req.body.subject;
    var text = req.body.text;
    var updateQuery = "UPDATE `registers` SET `status`=? where `id`=?";
    var query = mysql.format(updateQuery, [status, id]);
    if (text != "" && subject != "") {
      let mailOptions = {
        from: "meetingscheduler2000@gmail.com",
        subject: subject,
        text: text,
        to: email,
      };
      transpoter.sendMail(mailOptions, function (err, data) {
        if (err) {
          console.log("Error Occured!");
          console.log(err);
        } else {
          console.log("Email Sent!!");
        }
      });
    }
    con.query(query, function (err, response) {
      if (err) throw err;
      // console.log(response.insertId);
      res.redirect("/members");
    });
  }
});

router.get("/delete/:id", function (req, res, next) {
  if (authenticated == false) {
    res.redirect("/login");
  } else {
    var id = req.params.id;
    var deleteQuery = "delete from `registers` where `id`=?";
    var query = mysql.format(deleteQuery, id);
    con.query(query, function (err) {
      if (err) throw err;
      res.redirect("/members");
    });
  }
});

router.get("/login", function (req, res) {
  res.render("login", {
    title: "Login Page",
    success: "",
  });
});

var authenticated = false;

router.post("/login", function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var check = "Select * from users where email = ? and password = ?";
  var queryCheck = mysql.format(check, [email, password]);
  con.query(queryCheck, function (err, response) {
    if (err) throw err;
    if (response != "") {
      authenticated = true;
      res.redirect("/members");
    } else {
      res.redirect("/login");
    }
  });
});

module.exports = router;
