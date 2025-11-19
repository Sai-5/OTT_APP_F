import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.scss";
import useFetch from "../../../hooks/useFetch";
import { useSelector } from "react-redux";
import Image from "../../../components/lazyLoadImage/Image";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";

const HeroBanner = () => {
  const [background, setBackground] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data, loading } = useFetch("/movie/upcoming");

  useEffect(() => {
    const bg =
      "https://image.tmdb.org/t/p/original" +
      data?.results[Math.floor(Math.random() * 20)]?.backdrop_path;
    setBackground(bg);
  }, [data]);

  const searchQueryHandler = (e) => {
    if (e.key === "Enter" && query.length > 0) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <div className="heroBanner">
      {!loading && (
        <div className="backdrop-img">
          <Image src={background} />
        </div>
      )}

      <div className="opacityLayer"></div>

      <ContentWrapper>
        <div className="heroBannerContent">
          <span className="title">Welcome.</span>
          <span className="subtitle">
            Millions of movies, TV shows and people to discover. Explore now.
          </span>
          <div className="searchInput">
            <input
              type="text"
              placeholder="Search for a movie or tv show."
              onChange={(e) => setQuery(e.target.value)}
              onKeyUp={searchQueryHandler}
            />
            <button>
              <Link
                style={{ textDecoration: "none", color: "inherit" }}
                to={`/search/${query}`}
              >
                Search
              </Link>
            </button>
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default HeroBanner;
