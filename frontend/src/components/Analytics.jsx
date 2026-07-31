import { useState } from "react"
import api from "../services/api"
import dots from "../assets/3dots.png"

const Analytics = ({urls, get_urls}) => {

  
  const[editmenu, seteditMenu] = useState(false)
  const[urltoken, seturlToken] = useState("")
  const[newurl, setnewUrl] = useState("")
  const[updateclicked, setupdateClicked] = useState(false)
  const[showerror, setshowError] = useState("")
  const [qrImage, setQrImage] = useState("");
 
  const menu = (t) =>{
    setupdateClicked(false)
    if(editmenu == true){
        seteditMenu(false)
        seturlToken("")
        setshowError("")
    }
    else{
        seteditMenu(true)
        seturlToken(t)
    }
  }

  const delete_url = async(t) =>{
    seteditMenu(false)
    try{
        const response = await api.delete(`/urls/${t}`)
        console.log(response.data)
        await get_urls();
    }
    catch(error){
        console.log(error)
    }
    setQrImage("")
  }

  const update_url = async (t) =>{

    if(newurl.trim() === ""){
        console.log("Enter a valid URL")
        setshowError("Enter a valid URL")
        return;
        }
    else if(!newurl.startsWith("https://") && !newurl.startsWith("http://")){
        console.log("Enter a valid url")
        setshowError("Enter a valid URL")
        return;
    }
    try{
        const response = await api.put(`/urls/${t}`, {
            original_url : newurl
        })
        console.log(response.data)
        await get_urls();
    }
    catch(error){
        console.log(error)
    }
    setnewUrl("")
    seteditMenu(false)
    setshowError("")
    setQrImage("")
  }

  const generateQR = async (token) => {
        try {
            const response = await api.get(`/urls/${token}/qr`, {
                responseType: "blob"
            });
            const imageUrl = URL.createObjectURL(response.data);
            setQrImage(imageUrl);
        }
        catch(error){
            console.log(error);
        }
        seteditMenu(false)
    }

  return (
    <>
    <div className="flex flex-col items-center gap-5">
        <h1 className="text-3xl font-bold">URL ANALYTICS</h1>
        <div className="flex flex-col items-center sm:flex-row">
            <ul className="overflow-auto max-h-96">
                {urls.map((url)=>(
                <li key={url.short_token} className="flex items-center gap-3 p-3 border-b last:border-b-0">
                    <p className="border border-black flex-1 truncate px-1">{url.original_url}</p>
                    <p className="border border-black px-1">{url.short_token}</p>
                    <p className="border border-black px-1">{url.clicks}</p>
                    <div><img src={dots} alt="" className="w-5 h-5 p-1 rounded hover:bg-gray-200 cursor-pointer" onClick={() => menu(url.short_token)}/>
                       {urltoken === url.short_token && editmenu && <div className="flex flex-col">
                            <button className="border border-black cursor-pointer hover:bg-gray-200" onClick={() => setupdateClicked(true)}>Update</button>
                            {updateclicked && 
                            <div>
                                <input type="text" className="border border-black" onChange={(e) => setnewUrl(e.target.value)} placeholder="Enter a valid URL"/>
                                <button onClick={()=>update_url(urltoken)}>Submit</button>
                                {showerror !== "" && <p className="text-red-500">{showerror}</p>}
                            </div>}
                            <button className="border border-black cursor-pointer hover:bg-gray-200" onClick={() => delete_url(urltoken)}>Delete</button>
                            <button className="border border-black cursor-pointer hover:bg-gray-200" onClick={() => generateQR(urltoken)}>Generate QR</button>
                       </div>} 
                    </div>
                </li>
            ))}</ul>
            <div>
                {qrImage && <img src={qrImage} alt="qr code" className=""/>}
            </div>
        </div>
      </div>
    </>
  )
}
export default Analytics