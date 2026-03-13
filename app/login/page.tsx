'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/public/navbar';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function continueWithPhone() {
    setLoading(true);
    setError('');
    setMessage('');
    const supabase = createBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    if (otpError) {
      setError(otpError.message);
    } else {
      setPhoneCodeSent(true);
      setMessage('Code sent to your phone.');
    }
    setLoading(false);
  }

  async function verifyPhoneCode() {
    setLoading(true);
    setError('');
    const supabase = createBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (verifyError) {
      setError(verifyError.message);
    } else {
      window.location.href = '/account';
    }
    setLoading(false);
  }

  async function continueWithEmail() {
    setLoading(true);
    setError('');
    setMessage('');
    const supabase = createBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/account`;
    const { error: emailError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (emailError) {
      setError(emailError.message);
    } else {
      setMessage('Check your email for a one-time code or secure sign-in link.');
    }
    setLoading(false);
  }

  return (
    <div>
      <Navbar restaurantName="Beirut.delivery" />
      <main className="container-padding mx-auto max-w-md py-8">
        <h1 className="section-title">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Sign in to save your cart across devices and checkout faster.</p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-2">
            <button className={`rounded-xl px-3 py-2 text-sm ${mode === 'phone' ? 'bg-primary text-black' : 'bg-surface text-muted'}`} onClick={() => setMode('phone')} type="button">Continue with phone</button>
            <button className={`rounded-xl px-3 py-2 text-sm ${mode === 'email' ? 'bg-primary text-black' : 'bg-surface text-muted'}`} onClick={() => setMode('email')} type="button">Continue with email</button>
          </div>

          {mode === 'phone' ? (
            <div className="mt-4 space-y-3">
              <input className="input" placeholder="+961XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {phoneCodeSent && <input className="input" placeholder="Enter one-time code" value={code} onChange={(e) => setCode(e.target.value)} />}
              {!phoneCodeSent ? (
                <button type="button" disabled={loading || !phone} className="btn-primary w-full disabled:opacity-60" onClick={continueWithPhone}>Send one-time code</button>
              ) : (
                <button type="button" disabled={loading || !code} className="btn-primary w-full disabled:opacity-60" onClick={verifyPhoneCode}>Verify and continue</button>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <input className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="button" disabled={loading || !email} className="btn-primary w-full disabled:opacity-60" onClick={continueWithEmail}>Send one-time code</button>
            </div>
          )}

          {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </div>

        <p className="mt-4 text-center text-sm text-muted">You can also <Link className="text-primary" href="/menu">continue as guest</Link>.</p>
      </main>
    </div>
  );
}
