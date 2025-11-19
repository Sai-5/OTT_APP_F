import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
} from "react-icons/fi";
import host from "../../api";
import Header from "../../components/header/Header";
import "./style.scss";

const SubscribedList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "username",
    direction: "asc",
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token =
        localStorage.getItem("jwtToken") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("jwtToken="))
          ?.split("=")[1];
      if (!token) return;

      const response = await axios.get(`${host}/api/subscription/all`, {
        headers: { "auth-token": token },
      });

      if (response.data.status) {
        setSubscriptions(response.data.subscriptions);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePlanFilter = (plan) => {
    setFilterPlan(plan);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch =
          sub.user?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          sub.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.plan?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPlan = filterPlan === "all" || sub.plan === filterPlan;

        return matchesSearch && matchesPlan;
      })
      .sort((a, b) => {
        if (sortConfig.key === "username") {
          const nameA = a.user?.username?.toLowerCase() || "";
          const nameB = b.user?.username?.toLowerCase() || "";
          return sortConfig.direction === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        } else if (sortConfig.key === "plan") {
          return sortConfig.direction === "asc"
            ? a.plan.localeCompare(b.plan)
            : b.plan.localeCompare(a.plan);
        } else if (sortConfig.key === "endDate") {
          return sortConfig.direction === "asc"
            ? new Date(a.endDate) - new Date(b.endDate)
            : new Date(b.endDate) - new Date(a.endDate);
        }
        return 0;
      });
  }, [subscriptions, searchTerm, filterPlan, sortConfig]);

  const getUniquePlans = () => {
    const plans = new Set(subscriptions.map((sub) => sub.plan));
    return ["all", ...Array.from(plans)].filter(Boolean);
  };

  const handleDelete = async (subscriptionId) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        const token =
          localStorage.getItem("jwtToken") ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("jwtToken="))
            ?.split("=")[1];
        if (!token) return;

        await axios.delete(
          `${host}/api/subscription/delete/${subscriptionId}`,
          {
            headers: { "auth-token": token },
          }
        );

        // Refetch subscriptions after deletion
        fetchSubscriptions();
      } catch (error) {
        console.error("Error deleting subscription:", error);
        alert("Failed to delete subscription. Please try again.");
      }
    }
  };

  return (
    <div className="admin-container">
      <Header />
      <div className="user-management">
        <div className="user-management__header">
          <h1>Subscribed Users</h1>
        </div>

        <div className="user-management__filters">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <button
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {showFilters && (
          <div className="filters-dropdown">
            <div className="filter-group">
              <label>Plan:</label>
              <div className="filter-options">
                {getUniquePlans().map((plan) => (
                  <button
                    key={plan}
                    className={`filter-tag ${
                      filterPlan === plan ? "active" : ""
                    }`}
                    onClick={() => handlePlanFilter(plan)}
                  >
                    {plan === "all" ? "All Plans" : plan}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="subscription-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("username")}>
                  Username
                  {sortConfig.key === "username" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th>Email</th>
                <th onClick={() => handleSort("plan")}>
                  Plan
                  {sortConfig.key === "plan" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th>Price</th>
                <th>Start Date</th>
                <th onClick={() => handleSort("endDate")}>
                  End Date
                  {sortConfig.key === "endDate" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub._id}>
                    <td>{sub.user?.username || "N/A"}</td>
                    <td>{sub.user?.email || "N/A"}</td>
                    <td>{sub.plan}</td>
                    <td>${sub.price}</td>
                    <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                    <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                    <td>{sub.status}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(sub._id)}
                        title="Delete Subscription"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-results">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscribedList;
