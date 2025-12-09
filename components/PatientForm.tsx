
import React, { useState } from 'react';
import { Patient } from '../types';
import { supabase } from '../services/supabaseClient';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const PatientForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialState: Patient = {
    file_number: 'J-NEW', // Placeholder, will be ignored by DB
    full_name: '',
    dob: '',
    job: '',
    address: '',
    phone: '',
    email: '',
    medical_history: {
      highBloodPressure: false,
      diabetes: false,
      stomachUlcer: false,
      rheumaticFever: false,
      hepatitis: false,
      pregnancyOrNursing: false,
    },
    questions: {
      antibioticAllergy: false,
      anesthesiaAllergy: false,
      heartProblems: false,
      kidneyProblems: false,
      liverProblems: false,
      regularMedication: false,
    },
    medications: {
      bloodPressure: false,
      diabetes: false,
      bloodThinners: false,
      other: '',
    },
    total_cost: 0,
    visits: []
  };

  const [formData, setFormData] = useState<Patient>(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (section: keyof Patient, field: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        // @ts-ignore - dynamic key access
        ...prev[section],
        // @ts-ignore
        [field]: !prev[section][field]
      }
    }));
  };

  const handleOtherMedicationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      medications: {
        ...prev.medications,
        other: e.target.value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Remove file_number from the payload so the DB Sequence kicks in
      // The database will auto-generate the next number (1, 2, 3...)
      const { file_number, ...dataToSend } = formData;

      const { error: dbError } = await supabase
        .from('patients')
        .insert([dataToSend]);

      if (dbError) throw dbError;

      setSuccess(true);
      // Reset form
      setFormData(initialState);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      console.error('Error saving patient:', err);
      if (err.message && (err.message.includes('relation "public.patients" does not exist') || err.message.includes('Could not find the table'))) {
         setError('قاعدة البيانات غير جاهزة. يرجى التأكد من تشغيل كود SQL.');
      } else {
         setError(err.message || 'حدث خطأ أثناء حفظ البيانات.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header of Form */}
      <div className="bg-gray-50 p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">بيانات المريض</h2>
          <p className="text-gray-500 text-sm">Patient Registration Form</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-brand-gold/30 shadow-sm">
          <span className="text-gray-500 text-sm ml-2">الرقم (File No):</span>
          <span className="text-xl font-mono font-bold text-brand-gold">
             {/* Show "AUTO" to indicate it's generated automatically by DB */}
             AUTO
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 border border-green-200">
            <CheckCircle2 className="w-6 h-6" />
            <p className="font-bold">تم حفظ بيانات المريض بنجاح! (تم إنشاء رقم الملف تلقائياً)</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start gap-3">
             <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
             <div>
                <p className="font-bold">خطأ:</p>
                <p>{error}</p>
             </div>
          </div>
        )}

        {/* Section 1: Personal Data */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-brand-gold rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">البيانات الشخصية</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">الإسم (رباعي)</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                placeholder="أدخل الإسم بالكامل"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">تاريخ الميلاد</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">الوظيفة</label>
              <input
                type="text"
                name="job"
                value={formData.job}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">العنوان</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">رقم التليفون</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all text-left"
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Section 2: Medical History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1 h-6 bg-brand-gold rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">التاريخ الطبي</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">هل تعاني من أي الحالات الطبية الآتية؟</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'highBloodPressure', label: 'الضغط المرتفع' },
              { key: 'diabetes', label: 'السكر' },
              { key: 'stomachUlcer', label: 'قرحة المعدة' },
              { key: 'rheumaticFever', label: 'الحمى الروماتزمية' },
              { key: 'hepatitis', label: 'الالتهاب الكبدي الوبائي' },
              { key: 'pregnancyOrNursing', label: 'الحمل أو الرضاعة' },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-400 checked:bg-brand-gold checked:border-brand-gold transition-all"
                    // @ts-ignore
                    checked={formData.medical_history[item.key]}
                    onChange={() => handleCheckboxChange('medical_history', item.key)}
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Section 3: Questions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-brand-gold rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">أسئلة عامة</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'antibioticAllergy', label: 'هل تعاني من الحساسية ضد أي من المضادات الحيوية؟' },
              { key: 'anesthesiaAllergy', label: 'هل تعاني من الحساسية من البنج الموضعي؟' },
              { key: 'heartProblems', label: 'هل تعاني من مشاكل صحية بالقلب؟' },
              { key: 'kidneyProblems', label: 'هل تعاني من مشاكل صحية بالكلية؟' },
              { key: 'liverProblems', label: 'هل تعاني من مشاكل صحية بالكبد؟' },
              { key: 'regularMedication', label: 'هل تتعاطى أي علاج بانتظام؟' },
            ].map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium mb-2 sm:mb-0">{item.label}</span>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q_${item.key}`}
                      // @ts-ignore
                      checked={formData.questions[item.key] === true}
                      onChange={() => setFormData(prev => ({
                        ...prev, questions: { ...prev.questions, [item.key]: true }
                      }))}
                      className="w-4 h-4 text-brand-gold focus:ring-brand-gold"
                    />
                    <span>نعم</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q_${item.key}`}
                       // @ts-ignore
                      checked={formData.questions[item.key] === false}
                       onChange={() => setFormData(prev => ({
                        ...prev, questions: { ...prev.questions, [item.key]: false }
                      }))}
                      className="w-4 h-4 text-brand-gold focus:ring-brand-gold"
                    />
                    <span>لا</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

         <hr className="border-gray-200" />

        {/* Section 4: Medications */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-brand-gold rounded-full"></div>
            <h3 className="text-lg font-bold text-gray-800">الأدوية الحالية</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
             {[
              { key: 'bloodPressure', label: 'علاج الضغط' },
              { key: 'diabetes', label: 'علاج السكر' },
              { key: 'bloodThinners', label: 'علاج السيولة' },
            ].map((item) => (
               <label key={item.key} className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-brand-gold cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded text-brand-gold focus:ring-brand-gold"
                     // @ts-ignore
                    checked={formData.medications[item.key]}
                    onChange={() => handleCheckboxChange('medications', item.key)}
                  />
                  <span className="text-gray-700">{item.label}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <label className="text-gray-700 font-semibold whitespace-nowrap">علاج آخر:</label>
            <input
              type="text"
              value={formData.medications.other}
              onChange={handleOtherMedicationChange}
              placeholder="أذكره هنا..."
              className="flex-1 px-4 py-2 border-b-2 border-gray-300 focus:border-brand-gold outline-none bg-transparent transition-colors"
            />
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 mt-8 border-t-2 border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand-gold hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            <span>حفظ البيانات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
