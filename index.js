const express = require('express')
const bodyParser = require('body-parser');
var con = require("./conn.js");
const app = express()
const { isValidName, isValidEmail, isValidPwd } = require("./validation.js")

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// getting sign up data from cient side

// user account creation //////////////////////////////================////////////////////////////------------////////////////
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/Signup.html');
});
// getting form data using body parser
app.post("/", function (req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;

  if (!isValidName(name)) {
    return res.send({ status: false, message: 'only alphabets are allowed' })
  }

  if (!isValidEmail(email)) {
    return res.send({ status: false, message: 'Please enter valid e-mail' })
  }

  if (!isValidPwd(password))
    return res.status(400).send({
      status: false,
      message:
        "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters",
    });
  alreadyExist = false;
  //  function signup(){
  con.query("select email from users", (err, result) => {
    if (err) { throw err; }
    if (result) {
      for (let i = 0; i < result.length; i++) {
        if (result[i].email == email) {
          alreadyExist = true;
          return res.send("this e mail is already registered")
        }
      }
    }
  });

  // writing sql query to insert data in data base
  var sql = "INSERT INTO users(name, email, password) VALUES('" + name + "', '" + email + "','" + password + "')";

  con.query(sql, function (error, result) {
    if (alreadyExist == false) {
      
      res.send('Your Account is Created successfyllt');
    }
  });
});


// log in user data is here
// user account log in here /////////////////////////////////////=============================////////////////////////////////
app.get("/login.html", function (req, res) {
  res.sendFile(__dirname + '/login.html');
})
// getting form data using body parser

app.post("/login.html", function (req, res) {

  let email = req.body.email
  let password = req.body.password

  if (!isValidEmail(email)) {
    return res.send({ status: false, message: 'Please enter valid e-mail' })
  }

  if (!isValidPwd(password))
    return res.status(400).send({
      status: false,
      message:
        "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters",
    });


  let user = "select * from users where email = ?"
  con.query(user, [email], function (err, result) {

    if (err) return res.status(500).send({ status: false, massage: err.massage })
    if (result.length == 0) return res.status(400).send({ status: false, massage: ' Email not Found' })

    let diff = Math.abs(new Date(result[0]['last_failed_attempt']).getTime() - new Date().getTime())

    diff = diff / (60 * 60 * 1000);

    // today
    if (diff < 24) {
      if (result[0]['failed_attempt'] >= 5)
        return res.status(400).send({ status: false, massage: 'try after 24 hours because you have done total 5 wrong attempt' })

      // before 24 hour right attempt
      if (password == result[0].password) {
        let update = 'update users set failed_attempt = 0 where email = ?;'
        con.query(update, [email], function (err, updated) {
          if (err) return res.status(400).send({ status: false, massage: 'some error in update' })
          res.redirect("/home.html")

          app.get('/home.html', function (req, res) {
            res.sendFile(__dirname + '/home.html');
          });
        })
      }
      //before 24 hour wrong attempt
      else {
        let update = 'update users set failed_attempt = failed_attempt+1 where email = ?;'
        con.query(update, [email], function (err, updated) {

          if (err) return res.status(400).send({ status: false, massage: 'some error in update' })
          else return res.status(400).send({ status: false, massage: `you have entered wrong password you have only ${5 - (result[0].failed_attempt + 1)}attempts` })
        })
      }

    }
    // tomorrow...
    else {
      // after 24 hour right attempt
      if (password == result[0].password) {
        let update = 'update users set failed_attempt = 0 where email = ?;'
        con.query(update, [email], function (err, updated) {
          if (err) return res.status(400).send({ status: false, massage: 'some error in update' })
          res.redirect("/home.html")

          app.get('/home.html', function (req, res) {
            res.sendFile(__dirname + '/home.html');
          });
        })
      }
      // after 24 hours wrong attemp
      else {
        let update = 'update users set failed_attempt = 1,last_failed_attempt = now() where email = ?;'
        con.query(update, [email], function (err, updated) {

          if (err) return res.status(400).send({ status: false, massage: 'some error in update' })
          else return res.status(400).send({ status: false, massage: `you have entered wrong password you have only${5 - (result[0].failed_attempt + 1)}attempts` })
        })
      }
    }
  })
});

app.listen(3000, function () {
  console.log("port is connected 3000!")
})

