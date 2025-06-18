import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

function EventDialog({ open, onClose, onAdd, slot, event, isEdit, setEdit }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  console.log("evenyeventeventevent", event);

  useEffect(() => {
    if (isEdit && event) {
      setValue("title", event.title);
      setValue("description", event.description);
      setValue("start", moment(event.start).format("YYYY-MM-DDTHH:mm"));
      setValue("end", moment(event.end).format("YYYY-MM-DDTHH:mm"));
    }
    else{
        reset()
    }
  }, [isEdit]);

  const onSubmit = (data) => {
    if (isEdit) {
      const existingEvents =
        JSON.parse(localStorage.getItem("calendar-events")) || [];

      const data = existingEvents.map((v) => {
        return v.id == event.id
          ? {
              id: event.id,
              title: data.title,
              description: data.description,
              start: new Date(data.start),
              end: new Date(data.end),
            }
          : v;
      });
      localStorage.setItem("calendar-events", JSON.stringify(data));
      setEdit(false);
    } else {
      onAdd({
        id: uuidv4(),
        title: data.title,
        description: data.description,
        start: new Date(data.start),
        end: new Date(data.end),
      });
      reset();
      onClose();
    }
  };

  const minEndTime = moment(control._formValues?.start || new Date())
    .add(15, "minutes")
    .format("YYYY-MM-DDTHH:mm");

  const today = moment().format("YYYY-MM-DDTHH:mm");

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isEdit ? " update Event" : "Add Event"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
              />
            )}
          />

          <Controller
            name="start"
            control={control}
            defaultValue={moment(slot?.start || new Date()).format(
              "YYYY-MM-DDTHH:mm"
            )}
            rules={{
              required: "Start time is required",
              validate: (value) =>
                moment(value).isSameOrAfter(moment(), "minute") ||
                "Start must be today or later",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Start"
                type="datetime-local"
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: today } }}
                error={!!errors.start}
                helperText={errors.start?.message}
              />
            )}
          />

          <Controller
            name="end"
            control={control}
            defaultValue={moment(slot?.end || new Date()).format(
              "YYYY-MM-DDTHH:mm"
            )}
            rules={{
              required: "End time is required",
              validate: (value, { start }) =>
                moment(value).isAfter(start) || "End must be after start",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="End"
                type="datetime-local"
                fullWidth
                margin="normal"
                inputProps={{ min: minEndTime }}
                error={!!errors.end}
                helperText={errors.end?.message}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default EventDialog;
