import React from "react";

const Login = () => (
  <div className="auth-container">
    <h1 className="auth-title">Login</h1>
    <form className="auth-form">
      <div className="auth-field">
        <label className="auth-label">Email:</label>
        <input type="email" name="email" className="auth-input" />
      </div>
      <div className="auth-field">
        <label className="auth-label">Password:</label>
        <input type="password" name="password" className="auth-input" />
      </div>
      <button type="submit" className="auth-btn">Login</button>
    </form>
  </div>
);

export default Login; 