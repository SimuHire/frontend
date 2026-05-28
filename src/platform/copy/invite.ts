export const INVITE_UNAVAILABLE_MESSAGE =
  'This invite link is no longer valid. Please contact your Talent Partner to request a new invitation.';

export const INVITE_INVALID_MESSAGE =
  'This invite link is invalid. Check that you copied the full URL.';

export const INVITE_EXPIRED_MESSAGE =
  'This invite link expired. Please ask your Talent Partner for a new one.';

export function inviteExpiredWithContact(
  name: string,
  expiredOn?: string | null,
) {
  const label = name.trim() || 'your Talent Partner';
  const dateText = expiredOn ? ` on ${expiredOn}` : '';
  return `This invite link expired${dateText}. Please ask ${label} for a new one.`;
}

export const INVITE_ALREADY_CLAIMED_MESSAGE =
  "You've already claimed this invite.";

export const INVITE_TERMINATED_MESSAGE = 'This Trial is no longer available.';

export const INVITE_SUPPORT_EMAIL = 'support@winoe.ai';
