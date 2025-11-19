import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { fetchDataFromApi } from "./utils/api";
import { useSelector, useDispatch } from "react-redux";
import { getApiConfiguration, getGenres, getMovies } from "./store/homeSlice";
import Home from "./pages/home/Home";
import Details from "./pages/details/Details";
import Search from "./pages/searchResult/Search";
import Explore from "./pages/explore/Explore";
import NotFoundPage from "./pages/404/NotFoundPage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Upcoming from "./pages/upcoming/Upcoming";
import TopRatedPage from "./pages/topRated/TopRatedPage";
import Popular from "./pages/popular/Popular";
import WatchList from "./pages/watchlist/WatchList";
import SubscriptionPlan from "./pages/subscription/SubscriptionPlan";
import UserManagement from "./pages/admin/UserManagement";
import SubscribedList from "./pages/admin/SubscribedList";
const App = () => {
  const url = useSelector((state) => state.home.url);

  const dispatch = useDispatch();

  useEffect(() => {
    fetchApiConfig();
    genresCall();
  }, []);

  const fetchApiConfig = () => {
    fetchDataFromApi("/configuration").then((res) => {
      if (res && res.images && res.images.secure_base_url) {
        const url = {
          backdrop: res.images.secure_base_url + "original",
          poster: res.images.secure_base_url + "original",
          profile: res.images.secure_base_url + "original",
        };
        dispatch(getApiConfiguration(url));
      } else {
        console.error("Failed to fetch API configuration:", res);
      }
    });
  };

  const genresCall = async () => {
    let promises = [];
    let endPoints = ["tv", "movie"];
    let allGenres = {};

    endPoints.forEach((url) => {
      promises.push(fetchDataFromApi(`/genre/${url}/list`));
    });

    const data = await Promise.all(promises);

    data.forEach((response) => {
      if (response && response.genres) {
        response.genres.forEach((item) => (allGenres[item.id] = item));
      }
    });
    dispatch(getGenres(allGenres));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/subscription" element={<SubscriptionPlan />} />
        <Route path="/:mediaType/:id" element={<Details />} />
        <Route path="/watchlist" element={<WatchList />} />
        <Route path="/search/:query" element={<Search />} />
        <Route path="/explore/:mediaType" element={<Explore />} />
        <Route path="/explore/upcoming" element={<Upcoming />} />
        <Route path="/explore/popular" element={<Popular />} />
        <Route path="/explore/toprated" element={<TopRatedPage />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/subscriptions" element={<SubscribedList />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
