import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const dummyEvents = [
  {
    id: 1,
    title: "Music Concert",
    date: "2024-07-15",
    location: "City Hall",
    description: "A night of amazing live music!",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80",
    category: "Music",
    badge: "Popular"
  },
  {
    id: 2,
    title: "Art Exhibition",
    date: "2024-08-01",
    location: "Art Gallery",
    description: "Explore the latest in modern art.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80",
    category: "Art",
    badge: "New"
  },
  {
    id: 3,
    title: "Tech Conference",
    date: "2024-09-10",
    location: "Convention Center",
    description: "Join industry leaders in tech innovation.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
    category: "Tech",
    badge: "Sold Out"
  },
];

const categories = ["All", "Music", "Art", "Tech"];

const Events = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEvents = dummyEvents.filter(event => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || event.location.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="events-bg">
      <main className="events-main">
        <section className="events-section">
          <h1 className="events-title">Browse Events</h1>
          <div className="event-filter-bar">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="event-search"
            />
            <div className="event-categories">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`event-category-btn${selectedCategory === cat ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="event-grid">
            {filteredEvents.length === 0 ? (
              <p className="event-empty">No events found.</p>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
                  <img src={event.image} alt={event.title} className="event-img" />
                  <div className="event-card-body">
                    <div className="event-card-header">
                      <h2 className="event-title">{event.title}</h2>
                      <span className={`event-badge ${event.badge.toLowerCase().replace(' ', '-')}`}>{event.badge}</span>
                    </div>
                    <p className="event-category">{event.category}</p>
                    <p className="event-meta">{event.date} &middot; {event.location}</p>
                    <p className="event-desc">{event.description}</p>
                    <button className="event-book-btn" onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}`); }}>Book Now</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Events; 