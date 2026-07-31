import { useEffect, useState } from "react"
import copy from "../assets/copy.png"
import api from "../services/api"

const UrlSection = ({get_urls}) => {


    useEffect(() => {
        const handleFocus = () =>{
            get_urls();
        }
        window.addEventListener("focus", handleFocus)

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
        
    },[])

  const[shorten, setShorten] = useState(false)
  const[url, setUrl] = useState("")
  const [shortUrl, setShortUrl] = useState("");
  const[copied, setCopied] = useState(false)
  const[error, setError] = useState("");

  const copyurl = () =>{
    navigator.clipboard.writeText(shortUrl);
    setCopied(true)
    setTimeout(() => {
        setCopied(false);
    }, 2000);
  }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("")
        // validate URL
        console.log(url)
        if(url.trim() === ""){
            console.log("Enter a valid URL")
            setError("Enter a valid URL")
            return;
        }
        else if(!url.startsWith("https://") && !url.startsWith("http://")){
            console.log("Enter a valid url")
            setError("Enter a valid URL")
            return;
        }
        // axios.post(...)
        try{
            const response = await api.post("/shorten", {
                original_url : url
            })
            console.log(response.data)
            setShortUrl(`http://localhost:8000/${response.data.short_token}`)
            setShorten(true)
        }
        catch(error){
            console.log(error)
        }
        get_urls();
    }

  return (
    <>
    <form className="flex flex-col gap-4 justify-center items-center border border-black p-10" onSubmit={handleSubmit}>
        <h1 className="text-2xl">Shorten a Long URL</h1>
        <div className="flex gap-2">
            <input type="text" placeholder="Enter your long URL here" className="border border-gray-200" 
             value = {url} onChange={(e) => setUrl(e.target.value)}/>
            <button className="bg-blue-600 text-amber-50 cursor-pointer">Shorten</button>
        </div>
        {error === "" && shorten && <div className="flex flex-col">
            <h1>Short URL created successfully!</h1>
            <div className="flex gap-2">
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600" onClick={() => get_urls()}>{shortUrl}</a>
                <img src={copy} alt="copy icon" className="h-4 w-auto cursor-pointer" onClick={copyurl}/>
                {copied && <p>Copied!</p>}
            </div>
        </div>}
        {error !== "" && <p className="text-red-500">{error}</p>}
    </form>

    </>
  )
}

export default UrlSection