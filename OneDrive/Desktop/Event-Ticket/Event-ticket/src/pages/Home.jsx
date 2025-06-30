import React from "react";
import { useNavigate } from "react-router-dom";

const eventCategories = [
  { name: "Weddings", color: "#f472b6", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80" },
  { name: "Birthdays", color: "#fbbf24", img: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80" },
  { name: "Corporate Events", color: "#34d399", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80" },
  { name: "Concerts", color: "#60a5fa", img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80" },
  { name: "Exhibitions", color: "#a78bfa", img: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80" },
  { name: "Catering & Decor", color: "#f87171", img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80" },
];

const featuredEvents = [
  { title: "Grand Wedding Package", price: "$2500", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80", location: "City Banquet Hall", rating: 4.9 },
  { title: "Corporate Conference", price: "$1200", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80", location: "Downtown Center", rating: 4.7 },
  { title: "Outdoor Concert Venue", price: "$3800", img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80", location: "Open Air Arena", rating: 4.8 },
  { title: "Exhibition Hall", price: "$1500", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", location: "Expo Center", rating: 4.6 },
  { title: "Birthday Celebration", price: "$2000", img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80", location: "Party Place", rating: 4.9 },
  { title: "Outdoor Concert Venue", price: "$2500", img: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80", location: "Central Park", rating: 4.8 },
];

const testimonials = [
  { name: "James Williams", img: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, text: "Booking was seamless and the event was unforgettable! Highly recommend." },
  { name: "Janet Brown", img: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5, text: "Great platform, easy to use and excellent support." },
  { name: "Albert Evans", img: "https://randomuser.me/api/portraits/men/65.jpg", rating: 4, text: "Lots of event options and the booking process is quick." },
  { name: "Jenny Wilson", img: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5, text: "Loved the experience! Will book again for sure." },
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

const partners = [
  "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
  "https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png",
  "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
  "https://upload.wikimedia.org/wikipedia/commons/2/2f/Logo_TV_2015.png"
];

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="homepage-v2">
      {/* Hero Banner */}
      <section className="hero-v2">
        <img className="hero-bg-img-v2" src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1800&q=80" alt="Event Hall Banner" />
        <div className="hero-overlay-v2" />
        <div className="hero-content-v2">
          <h1>Book Your Dream Event <span className="hero-accent-v2">With Ease</span></h1>
          <p>Find and book venues, organizers, and services in just a few clicks. Create unforgettable moments for any occasion.</p>
        </div>
      </section>

      {/* Event Categories */}
      <section className="categories-v2">
        <h2>Event Categories</h2>
        <div className="categories-grid-v2">
          {eventCategories.map((cat, idx) => (
            <div className="category-card-v2" key={idx} style={{ background: cat.color + '22' }}>
              <img src={cat.img} alt={cat.name} />
              <div className="category-card-label-v2" style={{ background: cat.color }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured-v2">
        <h2>Featured Events & Venues</h2>
        <div className="featured-grid-v2">
          {featuredEvents.map((ev, idx) => (
            <div className="featured-card-v2" key={idx}>
              <img src={ev.img} alt={ev.title} />
              <div className="featured-card-body-v2">
                <h3>{ev.title}</h3>
                <div className="featured-meta-v2">{ev.location}</div>
                <div className="featured-price-v2">{ev.price}</div>
                <div className="featured-rating-v2">{'★'.repeat(Math.round(ev.rating))}<span className="featured-rating-num-v2">{ev.rating}</span></div>
                <button className="featured-btn-v2">Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-v2">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-grid-v2">
          {testimonials.map((t, idx) => (
            <div className="testimonial-card-v2" key={idx}>
              <img src={t.img} alt={t.name} />
              <div className="testimonial-rating-v2">{'★'.repeat(t.rating)}</div>
              <p className="testimonial-text-v2">{t.text}</p>
              <div className="testimonial-name-v2">{t.name}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home; 