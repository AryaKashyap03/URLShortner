import { useState } from "react";
import api from "../services/api";

const Login = ({ setLoggedIn, setShowSignup }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      const formData = new URLSearchParams();

      formData.append("username", username);
      formData.append("password", password);

        const response = await api.post(
            "/auth/token",
            formData,
            {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            },
        );

        localStorage.setItem(
            "token",
            response.data.access_token,
        );
        setLoggedIn(true);
        setUsername("");
        setPassword("");
    } 
    catch (error) {
      console.log(error);
      alert("Invalid credentials");
    }
  };

  return (
    <form
      onSubmit={login}
      className="bg-white p-6 rounded-lg flex flex-col gap-3 w-96"
    >
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        placeholder="Username"
        className="border p-2"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="bg-blue-600 text-white py-2 rounded">Login</button>

      <p
        className="text-blue-600 cursor-pointer"
        onClick={() => setShowSignup(true)}
      >
        Create Account
      </p>
    </form>
  );
};

export default Login;
