import React from 'react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Secure Authentication with
            <span className="gradient-text"> Face ID</span>
          </h1>
          <p className="hero-subtitle">
            Experience the future of secure login with advanced facial recognition technology. 
            Fast, secure, and convenient authentication for your applications.
          </p>
          <div className="hero-buttons">
            <button onClick={() => onGetStarted('login')} className="btn btn-primary btn-large">
              Try Face Login
            </button>
            <button onClick={() => onGetStarted('signup')} className="btn btn-secondary btn-large">
              Register Face ID
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="face-id-demo">
            <div className="camera-frame">
              <div className="camera-lens"></div>
              <div className="scan-line"></div>
            </div>
            <div className="face-outline"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Face ID?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Ultra Secure</h3>
            <p>Advanced AI-powered facial recognition with 99.9% accuracy for maximum security.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Instant authentication in under 2 seconds. No more typing passwords.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Cross Platform</h3>
            <p>Works seamlessly across all devices and browsers with camera access.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Easy Setup</h3>
            <p>Simple 10-photo registration process for optimal recognition accuracy.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register Your Face</h3>
            <p>Capture 10 photos from different angles to create your unique face profile.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Processing</h3>
            <p>Our advanced AI analyzes facial features to create a secure biometric template.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Instant Login</h3>
            <p>Simply look at your camera and get authenticated instantly with your face.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience the Future?</h2>
          <p>Join thousands of users who have already switched to Face ID authentication.</p>
          <div className="cta-buttons">
            <button onClick={() => onGetStarted('signup')} className="btn btn-primary btn-large">
              Get Started Now
            </button>
            <button onClick={() => onGetStarted('login')} className="btn btn-outline btn-large">
              Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Face ID Authentication. Built with React and face-api.js</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 