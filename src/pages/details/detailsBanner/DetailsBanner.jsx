import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import Cookie from "js-cookie";
import "./style.scss";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";
import useFetch from "../../../hooks/useFetch";
import Genres from "../../../components/genres/Genres";
import CircleRating from "../../../components/circleRating/CircleRating";
import Image from "../../../components/lazyLoadImage/Image.jsx";
import PosterFallback from "../../../assets/no-poster.png";
import { PlayIcon } from "../Playbtn.jsx";

import VideoPopup from "../../../components/videoPopup/VideoPopup";
import axios from "axios";
import Cookies from "js-cookie";
import backendHost, { watchlistAPI } from "../../../api.js";
import { FaPlay, FaPlus, FaCheck } from "react-icons/fa";

const DetailsBanner = ({ video, crew }) => {
  const [show, setShow] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [watched, setWatched] = useState(false);
  const { mediaType, id } = useParams();

  useEffect(() => {
    fetchMovies();
  }, []);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
    closeOnClick: true,
  };

  const { data, loading } = useFetch(`/${mediaType}/${id}`);

  const _genres = data?.genres?.map((g) => g.id);
  const director = crew?.filter((f) => f.job === "Director");
  const writer = crew?.filter(
    (f) => f.job === "ScreenPlay" || f.job === "Writer" || f.job === "Story"
  );

  const fetchMovies = async () => {
    const jwtToken = Cookies.get("jwtToken");
    if (!jwtToken) return;

    const host = `${backendHost}/api/saved/getmovies`;
    try {
      const { data } = await axios.get(host, {
        headers: {
          "auth-token": jwtToken,
        },
      });
      if (data.status) {
        const movie = data.movies.find((i) => parseInt(id) === i.id);

        if (movie === undefined) {
          setSaved(false);
          setWatched(false);
        } else {
          setSaved(true);
          setWatched(movie.watched || false);
        }
      }
    } catch (error) {
      console.log(error);
      // Remove toast notification for server errors
    }
  };

  const toHoursAndMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  };

  const handleSave = async () => {
    const jwtToken = Cookies.get("jwtToken");
    const movieData = {
      id: data.id,
      mediaType,
      genre_ids: data?.genres.map((g) => g.id),
      title: data?.name ? data?.name : data?.title,
      poster_path: data?.poster_path,
      release_date: data?.release_date
        ? data?.release_date
        : data?.first_air_date,
      vote_average: data?.vote_average,
    };
    try {
      const res = await watchlistAPI.addMovie(movieData, jwtToken);
      const { status, msg } = res;
      if (status === true) {
        toast.success(msg, toastOptions);
        setSaved(true);
        // Refresh the watchlist to show the added movie
        fetchMovies();
      } else {
        toast.error(msg, toastOptions);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add movie to watchlist", toastOptions);
    }
  };

  const handleUnsave = async () => {
    const jwtToken = Cookie.get("jwtToken");

    try {
      const res = await watchlistAPI.deleteMovie(data.id, jwtToken);
      const { status, msg } = res;
      if (status === true) {
        toast.success(msg, toastOptions);
        setSaved(false);
        setWatched(false);
        // Refresh the watchlist to remove the deleted movie
        fetchMovies();
      } else {
        toast.error(msg, toastOptions);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove movie from watchlist", toastOptions);
    }
  };

  const handleWatch = async () => {
    if (!saved) {
      toast.error("Please add to watchlist first", toastOptions);
      return;
    }

    if (video && video.key) {
      setShow(true);
      setVideoId(video.key);

      // Mark as watched in backend
      const jwtToken = Cookie.get("jwtToken");
      try {
        const res = await watchlistAPI.markAsWatched(data.id, jwtToken);
        const { status, msg } = res;
        if (status === true) {
          setWatched(true);
          toast.success("Movie marked as watched!", toastOptions);
        } else {
          toast.error(msg, toastOptions);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to mark as watched", toastOptions);
      }
    }
  };

  const jwtToken = Cookie.get("jwtToken");
  return (
    <div className="detailsBanner">
      {!loading ? (
        <>
          {!!data && (
            <>
              <div className="backdrop-img">
                <Image
                  src={
                    "https://image.tmdb.org/t/p/original" + data?.backdrop_path
                  }
                />
              </div>
              <div className="opacity-layer"></div>
              <ContentWrapper>
                <div className="content">
                  <div className="left">
                    {data.poster_path ? (
                      <Image
                        className="posterImg"
                        src={
                          "https://image.tmdb.org/t/p/original" +
                          data.poster_path
                        }
                      />
                    ) : (
                      <Image className="posterImg" src={PosterFallback} />
                    )}
                  </div>
                  <div className="right">
                    <div className="titleContainer">
                      <div className="title">
                        {`${data.name || data.title} (${dayjs(
                          data?.first_air_date || data?.release_date
                        ).format("YYYY")})`}
                      </div>
                    </div>
                    <div className="subtitle">{data.tagline}</div>
                    <Genres data={_genres} />
                    <div className="row">
                      <CircleRating rating={data?.vote_average.toFixed(1)} />
                      <div
                        onClick={() => {
                          if (video && video.key) {
                            setShow(true);
                            setVideoId(video.key);
                          }
                        }}
                        className="playbtn"
                      >
                        <PlayIcon />
                        <span className="text">Watch Trailer</span>
                      </div>
                      {jwtToken && (
                        <div onClick={saved ? handleUnsave : handleSave} className="watchlistBtn">
                          {saved ? <FaCheck /> : <FaPlus />}
                        </div>
                      )}
                      {jwtToken && saved && (
                        <div
                          onClick={handleWatch}
                          className={`watchbtn ${watched ? 'watched' : ''}`}
                        >
                          <FaPlay />
                          <span className="text">
                            {watched ? 'Watched' : 'Watch Movie'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="overview">
                      <div className="heading">Overview</div>
                      <div className="description">{data.overview}</div>
                    </div>

                    <div className="info">
                      {data.status && (
                        <div className="infoItem">
                          <span className="text bold">Status: </span>
                          <span className="text">{data.status}</span>
                        </div>
                      )}
                      {data?.first_air_date ||
                        (data?.release_date && (
                          <div className="infoItem">
                            <span className="text bold">Release Date: </span>
                            <span className="text">
                              {dayjs(
                                data?.first_air_date || data?.release_date
                              ).format("MMM D, YYYY")}
                            </span>
                          </div>
                        ))}
                      {data.runtime && (
                        <div className="infoItem">
                          <span className="text bold">Runtime: </span>
                          <span className="text">
                            {toHoursAndMinutes(data.runtime)}
                          </span>
                        </div>
                      )}
                    </div>

                    {director?.length > 0 && (
                      <div className="info">
                        <span className="text bold">Director: </span>
                        <span className="text">
                          {director?.map((d, i) => (
                            <span key={i}>
                              {d.name}
                              {director.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}

                    {writer?.length > 0 && (
                      <div className="info">
                        <span className="text bold">Writer: </span>
                        <span className="text">
                          {writer?.map((d, i) => (
                            <span key={i}>
                              {d.name}
                              {writer.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}

                    {data?.created_by?.length > 0 && (
                      <div className="info">
                        <span className="text bold">Creator: </span>
                        <span className="text">
                          {data?.created_by?.map((d, i) => (
                            <span key={i}>
                              {d.name}
                              {data?.created_by?.length - 1 !== i && ", "}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <VideoPopup
                  setShow={setShow}
                  videoId={videoId}
                  setVideoId={setVideoId}
                  show={show}
                />
              </ContentWrapper>
            </>
          )}
        </>
      ) : (
        <div className="detailsBannerSkeleton">
          <ContentWrapper>
            <div className="left skeleton"></div>
            <div className="right">
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
              <div className="row skeleton"></div>
            </div>
          </ContentWrapper>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default DetailsBanner;
