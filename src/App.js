import { useEffect } from 'react';
import './App.css';

function App() {
  const client_id = process.env.REACT_APP_MAL_CLIENT_ID;  
  const client_secret = process.env.REACT_APP_MAL_CLIENT_SECRET;
  const url = process.env.REACT_APP_URL;
  const code_challenge = process.env.REACT_APP_CODE_CHALLENGE;
  console.log(String(code_challenge).length)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search)
    console.log(token)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <a
          className="App-link"
          href={`${url}response_type=code&client_id=${client_id}&client_secret=${client_secret}&code_challenge=${code_challenge}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Register MAL
        </a>
      </header>
    </div>
  );
}

export default App;
