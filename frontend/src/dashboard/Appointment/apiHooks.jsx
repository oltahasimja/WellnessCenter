import { useState, useEffect } from "react";
import axios from "axios";

export const useFetchSpecialists = (currentUser, setSpecialists, setErrorMessage) => {
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const specsResponse = await axios.get("http://localhost:5001/api/user/specialists");
        setSpecialists(specsResponse.data);
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setErrorMessage("Error fetching specialists data");
      }
    };

    if (currentUser) {
      fetchSpecialists();
    }
  }, [currentUser]);
};

export const useFetchSchedules = (specialists, setSchedules, setLoadingSchedules, setErrorMessage) => {
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const response = await axios.get("http://localhost:5001/api/schedule");
        setSchedules(response.data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setErrorMessage("Error fetching schedules");
      } finally {
        setLoadingSchedules(false);
      }
    };
    
    if (specialists.length > 0) {
      fetchSchedules();
    }
  }, [specialists]);
};