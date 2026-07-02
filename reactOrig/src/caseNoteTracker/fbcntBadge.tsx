import React from 'react';
import { fbBlue, fbGreen, fbRed } from './cntStyles';

function Badge({ text, backgroundColor }: { text: string; backgroundColor: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor,
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 500,
        lineHeight: 1,
        borderRadius: '0.2rem',
        padding: '0.12rem 0.35rem',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

export function FbcntBadge() {
  return <Badge text="Badge" backgroundColor={fbBlue} />;
}

export function FbcntBadgeActive() {
  return <Badge text="Active" backgroundColor={fbGreen} />;
}

export function FbcntBadgeClosed() {
  return <Badge text="Closed" backgroundColor={fbRed} />;
}

export function FbcntBadgeDestroyed() {
  return <Badge text="Destroyed" backgroundColor={fbRed} />;
}

export function FbcntBadgeRequested() {
  return <Badge text="Req" backgroundColor="#fd8a10" />;
}

export function FbcntBadgeRescheduled() {
  return <Badge text="Rescheduled" backgroundColor="#fd8a10" />;
}

export function FbcntBadgeCancelled() {
  return <Badge text="Cancelled" backgroundColor={fbRed} />;
}
