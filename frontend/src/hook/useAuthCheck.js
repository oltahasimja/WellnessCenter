import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../axios";

const useAuthCheck = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await api.get("/user", { 
          withCredentials: true 
        });
        
        if (response.data.user) {
          setIsAuthenticated(true);
          setUser(response.data.user);
          localStorage.setItem("currentUser", JSON.stringify(response.data.user));

          
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath);
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkLoginStatus();
  }, [navigate]);

  return { isChecking, isAuthenticated, user };
};

export default useAuthCheck;