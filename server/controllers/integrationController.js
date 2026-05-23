import { fetchGithubProfile } from '../services/githubService.js';
import { fetchLeetcodeProfile } from '../services/leetcodeService.js';
import { fetchLinkedinProfile } from '../services/linkedinService.js';

export const getGithubIntegration = async (req, res, next) => {
  try {
    const username = sanitizeProfileInput(req.params.username);

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Valid GitHub username or profile URL is required',
      });
    }

    const data = await fetchGithubProfile(username);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeetcodeIntegration = async (req, res, next) => {
  try {
    const username = sanitizeProfileInput(req.params.username);

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Valid LeetCode username or profile URL is required',
      });
    }

    const data = await fetchLeetcodeProfile(username);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const postLinkedinIntegration = async (req, res, next) => {
  try {
    const linkedinProfile = sanitizeUrl(req.body?.linkedinProfile || req.body?.profileUrl);

    if (!linkedinProfile) {
      return res.status(400).json({
        success: false,
        message: 'Valid LinkedIn profile URL is required',
      });
    }

    const data = await fetchLinkedinProfile({
      linkedinProfile,
      currentRole: req.body?.currentRole,
      professionalFocus: req.body?.professionalFocus,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

function sanitizeUsername(value) {
  const username = String(value || '').trim();
  return /^[a-zA-Z0-9_-]{1,40}$/.test(username) ? username : '';
}

function sanitizeProfileInput(value) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 300);
}

function sanitizeUrl(value) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 300);
}
