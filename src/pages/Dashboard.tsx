import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Appointment {
  id: number;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/patient');
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.name}</h1>
            <p className="text-slate-500 mt-2">Manage your health appointments and medical history.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-teal-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Appointments</p>
                <p className="text-xl font-bold text-slate-900">{appointments.length}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-bottom border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
              </div>
              
              {loading ? (
                <div className="p-12 text-center text-slate-500">Loading appointments...</div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="text-slate-300 w-10 h-10" />
                  </div>
                  <p className="text-slate-500">No appointments found. Start by booking one!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center">
                          <User className="text-teal-600 w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{apt.doctor_name}</h3>
                          <p className="text-sm text-slate-500">{apt.specialization}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          {apt.appointment_date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4" />
                          {apt.appointment_time}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      
                      {apt.status === 'pending' && (
                        <button 
                          onClick={() => cancelAppointment(apt.id)}
                          className="text-red-500 font-semibold hover:text-red-700 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-teal-100">
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-teal-50 mb-6">Our AI Assistant is ready to help you book or manage your appointments.</p>
              <button className="w-full py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-all">
                Open Chatbot
              </button>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Health Tips</h3>
              <div className="space-y-6">
                {[
                  "Stay hydrated: Drink at least 8 glasses of water daily.",
                  "Regular exercise: Aim for 30 minutes of activity.",
                  "Better sleep: Maintain a consistent sleep schedule."
                ].map((tip, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                    <p className="text-slate-600 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
