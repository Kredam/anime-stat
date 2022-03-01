const express = require("express");
const axios = require("axios");
const querystring = require('querystring')
var cors = require("cors");
const path = require('path');
require('dotenv').config({path: path.resolve('./.env')});

const CLIENT_ID = process.env.REACT_APP_MAL_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_MAL_CLIENT_SECRET;
const CODE_CHALLENGE = process.env.REACT_APP_CODE_CHALLENGE;
const app = express();
app.use(cors({ credentials: true, origin: true }));

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
  }).then((response) => {
    console.log(response)
    res.redirect(
      `http://localhost:3000?access_token=${response.data.access_token}`
    );
  }).catch(err => {
    console.log()
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});