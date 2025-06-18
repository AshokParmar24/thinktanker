import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import EventDialog from "../EventDialog/EventDialog";
import DeleteDialog from "../DeleteDialog/DeleteDialog";

const localizer = momentLocalizer(moment);

function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [curreEvent, setCurrentEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const handleSelectSlot = ({ start, end }) => {
    setEditEvent(null);
    setCurrentEvent(null);
    setIsEdit(false);
    setOpen(true);
    setSelectedSlot({ start, end });
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const existingEvents =
      JSON.parse(localStorage.getItem("calendar-events")) || [];

    const parsedEvents = existingEvents.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

    setEvents(parsedEvents);
  }, []);

  const handleAddEvent = (newEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    localStorage.setItem("calendar-events", JSON.stringify(updatedEvents));
    setOpen(false);
  };

  return (
    <>
      <div style={{ height: "100vh", padding: 20 }}>
        <h2>📅 Event Calendar</h2>
        <p>
          <strong>Date:</strong> {moment(currentDate).format("MMMM YYYY")} |{" "}
          <strong>View:</strong> {currentView}
        </p>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          popup={false}
          onSelectSlot={handleSelectSlot}
          slotPropGetter={(date) => {
            const now = new Date();
            if (moment(date).isAfter(now, "day")) {
              return {
                style: {
                  backgroundColor: "#f0f0f0",
                  pointerEvents: "none",
                  color: "#aaa",
                },
              };
            }
            return {};
          }}
          components={{
            event: ({ event }) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    📌 <strong>{event.title}</strong>
                    <Box sx={{display:"flex",gap:"2px"}}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentEvent(event);
                          setDeleteDialogOpen(true);
                        }}
                        color="error"
                        aria-label="delete event"
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEdit(true);
                          setEditEvent(event);
                          setOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                </div>
              </div>
            ),
          }}
          onNavigate={(date) => setCurrentDate(date)}
          onView={(view) => setCurrentView(view)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={currentView}
          date={currentDate}
          defaultView="month"
          style={{ height: "90vh" }}
        />
      </div>

      <EventDialog
        open={open}
        onClose={handleClose}
        onAdd={handleAddEvent}
        slot={selectedSlot}
        event={editEvent}
        isEdit={isEdit}
        setEdit={setIsEdit}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          const filtered = events.filter((e) => e.id !== curreEvent?.id);
          setEvents(filtered);
          localStorage.setItem("calendar-events", JSON.stringify(filtered));
          setDeleteDialogOpen(false);
          setCurrentEvent(null);
          handleClose();
          setIsEdit(false);
        }}
        event={curreEvent}
      />
    </>
  );
}

export default CalendarApp;
