import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext'; 
import User from './dashboard/User';
import Role from './dashboard/Role';
import Home from './pages/Home'

const App = () => {
    return (
            <div className="relative">
                            <div className="absolute top-4 right-4">
                                <ThemeProvider />
                                </div>


        <ThemeProvider>
            <Router>
                <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/user" element={<User />} />
                <Route path="/role" element={<Role />} />

             
                </Routes>
            </Router>
        </ThemeProvider>

        </div>
    );
};

export default App;
