import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../services/api";


function Register() {

  const navigate = useNavigate();


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });


  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {

      await registerUser({
        ...form,
        role: "citizen"
      });

      setMessage(
        "Registration successful! Redirecting..."
      );

      setTimeout(() => {

        navigate("/login");

      }, 1000);

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
          Jeevan<span>Setu</span>
        </div>


        <h1>
          Create Account
        </h1>


        <p>
          Join JeevanSetu as a citizen
        </p>


        <form
          onSubmit={handleSubmit}
        >

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />


          <label>
            Email
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Creating..."
              : "Create Account"
            }

          </button>

        </form>


        {message && (

          <div className="message">
            {message}
          </div>

        )}


        <p className="switch-auth">

          Already have an account?

          <span
            onClick={() => navigate("/login")}
          >
            Login
          </span>

        </p>

      </div>

    </div>

  );
}


export default Register;