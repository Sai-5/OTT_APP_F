import moment from "moment";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import renderHost from "../../api";
import { RxDotsVertical, RxPerson } from "react-icons/rx";
import axios from "axios";

const Review = ({ r, mutate }) => {
  const [options, setOptions] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editReview, setEditReview] = useState("");

  useEffect(() => {
    setEditReview(r.review);
  }, []);

  const { username, review, reviewId, datetime, userId } = r;

  const jwtToken = Cookies.get("jwtToken");
  const payload = jwtDecode(jwtToken);

  const handleReviewDelete = async () => {
    try {
      const host = `${renderHost}/api/review/deletereview/${reviewId}`;

      const { data } = await axios.delete(host, {
        headers: {
          "auth-token": jwtToken,
        },
      });
      if (data?.status) {
        mutate();
      } else {
        alert("Failed to delete review. Please try again.");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const handleReviewEdit = async () => {
    try {
      const host = `${renderHost}/api/review/editreview`;

      const { data } = await axios.put(host, {
        reviewId,
        review: editReview,
      }, {
        headers: {
          "auth-token": jwtToken,
        },
      });
      if (data?.status) {
        mutate();
        setEdit(false);
      } else {
        alert("Failed to edit review. Please try again.");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to edit review. Please try again.");
    }
  };

  return (
    <li>
      <div className="profileImage">
        <RxPerson />
      </div>

      <div className="reviewData">
        <div>
          <p className="name">{username}</p>
          <LuDot />
          <p className="moment">{moment(datetime).fromNow()}</p>
        </div>

        {!edit && <p className="review">{review}</p>}

        {edit && (
          <div className="reviewEditInputContainer">
            <input
              type="text"
              value={editReview}
              className="reviewEdit"
              onChange={(e) => {
                setEditReview(e.target.value);
              }}
            />
            <p
              onClick={handleReviewEdit}
              style={
                editReview === review
                  ? { pointerEvents: "none", opacity: 0.5 }
                  : {}
              }
              className="save"
            >
              Save
            </p>
          </div>
        )}

        {payload?.userDetails?._id === userId && (
          <RxDotsVertical
            style={options ? { color: "crimson" } : {}}
            onClick={() => setOptions(!options)}
            className="dots"
          />
        )}

        {options && payload?.userDetails?._id === userId && (
          <ul className="reviewOptions">
            <li>
              <MdDelete onClick={handleReviewDelete} />
            </li>
            <li>
              <FaRegEdit
                style={
                  edit === true ? { color: "crimson" } : { color: "white" }
                }
                onClick={() => setEdit(!edit)}
              />
            </li>
          </ul>
        )}
      </div>
    </li>
  );
};

export default Review;
