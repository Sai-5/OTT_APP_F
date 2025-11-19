import React from "react";

import Carousel from "../../../components/carousel/Carousel";
import useFetch from "../../../hooks/useFetch";

const Similar = ({ mediaType, id }) => {
  const { data, loading, error } = useFetch(`/${mediaType}/${id}/similar`);

  const title = mediaType === "tv" ? "Similar TV Shows" : "Similar Movies";

  return (
    <>
      {data?.results.length > 0 ? (
        <Carousel
          data={data}
          loading={loading}
          endpoint={mediaType}
          title={title}
        />
      ) : (
        <div className="emptyTitle">No Similar Movies !</div>
      )}
    </>
  );
};

export default Similar;
