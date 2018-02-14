require("dotenv").config();
const express = require("express");

const { PORT, CONNECTION_STRING, SECRET } = process.env;

//  MIDDLEWARE DEP
const { json } = require("body-parser");
const session = require("express-session");
const cors = require("cors");

// DATABASE DEP
const massive = require("massive");
const userCtrl = require("./Controllers/user/userCtrl");

//INITIALIZE APP
const app = express();

//SOCKET.IO
// const socket = require("socket.io");
const http = require("http").Server(app);
const io = require("socket.io")(http);
let playerCount = 0;
let difficulty = 1;

//MASSIVE CONNECTION TO DB
massive(CONNECTION_STRING)
  .then(db => {
    app.set("db", db);
  })
  .catch(console.log);
// console.log("HIT");

//BASIC MIDDLEWARES
app.use(json());
app.use(cors());

// app.use(
//    session({
//        secret: SECRET,
//        saveUninitialized: false,
//        resave: false,
//        cookie: {
//            maxAge: 1000
//        }
//    })
// );

io.on("connection", socket => {
  //client joined
  playerCount++;
  console.log("Client connected: ", socket);

  //onClick of button in front-end activate this.socket.emit("next question")
  socket.on("next question", () => {
    app
      .get("db")
      .get_questions([difficulty])
      .then(questions => {
        io.emit("new question", {
          isQuestion: true,
          isAnswer: false,
          isCompleted: false,
          response: questions
        });
      })
      .catch(console.log);

    if (difficulty < 10) {
      difficulty++;
      console.log(difficulty);
      setTimeout(() => {
        io.emit("new answer", {
          isQuestion: false,
          isAnswer: true,
          isCompleted: false
        });
      }, 10000);
    } else {
      console.log("THIS IS THE END");
      setTimeout(() => {
        io.emit("new answer", {
          isQuestion: false,
          isAnswer: true,
          isCompleted: true
        });
      }, 10000);
    }
  });

  //onClick of answer-choice button activate this.socket.emit("answer choice", choice)
  // socket.on("answer choice", (user_id, question_id, choice) => {
  //   console.log(choice);
  //   app
  //     .get("db")
  //     .add_answer([user_id, question_id, choice])
  //     .then(answered => {
  //       //can compare user answered choice with the correct_answer choice from the above response in front end to decide whether to remove functionality or not
  //       io.emit("chosen answer", answered);
  //     })
  //     .catch(console.log);
  // });

  //client disconnected
  socket.on("disconnect", () => console.log("Client disconnected"));
});

app.post("/api/register", userCtrl.addUser);
app.get("/api/login", userCtrl.getUser);
app.put("/api/profile/update", userCtrl.updateUser);

http.listen(PORT || 3001, () => {
  console.log(`Listening on port: ${PORT}`);
});
