import React, { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Cookie from "js-cookie";

import "../style.scss";
import Image from "../../components/lazyLoadImage/Image";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import backendHost from "../../api";

const Register = () => {
  const [background, setBackground] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
    role: "user",
  });
  const [showPass, setShowPass] = useState(false);

  const { data, loading } = useFetch("/movie/upcoming");
  useEffect(() => {
    const bg =
      "https://image.tmdb.org/t/p/original" +
      data?.results[Math.floor(Math.random() * 20)]?.backdrop_path;
    setBackground(bg);
  }, [data]);

  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    closeOnClick: true,
  };

  const handleValidation = () => {
    const { password, confirmPassword, username, email } = userData;
    if (password !== confirmPassword) {
      toast.error(
        "Password and confirm password should be same.",
        toastOptions
      );
      return false;
    } else if (username.length < 3) {
      toast.error(
        "Username should be greater than 3 characters.",
        toastOptions
      );
      return false;
    } else if (password.length < 8) {
      toast.error(
        "Password should be equal or greater than 8 characters.",
        toastOptions
      );
      return false;
    } else if (email === "") {
      toast.error("Email is required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, username, role } = userData;

    if (handleValidation()) {
      const host = `${backendHost}/api/auth/register`;

      const response = await axios.post(host, {
        username,
        password,
        email,
        role,
      });
      const { data } = response;

      if (data.status) {
        localStorage.setItem("user", JSON.stringify(data.userData));
        Cookie.set("jwtToken", data.jwtToken);
        setUserData({
          username: "",
          password: "",
          email: "",
          confirmPassword: "",
          role: "user",
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
        <p className="loginTitle">Register</p>

        <div className="inputContainer">
          <label htmlFor="username">Username</label>
          <input
            name="username"
            id="username"
            type="text"
            placeholder="Enter Username"
            className="input"
            onChange={(e) => onChange(e)}
            value={userData.username}
          />
        </div>
        <div className="inputContainer">
          <label htmlFor="email">Email</label>
          <input
            name="email"
            id="email"
            type="email"
            placeholder="Enter your email"
            className="input"
            onChange={(e) => onChange(e)}
            value={userData.email}
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="pass">Password</label>
          <input
            name="password"
            id="pass"
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            className="input"
            onChange={(e) => onChange(e)}
            value={userData.password}
          />
        </div>
        <div className="inputContainer">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            name="confirmPassword"
            id="confirm"
            type={showPass ? "text" : "password"}
            placeholder="Confirm your password"
            className="input"
            onChange={(e) => onChange(e)}
            value={userData.confirmPassword}
          />
        </div>
        <div className="checkbox">
          <input onChange={onShowPass} id="check" type="checkbox" />
          <label htmlFor="check">Show Password</label>
        </div>

        <div className="inputContainer">
          <label>Role</label>
          <div className="radioGroup">
            <input
              type="radio"
              id="user"
              name="role"
              value="user"
              checked={userData.role === "user"}
              onChange={(e) => onChange(e)}
            />
            <label htmlFor="user">User</label>
            <input
              type="radio"
              id="admin"
              name="role"
              value="admin"
              checked={userData.role === "admin"}
              onChange={(e) => onChange(e)}
            />
            <label htmlFor="admin">Admin</label>
          </div>
        </div>

        <button type="submit">Submit</button>
        <p>
          Already have an account?
          <Link style={{ textDecoration: "none" }} to={"/login"}>
            <span>Login</span>
          </Link>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Register;
