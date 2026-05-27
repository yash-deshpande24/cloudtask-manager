import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register } from '../api';

const s = {
  page:  { minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' },
  box:   { background:'#1e293b', borderRadius:16, padding:40, width:'100%', maxWidth:420, boxShadow:'0 25px 50px rgba(0,0,0,0.5)' },
  logo:  { fontSize:32, textAlign:'center', marginBottom:8 },
  title: { color:'#f1f5f9', fontSize:24, fontWeight:700, textAlign:'center', marginBottom:4 },
  sub:   { color:'#64748b', textAlign:'center', marginBottom:32, fontSize:14 },
  tabs:  { display:'flex', background:'#0f172a', borderRadius:8, padding:4, marginBottom:28 },
  tab:   (a) => ({ flex:1, padding:'8px 0', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:600,
            background: a ? '#3b82f6' : 'transparent', color: a ? '#fff' : '#64748b', transition:'all .2s' }),
  label: { display:'block', color:'#94a3b8', fontSize:13, marginBottom:6, fontWeight:500 },
  input: { width:'100%', padding:'12px 14px', background:'#0f172a', border:'1px solid #334155',
           borderRadius:8, color:'#f1f5f9', fontSize:14, marginBottom:16, outline:'none', boxSizing:'border-box' },
  btn:   { width:'100%', padding:'13px', background:'#3b82f6', color:'#fff', border:'none',
           borderRadius:8, fontSize:16, fontWeight:700, cursor:'pointer', marginTop:4 },
  err:   { background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', color:'#fca5a5',
           borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16 },
};

export default function Login() {
  const { saveAuth } = useAuth();
  const [tab,  setTab]  = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [err,  setErr]  = useState('');
  const [load, setLoad] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setErr(''); setLoad(true);
    try {
      const fn   = tab === 'login' ? login : register;
      const body = tab === 'login' ? { email: form.email, password: form.password } : form;
      const { data } = await fn(body);
      saveAuth(data.token, data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Something went wrong');
    } finally { setLoad(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.box}>
        <div style={s.logo}>☁️</div>
        <h1 style={s.title}>CloudTask Manager</h1>
        <p style={s.sub}>Manage your tasks in the cloud</p>

        <div style={s.tabs}>
          <button style={s.tab(tab==='login')}    onClick={() => { setTab('login');    setErr(''); }}>Login</button>
          <button style={s.tab(tab==='register')} onClick={() => { setTab('register'); setErr(''); }}>Register</button>
        </div>

        {err && <div style={s.err}>{err}</div>}

        {tab === 'register' && (
          <>
            <label style={s.label}>Full Name</label>
            <input style={s.input} name="name" placeholder="John Doe" value={form.name} onChange={handle} />
          </>
        )}
        <label style={s.label}>Email</label>
        <input style={s.input} name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
        <label style={s.label}>Password</label>
        <input style={s.input} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />

        <button style={s.btn} onClick={submit} disabled={load}>
          {load ? 'Please wait...' : tab === 'login' ? 'Login →' : 'Create Account →'}
        </button>
      </div>
    </div>
  );
}
