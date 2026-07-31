import { useState } from "react";
import api from "../services/api";

const SignUp = ({ setShowSignup }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  const signup = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth", {
        ...form,
        role: "user",
      });

      alert("Account created successfully!");

      setShowSignup(false);
    } catch (error) {
      console.log(error);
      alert("Signup failed");
    }
  };

  return (
    <form
      onSubmit={signup}
      className="bg-white p-6 rounded-lg flex flex-col gap-3 w-96"
    >
      <h1 className="text-2xl font-bold">Create Account</h1>

      <input
        placeholder="Username"
        className="border p-2"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="First Name"
        className="border p-2"
        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
      />

      <input
        placeholder="Last Name"
        className="border p-2"
        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button className="bg-blue-600 text-white py-2 rounded">Sign Up</button>

      <p
        className="text-blue-600 cursor-pointer"
        onClick={() => setShowSignup(false)}
      >
        Already have an account?
      </p>
    </form>
  );
};

export default SignUp;
