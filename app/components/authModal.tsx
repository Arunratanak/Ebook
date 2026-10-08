'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './authProvider';

type Mode = 'signin' | 'register';

export default function AuthModal(): React.JSX.Element {
  const { authModalOpen, closeAuthModal, login, register } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Keep the native dialog in sync with the context flag.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (authModalOpen && !dialog.open) dialog.showModal();
    if (!authModalOpen && dialog.open) dialog.close();
  }, [authModalOpen]);

  const resetForm = (): void => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setSubmitting(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result =
      mode === 'signin'
        ? await login(email, password)
        : await register(name, email, password);

    setSubmitting(false);
    if (result.ok) {
      dialogRef.current?.close();
    } else {
      setError(result.error);
    }
  };

  const switchMode = (next: Mode): void => {
    setMode(next);
    setError(null);
  };

  const isRegister = mode === 'register';

  return (
    <dialog
      ref={dialogRef}
      className="auth-modal"
      onClose={() => {
        resetForm();
        closeAuthModal();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-modal__body">
        <header className="auth-modal__header">
          <h2 id="auth-modal-title" className="auth-modal__title">
            {isRegister ? 'Create account' : 'Sign in'}
          </h2>
          <button
            type="button"
            className="auth-modal__close"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
        </header>

        <p className="auth-modal__note">
          A Z-Library account has its own daily download quota, so your downloads no longer share
          the app&apos;s limit.
        </p>

        <div className="auth-modal__tabs" role="tablist" aria-label="Account action">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            className={`auth-modal__tab ${!isRegister ? 'auth-modal__tab--active' : ''}`}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={`auth-modal__tab ${isRegister ? 'auth-modal__tab--active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-modal__field">
              <span>Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label className="auth-modal__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-modal__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 6 : undefined}
              required
            />
          </label>

          {error && (
            <p role="alert" className="auth-modal__error">
              {error}
            </p>
          )}

          <button type="submit" className="primary-button auth-modal__submit" disabled={submitting}>
            {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </dialog>
  );
}
