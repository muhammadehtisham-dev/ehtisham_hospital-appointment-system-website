import { motion } from 'framer-motion';
import { Activity, Calendar, MessageSquare, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 text-center md:text-left z-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Your Health, <span className="text-teal-600">Our Priority</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg">
              Experience world-class healthcare with our expert doctors. Book appointments easily and manage your health journey with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/doctors" className="px-8 py-4 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 text-center">
                Book Appointment
              </Link>
              <Link to="/signup" className="px-8 py-4 bg-white text-teal-600 border-2 border-teal-600 rounded-full font-semibold hover:bg-teal-50 transition-all text-center">
                Join Now
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="md:w-1/2 mt-12 md:mt-0 relative"
          >
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                alt="Doctor" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Specialized Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We offer a wide range of medical services provided by top-tier professionals in the industry.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Emergency Care", desc: "24/7 emergency services with immediate response teams." },
              { icon: Users, title: "Expert Doctors", desc: "Consult with highly qualified specialists in various fields." },
              { icon: Calendar, title: "Easy Booking", desc: "Schedule your visits in seconds with our intuitive system." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="text-teal-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot Promo */}
      <section className="py-24 bg-teal-600 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 z-10">
            <h2 className="text-4xl font-bold mb-6">Meet Your AI Health Assistant</h2>
            <p className="text-xl text-teal-50 mb-8">
              Need help booking? Not sure which doctor to see? Our AI chatbot is available 24/7 to guide you through the process.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-teal-600" alt="User" />
                ))}
              </div>
              <span className="text-sm font-medium">Trusted by 5,000+ patients</span>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center z-10">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 w-full max-w-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">AI Assistant Online</span>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-white/20 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                  Hello! How can I help you today?
                </div>
                <div className="bg-teal-500 p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto">
                  I want to book an appointment with a cardiologist.
                </div>
                <div className="bg-white/20 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                  Sure! Dr. Sarah Johnson is available on Monday. Would you like to proceed?
                </div>
              </div>
              <div className="relative">
                <input type="text" placeholder="Type your message..." className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-3 focus:outline-none focus:bg-white/20" disabled />
                <button className="absolute right-2 top-1.5 p-2 bg-white text-teal-600 rounded-full">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
      </section>
    </div>
  );
}
