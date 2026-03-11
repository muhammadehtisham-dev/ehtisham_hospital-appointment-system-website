import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: number;
  availability: string;
}

interface Appointment {
  id: number;
  doctor_name: string;
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '', specialization: '', experience: '', availability: '', image_url: '', description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, aptsRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/appointments/admin')
      ]);
      setDoctors(docsRes.data);
      setAppointments(aptsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctors', newDoctor);
      setShowAddDoctor(false);
      setNewDoctor({ name: '', specialization: '', experience: '', availability: '', image_url: '', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDoctor = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="container mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500 mt-2">Manage medical staff, appointments, and system settings.</p>
          </div>
          <button 
            onClick={() => setShowAddDoctor(true)}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100"
          >
            <Plus className="w-5 h-5" /> Add New Doctor
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Doctors Management */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="text-teal-600 w-6 h-6" /> Medical Staff
              </h2>
              <span className="text-sm font-bold text-slate-400">{doctors.length} Total</span>
            </div>
            <div className="divide-y divide-slate-100">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-sm text-teal-600 font-medium">{doc.specialization}</p>
                  </div>
                  <button 
                    onClick={() => deleteDoctor(doc.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* All Appointments */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Recent Appointments</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-6 hover:bg-slate-50 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-slate-900">{apt.patient_name}</span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{apt.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Doctor: {apt.doctor_name}</span>
                    <span>Date: {apt.appointment_date}</span>
                    <span>Time: {apt.appointment_time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Add New Medical Professional</h2>
            <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Doctor Name"
                  required
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Specialization"
                  required
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  placeholder="Years of Experience"
                  required
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Availability (e.g. Mon-Fri, 9AM-5PM)"
                  required
                  value={newDoctor.availability}
                  onChange={(e) => setNewDoctor({...newDoctor, availability: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newDoctor.image_url}
                  onChange={(e) => setNewDoctor({...newDoctor, image_url: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
                />
                <textarea
                  placeholder="Short Description"
                  value={newDoctor.description}
                  onChange={(e) => setNewDoctor({...newDoctor, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 h-[100px]"
                />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all"
                >
                  Save Doctor Profile
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
