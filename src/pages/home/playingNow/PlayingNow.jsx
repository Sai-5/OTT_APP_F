import React, { useState } from "react";

import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";

import useFetch from "../../../hooks/useFetch";
import Carousel from "../../../components/carousel/Carousel";

const PlayingNow = () => {
  const { data, loading } = useFetch(`/movie/now_playing`);

  return (
    <div className="carouselSection">
      <ContentWrapper>
        <span className="carouselTitle">Playing in theatres</span>
      </ContentWrapper>
      <Carousel endpoint={"movie"} data={data} loading={loading} />
    </div>
  );
};

export default PlayingNow;
