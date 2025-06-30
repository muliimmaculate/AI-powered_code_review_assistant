import React from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-bg-light">
      <div className="auth-card-light">
        <div className="auth-logo-light"></div>
        <h1 className="auth-title-light">Create Account</h1>
        <p className="auth-subtitle-light">Sign up to access all features and manage your events</p>
        <form className="auth-form-light">
          <input type="text" className="auth-input-light" placeholder="Name" />
          <input type="email" className="auth-input-light" placeholder="Email Address" />
          <input type="password" className="auth-input-light" placeholder="Password" />
          <button type="submit" className="auth-btn-light">Register</button>
        </form>
        <div className="auth-divider-light"><span>or sign up with</span></div>
        <div className="auth-social-row-light">
          <button className="auth-social-btn-light google"><img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" /></button>
          <button className="auth-social-btn-light facebook"><img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" /></button>
        </div>
        <div className="auth-bottom-row-light">
          <span>Already have an account?</span>
          <button className="auth-btn-secondary-light" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Register; 