import React, { useState, useContext, useEffect } from "react";
import { Check } from "lucide-react";
import { ChatContext } from "../context/ChatContext";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingCard = ({
  title,
  description,
  price,
  period,
  buttonText,
  buttonVariant,
  gradient,
  imageUrl,
  limits,
  features,
  badge,
  onClick
}) => {
  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      {badge && (
        <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          {badge}
        </div>
      )}

      <div className="h-32 relative overflow-hidden">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`}></div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          {description}
        </p>

        <div className="mb-6">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-gray-400 ml-1">/ {period}</span>
        </div>

        <button
        onClick={onClick}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${buttonVariant}`}>
          {buttonText}
        </button>

        <div className="mt-8">
          <h4 className="text-white font-semibold mb-4">Plan Limits</h4>
          <ul className="space-y-3">
            {limits.map((limit, index) => (
              <li
                key={index}
                className="flex items-center text-gray-300 text-sm">
                <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                {limit}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h4 className="text-white font-semibold mb-4">{features.title}</h4>
          <ul className="space-y-3">
            {features.items.map((feature, index) => (
              <li
                key={index}
                className="flex items-center text-gray-300 text-sm">
                <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const { currentChatId } = useContext(ChatContext);
  const navigate = useNavigate();

  // Load Razorpay script dynamically
  useEffect(() => {
    const loadRazorpayScript = () => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setIsRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
      };
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  const handleClosePricing = () => {
    if (currentChatId) {
      navigate(`/chat/${currentChatId}`);
    } else {
      navigate("/");
    }
  };

  // Create order on backend
  const processPayment = async (planType, amount) => {
    const currency = "INR";
    const receipt = `receipt_${planType}_${Date.now()}`;
    
    try {
      const response = await fetch("http://localhost:5000/order", {
        method: "POST",
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency, 
          receipt
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const order = await response.json();
      console.log('Order created:', order);
      return order;
    } catch (error) {
      console.error("Payment processing error:", error);
      throw error;
    }
  };

  // Open Razorpay checkout
  const openRazorpayCheckout = (order, planType, amount) => {
    if (!isRazorpayLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    const options = {
      key: "rzp_live_RENHFiweVNuUkX", // Use test key for testing
      amount: order.amount,
      currency: order.currency,
      name: "Sprizen Technologies",
      description: `${planType} Plan Subscription`,
      // image: "./Companylogo.png",
      order_id: order.id,
      handler: function (response) {
        console.log('Payment successful:', response);
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
        // Handle successful payment here
        // You can redirect user or update subscription status
      },
   
      notes: {
        address: "Razorpay Corporate Office"
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzp1 = new window.Razorpay(options);
    
    rzp1.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      alert(`Payment failed: ${response.error.description}`);
    });

    rzp1.open();
  };

    const toNumber = (value) => {
    if (typeof value === "number") return value;
    if (!value) return NaN;
    const num = parseFloat(String(value).replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : NaN;
  };

  // Handle plan selection
  const handleClick = async (planType,price) => {
    console.log(`Clicked on ${planType} plan`);
    
    // Determine amount based on plan type
    // let amount = price; // default
    let amount = toNumber(price);
    if (!Number.isFinite(amount)) {
      switch (planType) {
        case "starter":
          amount = toNumber(pricingData.starter.monthlyPrice) || 5;
          break;
        case "creator":
          amount = toNumber(pricingData.creator.monthlyPrice) || 6;
          break;
        case "enterprise":
          amount = toNumber(pricingData.enterprise.monthlyPrice) || 7;
          break;
        case "annual":
          amount = toNumber(annualPlan.price) || 12;
          break;
        default:
          amount = 1;
      }
    }
    
    try {
      // Create order first
      const order = await processPayment(planType, amount);
      
      // Then open Razorpay checkout
      openRazorpayCheckout(order, planType, amount);
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  const pricingData = {
    starter: {
      title: "Starter Plan",
      description: "Beginners who want to explore Synthesio without any commitment.",
      monthlyPrice: "₹5.00",
      buttonText: "Upgrade",
      buttonVariant: "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
      gradient: "from-blue-500 via-blue-600 to-purple-700",
      imageUrl: "https://i.ytimg.com/vi/COv-TEtLrAg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD6AYIQzIfcDlSALXPLK8YAxhR6Gg",
      limits: ["1 editor, 3 guest commenters", "120 video minutes per year"],
      features: {
        title: "Features",
        items: [
          "125+ AI avatars",
          "3 personal avatars",
          "AI assistant",
          "Signing and commenting",
          "Studio avatars (paid add-on)",
          "Download videos",
        ],
      },
    },
    creator: {
      title: "Creator Plan",
      description: "Freelancers or small teams that need more flexibility and downloadable content.",
      monthlyPrice: "₹6.00",
      
      buttonText: "Upgrade",
      buttonVariant: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white",
      gradient: "from-pink-500 via-purple-500 to-pink-600",
      imageUrl: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800",
      badge: "Save 25%",
      limits: ["1 editor, 5 guest commenters", "360 video minutes per year"],
      features: {
        title: "Everything In Starter Plus...",
        items: [
          "Selected industry avatars",
          "5 personal avatars",
          "Premium voices",
          "Custom fonts",
          "Branded share page",
          "Synthesio API",
        ],
      },
    },
    enterprise: {
      title: "Enterprise Plan",
      description: "Content creators, marketers, and small businesses producing video content regularly.",
      monthlyPrice: "₹7.00",
     
      buttonText: "Upgrade",
      buttonVariant: "bg-teal-600 hover:bg-teal-700 text-white",
      gradient: "from-teal-500 via-cyan-500 to-teal-600",
      imageUrl: "https://elements-resized.envatousercontent.com/elements-video-cover-images/794c1a9f-aa2f-4373-a457-2dba10b1a30e/video_preview/video_preview_0000.jpg?w=500&cf_fit=cover&q=85&format=auto&s=b248d18e091492bf8b3ad82633320b42fe00a4d298024ec66d5fad782d22c681",
      limits: ["Custom no. of editors and guests", "Unlimited video minutes"],
      features: {
        title: "Everything In Creator Plus...",
        items: [
          "All industry avatars",
          "Unlimited personal avatars",
          "Branded AI avatars (paid add-on)",
          "Voice cloning",
          "Shared workspace",
          "SAML/SSO",
        ],
      },
    },
  };

  const annualPlan = {
    title: "Annual Pro Plan",
    description: "Get the best value with our comprehensive annual subscription. Perfect for serious content creators and growing businesses.",
    price: "₹12.00",
    buttonText: "Get Annual Plan",
    buttonVariant: "bg-gradient-to-r from-purple-500 to-red-600 hover:from-purple-600 hover:to-red-700 text-white",
    gradient: "from-black-400 to-purple-500",
    imageUrl: "https://i.ytimg.com/vi/DGu9frFvG2M/maxresdefault.jpg",
    badge: "Best Value",
    limits: [
      "Unlimited editors and guests",
      "Unlimited video minutes",
      "Priority support included"
    ],
    features: {
      title: "Premium Annual Features",
      items: [
        "All industry avatars included",
        "Unlimited personal avatars",
        "Advanced voice cloning",
        "Custom branding options",
        "API access with higher limits",
        "Dedicated account manager",
        "Advanced analytics dashboard",
        "White-label solutions"
      ]
    }
  };

  const getCurrentPrice = (plan) => {
    return billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  };

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4">
      <button className="fixed top-6 right-6 bg-white hover:bg-gray-100 text-gray-900 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50" onClick={handleClosePricing}>
        <X className="w-6 h-6" />
      </button>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Choose the Perfect Plan for You
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Choose a plan that will help you create professional videos with AI
            quickly and easily. Suitable for personal projects, teamwork and
            large-scale content.
          </p>

          <div className="flex items-center justify-center mt-12">
            <div className="bg-gray-800 rounded-full p-1 flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-white text-gray-900"
                    : "text-gray-400 hover:text-white"
                }`}>
                Personal
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  billingPeriod === "annually"
                    ? "bg-white text-gray-900"
                    : "text-gray-400 hover:text-white"
                }`}>
                Business
              </button>
            </div>
          </div>
        </div>

        {billingPeriod === "monthly" ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <PricingCard
              {...pricingData.starter}
              price={getCurrentPrice(pricingData.starter)}
              period={billingPeriod}
              onClick={() => handleClick('starter',5)}
            />
            <PricingCard
              {...pricingData.creator}
              price={getCurrentPrice(pricingData.creator)}
              period={billingPeriod}
              onClick={() => handleClick('creator',6)}
            />
            <PricingCard
              {...pricingData.enterprise}
              price={getCurrentPrice(pricingData.enterprise)}
              period={billingPeriod}
              onClick={() => handleClick('enterprise',7)}
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="max-w-md">
              <PricingCard
                {...annualPlan}
                price={annualPlan.price}
                period={billingPeriod}
                onClick={() => handleClick('annual')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}