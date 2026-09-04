import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../services/api";


function Login() {

  const navigate = useNavigate();


  const [form, setForm] = useState({
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

      const data = await loginUser(form);


      localStorage.setItem(
        "token",
        data.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      if (data.user.role === "worker") {

        navigate("/worker");

      } else if (
        data.user.role === "government"
      ) {

        navigate("/government");

      } else {

        navigate("/citizen");

      }


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Login failed"
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
          Welcome Back
        </h1>


        <p>
          Login to your JeevanSetu account
        </p>


        <form
          onSubmit={handleSubmit}
        >

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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"
            }

          </button>

        </form>


        {message && (

          <div className="error">
            {message}
          </div>

        )}


        <p className="switch-auth">

          Don't have an account?

          <span
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </span>

        </p>

      </div>

    </div>

  );
}


export default Login;