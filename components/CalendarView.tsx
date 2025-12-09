
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Appointment, Patient } from '../types';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, User, Plus, X, Loader2, Check, CalendarClock, MapPin } from 'lucide-react';

export const CalendarView: React.FC = () => {
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarAppointments, setCalendarAppointments] = useState<Appointment[]>([]);
  
  // Today's List State (Separate so it stays visible even when browsing other months)
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDateSlot, setSelectedDateSlot] = useState<Date | null>(null);
  
  // Booking Form State
  const [patientSearch, setPatientSearch] = useState('');
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [bookingTime, setBookingTime] = useState('12:00');
  const [procedure, setProcedure] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchCalendarAppointments();
  }, [currentDate]);

  useEffect(() => {
    fetchTodaysAppointments();
  }, [showModal]); // Re-fetch today when a booking modal closes

  const fetchTodaysAppointments = async () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('appointments')
      .select('*, patients(full_name, file_number, phone)')
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: true });

    setTodaysAppointments(data || []);
  };

  const fetchCalendarAppointments = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1).toISOString();
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .select('*, patients(full_name, file_number, phone)')
      .gte('start_time', startOfMonth)
      .lte('start_time', endOfMonth);

    if (error) {
      console.error('Error fetching appointments:', error);
    } else {
      setCalendarAppointments(data || []);
    }
    setLoading(false);
  };

  const searchPatients = async (term: string) => {
    if (term.length < 2) {
      setPatientsList([]);
      return;
    }
    const { data } = await supabase
      .from('patients')
      .select('id, full_name, file_number, phone')
      .or(`full_name.ilike.%${term}%,file_number.eq.${term},phone.ilike.%${term}%`)
      .limit(5);
    
    setPatientsList(data || []);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDateSlot) return;

    setBookingLoading(true);

    const [hours, minutes] = bookingTime.split(':').map(Number);
    const startDate = new Date(selectedDateSlot);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); 

    const newAppointment = {
      patient_id: selectedPatient.id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      procedure: procedure,
      status: 'scheduled'
    };

    const { error } = await supabase.from('appointments').insert([newAppointment]);

    if (error) {
      alert('Error booking appointment: ' + error.message);
    } else {
      setShowModal(false);
      setPatientSearch('');
      setSelectedPatient(null);
      setProcedure('');
      fetchCalendarAppointments(); 
      fetchTodaysAppointments(); // Update sidebar immediately
    }
    setBookingLoading(false);
  };

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
  const startOffset = (firstDayOfMonth + 1) % 7; 

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: startOffset }, (_, i) => i);

  const getAppointmentsForDay = (day: number) => {
    return calendarAppointments.filter(app => {
      const appDate = new Date(app.start_time);
      return appDate.getDate() === day;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* 1. Today's Summary Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        <div className="bg-brand-gold text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <CalendarClock className="w-8 h-8 opacity-80" />
            <div>
              <h3 className="font-bold text-lg">مواعيد اليوم</h3>
              <p className="text-brand-gold/20 text-sm font-mono opacity-80">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold mt-4">
            {todaysAppointments.length} <span className="text-sm font-normal opacity-80">موعد</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[500px] overflow-y-auto">
           <div className="p-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm">
             قائمة الانتظار
           </div>
           {todaysAppointments.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4 text-center">
               <Check className="w-12 h-12 mb-2 opacity-20" />
               <p>لا توجد مواعيد مسجلة لليوم</p>
             </div>
           ) : (
             <div className="divide-y divide-gray-100">
               {todaysAppointments.map(app => (
                 <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                   <div className="flex justify-between items-start mb-1">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold font-mono">
                        {new Date(app.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded">{app.procedure}</span>
                   </div>
                   <div className="font-bold text-gray-800 mb-1">{app.patients?.full_name}</div>
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                     <User size={12} />
                     <span className="font-mono" dir="ltr">{app.patients?.phone}</span>
                     <span className="mx-1">•</span>
                     <span>#{app.patients?.file_number}</span>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>


      {/* 2. Main Calendar Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between bg-gray-50 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-brand-gold" />
            <h2 className="text-xl font-bold text-gray-800">الجدول الشهري</h2>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md"><ChevronRight /></button>
            <span className="font-bold text-lg min-w-[150px] text-center">
              {currentDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md"><ChevronLeft /></button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 bg-brand-gold/5 border-b border-brand-gold/10 text-center py-2 font-bold text-brand-gold text-sm">
          <div>السبت</div>
          <div>الأحد</div>
          <div>الإثنين</div>
          <div>الثلاثاء</div>
          <div>الأربعاء</div>
          <div>الخميس</div>
          <div>الجمعة</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
          {blanksArray.map(i => (
            <div key={`blank-${i}`} className="bg-gray-50 min-h-[120px]"></div>
          ))}

          {daysArray.map(day => {
            const dayApps = getAppointmentsForDay(day);
            const isToday = 
              day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div key={day} className={`bg-white min-h-[120px] p-2 flex flex-col gap-1 transition-colors hover:bg-blue-50 relative group ${isToday ? 'bg-blue-50/50' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-gold text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  <button 
                    onClick={() => {
                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      setSelectedDateSlot(date);
                      setShowModal(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-brand-gold hover:bg-brand-gold/10 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Appointments List (Calendar Cell) */}
                <div className="flex-1 overflow-y-auto space-y-1">
                  {dayApps.map(app => (
                    <div key={app.id} className="text-xs p-1.5 rounded bg-blue-100 border-l-2 border-blue-500 text-blue-900 truncate shadow-sm cursor-help" title={`${app.patients?.full_name} - ${app.procedure}`}>
                       <div className="flex items-center gap-1 font-bold">
                         <Clock size={10} />
                         {new Date(app.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                       </div>
                       <div className="truncate">{app.patients?.full_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-brand-gold p-4 flex justify-between items-center text-white">
               <h3 className="font-bold text-lg">حجز موعد جديد</h3>
               <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            
            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">التاريخ</label>
                 <div className="p-2 bg-gray-100 rounded text-gray-600 font-mono">
                   {selectedDateSlot?.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </div>
               </div>

               {/* Patient Search */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">المريض</label>
                  {selectedPatient ? (
                    <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                       <div className="flex items-center gap-2">
                         <Check size={16} />
                         <span className="font-bold">{selectedPatient.full_name}</span>
                       </div>
                       <button type="button" onClick={() => setSelectedPatient(null)} className="text-red-500 hover:text-red-700 text-sm">تغيير</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="ابحث بالإسم أو الرقم..."
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-gold outline-none"
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          searchPatients(e.target.value);
                        }}
                      />
                      {patientsList.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border shadow-lg rounded mt-1 max-h-40 overflow-y-auto z-10">
                          {patientsList.map(p => (
                            <div 
                              key={p.id} 
                              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-0"
                              onClick={() => {
                                setSelectedPatient(p);
                                setPatientsList([]);
                                setPatientSearch('');
                              }}
                            >
                               <div className="font-bold text-sm">{p.full_name}</div>
                               <div className="text-xs text-gray-500 flex justify-between">
                                  <span>#{p.file_number}</span>
                                  <span dir="ltr">{p.phone}</span>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
               </div>

               {/* Time Selection */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">الوقت</label>
                 <input 
                   type="time" 
                   required
                   value={bookingTime}
                   onChange={(e) => setBookingTime(e.target.value)}
                   className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-gold outline-none"
                 />
               </div>

               {/* Procedure */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">نوع الكشف / الإجراء</label>
                 <input 
                   type="text"
                   required
                   placeholder="مثال: كشف، حشو، خلع..." 
                   value={procedure}
                   onChange={(e) => setProcedure(e.target.value)}
                   className="w-full border p-2 rounded focus:ring-2 focus:ring-brand-gold outline-none"
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={bookingLoading || !selectedPatient}
                 className="w-full bg-brand-gold text-white py-3 rounded-lg font-bold hover:bg-yellow-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
               >
                 {bookingLoading ? <Loader2 className="animate-spin" /> : <Check />}
                 تأكيد الحجز
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
