'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './authProvider';

export default function ProfileDashboard(): React.JSX.Element {
  const { user, loading, logout, openAuthModal, refresh } = useAuth();

  const backLink = (
    <div className="search-back-row">
      <Link href="/" className="search-back">
        <span aria-hidden="true">←</span>
        Back to home
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="search-dashboard">
        {backLink}
        <p className="search-empty">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="search-dashboard">
        {backLink}
        <header className="page-header">
          <h1 className="page-header__title">Profile</h1>
        </header>
        <div className="search-empty">
          <p>Sign in to see your account and download quota.</p>
          <button type="button" className="primary-button" onClick={openAuthModal}>
            Sign in or create account
          </button>
        </div>
      </div>
    );
  }

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();
  const limit = user.downloadsLimit;
  const used = user.downloadsToday;
  const remaining = Math.max(limit - used, 0);
  const percent = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

  return (
    <div className="search-dashboard">
      {backLink}

      <header className="page-header">
        <h1 className="page-header__title">Profile</h1>
      </header>

      <section className="profile-card" aria-labelledby="profile-account">
        <div className="profile-card__avatar" aria-hidden="true">{initial}</div>
        <div className="profile-card__details">
          <h2 id="profile-account" className="profile-card__name">
            {user.name || 'Unnamed account'}
          </h2>
          <p className="profile-card__email">{user.email}</p>
          <p className="profile-card__id">Account ID {user.id}</p>
        </div>
      </section>

      <section className="profile-quota" aria-labelledby="profile-quota-title">
        <h2 id="profile-quota-title" className="profile-quota__title">Daily downloads</h2>
        <div
          className="profile-quota__bar"
          role="progressbar"
          aria-label="Daily downloads used"
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used}
        >
          <div className="profile-quota__fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="profile-quota__text">
          {limit > 0
            ? `${used} of ${limit} used today · ${remaining} remaining`
            : 'Quota is not available right now.'}
        </p>
        <button type="button" className="secondary-button" onClick={() => void refresh()}>
          Refresh quota
        </button>
      </section>

      <div className="profile-actions">
        <Link href="/saved" className="secondary-button">
          My List
        </Link>
        <button
          type="button"
          className="saved-card__remove"
          onClick={() => void logout()}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
