import React from 'react';

const EventListComponent = ({ events }) => {
  return (
    <div className="event-list">
      <h2></h2>  {/* Rubrik för händelselistan */}
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
};

const EventItem = ({ event }) => {
  return (
    <div className="event-item">
      <h4>{event.type}</h4>
      <p>{event.date} - {event.time}</p>
      <p>{event.location}</p>
      <p>{event.description}</p>
    </div>
  );
};

export default EventListComponent;