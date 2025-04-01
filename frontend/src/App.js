import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './dashboard/Dashboard';
import Program from './dashboard/Program';
import List from './dashboard/List';
import UserProgram from './dashboard/UserPrograms'
import ProgramDetail from './dashboard/ProgramDetail'; 
import Training from './dashboard/Training';




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
                <Route path="/list" element={<List/>} />
                <Route path="/training" element={<Training/>}/>
                <Route path="/userprograms" element={<UserProgram/>}/>
                <Route path="/programs" element={<Program />} />
                <Route path="/programs/:id" element={<ProgramDetail />} />
                </Routes>
            </Router>
        </ThemeProvider>

    );
};

export default App;
