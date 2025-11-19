import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";
import noResults from "../../assets/no-results.png";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import useFetch from "../../hooks/useFetch";
import Pagination from "../../components/pagination/Pagination";
import "./style.scss";
import { PageContext } from "../../context/pageContext";

const SearchResult = () => {
  const { query } = useParams();
  const { data, loading } = useFetch(`/search/multi?query=${query}`);
  const { setTopRatedPage, topRatedPage } = useContext(PageContext);

  const onPageChange = (p) => {
    setTopRatedPage(p);
  };

  useEffect(() => {
    return () => {
      setTopRatedPage(1);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="searchResultsPage">
        {loading && <Spinner initial={true} />}
        {!loading && (
          <div className="wrapper">
            {data?.results?.length > 0 ? (
              <>
                <div className="pageTitle">
                  {`Search ${
                    data?.total_results > 1 ? "results" : "result"
                  } of '${query}'`}
                </div>

                <ul className="movieDataContainer">
                  {data?.results.map((m) => {
                    return (
                      <li key={m.id}>
                        <MovieCard
                          fromSearch={true}
                          data={m}
                          mediaType="movie"
                        />
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
              </>
            ) : (
              <div className="noFoundContainer">
                <img src={noResults} className="notFound" />
                <span className="resultNotFound">
                  Sorry, Results not found!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchResult;
