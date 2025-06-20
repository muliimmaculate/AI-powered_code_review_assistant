import React from "react";

const Register = () => (
  <div className="auth-container">
    <h1 className="auth-title">Register</h1>
    <form className="auth-form">
      <div className="auth-field">
        <label className="auth-label">Name:</label>
        <input type="text" name="name" className="auth-input" />
      </div>
      <div className="auth-field">
        <label className="auth-label">Email:</label>
        <input type="email" name="email" className="auth-input" />
      </div>
      <div className="auth-field">
        <label className="auth-label">Password:</label>
        <input type="password" name="password" className="auth-input" />
      </div>
      <button type="submit" className="auth-btn">Register</button>
    </form>
  </div>
);

export default Register; 