import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext'; 
import User from './dashboard/User';
import Role from './dashboard/Role';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './dashboard/Dashboard';
import Program from './dashboard/Program';

const App = () => {
    return (
 

        <ThemeProvider>
            <Router>
                <Routes>

                {/* <Route path="/" element={<Home />} /> */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/program" element={<Program/>}/>
                <Route path="/user" element={<User />} />
                <Route path="/role" element={<Role />} />

             
                </Routes>
            </Router>
        </ThemeProvider>

    );
};

export default App;
