  import React, { useEffect } from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { ThemeProvider, useTheme } from './components/ThemeContext'; 
  import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


// const root = ReactDOM.createRoot(document.getElementById('root'));
  import Home from './pages/Home';
  import Login from './pages/Login';
  import Register from './pages/Register';
  import Dashboard from './dashboard/Dashboard';
  import Program from './dashboard/Program';
  import List from './dashboard/List';
  import UserProgram from './dashboard/UserPrograms';
  import CardMember from './dashboard/CardMember';
  import ProgramDetail from './dashboard/ProgramDetail'; 
  import Training from './dashboard/Training';
  import Certification from './dashboard/Certification';
  import Card from './dashboard/Card';
  import TrainingApplication from './dashboard/TrainingApplication';
  import ScheduleTraining from './dashboard/ScheduleTraining';
  import TrainingDetail from './dashboard/TrainingDetail';
  import Order from './dashboard/Order';
  import Delivery from './dashboard/Delivery';
  import ForgotPassword from './components/ForgotPassword';
  import ResetPassword from './components/ResetPassword';
  import Product from './dashboard/Product';
  import Category from './dashboard/Category';
  import Schedule from './pages/Schedule'
  import ProductsPage from './pages/product/ProductsPage';
  import MyPrograms from './pages/MyPrograms';
  import TrainingPage from './pages/TrainingPage'
  import TrainingApplicationn from './pages/TrainingApplicationn.jsx';
  import ProductDetailPage from './pages/product/ProductDetailPage';
  import CreateAppointment from './pages/CreateAppointment';
  import MyAppointments from './pages/MyAppointments';
  import Profile from './pages/Profile';
  import Chat from './pages/chat/Chat.jsx';
  import { CartProvider } from './context/CartContext';
  import ClientOrderForm from './dashboard/ClientOrderForm';
  import CartItem from './dashboard/CartItem';
  import { NotificationSoundProvider } from './context/NotificationSoundContext.jsx';
  import OrderConfirmation from './pages/OrderConfirmation.jsx';


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



          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/CreateAppointment" element={<CreateAppointment />} />
          <Route path="/MyAppointments" element={<MyAppointments />} />
          <Route path="/Profile" element={<Profile />} />

          <Route path="/trainingpage" element={<TrainingPage />} />
          <Route path="/trainingapplicationn" element={<TrainingApplicationn />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/cartitem" element={<CartItem />} />



          <Route path="/Schedule" element={<Schedule />} />
          <Route path="/MyPrograms" element={<MyPrograms />} />
          <Route path="/cardmember" element={<CardMember/>}/>
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
          <Route path="/delivery" element={<Delivery/>}/>
          <Route path="/order-confirmation" element={<OrderConfirmation/>} />

          <Route path="/product" element={<Product/>}/>
          <Route path="/productspage" element={<ProductsPage/>}/>
          <Route path="/client-order-form" element={<ClientOrderForm />} />
           <Route path="/product/:productName" element={<ProductDetailPage />} />


          <Route path="/category" element={<Category/>}/>

        

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        
            
        <Route path="*" element={<Navigate to="/" />} />
          
        
        </Routes>
      </Router>
    );
  };

const App = () => {
      const stripePromise = loadStripe("pk_test_51REGk6LPejWsTmTS57FbFFRXJO8hOcu0PVbqIn0Wemc9dlNaMi9HuB24KRZAiRIgJTSFNnI7juFs7I2rwiHJcHVZ00yEoXp6bE"); 

  return (
    <ThemeProvider>
      <CartProvider>
        <NotificationSoundProvider>
          <Elements stripe={stripePromise}>
            <AppRoutes />
          </Elements>
        </NotificationSoundProvider>
      </CartProvider>
    </ThemeProvider>
  );
};


  export default App;
