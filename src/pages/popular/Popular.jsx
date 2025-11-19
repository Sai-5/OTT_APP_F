import React, { useContext, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import useFetch from "../../hooks/useFetch";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";
import Pagination from "../../components/pagination/Pagination";
import { PageContext } from "../../context/pageContext";

import "./style.scss";

const Popular = () => {
  const { data, loading } = useFetch("/movie/popular");
  const { setTopRatedPage, topRatedPage } = useContext(PageContext);

  const onPageChange = (page) => {
    setTopRatedPage(page);
  };

  useEffect(() => {
    return () => {
      setTopRatedPage(1);
    };
  }, []);

  return (
    <>
      <Header />
      <div style={{ paddingTop: "80px" }} className="upcomingPage">
        {loading ? (
          <Spinner initial={true} />
        ) : (
          <div className="wrapper">
            <h1>Popular Movies</h1>
            <ul className="moviesDataContainer">
              {data?.results.map((m) => {
                return (
                  <li key={m.id}>
                    <MovieCard fromSearch={false} data={m} mediaType="movie" />
                  </li>
                );
              })}
            </ul>
            <Pagination
              totalItems={data?.total_results}
              itemsPerPage={20}
              onPageChange={onPageChange}
              page={topRatedPage}
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Popular;
