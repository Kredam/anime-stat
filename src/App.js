import {useEffect, useState} from 'react';
import axios from 'axios'
import  domtoimage from "dom-to-image"
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [logged, isLogged] = useState(false)
  const client_id = process.env.REACT_APP_MAL_CLIENT_ID;
  const client_secret = process.env.REACT_APP_MAL_CLIENT_SECRET;
  const url = process.env.REACT_APP_URL;
  const code_challenge = process.env.REACT_APP_CODE_CHALLENGE;
  const [animes, setAnimes] = useState([])
  console.log(String(code_challenge).length)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


  useEffect(() => { 
    const username = new URLSearchParams(window.location.search).get("username")
    console.log(username)
    if(localStorage.getItem("username")){
      isLogged(() => true)
    }
    if(username !== null) {
      localStorage.setItem("username", username)
      isLogged(() => true)
    }
    if(localStorage.getItem("username")){
      axios({
        method:"POST",
        url:"https://mal-readme.herokuapp.com/animelist/stats",
        headers:{
          'Content-Type' : 'application/json'
        },
        data:{
          username:localStorage.getItem("username")
        }
      }).then((res) => {
        const node = document.getElementById("top_list")
        domtoimage.toPng(node).then(function (dataUrl) {
          var img = new Image()
          img.src = dataUrl
          document.body.innerHTML = ""
          document.body.appendChild(img)
        })
        setAnimes(() => res.data.data)
            // console.log(JSON.stringify(res, null, 2))
      })
    }
  }, [])

  return (
    (!logged ?
      <>
        <div>
          <a
            className="App-link"
            href={`${url}response_type=code&client_id=${client_id}&client_secret=${client_secret}&code_challenge=${code_challenge}`}
            target="_blank"
            rel="noopener noreferrer"
            >
            Register MAL
          </a>
        </div>
      </>
    :
    <div class="table-div" id="top_list">
      <table class="styled-table">
        <thead>
          <tr>
            <th><img src='./MyAnimeList_Logo.png' height={30} width={30} /></th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {/* <div class="gallery"> */}
            {animes.map((x,index) => {
            return <tr>
              <td><img src={x.node.main_picture.medium}  width={30} height={40}/></td>
              <td>{x.node.title}</td>
            </tr>
          })
          }

        </tbody>
      </table>
    </div>
    )
  );
}

export default App;
