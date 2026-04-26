import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';

const RESOURCE_TYPES = [
  { key: 'note',  label: '📄 Notes',   desc: 'PDF study material' },
  { key: 'paper', label: '📝 Paper',   desc: 'Previous year exam' },
  { key: 'video', label: '🎬 Video',   desc: 'YouTube lecture link' },
  { key: 'doubt', label: '🙋 Session', desc: 'Schedule live doubt session' },
];

const SUBJECTS = ['CS', 'IT', 'Mechanical', 'Electronics', 'Civil', 'Chemical', 'MATH', 'Physics'];

const DEFAULT_FORM = {
  type: 'note', title: '', subject: 'CS', college: '',
  ytLink: '', tags: '', date: '', time: '',
  seats: '', duration: '', exam: '',
};

export default function Upload() {
  const { addResource, dark, toast } = useApp();
  const css = getTheme(dark);

  const [form, setForm]           = useState(DEFAULT_FORM);
  const [file, setFile]           = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});
  const [colleges, setColleges]   = useState([]);
  const fileInputRef              = useRef();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ✅ fetch real colleges from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/colleges')
      .then((r) => r.json())
      .then((data) => {
        setColleges(data);
        if (data.length > 0) set('college', data[0]._id);
      })
      .catch(() => toast('Could not load colleges', 'error'));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.college)      e.college = 'Please select a college';
    if (form.type === 'video' && !form.ytLink.trim()) e.ytLink = 'YouTube link is required';
    if ((form.type === 'note' || form.type === 'paper') && !file) e.file = 'Please attach a file';
    if (form.type === 'doubt') {
      if (!form.date)  e.date  = 'Date is required';
      if (!form.time)  e.time  = 'Time is required';
      if (!form.seats || isNaN(form.seats)) e.seats = 'Seats required (number)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ✅ builds FormData and passes to context addResource
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('type',    form.type);
    formData.append('title',   form.title.trim());
    formData.append('subject', form.subject);
    formData.append('college', form.college);
    if (form.ytLink)   formData.append('ytLink',   form.ytLink.trim());
    if (form.tags)     formData.append('tags',     form.tags);
    if (form.exam)     formData.append('exam',     form.exam);
    if (form.date)     formData.append('date',     form.date);
    if (form.time)     formData.append('time',     form.time);
    if (form.seats)    formData.append('seats',    form.seats);
    if (form.duration) formData.append('duration', form.duration);
    if (file)          formData.append('file',     file);

    // ✅ addResource in context handles fetch + token
    const success = await addResource(formData);

    if (success) {
      setForm(DEFAULT_FORM);
      setFile(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }

    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 660 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-1px', color: dark ? '#fff' : '#0f0f23', marginBottom: 6 }}>
          Upload Resource
        </h1>
        <p style={{ color: dark ? '#64748b' : '#94a3b8' }}>
          Share your knowledge with students across colleges
        </p>
      </div>

      {submitted && (
        <div style={{
          marginBottom: 20, padding: '16px 20px', borderRadius: 14,
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>Resource uploaded successfully!</p>
            <p style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8', marginTop: 2 }}>
              Students can now discover your content.
            </p>
          </div>
        </div>
      )}

      <div style={{ ...css.card, padding: 36, borderRadius: 22 }}>

        {/* Resource type */}
        <div style={{ marginBottom: 26 }}>
          <label style={css.label}>Resource Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {RESOURCE_TYPES.map((t) => (
              <button key={t.key} onClick={() => { set('type', t.key); setFile(null); setErrors({}); }}
                style={{
                  padding: '14px 16px', borderRadius: 13, cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${form.type === t.key ? '#6366f1' : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
                  background: form.type === t.key ? 'rgba(99,102,241,0.1)' : 'transparent',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark ? '#f1f5f9' : '#0f0f23', marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <FormField label="Title *" error={errors.title}>
          <input value={form.title} onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Data Structures — Complete Notes"
            style={{ ...css.input, borderColor: errors.title ? '#ef4444' : undefined }} />
        </FormField>

        {/* Subject + College */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <FormField label="Subject">
            <select value={form.subject} onChange={(e) => set('subject', e.target.value)} style={css.input}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="College" error={errors.college}>
            <select value={form.college} onChange={(e) => set('college', e.target.value)}
              style={{ ...css.input, borderColor: errors.college ? '#ef4444' : undefined }}>
              <option value="">— Select college —</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>{c.short} — {c.city}</option>
              ))}
            </select>
          </FormField>
        </div>

        {form.type === 'paper' && (
          <FormField label="Exam Type">
            <select value={form.exam} onChange={(e) => set('exam', e.target.value)} style={css.input}>
              <option value="">Select exam type</option>
              <option value="Mid Sem">Mid Sem</option>
              <option value="End Sem">End Sem</option>
              <option value="Unit Test">Unit Test</option>
              <option value="Prelim">Prelim</option>
            </select>
          </FormField>
        )}

        {form.type === 'video' && (
          <FormField label="YouTube Link *" error={errors.ytLink}>
            <input value={form.ytLink} onChange={(e) => set('ytLink', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={{ ...css.input, borderColor: errors.ytLink ? '#ef4444' : undefined }} />
          </FormField>
        )}

        {form.type === 'doubt' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <FormField label="Session Date *" error={errors.date}>
                <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                  style={{ ...css.input, borderColor: errors.date ? '#ef4444' : undefined }} />
              </FormField>
              <FormField label="Time *" error={errors.time}>
                <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)}
                  style={{ ...css.input, borderColor: errors.time ? '#ef4444' : undefined }} />
              </FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <FormField label="Max Seats *" error={errors.seats}>
                <input type="number" value={form.seats} onChange={(e) => set('seats', e.target.value)}
                  placeholder="e.g. 50"
                  style={{ ...css.input, borderColor: errors.seats ? '#ef4444' : undefined }} />
              </FormField>
              <FormField label="Duration">
                <input value={form.duration} onChange={(e) => set('duration', e.target.value)}
                  placeholder="e.g. 90 min" style={css.input} />
              </FormField>
            </div>
          </>
        )}

        {(form.type === 'note' || form.type === 'paper') && (
          <FormField label="Tags (comma separated)">
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)}
              placeholder="e.g. Trees, Graphs, Dynamic Programming" style={css.input} />
          </FormField>
        )}

        {/* ✅ real file drop zone */}
        {(form.type === 'note' || form.type === 'paper') && (
          <div style={{ marginBottom: 26 }}>
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                padding: 28, borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                border: `2px dashed ${
                  errors.file ? '#ef4444' :
                  dragOver    ? '#6366f1' :
                  file        ? '#10b981' :
                  (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')
                }`,
                background: file
                  ? (dark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)')
                  : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                transition: 'all 0.15s',
              }}>
              {file ? (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>{file.name}</p>
                  <p style={{ fontSize: 12, color: dark ? '#64748b' : '#94a3b8', marginTop: 4 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB — <span style={{ color: '#818cf8' }}>click to change</span>
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>☁️</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: dark ? '#64748b' : '#94a3b8' }}>
                    Drag & drop file here, or <span style={{ color: '#818cf8' }}>browse</span>
                  </p>
                  <p style={{ fontSize: 12, color: dark ? '#334155' : '#cbd5e1', marginTop: 5 }}>PDF, PPT, DOCX up to 50 MB</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]); }}
              style={{ display: 'none' }} />
            {errors.file && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6, fontWeight: 500 }}>{errors.file}</p>}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{
            ...css.btnPrimary, width: '100%', padding: 14, fontSize: 15, borderRadius: 13,
            opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          {loading
            ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Uploading...</>
            : 'Upload Resource →'
          }
        </button>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: error ? '#ef4444' : '#94a3b8', marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 5, fontWeight: 500 }}>{error}</p>}
    </div>
  );
}