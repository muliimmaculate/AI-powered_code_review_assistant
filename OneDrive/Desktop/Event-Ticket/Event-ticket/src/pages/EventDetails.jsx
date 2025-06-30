import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const dummyEvents = [
  {
    id: 1,
    title: "Music Concert",
    date: "2024-07-15",
    location: "City Hall",
    description: "A night of amazing live music with top artists and a vibrant crowd. Enjoy an unforgettable concert experience!",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    category: "Music",
    badge: "Popular"
  },
  {
    id: 2,
    title: "Art Exhibition",
    date: "2024-08-01",
    location: "Art Gallery",
    description: "Explore the latest in modern art. See stunning paintings, sculptures, and installations from emerging artists.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
    category: "Art",
    badge: "New"
  },
  {
    id: 3,
    title: "Tech Conference",
    date: "2024-09-10",
    location: "Convention Center",
    description: "Join industry leaders in tech innovation. Talks, workshops, and networking with top tech professionals.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    category: "Tech",
    badge: "Sold Out"
  },
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  // Prefer event from location.state, fallback to dummyEvents
  const event = location.state?.event || dummyEvents.find(e => e.id === Number(id));

  if (!event) {
    return <div className="event-details-container"><h2>Event not found</h2></div>;
  }

  return (
    <div className="event-details-bg">
      <div className="event-details-container advanced">
        <div className="event-details-img-wrap">
          <img src={event.image} alt={event.title} className="event-details-img advanced" />
          <span className={`event-advanced-badge ${event.badge.toLowerCase().replace(' ', '-')}`}>{event.badge}</span>
        </div>
        <div className="event-details-card advanced">
          <h1 className="event-details-title advanced">{event.title}</h1>
          <div className="event-details-meta-row">
            <span className="event-details-meta advanced"><strong>Date:</strong> {event.date}</span>
            <span className="event-details-meta advanced"><strong>Location:</strong> {event.location}</span>
            <span className="event-details-meta advanced"><strong>Category:</strong> {event.category}</span>
          </div>
          <p className="event-details-desc advanced"><strong>Description:</strong> {event.description}</p>
          <button className="event-details-btn advanced" onClick={() => setShowModal(true)}>Book Ticket</button>
          <button className="event-details-back advanced" onClick={() => navigate(-1)}>Back to Events</button>
        </div>
      </div>
      {showModal && (
        <div className="booking-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <h2>Book Ticket</h2>
            <p>Booking for <strong>{event.title}</strong></p>
            <input className="booking-modal-input" type="text" placeholder="Your Name" />
            <input className="booking-modal-input" type="email" placeholder="Your Email" />
            <button className="booking-modal-btn" onClick={() => setShowModal(false)}>Confirm Booking</button>
            <button className="booking-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails; 