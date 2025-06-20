import React from "react";
import { useNavigate } from "react-router-dom";

const featuredEvents = [
  {
    id: 1,
    title: "Music Concert",
    date: "2024-07-15",
    location: "City Hall",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    title: "Art Exhibition",
    date: "2024-08-01",
    location: "Art Gallery",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    title: "Tech Conference",
    date: "2024-09-10",
    location: "Convention Center",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    title: "Food Festival",
    date: "2024-10-05",
    location: "Central Park",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    title: "Startup Pitch Night",
    date: "2024-11-12",
    location: "Tech Hub",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    title: "Charity Run",
    date: "2024-12-01",
    location: "Riverside Park",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80"
  },
];

const testimonials = [
  {
    name: "Alex Kim",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "Booking my concert tickets was a breeze! The site is beautiful and easy to use.",
  },
  {
    name: "Maria Lopez",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "I love the event recommendations and the modern design. Highly recommended!",
  },
  {
    name: "James Smith",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    quote: "The booking process is so smooth and the events are always top-notch.",
  },
];

const howItWorks = [
  {
    icon: "🔍",
    title: "Find Events",
    desc: "Browse and search for events that match your interests."
  },
  {
    icon: "🎟️",
    title: "Book Instantly",
    desc: "Reserve your spot in seconds with secure checkout."
  },
  {
    icon: "🎉",
    title: "Enjoy the Experience",
    desc: "Attend and have an unforgettable time!"
  },
];

const whyChooseUs = [
  {
    icon: "🛡️",
    title: "Secure Payments",
    desc: "Your data and payments are protected with top security."
  },
  {
    icon: "🌟",
    title: "Curated Events",
    desc: "Only the best and most exciting events, handpicked for you."
  },
  {
    icon: "💬",
    title: "24/7 Support",
    desc: "Our team is always here to help you, anytime."
  },
];

const latestNews = [
  {
    title: "Evently Launches New Mobile App",
    desc: "Book and manage your tickets on the go with our brand new mobile app for iOS and Android."
  },
  {
    title: "2024 Summer Festival Announced",
    desc: "Join us for a week of music, food, and fun at the annual Summer Festival. Early bird tickets available now!"
  },
  {
    title: "COVID-19 Safety Measures Updated",
    desc: "Read about our latest health and safety protocols to keep you safe at all events."
  },
];

const Home = () => {
  const navigate = useNavigate();
  const featured = featuredEvents[0];
  return (
    <div className="page-container">
      <section className="hero">
        <h1 className="hero-title">Effortless Event Booking</h1>
        <p className="hero-subtitle">Discover, book, and manage tickets for the best events around you. Simple. Secure. Seamless.</p>
        <a href="/events" className="hero-cta">Browse Events</a>
      </section>
      <hr className="section-divider" />
      <main className="home-main compact-main">
        {/* Featured Event Banner */}
        <section className="home-featured-banner compact-section">
          <div className="home-featured-banner-inner compact-card">
            <img src={featured.image} alt={featured.title} className="home-featured-img" />
            <div className="home-featured-content">
              <span className="home-featured-badge">Featured Event</span>
              <h2 className="home-featured-title">{featured.title}</h2>
              <p className="home-featured-meta">{featured.date} &middot; {featured.location}</p>
              <button className="home-featured-btn" onClick={() => navigate(`/events/${featured.id}`)}>Book Now</button>
            </div>
          </div>
        </section>
        {/* How It Works Section */}
        <section className="home-section home-how-it-works compact-section">
          <h2 className="home-section-title">How It Works</h2>
          <div className="home-card-grid compact-grid">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="home-card home-how-card compact-card">
                <span className="home-how-icon">{item.icon}</span>
                <h4 className="home-how-title">{item.title}</h4>
                <p className="home-how-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Why Choose Us */}
        <section className="home-section home-why-choose compact-section">
          <h2 className="home-section-title">Why Choose Us</h2>
          <div className="home-card-grid compact-grid">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="home-card home-why-card compact-card">
                <span className="home-why-icon">{item.icon}</span>
                <h4 className="home-why-title">{item.title}</h4>
                <p className="home-why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Featured Events */}
        <section className="home-section home-featured-events compact-section">
          <h2 className="home-section-title">Featured Events</h2>
          <div className="home-featured-grid compact-grid">
            {featuredEvents.map(event => (
              <div key={event.id} className="home-featured-card compact-card" onClick={() => navigate(`/events/${event.id}`)}>
                <img src={event.image} alt={event.title} className="home-featured-card-img" />
                <div className="home-featured-card-body">
                  <h3 className="home-featured-card-title">{event.title}</h3>
                  <p className="home-featured-card-meta">{event.date} &middot; {event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* Testimonials */}
        <section className="home-section home-testimonials compact-section">
          <h2 className="home-section-title">What Our Users Say</h2>
          <div className="home-testimonial-grid compact-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="home-testimonial-card compact-card">
                <img src={t.avatar} alt={t.name} className="home-testimonial-avatar" />
                <p className="home-testimonial-quote">“{t.quote}”</p>
                <span className="home-testimonial-name">{t.name}</span>
              </div>
            ))}
          </div>
        </section>
        {/* Latest News */}
        <section className="home-section home-latest-news compact-section">
          <h2 className="home-section-title">Latest News</h2>
          <div className="home-news-list compact-grid">
            {latestNews.map((news, idx) => (
              <div key={idx} className="home-news-item compact-card">
                <h4 className="home-news-title">{news.title}</h4>
                <p className="home-news-desc">{news.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home; 