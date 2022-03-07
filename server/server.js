const express = require("express");
const axios = require("axios");
var cors = require("cors");
const bodyparser = require('body-parser')
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../mal-readme-firebase-adminsdk-seybw-c9c3b94c50.json')
require('dotenv').config({path: path.resolve('./.env')});

const CLIENT_ID = process.env.REACT_APP_MAL_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_MAL_CLIENT_SECRET;
const CODE_CHALLENGE = process.env.REACT_APP_CODE_CHALLENGE;

let username = ""
const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyparser.json())
// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore()

async function fetchUserInfo(user_access_token){
  return await axios.get('https://api.myanimelist.net/v2/users/@me?', {
    headers:{
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization':`Bearer ${user_access_token}`
    }
  }).then(res => {
    return res.data.name
  })
}

async function fetchMyAnimeListStats(access_token, username){
  return await axios.get(`https://api.myanimelist.net/v2/users/${username}/animelist?`, {
    params:{
      status:"completed",
      limit: 10,
      sort:"list_score"
    },
    headers:{
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization':`Bearer ${access_token}`
    }
  }).then(res => {
    return res.data
  })
}

app.post("/animelist/stats", async(req, res) => {
  const acces_token = (await db.collection("users").doc(req.body.username).get()).data().access_token
  const stats = await fetchMyAnimeListStats(acces_token, req.body.username)

  return res.send(stats)
})

app.get("/oauth/redirect", (req, res) => {
  const code = req.query.code;
  const dataFormated = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=authorization_code&code=${code}&code_verifier=${CODE_CHALLENGE}`
  console.log(process.env.config)
  axios({
    method: "POST",
    url: "https://myanimelist.net/v1/oauth2/token",
    data: dataFormated,
    headers: {
      'Content-Type':'application/x-www-form-urlencoded',  
    },
  }).then(async(response) => {
    username = await fetchUserInfo(response.data.access_token)
    // const usersRef = db.collection("users").doc(username).set(response.data)
    res.redirect(
      `http://localhost:3000?username=${username}`
      );
    })
  });
  
  const PORT = 8080;
  app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
  });