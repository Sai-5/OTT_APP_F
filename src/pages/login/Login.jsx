import React, { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { Link, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Image from "../../components/lazyLoadImage/Image";
import backendHost from "../../api";
import "../style.scss";

const Login = () => {
  const [userData, setUserData] = useState({
    password: "",
    email: "",
  });
  const [background, setBackground] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { data, loading } = useFetch("/movie/upcoming");

  useEffect(() => {
    if (data && data.results && data.results.length > 0) {
      const bg =
        "https://image.tmdb.org/t/p/original" +
        data.results[Math.floor(Math.random() * data.results.length)]?.backdrop_path;
      setBackground(bg);
    }
  }, [data]);

  const navigate = useNavigate();

  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    closeOnClick: true,
  };

  const handleValidation = () => {
    const { name, password } = userData;
    if (name === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = userData;
    if (handleValidation()) {
      const host = `${backendHost}/api/auth/login`;

      const response = await axios.post(host, {
        email,
        password,
      });

      const { data } = response;

      if (data.status) {
        localStorage.setItem("user", JSON.stringify(data.userData));
        Cookie.set("jwtToken", data.jwtToken, { expires: 9 });
        // Do not set access time on login - only set when accessing content without subscription
        setUserData({
          password: "",
          email: "",
        });
        navigate("/");
      } else {
        toast.error(data.msg, toastOptions);
      }
    }
  };

  const onShowPass = () => {
    setShowPass((prev) => !prev);
  };

  return (
    <div className="loginContainer">
      {!loading && (
        <div className="backdrop-img">
          <Image src={background} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="formContainer">
        <h1>Streamify</h1>
        <p className="loginTitle">Login</p>
        <div className="inputContainer">
          <label htmlFor="email" className="name">
            Email
          </label>
          <input
            name="email"
            id="email"
            type="email"
            placeholder="Enter your email"
            className="input"
            value={userData.email}
            onChange={onChange}
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="pass" className="name">
            Password
          </label>
          <input
            name="password"
            id="pass"
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            className="input"
            value={userData.password}
            onChange={onChange}
          />
        </div>
        <div className="checkbox">
          <input
            value={showPass}
            onChange={onShowPass}
            id="check"
            type="checkbox"
          />
          <label htmlFor="check">Show Password</label>
        </div>
        <button type="submit">Login</button>
        <p>
          Create an account
          <Link style={{ textDecoration: "none" }} to={"/register"}>
            <span>Register</span>
          </Link>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
