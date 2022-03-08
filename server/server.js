const express = require("express");
const axios = require("axios");
var cors = require("cors");
const bodyparser = require('body-parser')
const path = require('path');
const base64 = require(`base64-js`)
const serviceAccount = require('./mal-readme-firebase-adminsdk-seybw-c9c3b94c50.json')
const sha256 = require("js-sha256").sha256
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
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
  credential: cert(JSON.parse(Buffer.from(process.env.FIREBASE, 'base64').toString('ascii')))
});
const db = getFirestore()

async function fetchUserInfo(user_access_token){
  return await axios.get('https://api.myanimelist.net/v2/users/@me?', {
    headers:{
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization':`Bearer ${user_access_token}`
    }
  }).then(res => {
    return sha256(res.data.name)
  })
}

async function generate_new_token(refresh_token) {
  const dataFormated = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code_verifier=${CODE_CHALLENGE}&grant_type=refresh_token&refresh_token=${refresh_token}`
  await axios({
    method: "POST",
    url: "https://myanimelist.net/v1/oauth2/token",
    data: dataFormated,
    headers: {
      'Content-Type':'application/x-www-form-urlencoded',
    },
  }).then((res) => console.log(res))
}

async function fetchMyAnimeListStats(access_token, username){
  return await axios.get(`https://api.myanimelist.net/v2/users/@me/animelist?`, {
    params:{
      status:"completed",
      limit: 5,
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

app.get('/', (req, res) => {
  res.send('Working')
})

app.post("/animelist/stats", async(req, res) => {
  const user_data = await db.collection("users").doc(req.body.username).get()
  const acces_token = user_data.data().access_token
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
  }).then(async (response) => {
    console.log(response.data)
    const access_token = response.data.access_token
    username = await fetchUserInfo(access_token)
    db.collection("users").doc(username).set(response.data)
    res.redirect(
        `http://localhost:3000?username=${username}`
    );

    }).catch((err) => {
      if(err.response.data.hint === "Authorization code has expired"){

    }
  })
  });
  
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`);
  });