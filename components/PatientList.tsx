import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Patient } from '../types';
import { Loader2, Search, FileText, X, User, Calendar, Briefcase, MapPin, Phone, Mail, Activity, AlertCircle, Pill, Check, Trash2 } from 'lucide-react';

// Label Mappings (matching the form)
const MEDICAL_HISTORY_LABELS: Record<string, string> = {
  highBloodPressure: 'الضغط المرتفع',
  diabetes: 'السكر',
  stomachUlcer: 'قرحة المعدة',
  rheumaticFever: 'الحمى الروماتزمية',
  hepatitis: 'الالتهاب الكبدي الوبائي',
  pregnancyOrNursing: 'الحمل أو الرضاعة',
};

const QUESTIONS_LABELS: Record<string, string> = {
  antibioticAllergy: 'حساسية ضد المضادات الحيوية',
  anesthesiaAllergy: 'حساسية من البنج الموضعي',
  heartProblems: 'مشاكل صحية بالقلب',
  kidneyProblems: 'مشاكل صحية بالكلية',
  liverProblems: 'مشاكل صحية بالكبد',
  regularMedication: 'يتعاطى علاج بانتظام',
};

const MEDICATIONS_LABELS: Record<string, string> = {
  bloodPressure: 'علاج الضغط',
  diabetes: 'علاج السكر',
  bloodThinners: 'علاج السيولة',
};

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    // Stop the row click event so the modal doesn't open
    if (e) e.stopPropagation();

    if (!window.confirm('هل أنت متأكد من حذف هذا المريض نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local list
      setPatients(prev => prev.filter(p => p.id !== id));
      
      // If the deleted patient was open in modal, close it
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Error deleting patient:', err);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.file_number.includes(searchTerm)
  );

  // Helper to render boolean status with color
  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? <Check size={12} /> : <X size={12} />}
      {active ? 'نعم' : 'لا'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-brand-gold" />
          سجل المرضى
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث بالإسم أو الرقم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none"
          />
        </div>
      </div>

      {/* Table List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">الرقم</th>
                  <th className="px-6 py-4">الإسم</th>
                  <th className="px-6 py-4">التليفون</th>
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">تاريخ التسجيل</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => setSelectedPatient(patient)}
                      className="hover:bg-brand-gold/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-brand-gold font-bold group-hover:underline">
                        {patient.file_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{patient.full_name}</td>
                      <td className="px-6 py-4 text-gray-600" dir="ltr">{patient.phone}</td>
                      <td className="px-6 py-4 text-gray-600">{patient.address}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString('ar-EG') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleDelete(patient.id!, e)}
                          disabled={deletingId === patient.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="حذف المريض"
                        >
                          {deletingId === patient.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      لا يوجد مرضى مطابقين للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-brand-gold text-white p-6 sticky top-0 z-10 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedPatient.full_name}</h2>
                <div className="flex items-center gap-2 opacity-90">
                  <span className="font-mono bg-white/20 px-2 py-0.5 rounded">#{selectedPatient.file_number}</span>
                  <span className="text-sm">ملف مريض</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              
              {/* Personal Info Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="flex items-start gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-brand-gold mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">تاريخ الميلاد</p>
                      <p className="font-semibold">{selectedPatient.dob || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 text-gray-700">
                    <Briefcase className="w-5 h-5 text-brand-gold mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">الوظيفة</p>
                      <p className="font-semibold">{selectedPatient.job || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-brand-gold mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">التليفون</p>
                      <p className="font-semibold" dir="ltr">{selectedPatient.phone || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-brand-gold mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">العنوان</p>
                      <p className="font-semibold">{selectedPatient.address || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 text-gray-700 md:col-span-2">
                    <Mail className="w-5 h-5 text-brand-gold mt-1" />
                    <div>
                      <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                      <p className="font-semibold" dir="ltr">{selectedPatient.email || '-'}</p>
                    </div>
                 </div>
              </section>

              <hr className="border-gray-100" />

              {/* Medical History */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-brand-gold" />
                  <h3 className="text-lg font-bold text-gray-800">التاريخ الطبي</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(MEDICAL_HISTORY_LABELS).map(([key, label]) => {
                    // @ts-ignore
                    const isActive = selectedPatient.medical_history[key];
                    return (
                      <div key={key} className={`p-3 rounded-lg border ${isActive ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-center`}>
                        <span className={isActive ? 'text-gray-900 font-semibold' : 'text-gray-500'}>{label}</span>
                        <StatusBadge active={isActive} />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Questions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-brand-gold" />
                  <h3 className="text-lg font-bold text-gray-800">أسئلة طبية</h3>
                </div>
                <div className="space-y-2">
                   {Object.entries(QUESTIONS_LABELS).map(([key, label]) => {
                    // @ts-ignore
                    const isActive = selectedPatient.questions[key];
                    return (
                      <div key={key} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{label}</span>
                         <StatusBadge active={isActive} />
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Medications */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="text-brand-gold" />
                  <h3 className="text-lg font-bold text-gray-800">الأدوية</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex flex-wrap gap-3 mb-4">
                     {Object.entries(MEDICATIONS_LABELS).map(([key, label]) => {
                        // @ts-ignore
                        const isActive = selectedPatient.medications[key];
                        if (!isActive) return null;
                        return (
                          <span key={key} className="bg-white border border-brand-gold/30 text-brand-gold px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            {label}
                          </span>
                        );
                      })}
                      {/* Check if no checkbox meds are selected */}
                      {!Object.entries(MEDICATIONS_LABELS).some(([key]) => 
                        // @ts-ignore
                        selectedPatient.medications[key]
                      ) && !selectedPatient.medications.other && (
                        <span className="text-gray-500 italic">لا يوجد أدوية مسجلة</span>
                      )}
                  </div>
                  
                  {selectedPatient.medications.other && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500 block mb-1">علاج آخر:</span>
                      <p className="text-gray-900 font-medium">{selectedPatient.medications.other}</p>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={(e) => handleDelete(selectedPatient.id!, e)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span>حذف السجل</span>
              </button>
              
              <button 
                onClick={() => setSelectedPatient(null)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};