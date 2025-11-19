import React from "react";
import "./style.scss";
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import DetailsBanner from "./detailsBanner/DetailsBanner";
import Cast from "./cast/Cast";
import VideoSection from "./videoSection/VideoSection";
import Similar from "./carousels/Similar";
import Recommendation from "./carousels/Recommendations";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Reviews from "../../components/reviews/Reviews";

const Details = () => {
  const { mediaType, id } = useParams();

  const { data, loading } = useFetch(`/${mediaType}/${id}/videos`);
  const { data: credits, loading: creditsLoading } = useFetch(
    `/${mediaType}/${id}/credits`
  );

  return (
    <div className="detailsContainer">
      <Header />
      <div className="movieDetails">
        <DetailsBanner video={data?.results?.[0]} crew={credits?.crew} />
        <Cast data={credits?.cast} loading={creditsLoading} />
        <VideoSection loading={loading} data={data} />
        <Reviews movieId={id} />
        <Similar mediaType={mediaType} id={id} />
        <Recommendation mediaType={mediaType} id={id} />
      </div>

      <Footer />
    </div>
  );
};

export default Details;
