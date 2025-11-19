import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookie from 'js-cookie';
import { toast } from 'react-toastify';
import Header from '../../components/header/Header';
import host from '../../api';
import './style.scss';

const SubscriptionPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activePlan, setActivePlan] = useState(null);
  const navigate = useNavigate();

  const fetchActiveSubscription = async () => {
    const jwtToken = Cookie.get('jwtToken');
    if (!jwtToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${host}/api/subscription/get`, {
        headers: {
          'auth-token': jwtToken,
        },
      });

      if (response.data.status) {
        setActivePlan(response.data.subscription.plan);
        setSelectedPlan(response.data.subscription.plan); // Pre-select the active plan
      }
    } catch (error) {
      // No active subscription, that's fine
    }
  };

  useEffect(() => {
    fetchActiveSubscription();
    // Keep free access time to allow timer to continue on subscription page
  }, []);

  const plans = [
    { id: '1month', name: '1 Month', price: 99 },
    { id: '3months', name: '3 Months', price: 199 },
    { id: '6months', name: '6 Months', price: 399 },
    { id: '1year', name: '1 Year', price: 699 },
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }

    const jwtToken = Cookie.get('jwtToken');
    if (!jwtToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`${host}/api/subscription/create`, {
        plan: selectedPlan,
      }, {
        headers: {
          'auth-token': jwtToken,
        },
      });

      if (response.data.status) {
        toast.success('Subscription created successfully!');
        navigate('/admin/subscriptions');
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error('Failed to create subscription');
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <div className="subscription-plan">
        <div className="heroBanner">
          <div className="opacityLayer"></div>
          <div className="heroBannerContent">
            <span className="title">Choose Your Plan</span>
            <span className="subtitle">
              Unlock unlimited access to movies and TV shows. Choose the plan that fits you best.
            </span>
          </div>
        </div>
        <div className="container">
          {activePlan && (
            <p className="active-plan">You have an active {plans.find(p => p.id === activePlan)?.name} plan.</p>
          )}
          <div className="plans">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <h2>{plan.name}</h2>
                <p className="price">₹{plan.price}</p>
                <button className="select-btn">
                  {selectedPlan === plan.id ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
          <button className="subscribe-btn" onClick={handleSubscribe} disabled={!!activePlan}>
            {activePlan ? 'Already Subscribed' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPlan;
