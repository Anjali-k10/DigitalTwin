export async function fetchLinkedinProfile(input = {}) {
  const profile = typeof input === 'string' ? { linkedinProfile: input } : input;
  const profileUrl = sanitizeLinkedinUrl(profile.linkedinProfile || profile.profileUrl);
  const professionalFocus = sanitizeText(profile.professionalFocus || profile.focus || '');
  const currentRole = sanitizeText(profile.currentRole || profile.role || '');

  if (!profileUrl) {
    return buildLinkedinFallback(profile.linkedinProfile, 'LinkedIn profile URL is missing or invalid');
  }

  const hasCustomSlug = /linkedin\.com\/in\/[^/?#]+/i.test(profileUrl);
  const profileStrength = clamp(
    35
    + (hasCustomSlug ? 25 : 0)
    + (professionalFocus ? 18 : 0)
    + (currentRole ? 14 : 0)
    + (profileUrl.length > 34 ? 8 : 0),
    20,
    96
  );

  return {
    source: 'linkedin',
    connected: true,
    verified: false,
    verificationLevel: 'format-only',
    profileUrl,
    professionalFocus,
    currentRole,
    profileStrength,
    networkingConsistency: profileStrength >= 75 ? 'strong' : profileStrength >= 55 ? 'building' : 'early',
    careerFocusIndicators: buildCareerFocusIndicators({ profileUrl, professionalFocus, currentRole, profileStrength }),
    fetchedAt: new Date().toISOString(),
    error: '',
  };
}

function buildCareerFocusIndicators({ profileUrl, professionalFocus, currentRole, profileStrength }) {
  const indicators = [];

  if (profileUrl) indicators.push('LinkedIn profile URL saved as an unverified career signal');
  if (currentRole) indicators.push(`Current role signal: ${currentRole}`);
  if (professionalFocus) indicators.push(`Professional focus: ${professionalFocus}`);
  if (profileStrength >= 75) indicators.push('Profile strength supports career momentum');
  if (profileStrength < 55) indicators.push('Profile needs more professional context');

  return indicators;
}

function sanitizeLinkedinUrl(value) {
  const text = sanitizeText(value);

  if (!text) return '';

  try {
    const url = new URL(text.startsWith('http') ? text : `https://${text}`);
    const isLinkedin = url.hostname.replace(/^www\./, '').toLowerCase() === 'linkedin.com';
    return isLinkedin ? url.toString() : '';
  } catch {
    return '';
  }
}

function sanitizeText(value) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 300);
}

function buildLinkedinFallback(profileUrl, error) {
  return {
    source: 'linkedin',
    connected: false,
    verified: false,
    verificationLevel: 'format-only',
    profileUrl: String(profileUrl || '').trim(),
    professionalFocus: '',
    currentRole: '',
    profileStrength: 0,
    networkingConsistency: 'unknown',
    careerFocusIndicators: [],
    fetchedAt: new Date().toISOString(),
    error,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(Math.round(value), min), max);
}
