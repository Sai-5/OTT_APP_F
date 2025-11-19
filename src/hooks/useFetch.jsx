import { useContext, useEffect, useState } from "react";
import { fetchDataFromApi } from "../utils/api";
import { PageContext } from "../context/pageContext";

const useFetch = (url, params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const { topRatedPage } = useContext(PageContext);

  useEffect(() => {
    setLoading("Loading...");
    setData(null);
    setError(null);

    fetchDataFromApi(url, { page: topRatedPage })
      .then((res) => {
        setLoading(false);
        setData(res);
      })
      .catch((err) => {
        setLoading(false);
        setError("Something went wrong!");
      });
  }, [url, topRatedPage]);
  return { data, loading, error };
};

export default useFetch;
