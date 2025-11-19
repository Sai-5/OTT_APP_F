import React, { useState, useEffect } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { SlMenu } from "react-icons/sl";
import { VscChromeClose } from "react-icons/vsc";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Cookie from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import host from "../../api";
import "./style.scss";

import ContentWrapper from "../contentWrapper/ContentWrapper";

const Header = () => {
  const [show, setShow] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const jwtToken = Cookie.get("jwtToken");
    if (!jwtToken) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const controlNavbar = () => {
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY && !mobileMenu) {
        setShow("hide");
      } else {
        setShow("show");
      }
    } else {
      setShow("top");
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  // Calculate remaining time for users without subscription
  useEffect(() => {
    const accessTime = localStorage.getItem('subscriptionAccessTime');
    if (accessTime) {
      const currentTime = Date.now();
      const elapsed = currentTime - parseInt(accessTime);
      const remaining = Math.max(0, 300000 - elapsed); // 5 minutes in milliseconds
      setRemainingTime(Math.floor(remaining / 1000)); // Convert to seconds
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    if (remainingTime > 0 && location.pathname !== '/subscription') {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('subscriptionAccessTime');
            navigate("/subscription");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [remainingTime, navigate]);

  // Check for expired access time on component mount and periodically
  useEffect(() => {
    const checkAccessTime = () => {
      const accessTime = localStorage.getItem('subscriptionAccessTime');
      if (accessTime) {
        const currentTime = Date.now();
        if ((currentTime - parseInt(accessTime)) >= 300000) { // 5 minutes expired
          localStorage.removeItem('subscriptionAccessTime');
          if (location.pathname !== '/subscription') {
            navigate("/subscription");
          }
        }
      }
    };

    // Check immediately
    checkAccessTime();

    // Check every minute
    const interval = setInterval(checkAccessTime, 60000);

    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  const searchQueryHandler = async (e) => {
    if (e.key === "Enter" && query.length > 0) {
      const jwtToken = Cookie.get("jwtToken");
      const userRole = jwtToken ? jwtDecode(jwtToken).userDetails.role : null;

      // Admins have full access
      if (userRole === 'admin') {
        navigate(`/search/${query}`);
        setTimeout(() => {
          setShowSearch(false);
        }, 1000);
        return;
      }

      const hasSubscription = await checkSubscription();
      if (!hasSubscription) {
        const accessTime = localStorage.getItem('subscriptionAccessTime');
        const currentTime = Date.now();
        if (!accessTime || (currentTime - parseInt(accessTime)) >= 300000) {
          alert("Please subscribe to access this content.");
          navigate("/subscription");
          return;
        }
      }
      navigate(`/search/${query}`);
      setTimeout(() => {
        setShowSearch(false);
      }, 1000);
    }
  };

  const openSearch = () => {
    setMobileMenu(false);
    setShowSearch(true);
  };

  const openMobileMenu = () => {
    setMobileMenu(true);
    setShowSearch(false);
  };

  const checkSubscription = async () => {
    const jwtToken = Cookie.get("jwtToken");
    if (!jwtToken) return false;

    try {
      const response = await axios.get(`${host}/api/subscription/get`, {
        headers: {
          'auth-token': jwtToken,
        },
      });
      return response.data.status;
    } catch (error) {
      return false;
    }
  };

  const navigationHandler = async (type) => {
    const jwtToken = Cookie.get("jwtToken");
    const userRole = jwtToken ? jwtDecode(jwtToken).userDetails.role : null;

    // Admins have full access
    if (userRole === 'admin') {
      if (type === "movie") {
        navigate("/explore/movie");
      } else if (type === "tv") {
        navigate("/explore/tv");
      } else if (type === "upcoming") {
        navigate("/explore/upcoming");
      } else if (type === "top") {
        navigate("/explore/toprated");
      } else if (type === "popular") {
        navigate("/explore/popular");
      }
      setMobileMenu(false);
      return;
    }

    const hasSubscription = await checkSubscription();

    if (!hasSubscription) {
      const accessTime = localStorage.getItem('subscriptionAccessTime');
      const currentTime = Date.now();

      if (!accessTime || (currentTime - parseInt(accessTime)) >= 300000) { // 5 minutes expired or no access
        // Show popup and redirect to subscription
        alert("Please subscribe to access this content.");
        navigate("/subscription");
        return;
      }
      // Has valid access, continue
    }

    if (type === "movie") {
      navigate("/explore/movie");
    } else if (type === "tv") {
      navigate("/explore/tv");
    } else if (type === "upcoming") {
      navigate("/explore/upcoming");
    } else if (type === "top") {
      navigate("/explore/toprated");
    } else if (type === "popular") {
      navigate("/explore/popular");
    }
    setMobileMenu(false);
  };

  const handleSubscriptionLink = () => {
    // Keep access time to allow timer to continue on subscription page
    navigate("/subscription");
  };

  const handleHomeLink = async () => {
    const jwtToken = Cookie.get("jwtToken");
    const userRole = jwtToken ? jwtDecode(jwtToken).userDetails.role : null;

    // Admins have full access
    if (userRole === 'admin') {
      navigate("/");
      return;
    }

    const hasSubscription = await checkSubscription();
    if (!hasSubscription) {
      const accessTime = localStorage.getItem('subscriptionAccessTime');
      const currentTime = Date.now();
      if (!accessTime || (currentTime - parseInt(accessTime)) >= 300000) {
        alert("Please subscribe to access this content.");
        navigate("/subscription");
        return;
      }
    }
    navigate("/");
  };

  const handleLogout = () => {
    Cookie.remove("jwtToken");
    navigate("/login");
  };

  const jwtToken = Cookie.get("jwtToken");
  const userRole = jwtToken ? jwtDecode(jwtToken).userDetails.role : null;

  // Function to check if a menu item is active
  const isActive = (type) => {
    const path = location.pathname;
    switch(type) {
      case 'movie':
        return path.includes('/explore/movie') || path === '/';
      case 'tv':
        return path.includes('/explore/tv');
      case 'upcoming':
        return path.includes('/explore/upcoming');
      case 'top':
        return path.includes('/explore/toprated');
      case 'popular':
        return path.includes('/explore/popular');
      case 'watchlist':
        return path.includes('/watchlist');
      case 'subscription':
        return path.includes('/subscription');
      case 'admin-users':
        return path.includes('/admin/users');
      case 'admin-subscriptions':
        return path.includes('/admin/subscriptions');
      default:
        return false;
    }
  };

  return (
    <header className={`header ${mobileMenu ? "mobileView" : ""} ${show}`}>
      <ContentWrapper>
        <div className="logo">
          <div onClick={handleHomeLink} style={{ cursor: "pointer" }}>
            <h1 className="websiteName">Streamify</h1>
          </div>
        </div>
        <ul className="menuItems">
          {remainingTime > 0 && (
            <li className="menuItem timer">
              Free Access: {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </li>
          )}
          <li 
            onClick={() => navigationHandler("movie")} 
            className={`menuItem ${isActive('movie') ? 'active' : ''}`}
          >
            Movies
          </li>
          <li 
            onClick={() => navigationHandler("tv")} 
            className={`menuItem ${isActive('tv') ? 'active' : ''}`}
          >
            TV Shows
          </li>
          <li
            onClick={() => navigationHandler("upcoming")}
            className={`menuItem ${isActive('upcoming') ? 'active' : ''}`}
          >
            Upcoming
          </li>
          <li 
            onClick={() => navigationHandler("top")} 
            className={`menuItem ${isActive('top') ? 'active' : ''}`}
          >
            Top Rated
          </li>
          <li 
            onClick={() => navigationHandler("popular")} 
            className={`menuItem ${isActive('popular') ? 'active' : ''}`}
          >
            Popular
          </li>
          {!jwtToken && (
            <li className="menuItem">
              <Link
                style={{ textDecoration: "None", color: "inherit" }}
                to="/login"
              >
                Login
              </Link>
            </li>
          )}
          {jwtToken && (
            <>
              <li 
                className={`menuItem ${isActive('watchlist') ? 'active' : ''}`}
                onClick={() => navigate("/watchlist")}
                style={{ cursor: 'pointer' }}
              >
                WatchList
              </li>
              {userRole !== 'admin' && (
                <li 
                  className={`menuItem ${isActive('subscription') ? 'active' : ''}`}
                  onClick={handleSubscriptionLink}
                  style={{ cursor: 'pointer' }}
                >
                  Subscription
                </li>
              )}
              {userRole === 'admin' && (
                <>
                  <li className="menuItem">
                    <Link
                      style={{ textDecoration: "None", color: "inherit" }}
                      to="/admin/users"
                    >
                      User Management
                    </Link>
                  </li>
                  <li className="menuItem">
                    <Link
                      style={{ textDecoration: "None", color: "inherit" }}
                      to="/admin/subscriptions"
                    >
                      Subscribed List
                    </Link>
                  </li>
                </>
              )}
              <li onClick={handleLogout} className="menuItem">
                Logout
              </li>
            </>
          )}

          <li className="menuItem">
            <HiOutlineSearch onClick={openSearch} />
          </li>
        </ul>

        <div className="mobileMenuItems">
          <HiOutlineSearch onClick={openSearch} />
          {mobileMenu ? (
            <VscChromeClose onClick={() => setMobileMenu(false)} />
          ) : (
            <SlMenu onClick={openMobileMenu} />
          )}
        </div>
      </ContentWrapper>

      {showSearch && (
        <div className="searchBar">
          <ContentWrapper>
            <div className="searchInput">
              <input
                type="text"
                placeholder="Search for a movie or tv show."
                onChange={(e) => setQuery(e.target.value)}
                onKeyUp={searchQueryHandler}
              />
              <VscChromeClose onClick={() => setShowSearch(false)} />
            </div>
          </ContentWrapper>
        </div>
      )}


    </header>
  );
};

export default Header;
