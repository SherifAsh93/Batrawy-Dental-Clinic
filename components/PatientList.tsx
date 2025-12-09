
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Patient, Visit } from '../types';
import { CalendarView } from './CalendarView';
import { Loader2, Search, FileText, X, User, Calendar, Briefcase, MapPin, Phone, Mail, Activity, AlertCircle, Pill, Check, Trash2, Plus, DollarSign, Wallet, Save, LayoutGrid, List } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Financial State
  // Changed to allow string (empty) so the input can be blank instead of 0
  const [tempTotalCost, setTempTotalCost] = useState<number | string>(''); 
  const [updatingCost, setUpdatingCost] = useState(false);
  const [addingVisit, setAddingVisit] = useState(false);
  const [newVisit, setNewVisit] = useState<Partial<Visit>>({
    visit_date: new Date().toISOString().split('T')[0],
    procedure: '',
    paid_amount: 0
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      // If the cost is 0, show empty string to keep UI clean
      setTempTotalCost(selectedPatient.total_cost === 0 ? '' : selectedPatient.total_cost);
    }
  }, [selectedPatient]);

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

  const handleUpdateTotalCost = async () => {
    if (!selectedPatient?.id) return;
    setUpdatingCost(true);
    
    // Convert empty string back to 0 for database
    const costToSave = tempTotalCost === '' ? 0 : Number(tempTotalCost);

    try {
       const { error } = await supabase
        .from('patients')
        .update({ total_cost: costToSave })
        .eq('id', selectedPatient.id);

      if (error) throw error;
      
      // Update local state
      const updatedPatient = { ...selectedPatient, total_cost: costToSave };
      setSelectedPatient(updatedPatient);
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
      
    } catch (err) {
      console.error("Error updating total cost", err);
      alert("حدث خطأ أثناء تحديث التكلفة");
    } finally {
      setUpdatingCost(false);
    }
  };

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient?.id || !newVisit.procedure) return;
    setAddingVisit(true);

    try {
      const newVisitData: Visit = {
        id: crypto.randomUUID(),
        visit_date: newVisit.visit_date!,
        procedure: newVisit.procedure,
        paid_amount: Number(newVisit.paid_amount) || 0,
      };

      const updatedVisits = [newVisitData, ...(selectedPatient.visits || [])];

      const { error } = await supabase
        .from('patients')
        .update({ visits: updatedVisits })
        .eq('id', selectedPatient.id);

      if (error) throw error;

      // Update local state
      const updatedPatient = { ...selectedPatient, visits: updatedVisits };
      setSelectedPatient(updatedPatient);
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));

      // Reset Form
      setNewVisit({
        visit_date: new Date().toISOString().split('T')[0],
        procedure: '',
        paid_amount: 0,
      });

    } catch (err) {
      console.error("Error adding visit", err);
      alert("حدث خطأ أثناء إضافة الزيارة");
    } finally {
      setAddingVisit(false);
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!selectedPatient?.id) return;
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;

    try {
      const updatedVisits = selectedPatient.visits.filter(v => v.id !== visitId);
      
      const { error } = await supabase
        .from('patients')
        .update({ visits: updatedVisits })
        .eq('id', selectedPatient.id);

      if (error) throw error;

      // Update local state
      const updatedPatient = { ...selectedPatient, visits: updatedVisits };
      setSelectedPatient(updatedPatient);
      setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));

    } catch (err) {
      console.error("Error deleting visit", err);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!window.confirm('هل أنت متأكد من حذف هذا المريض نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setDeletingId(id);
    try {
      // 1. Attempt delete
      const { error, count } = await supabase
        .from('patients')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) throw error;

      // 2. Verification Check: Explicitly check if it's gone
      // Sometimes RLS policies return success but don't delete if checks fail.
      const { data: checkData } = await supabase
        .from('patients')
        .select('id')
        .eq('id', id);
        
      if (checkData && checkData.length > 0) {
        throw new Error("Deletion permission denied. Check database policies.");
      }

      // 3. Update UI only if confirmed gone
      setPatients(prev => prev.filter(p => p.id !== id));
      
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
      }
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      alert('لا يمكن حذف المريض. قد لا تملك الصلاحيات الكافية، أو حدث خطأ في الاتصال.\n\nError: ' + (err.message || 'Unknown'));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.file_number.includes(searchTerm)
  );

  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? <Check size={12} /> : <X size={12} />}
      {active ? 'نعم' : 'لا'}
    </span>
  );

  // Financial Calculations
  const currentTotalCost = selectedPatient?.total_cost || 0;
  const totalPaid = selectedPatient?.visits?.reduce((sum, v) => sum + (v.paid_amount || 0), 0) || 0;
  const remainingBalance = currentTotalCost - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header with Search and View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-brand-gold" />
          سجل المرضى
        </h2>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List size={18} />
            <span>قائمة</span>
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={18} />
            <span>جدول مواعيد</span>
          </button>
        </div>

        {viewMode === 'list' && (
          <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث بالإسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        /* List View */
        loading ? (
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
        )
      )}

      {/* Patient Detail Modal (Unchanged) */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedPatient(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-brand-gold text-white p-6 sticky top-0 z-10 flex justify-between items-start shadow-md">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Medical Info */}
                <div className="space-y-6">
                   {/* Medical History */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="text-brand-gold" />
                      <h3 className="text-lg font-bold text-gray-800">التاريخ الطبي</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(MEDICAL_HISTORY_LABELS).map(([key, label]) => {
                        // @ts-ignore
                        const isActive = selectedPatient.medical_history[key];
                        return (
                          <div key={key} className={`p-2 rounded-lg border text-sm ${isActive ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-center`}>
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
                          <div key={key} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-0 text-sm">
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
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(MEDICATIONS_LABELS).map(([key, label]) => {
                            // @ts-ignore
                            const isActive = selectedPatient.medications[key];
                            if (!isActive) return null;
                            return (
                              <span key={key} className="bg-white border border-brand-gold/30 text-brand-gold px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                {label}
                              </span>
                            );
                          })}
                          {!Object.entries(MEDICATIONS_LABELS).some(([key]) => 
                            // @ts-ignore
                            selectedPatient.medications[key]
                          ) && !selectedPatient.medications.other && (
                            <span className="text-gray-500 italic text-sm">لا يوجد أدوية مسجلة</span>
                          )}
                      </div>
                      
                      {selectedPatient.medications.other && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500 block mb-1">علاج آخر:</span>
                          <p className="text-gray-900 font-medium text-sm">{selectedPatient.medications.other}</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Financials & Visits */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 h-fit">
                  <div className="flex items-center gap-2 mb-6">
                    <Wallet className="text-brand-gold w-6 h-6" />
                    <h3 className="text-xl font-bold text-gray-800">الحسابات والمدفوعات</h3>
                  </div>

                  {/* 1. Total Agreed Cost Input */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <label className="text-blue-800 font-bold text-sm block mb-2">إجمالي تكلفة العلاج المتفق عليها:</label>
                    <div className="flex gap-2">
                       <input 
                         type="number" 
                         value={tempTotalCost}
                         onChange={(e) => setTempTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                         className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-400"
                         placeholder="أدخل المبلغ الكلي هنا"
                       />
                       <button 
                         onClick={handleUpdateTotalCost}
                         disabled={updatingCost}
                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                       >
                         {updatingCost ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                         حفظ
                       </button>
                    </div>
                  </div>

                  {/* 2. Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-100 border border-green-200 rounded-xl p-4 text-center">
                       <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">تم دفع (Paid)</p>
                       <p className="text-xl font-bold text-green-700">{totalPaid.toLocaleString()} ج.م</p>
                    </div>
                    <div className="bg-red-100 border border-red-200 rounded-xl p-4 text-center">
                       <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-1">متبقي (Remaining)</p>
                       <p className="text-xl font-bold text-red-700">{remainingBalance.toLocaleString()} ج.م</p>
                    </div>
                  </div>
                  
                  {/* 3. Add New Visit Form */}
                  <form onSubmit={handleAddVisit} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                       <Plus size={16} /> تسجيل زيارة / دفع مبلغ
                    </h4>
                    <div className="space-y-3">
                       <div className="grid grid-cols-3 gap-3">
                         <input 
                           type="date" 
                           required
                           className="col-span-1 border rounded px-3 py-2 text-sm"
                           value={newVisit.visit_date}
                           onChange={e => setNewVisit({...newVisit, visit_date: e.target.value})}
                         />
                         <input 
                           type="text" 
                           placeholder="الإجراء (Procedure)"
                           required
                           className="col-span-2 border rounded px-3 py-2 text-sm"
                           value={newVisit.procedure}
                           onChange={e => setNewVisit({...newVisit, procedure: e.target.value})}
                         />
                       </div>
                       <div className="flex gap-3">
                         <div className="relative flex-1">
                            <input 
                              type="number" 
                              placeholder="المبلغ المدفوع اليوم"
                              className="border rounded w-full px-3 py-2 text-sm pl-8 font-bold text-green-700"
                              value={newVisit.paid_amount || ''}
                              onChange={e => setNewVisit({...newVisit, paid_amount: parseFloat(e.target.value)})}
                            />
                            <span className="absolute left-2 top-2 text-gray-400 text-xs">ج.م</span>
                         </div>
                         <button 
                           type="submit" 
                           disabled={addingVisit}
                           className="bg-brand-gold text-white rounded px-6 py-2 text-sm font-bold hover:bg-yellow-700 transition-colors disabled:opacity-50"
                         >
                           {addingVisit ? <Loader2 className="animate-spin" size={16} /> : 'إضافة'}
                         </button>
                       </div>
                    </div>
                  </form>

                  {/* 4. Visits Table */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-brand-gold/10 text-gray-700 font-bold">
                        <tr>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">الإجراء</th>
                          <th className="p-3 text-green-700">مدفوع</th>
                          <th className="p-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(!selectedPatient.visits || selectedPatient.visits.length === 0) ? (
                           <tr><td colSpan={4} className="p-4 text-center text-gray-400">لا يوجد زيارات مسجلة</td></tr>
                        ) : (
                          selectedPatient.visits.map(visit => (
                            <tr key={visit.id} className="group hover:bg-gray-50">
                              <td className="p-3">{visit.visit_date}</td>
                              <td className="p-3 font-medium">{visit.procedure}</td>
                              <td className="p-3 text-green-700 font-mono font-bold">{visit.paid_amount}</td>
                              <td className="p-3 text-left">
                                <button 
                                  onClick={() => handleDeleteVisit(visit.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button
                onClick={(e) => handleDelete(selectedPatient.id!, e)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span>حذف السجل نهائياً</span>
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
