import {useEffect, useState} from 'react';
import axios from 'axios'
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
    console.log("logged value: " + logged)
    if(localStorage.getItem("username")){
      isLogged(() => true)
    }
    if(username !== null) {
      localStorage.setItem("username", username)
      console.log(localStorage.getItem("username"))
      isLogged(() => true)
    }
    axios({
      method:"POST",
      url:"http://mal-readme.herokuapp.com/animelist/stats",
      headers:{
        'Content-Type' : 'application/json'
      },
      data:{
        username:localStorage.getItem("username")
      }
    }).then((res) => {
      setAnimes(() => res.data.data)
          // console.log(JSON.stringify(res, null, 2))
    })
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
    <div class="table-div">
      <table class="styled-table">
        <thead>
          <tr>
            <th><img src='MyAnimeList_Logo.png' height={30} width={30} /></th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {animes.map(x => {
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
