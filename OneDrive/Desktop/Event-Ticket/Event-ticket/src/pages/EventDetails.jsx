import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const dummyEvents = [
  {
    id: 1,
    title: "Music Concert",
    date: "2024-07-15",
    location: "City Hall",
    description: "A night of amazing live music!",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Art Exhibition",
    date: "2024-08-01",
    location: "Art Gallery",
    description: "Explore the latest in modern art.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Tech Conference",
    date: "2024-09-10",
    location: "Convention Center",
    description: "Join industry leaders in tech innovation.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
  },
];

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = dummyEvents.find(e => e.id === Number(id));

  if (!event) {
    return <div className="event-details-container"><h2>Event not found</h2></div>;
  }

  return (
    <div className="event-details-container">
      <img src={event.image} alt={event.title} className="event-details-img" />
      <div className="event-details-card">
        <h1 className="event-details-title">{event.title}</h1>
        <p className="event-details-meta"><strong>Date:</strong> {event.date}</p>
        <p className="event-details-meta"><strong>Location:</strong> {event.location}</p>
        <p className="event-details-desc"><strong>Description:</strong> {event.description}</p>
        <button className="event-details-btn" onClick={() => alert('Booking functionality coming soon!')}>Book Ticket</button>
        <button className="event-details-back" onClick={() => navigate(-1)}>Back to Events</button>
      </div>
    </div>
  );
};

export default EventDetails; 