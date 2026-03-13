import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import emailjs from '@emailjs/browser';

const ADMIN_EMAIL      = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_WHATSAPP   = process.env.REACT_APP_ADMIN_WHATSAPP;
const EMAILJS_SERVICE  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE = process.env.REACT_APP_EMAILJS_ADMIN_TEMPLATE_ID;
const EMAILJS_KEY      = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const BASE_URL         = process.env.REACT_APP_BASE_URL || window.location.origin;

const VEHICLE_OPTIONS = ['On foot', 'Bicycle', 'Motorbike', 'Car', 'Van'];
const HULL_ZONES = ['HU1','HU2','HU3','HU4','HU5','HU6','HU7','HU8','HU9','HU10','HU11','HU12','HU13','HU14','HU15','HU16','HU17'];

const STEPS = ['Personal Info', 'Address & Area', 'Experience', 'Documents', 'Review & Submit'];

const empty = {
  fullName: '', phone: '', email: '', dob: '',
  address: '', city: 'Hull', postcode: '', preferredZones: [],
  vehicleType: '', hasInsurance: false,
  experience: '', whyBuddy: '', availableWeekdays: false, availableWeekends: false, availableEvenings: false,
  emergencyName: '', emergencyPhone: '', emergencyRelation: '',
  niNumber: '',
  agreeTerms: false, agreeBackground: false, agreeInsurance: false,
};

const STORAGE_KEY = 'buddyApplyDraft';

