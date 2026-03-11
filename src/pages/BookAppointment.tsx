import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  image_url: string;
}

export default function BookAppointment() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get('/doctors');
        const d = response.data.find((doc: any) => doc.id === Number(id));
        setDoctor(d);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/appointments', {
        doctor_id: id,
        appointment_date: date,
        appointment_time: time
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div className="p-20 text-center">Loading doctor details...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-teal-600 p-8 text-white flex flex-col items-center justify-center text-center">
              <img 
                src={doctor.image_url} 
                alt={doctor.name} 
                className="w-32 h-32 rounded-full border-4 border-white/20 mb-6 object-cover"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-bold">{doctor.name}</h2>
              <p className="text-teal-100">{doctor.specialization}</p>
              
              <div className="mt-8 space-y-4 w-full">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                  <User className="w-5 h-5" />
                  <span className="text-sm">Expert Consultation</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Verified Professional</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3 p-8 md:p-12">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-green-600 w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-slate-500">Redirecting to your dashboard...</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Schedule Appointment</h3>
                  
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        Select Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        Select Time Slot
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTime(t)}
                            className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                              time === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-200'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !date || !time}
                      className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 disabled:opacity-50 mt-8"
                    >
                      {loading ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
