import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-bg-light">
      <div className="auth-card-light">
        <div className="auth-logo-light"></div>
        <h1 className="auth-title-light">Welcome Back!</h1>
        <p className="auth-subtitle-light">Build, test, and launch full-stack web and mobile apps</p>
        <form className="auth-form-light">
          <input type="email" className="auth-input-light" placeholder="Email Address" />
          <input type="password" className="auth-input-light" placeholder="Password" />
          <button type="submit" className="auth-btn-light">Login</button>
        </form>
        <button className="auth-link-light">Forgot Password?</button>
        <div className="auth-divider-light"><span>or continue with</span></div>
        <div className="auth-social-row-light">
          <button className="auth-social-btn-light google"><img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" /></button>
          <button className="auth-social-btn-light facebook"><img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" /></button>
        </div>
        <div className="auth-bottom-row-light">
          <span>Don't have an account?</span>
          <button className="auth-btn-secondary-light" onClick={() => navigate('/register')}>Create account</button>
        </div>
      </div>
    </div>
  );
};

export default Login; 