export default function BuddyApply() {
  const { theme } = useTheme();
  const [step, setStep] = useState(() => {
    try { return parseInt(sessionStorage.getItem(STORAGE_KEY + '_step') || '0', 10); } catch { return 0; }
  });
  const [form, setForm] = useState(() => {
    try { const saved = sessionStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : empty; } catch { return empty; }
  });
  const [idFile, setIdFile]     = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [idPreview, setIdPreview]   = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError] = useState('');
  const idRef     = useRef();
  const selfieRef = useRef();

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY + '_step', String(step)); } catch {}
  }, [step]);

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const toggleZone = (z) => setForm(f => ({
    ...f,
    preferredZones: f.preferredZones.includes(z)
      ? f.preferredZones.filter(x => x !== z)
      : [...f.preferredZones, z]
  }));

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) { setError('Only JPG, PNG, WebP or PDF files are allowed.'); e.target.value = ''; return; }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); e.target.value = ''; return; }
    const preview = file.type === 'application/pdf' ? null : URL.createObjectURL(file);
    if (type === 'id')     { setIdFile(file);     setIdPreview(preview); }
    if (type === 'selfie') { setSelfieFile(file); setSelfiePreview(preview); }
    setError('');
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName.trim()) return 'Please enter your full name';
      if (!form.phone.trim())    return 'Please enter your phone number';
      if (!form.email.trim())    return 'Please enter your email';
      if (!form.dob)             return 'Please enter your date of birth';
    }
    if (step === 1) {
      if (!form.address.trim())  return 'Please enter your address';
      if (!form.postcode.trim()) return 'Please enter your postcode';
      if (!form.vehicleType)     return 'Please select your vehicle type';
    }
    if (step === 2) {
      if (!form.whyBuddy.trim()) return 'Please tell us why you want to be a Buddy';
      if (!form.emergencyName.trim()) return 'Please enter emergency contact name';
      if (!form.emergencyPhone.trim()) return 'Please enter emergency contact number';
      if (!form.niNumber.trim()) return 'Please enter your National Insurance number';
    }
    if (step === 3) {
      if (!idFile)     return 'Please upload your photo ID';
      if (!selfieFile) return 'Please upload your selfie photo';
    }
    if (step === 4) {
      if (!form.agreeTerms)      return 'Please agree to our Terms of Service';
      if (!form.agreeBackground) return 'Please agree to the background check';
      if (!form.agreeInsurance)  return 'Please confirm you understand the insurance requirements';
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const uploadWithTimeout = async (storageRef, file, ms = 30000) => {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out')), ms)
    );
    await Promise.race([uploadBytes(storageRef, file), timeout]);
    return getDownloadURL(storageRef);
  };

  const submit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError('');
    try {
      let idUrl = '', selfieUrl = '';

      // Upload files to Firebase Storage (non-blocking if Storage rules reject)
      if (idFile) {
        try {
          const idRef2 = ref(storage, `buddy-applications/${Date.now()}-id-${idFile.name}`);
          idUrl = await uploadWithTimeout(idRef2, idFile);
        } catch { /* save application even if photo upload fails */ }
      }
      if (selfieFile) {
        try {
          const sRef = ref(storage, `buddy-applications/${Date.now()}-selfie-${selfieFile.name}`);
          selfieUrl = await uploadWithTimeout(sRef, selfieFile);
        } catch { /* save application even if photo upload fails */ }
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'applications'), {
        ...form,
        idPhotoUrl: idUrl,
        selfieUrl: selfieUrl,
        status: 'pending',
        tier: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send email notification via EmailJS
      if (EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_KEY && ADMIN_EMAIL) {
        try {
          await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            to_email:       ADMIN_EMAIL,
            applicant_name: form.fullName,
            applicant_email: form.email,
            applicant_phone: form.phone,
            vehicle:         form.vehicleType,
            postcode:        form.postcode,
            application_id:  docRef.id,
            admin_link:      `${BASE_URL}/admin`,
          }, EMAILJS_KEY);
        } catch {
          // Non-critical — don't block submission if email fails
        }
      }

      // WhatsApp notification (opens in new tab)
      if (ADMIN_WHATSAPP) {
        const waMsg = encodeURIComponent(`🆕 New Buddy Application!\n\nName: ${form.fullName}\nPhone: ${form.phone}\nPostcode: ${form.postcode}\nVehicle: ${form.vehicleType}\n\nReview: ${BASE_URL}/admin`);
        window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${waMsg}`, '_blank');
      }

      try { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(STORAGE_KEY + '_step'); } catch {}
      setSubmitted(true);
    } catch (e) {
      const msg = e?.code === 'permission-denied'
        ? 'Permission denied saving application. Please try again or email hello@onlybuddy.co.uk'
        : e?.message || 'Something went wrong. Please try again or email hello@onlybuddy.co.uk';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 24, padding: 48 }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: theme.green, fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>Application Submitted!</h1>
        <p style={{ fontSize: 16, color: theme.muted, lineHeight: 1.7, marginBottom: 24 }}>
          Thanks <strong style={{ color: theme.text }}>{form.fullName}</strong>! We've received your application and will review it within <strong style={{ color: theme.text }}>2–3 business days</strong>.
        </p>
        <div style={{ background: theme.primaryBg, border: `1px solid ${theme.primary}33`, borderRadius: 14, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: theme.primary, marginBottom: 10 }}>What happens next:</div>
          {[
            '✅ We review your application and documents',
            '📱 We call you on ' + form.phone + ' within 2–3 days',
            '🔍 You\'ll need to complete a DBS check (£18 — you arrange this at gov.uk/dbs)',
            '🎓 Short online onboarding session',
            '🚀 Start earning within a week!',
          ].map(s => <div key={s} style={{ fontSize: 13, color: theme.text2, marginBottom: 6 }}>{s}</div>)}
        </div>
        <div style={{ fontSize: 13, color: theme.muted }}>Questions? Email <strong>hello@onlybuddy.co.uk</strong> or WhatsApp us.</div>
      </div>
    </div>
  );

  const inputStyle = { width: '100%', background: theme.card2, border: `1.5px solid ${theme.border}`, borderRadius: 10, padding: '11px 14px', color: theme.text, fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: theme.muted, letterSpacing: 0.5, display: 'block', marginBottom: 6, textTransform: 'uppercase' };

  return (
    <div style={{ background: theme.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Join the Team</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>Become a Buddy</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 500, margin: '0 auto' }}>Earn £10–£18/hr on your own schedule. Join Hull's fastest growing errand platform.</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {['✓ Set your own hours', '✓ Weekly pay', '✓ Free to join', '✓ Work across all of Hull'].map(f => (
            <div key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= step ? theme.primary : theme.border, color: i <= step ? '#fff' : theme.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, margin: '0 auto 4px' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 10, color: i === step ? theme.primary : theme.muted, fontWeight: i === step ? 700 : 400, display: 'none' }} className="step-label">{s}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(step / (STEPS.length - 1)) * 100}%`, background: `linear-gradient(90deg, ${theme.primaryDark}, ${theme.primary})`, borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 8 }}>Step {step + 1} of {STEPS.length}: <strong style={{ color: theme.text }}>{STEPS[step]}</strong></div>
        </div>

        <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: '32px 28px' }}>

          {/* STEP 0: Personal Info */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input style={inputStyle} placeholder="e.g. James Smith" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth *</label>
                  <input type="date" style={inputStyle} value={form.dob} onChange={e => set('dob', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input style={inputStyle} placeholder="e.g. 07712 345678" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" style={inputStyle} placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>National Insurance Number *</label>
                <input style={inputStyle} placeholder="e.g. AB 12 34 56 C" value={form.niNumber} onChange={e => set('niNumber', e.target.value.toUpperCase())} />
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>Required for HMRC self-employment registration. Stored securely and encrypted.</div>
              </div>
            </div>
          )}

          {/* STEP 1: Address & Area */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Address & Work Area</h2>
              <div>
                <label style={labelStyle}>Home Address *</label>
                <input style={inputStyle} placeholder="e.g. 14 Newland Avenue" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={form.city} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Postcode *</label>
                  <input style={inputStyle} placeholder="e.g. HU5 2RQ" value={form.postcode} onChange={e => set('postcode', e.target.value.toUpperCase())} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Vehicle Type *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {VEHICLE_OPTIONS.map(v => (
                    <button key={v} onClick={() => set('vehicleType', v)} style={{ padding: '10px 18px', borderRadius: 10, border: `1.5px solid ${form.vehicleType === v ? theme.primary : theme.border}`, background: form.vehicleType === v ? theme.primaryBg : theme.card2, color: form.vehicleType === v ? theme.primary : theme.text2, fontWeight: form.vehicleType === v ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                      {v === 'On foot' ? '🚶' : v === 'Bicycle' ? '🚲' : v === 'Motorbike' ? '🏍️' : v === 'Car' ? '🚗' : '🚐'} {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Preferred Hull Zones (select all you can cover)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {HULL_ZONES.map(z => (
                    <button key={z} onClick={() => toggleZone(z)} style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${form.preferredZones.includes(z) ? theme.primary : theme.border}`, background: form.preferredZones.includes(z) ? theme.primaryBg : theme.card2, color: form.preferredZones.includes(z) ? theme.primary : theme.muted, fontWeight: form.preferredZones.includes(z) ? 700 : 500, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Availability</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[['availableWeekdays', '📅 Weekdays'], ['availableWeekends', '🎉 Weekends'], ['availableEvenings', '🌙 Evenings']].map(([field, label]) => (
                    <button key={field} onClick={() => set(field, !form[field])} style={{ padding: '10px 18px', borderRadius: 10, border: `1.5px solid ${form[field] ? theme.primary : theme.border}`, background: form[field] ? theme.primaryBg : theme.card2, color: form[field] ? theme.primary : theme.text2, fontWeight: form[field] ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Experience */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Experience & References</h2>
              <div>
                <label style={labelStyle}>Previous Relevant Experience</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} placeholder="e.g. 2 years as a delivery driver for Amazon, worked in retail at Tesco..." value={form.experience} onChange={e => set('experience', e.target.value)} rows={4} />
              </div>
              <div>
                <label style={labelStyle}>Why do you want to be a Buddy? *</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} placeholder="Tell us a bit about yourself and why you'd make a great Buddy..." value={form.whyBuddy} onChange={e => set('whyBuddy', e.target.value)} rows={4} />
              </div>
              <div style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 14, padding: '20px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>🆘 Emergency Contact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input style={inputStyle} placeholder="e.g. Sarah Smith" value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Relationship</label>
                      <input style={inputStyle} placeholder="e.g. Partner, Parent" value={form.emergencyRelation} onChange={e => set('emergencyRelation', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input style={inputStyle} placeholder="07712 345678" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Documents */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Upload Documents</h2>
              <div style={{ background: theme.primaryBg, border: `1px solid ${theme.primary}33`, borderRadius: 12, padding: 16, fontSize: 13, color: theme.text2, lineHeight: 1.6 }}>
                🔒 Your documents are <strong>encrypted and stored securely</strong> on Firebase. They are only used for identity verification and are never shared with third parties.
              </div>

              {/* Photo ID Upload */}
              <div>
                <label style={labelStyle}>Photo ID (Passport or Driving Licence) *</label>
                <div onClick={() => idRef.current.click()} style={{ border: `2px dashed ${idFile ? theme.green : theme.border}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: idFile ? theme.greenBg : theme.card2, transition: 'all 0.2s' }}>
                  {idFile ? (
                    <div>
                      {idPreview && <img src={idPreview} alt="ID preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />}
                      <div style={{ fontSize: 12, color: theme.green, fontWeight: 600, marginTop: 8 }}>✓ {idFile.name}</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>🪪</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text2 }}>Click to upload photo ID</div>
                      <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>Passport, driving licence, or national ID card · JPG, PNG or PDF</div>
                    </>
                  )}
                </div>
                <input ref={idRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e, 'id')} />
              </div>

              {/* Selfie Upload */}
              <div>
                <label style={labelStyle}>Selfie Photo (holding your ID) *</label>
                <div onClick={() => selfieRef.current.click()} style={{ border: `2px dashed ${selfieFile ? theme.green : theme.border}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: selfieFile ? theme.greenBg : theme.card2, transition: 'all 0.2s' }}>
                  {selfiePreview ? (
                    <div>
                      <img src={selfiePreview} alt="Selfie" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                      <div style={{ fontSize: 12, color: theme.green, fontWeight: 600, marginTop: 8 }}>✓ {selfieFile.name}</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 40, marginBottom: 8 }}>🤳</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text2 }}>Click to upload selfie</div>
                      <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>Clear photo of your face holding your ID · JPG or PNG</div>
                    </>
                  )}
                </div>
                <input ref={selfieRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e, 'selfie')} />
              </div>

              <div style={{ background: theme.card2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, fontSize: 13, color: theme.muted }}>
                <strong style={{ color: theme.text, display: 'block', marginBottom: 6 }}>About DBS Checks</strong>
                You will need to complete a DBS Basic check before your first job. This costs £18 and you arrange it yourself at <strong>gov.uk/request-copy-criminal-record</strong>. You do NOT need to do this before applying — just upload the certificate once you have it.
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>Review & Submit</h2>

              {/* Summary */}
              <div style={{ background: theme.bg2, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>Your Application Summary</div>
                {[
                  ['Name', form.fullName],
                  ['Phone', form.phone],
                  ['Email', form.email],
                  ['Address', `${form.address}, ${form.postcode}`],
                  ['Vehicle', form.vehicleType],
                  ['Zones', form.preferredZones.join(', ') || 'All Hull'],
                  ['ID Photo', idFile ? '✅ Uploaded' : '❌ Missing'],
                  ['Selfie', selfieFile ? '✅ Uploaded' : '❌ Missing'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ color: theme.muted, fontWeight: 600 }}>{k}</span>
                    <span style={{ color: theme.text, maxWidth: 260, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Agreements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['agreeTerms',      '📋 I agree to the OnlyBuddy Terms of Service and Buddy Code of Conduct'],
                  ['agreeBackground', '🔍 I consent to a background check and understand a DBS certificate is required before my first job'],
                  ['agreeInsurance',  '🛡️ I understand I am responsible for my own public liability insurance, or I will obtain it through OnlyBuddy\'s group policy'],
                ].map(([field, label]) => (
                  <label key={field} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', padding: 14, borderRadius: 12, background: form[field] ? theme.greenBg : theme.card2, border: `1.5px solid ${form[field] ? theme.green : theme.border}`, transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: theme.primary, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: theme.text2, lineHeight: 1.5 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: theme.redBg, border: `1px solid ${theme.red}44`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: theme.red, fontWeight: 600, marginTop: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
            {step > 0 ? (
              <button onClick={() => { setStep(s => s - 1); setError(''); }} style={{ padding: '12px 24px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.card2, color: theme.text2, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                ← Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button onClick={next} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: `0 4px 16px ${theme.primary}44` }}>
                Next Step →
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} style={{ padding: '14px 32px', borderRadius: 12, border: 'none', background: submitting ? theme.muted : `linear-gradient(135deg, ${theme.green}, #047857)`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: submitting ? 'none' : `0 4px 16px ${theme.green}44` }}>
                {submitting ? '⏳ Submitting...' : '🚀 Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
