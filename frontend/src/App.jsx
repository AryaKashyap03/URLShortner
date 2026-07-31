import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import UrlSection from "./components/UrlSection";
import Analytics from "./components/Analytics";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import api from "./services/api";

const App = () => {

  const [urls, setUrls] = useState([]);

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showSignup, setShowSignup] = useState(false);

  const get_urls = async () => {
    try{
      const response = await api.get("/urls");
      setUrls(response.data);
    }
    catch(error){
      console.log(error);
    }
  };

  useEffect(() => {
    if(loggedIn){
      get_urls();
    }
  }, [loggedIn]);

  return (
    <>
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>

      {!loggedIn && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

          {showSignup ? (
            <SignUp setShowSignup={setShowSignup}/>
          ) : (
            <Login
              setLoggedIn={setLoggedIn}
              setShowSignup={setShowSignup}
            />
          )}

        </div>
      )}

      {loggedIn && (
        <>
          <UrlSection get_urls={get_urls}/>
          <Analytics urls={urls} get_urls={get_urls}/>
        </>
      )}
    </>
  );
};

export default App;