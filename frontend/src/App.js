import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './components/ThemeContext'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './dashboard/Dashboard';
import Program from './dashboard/Program';
import List from './dashboard/List';
import UserProgram from './dashboard/UserPrograms';
import ProgramDetail from './dashboard/ProgramDetail'; 
import Training from './dashboard/Training';
import Certification from './dashboard/Certification';
import Card from './dashboard/Card';
import TrainingApplication from './dashboard/TrainingApplication';
import ScheduleTraining from './dashboard/ScheduleTraining';
import TrainingDetail from './dashboard/TrainingDetail';
import Order from './dashboard/Order';
import Review from './dashboard/Review';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Product from './dashboard/Product';
import Category from './dashboard/Category';
import Cart from './dashboard/Cart';
import ClientOrderForm from './dashboard/ClientOrderForm';
import Appointment from './pages/Appointment'
import Schedule from './pages/Schedule'


const AppRoutes = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Appointment" element={<Appointment />} />
        <Route path="/Schedule" element={<Schedule />} />

        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/list" element={<List />} />
        <Route path="/training" element={<Training />} />
        <Route path="/certification" element={<Certification />} />
        <Route path="/trainingapplication" element={<TrainingApplication />} />
        <Route path="/scheduleTraining" element={<ScheduleTraining />} />
        <Route path="/userprograms" element={<UserProgram />} />
        <Route path="/programs" element={<Program />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
        <Route path="/card" element={<Card />} />
        <Route path="/training/:id" element={<TrainingDetail />} />
        <Route path="/order" element={<Order />} />
        <Route path="/review" element={<Review/>}/>
        <Route path="/product" element={<Product/>}/>
        <Route path="/category" element={<Category/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/client-order-form" element={<ClientOrderForm/>}/>
      

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
