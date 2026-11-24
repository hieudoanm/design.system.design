'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface AppointmentRequest {
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  reason: string;
}

interface AppointmentBookingProps {
  doctors: string[];
  onSubmit: (request: AppointmentRequest) => void;
  title?: string;
}

const inputClass = 'input input-bordered w-full';

export const AppointmentBooking: FC<AppointmentBookingProps> = ({
  doctors,
  onSubmit,
  title = 'Book an appointment',
}) => {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctor, setDoctor] = useState(doctors[0] ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = (): void => {
    if (
      patientName.trim() === '' ||
      date === '' ||
      time === '' ||
      doctor === ''
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(undefined);
    onSubmit({
      patientName: patientName.trim(),
      date,
      time,
      doctor,
      reason: reason.trim(),
    });
  };

  return (
    <form
      className="card bg-base-200 w-full"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}>
      <div className="card-body flex flex-col gap-3">
        <h3 className="card-title">{title}</h3>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Patient name</span>
          </div>
          <input
            type="text"
            className={inputClass}
            placeholder="Jane Doe"
            value={patientName}
            onChange={(event) => setPatientName(event.target.value)}
            data-testid="patient-name"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Date</span>
            </div>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              data-testid="date"
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Time</span>
            </div>
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={(event) => setTime(event.target.value)}
              data-testid="time"
            />
          </label>
        </div>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Doctor</span>
          </div>
          <select
            className="select select-bordered w-full"
            value={doctor}
            onChange={(event) => setDoctor(event.target.value)}
            data-testid="doctor">
            {doctors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Reason</span>
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Describe your symptoms"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            data-testid="reason"
          />
        </label>
        {error && (
          <span className="text-error text-sm" data-testid="error">
            {error}
          </span>
        )}
        <button type="submit" className="btn btn-primary w-full">
          Book appointment
        </button>
      </div>
    </form>
  );
};
