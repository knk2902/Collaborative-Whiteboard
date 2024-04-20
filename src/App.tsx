import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Router, BrowserRouter, Routes } from 'react-router-dom';
import Login from './components/Login';
import Whiteboard from './components/Whiteboard';

const isAuthenticated = true;

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/whiteboard" element={<Whiteboard />} />
    </Routes>
  </BrowserRouter>
);

export default App;
