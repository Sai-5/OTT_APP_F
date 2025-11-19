import React, { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import MovieCard from "../../components/movieCard/MovieCard";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import Pagination from "../../components/pagination/Pagination";
import noResults from "../../assets/no-results.png";
import "./style.scss";
import { TailSpin } from "react-loader-spinner";
import Cookies from "js-cookie";
import backendHost, { watchlistAPI } from "../../api";

const WatchList = () => {
  const [moviesData, setMoviesData] = useState([]);
  const [loading, setLoading] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Adjust as needed

  const fetchSavedMovies = async () => {
    try {
      setLoading(true);
      const jwtToken = Cookies.get("jwtToken");
      const data = await watchlistAPI.getMovies(jwtToken);
      if (data.status) {
        setMoviesData(data?.movies);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching saved movies:", error);
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchSavedMovies();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate paginated data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMovies = moviesData.slice(startIndex, endIndex);

  return (
    <>
      <Header />

      {!loading ? (
        <div className="watchlistContainer">
          {moviesData.length > 0 && (
            <>
              <ContentWrapper>
                {paginatedMovies?.map((movie, index) => {
                  return (
                    <MovieCard
                      data={movie}
                      mediaType={movie?.mediaType}
                      key={index}
                    />
                  );
                })}
              </ContentWrapper>
              <Pagination
                totalItems={moviesData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                page={currentPage}
              />
            </>
          )}
          {moviesData.length == 0 && (
            <>
              <img className="noResultsImage" src={noResults} />
              <h1>Watchlist is empty</h1>
            </>
          )}
        </div>
      ) : (
        <div className="loadingContainer">
          <TailSpin
            visible={true}
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
      <Footer />
    </>
  );
};

export default WatchList;
