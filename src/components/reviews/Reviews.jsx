import React, { useState } from "react";
import { v4 } from "uuid";
import axios from "axios";
import useSWR from "swr";
import Spinner from "../spinner/Spinner";
import { MdOutlineSpeakerNotesOff } from "react-icons/md";
import Cookies from "js-cookie";
import ContentWrapper from "../contentWrapper/ContentWrapper";
import renderHost from "../../api";
import "./style.scss";

import Review from "../review/Review";

const Reviews = ({ movieId }) => {
  const [review, setReview] = useState("");

  const jwtToken = Cookies.get("jwtToken");

  const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.message);
      throw error;
    }

    return data;
  };

  const {
    data: reviewsData,
    mutate,
    isLoading,
  } = useSWR(`${renderHost}/api/review/getreviews/${movieId}`, fetcher);

  const handleReview = (e) => {
    setReview(e.target.value);
  };

  const handleReviewSubmit = async () => {
    if (!review.trim()) return;

    try {
      const host = `${renderHost}/api/review/addreview`;

      const body = {
        reviewId: v4(),
        movieId: movieId,
        review: review.trim(),
        datetime: new Date(),
      };
      await axios.post(host, body, {
        headers: {
          "auth-token": jwtToken,
        },
      });

      mutate();
      setReview("");
    } catch (error) {
      console.log(error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const reviewInput = () => {
    return (
      <div className="reviewInputContainer">
        <input
          placeholder="Write a review..."
          value={review}
          onChange={handleReview}
        />
        <button
          style={
            review.length < 6 ? { opacity: 0.5, pointerEvents: "none" } : {}
          }
          onClick={handleReviewSubmit}
        >
          Send
        </button>
      </div>
    );
  };

  const RenderReviews = () => {
    return (
      <ul className="ReviewsList">
        {reviewsData?.reviews?.map((r) => {
          return <Review mutate={mutate} key={v4()} r={r} />;
        })}
      </ul>
    );
  };

  const reviews = () => {
    return (
      <>
        {reviewsData?.reviews?.length > 0 ? (
          <div className="reviews">{<RenderReviews />}</div>
        ) : (
          <div className="noReviews">
            <MdOutlineSpeakerNotesOff />
            <h1>No Reviews</h1>
          </div>
        )}
      </>
    );
  };

  const renderLoading = () => (
    <>
      <Spinner />
    </>
  );

  return (
    <div className="reviewsContainer">
      <ContentWrapper>
        {reviewInput()}

        {isLoading ? renderLoading() : reviews()}
      </ContentWrapper>
    </div>
  );
};

export default Reviews;
