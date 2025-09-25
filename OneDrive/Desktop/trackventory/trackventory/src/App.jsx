import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductList from './components/ProductList';

function App() {
  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">📦 TrackVentory</h1>
        <p className="app-subtitle">Smart Inventory Management for Small Businesses</p>
      </div>
      <ProductList />
    </div>
  );
}

export default App
