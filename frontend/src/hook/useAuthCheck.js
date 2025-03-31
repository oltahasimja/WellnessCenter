import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", { withCredentials: true });
        if (!response.data.user) {
          navigate("/login");
        }
      } catch (error) {
        console.log("Përdoruesi nuk është i kyçur.");
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);
};

export default useAuthCheck;
