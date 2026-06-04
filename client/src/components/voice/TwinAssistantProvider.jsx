import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  createGoalFromAssistant,
  deleteGoalFromAssistant,
  getDashboardForAssistant,
  getFinanceForAssistant,
  getGoalsForAssistant,
  getSettings,
  processAssistantCommand,
} from '../../services/voiceAssistantService';
import { createDeepgramAssistantStream } from '../../services/deepgramService';
import TwinAssistantButton from './TwinAssistantButton';
import { TwinAssistantContext } from './twinAssistantContext';
import { logoutUser } from '../../features/auth/authThunks';

export default function TwinAssistantProvider({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [enabled, setEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    backgroundListening: true,
    wakeWordDetection: false,
    voiceResponses: false,
  });
  const [assistantState, setAssistantState] = useState('disabled');
  const [assistantMessage, setAssistantMessage] = useState('Ready for commands...');
  const [displayTranscript, setDisplayTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('offline');
  const streamRef = useRef(null);
  const startStreamRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const speakingIgnoreUntilRef = useRef(0);
  const lastAssistantResponseRef = useRef('');
  const processingRef = useRef(false);
  const lastProcessedTranscript = useRef('');
  const lastProcessedAt = useRef(0);
  const transcriptSubmitTimerRef = useRef(null);

  const addMessage = useCallback((role, text) => {
    if (!text) return;
    setMessages((currentMessages) => [...currentMessages, { role, text }]);
  }, []);

  const restartVoiceInput = useCallback(() => {
    if (!enabled || !preferences.backgroundListening || isSpeakingRef.current || processingRef.current) return;

    window.setTimeout(() => {
      if (!enabled || !preferences.backgroundListening || isSpeakingRef.current || processingRef.current) return;
      setAssistantState('ready');
      setAssistantMessage('Ready for commands...');
      if (!streamRef.current) {
        setVoiceStatus('connecting');
        startStreamRef.current?.();
      }
    }, 300);
  }, [enabled, preferences.backgroundListening]);

  const speakAssistantResponse = useCallback((text) => {
    if (!preferences.voiceResponses || !window.speechSynthesis || !text) {
      return Promise.resolve(false);
    }

    lastAssistantResponseRef.current = normalizeCommandText(text);
    isSpeakingRef.current = true;
    setAssistantState('speaking');
    setAssistantMessage(text);
    console.log('[Twin Assistant] Assistant Speaking');
    console.log('Speaking Response');

    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text).replace(/[*_#`]/g, ''));
      utterance.lang = 'en-IN';
      utterance.rate = 0.96;

      const finish = () => {
        isSpeakingRef.current = false;
        speakingIgnoreUntilRef.current = Date.now() + 1500;
        console.log('[Twin Assistant] Listening Resumed');
        resolve(true);
      };

      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    });
  }, [preferences.voiceResponses]);

  const executeAction = useCallback(async (action) => {
    if (!action) return;

    const responseMessage = action.response || action.message || 'Working on it...';
    lastAssistantResponseRef.current = normalizeCommandText(responseMessage);
    setAssistantState('responding');
    setAssistantMessage(responseMessage);
    addMessage('assistant', responseMessage);
    await speakAssistantResponse(responseMessage);

    await wait(650);

    if (action.action === 'navigate' && action.target) {
      console.log('[Twin Assistant] Action: navigate');
      console.log('[Twin Assistant] Target:', action.target);
      console.log(`NAVIGATING TO ${getNavigationLogLabel(action.target)}`);
      navigate(action.target);
      console.log('[Twin Assistant] Navigation executed.');
      return;
    }

    if (action.action === 'create_goal') {
      setAssistantState('processing');
      await createGoalFromAssistant(action);
      setAssistantState('responding');
      setAssistantMessage(`Created goal: ${action.title}`);
      addMessage('assistant', `Created goal: ${action.title}`);
      lastAssistantResponseRef.current = normalizeCommandText(`Created goal: ${action.title}`);
      await speakAssistantResponse(`Created goal: ${action.title}`);
      navigate('/goals');
      return;
    }

    if (action.action === 'run_simulation') {
      const simulationResponse = 'Opening Simulation and running your what-if scenario...';
      setAssistantState('responding');
      setAssistantMessage(simulationResponse);
      addMessage('assistant', simulationResponse);
      lastAssistantResponseRef.current = normalizeCommandText(simulationResponse);
      await speakAssistantResponse(simulationResponse);
      navigate('/simulation', { state: { assistantSimulation: action.payload || {} } });
      return;
    }

    if (action.action === 'delete_goal') {
      setAssistantState('processing');
      const deleteResponse = await deleteMatchingGoal(action.query);
      setAssistantState('responding');
      setAssistantMessage(deleteResponse);
      addMessage('assistant', deleteResponse);
      lastAssistantResponseRef.current = normalizeCommandText(deleteResponse);
      await speakAssistantResponse(deleteResponse);
      if (deleteResponse.startsWith('Deleted goal')) navigate('/goals');
      return;
    }

    if (action.action === 'answer_health_score') {
      setAssistantState('processing');
      const result = await getDashboardForAssistant();
      const healthResponse = formatDashboardHealthResponse(result);
      setAssistantState('responding');
      setAssistantMessage(healthResponse);
      addMessage('assistant', healthResponse);
      lastAssistantResponseRef.current = normalizeCommandText(healthResponse);
      await speakAssistantResponse(healthResponse);
      return;
    }

    if (action.action === 'answer_dashboard_metric') {
      setAssistantState('processing');
      const result = await getDashboardForAssistant();
      const metricResponse = formatDashboardMetricResponse(result, action.metric);
      setAssistantState('responding');
      setAssistantMessage(metricResponse);
      addMessage('assistant', metricResponse);
      lastAssistantResponseRef.current = normalizeCommandText(metricResponse);
      await speakAssistantResponse(metricResponse);
      return;
    }

    if (action.action === 'answer_savings') {
      setAssistantState('processing');
      const result = await getFinanceForAssistant();
      const savingsResponse = formatSavingsResponse(result);
      setAssistantState('responding');
      setAssistantMessage(savingsResponse);
      addMessage('assistant', savingsResponse);
      lastAssistantResponseRef.current = normalizeCommandText(savingsResponse);
      await speakAssistantResponse(savingsResponse);
      return;
    }

    if (action.action === 'logout') {
      setAssistantState('processing');
      await dispatch(logoutUser());
      navigate('/', { replace: true });
    }
  }, [addMessage, dispatch, navigate, speakAssistantResponse]);

  const submitTranscript = useCallback(async (spokenText) => {
    const command = String(spokenText || '').trim();
    const commandKey = normalizeCommandText(command);
    const now = Date.now();

    if (isIncompleteVoiceCommand(commandKey)) {
      console.log('[Twin Assistant] Incomplete transcript ignored:', command);
      setAssistantState('listening');
      setAssistantMessage('Listening...');
      return;
    }

    if (!command || processingRef.current || (commandKey === lastProcessedTranscript.current && now - lastProcessedAt.current < 3000)) {
      if (commandKey === lastProcessedTranscript.current) {
        console.log('[Twin Assistant] Duplicate transcript ignored:', command);
      }
      return;
    }

    console.log('[Twin Assistant] Transcript:', command);
    console.log(`COMMAND DETECTED: ${commandKey}`);
    processingRef.current = true;
    console.log('[Twin Assistant] Assistant Processing');
    console.log('Processing Request');
    lastProcessedTranscript.current = commandKey;
    lastProcessedAt.current = now;
    setAssistantState('processing');
    setAssistantMessage('Processing command...');
    setDisplayTranscript(command);
    addMessage('user', command);

    try {
      console.log('[Twin Assistant] Sending command');
      const action = await processAssistantCommand(command);
      console.log('[Twin Assistant] Response:', action);
      await executeAction(action);
    } catch (error) {
      const errorMessage = error.response?.data?.response || error.response?.data?.message || 'I could not process that command.';
      console.warn('[Twin Assistant] Command failed:', errorMessage);
      setAssistantState('responding');
      setAssistantMessage(errorMessage);
      addMessage('assistant', errorMessage);
      await speakAssistantResponse(errorMessage);
    } finally {
      processingRef.current = false;
      if (enabled) {
        setAssistantState('ready');
        setAssistantMessage('Ready for commands...');
        setDisplayTranscript('');
        restartVoiceInput();
      }
    }
  }, [addMessage, enabled, executeAction, restartVoiceInput, speakAssistantResponse]);

  const handleTranscriptPayload = useCallback(({ transcript, isFinal, speechFinal, source = 'voice' }) => {
    const liveText = transcript || '';
    const normalizedTranscript = normalizeCommandText(liveText);

    if (isSpeakingRef.current || Date.now() < speakingIgnoreUntilRef.current) {
      console.log('[Twin Assistant] Ignored transcript while speaking.');
      return;
    }

    if (isAssistantEcho(normalizedTranscript, lastAssistantResponseRef.current)) {
      console.log('[Twin Assistant] Ignored assistant echo:', liveText);
      return;
    }

    if (!enabled || processingRef.current) {
      return;
    }

    if (!liveText.trim()) return;

    console.log('[Twin Assistant] Transcript updated:', { transcript: liveText, isFinal, speechFinal, source });
    console.log('[Twin Assistant] Transcript Received');
    console.log(`TRANSCRIPT RECEIVED: ${liveText}`);
    setPanelOpen(true);
    setDisplayTranscript(liveText);
    setAssistantState('listening');
    setAssistantMessage('Listening...');

    window.clearTimeout(transcriptSubmitTimerRef.current);
    if (isFinal || speechFinal) {
      submitTranscript(liveText);
    } else {
      transcriptSubmitTimerRef.current = window.setTimeout(() => {
        submitTranscript(liveText);
      }, 900);
    }
  }, [enabled, submitTranscript]);

  const stopStream = useCallback(() => {
    window.clearTimeout(transcriptSubmitTimerRef.current);
    streamRef.current?.stop();
    streamRef.current = null;
  }, []);

  const startStream = useCallback(() => {
    if (!enabled || streamRef.current) return;

    setPanelOpen(true);
    setAssistantState('ready');
    setAssistantMessage('Ready for commands...');
    setVoiceStatus('connecting');

    streamRef.current = createDeepgramAssistantStream({
      onStatus: (status) => {
        if (!enabled || isSpeakingRef.current || processingRef.current) return;
        setVoiceStatus(status);
      },
      onListening: (active) => {
        if (!enabled) return;
        setAssistantState('ready');
        setAssistantMessage(active ? 'Ready for commands...' : 'Connecting voice...');
      },
      onTranscript: ({ transcript, isFinal, speechFinal }) => {
        handleTranscriptPayload({ transcript, isFinal, speechFinal, source: 'deepgram' });
      },
      onError: (message) => {
        setPanelOpen(true);
        setAssistantState('disabled');
        setAssistantMessage(message || 'Unable to connect to voice service.');
        setVoiceStatus('error');
      },
    });

    streamRef.current.start();
  }, [enabled, handleTranscriptPayload]);

  useEffect(() => {
    startStreamRef.current = startStream;
  }, [startStream]);

  const loadSettings = useCallback(async () => {
    try {
      const settings = await getSettings();
      const nextEnabled = Boolean(settings.twinAssistantEnabled);
      const nextPreferences = {
        backgroundListening: settings.twinAssistantPreferences?.backgroundListening ?? true,
        wakeWordDetection: settings.twinAssistantPreferences?.wakeWordDetection ?? false,
        voiceResponses: settings.twinAssistantPreferences?.voiceResponses ?? false,
      };
      setEnabled(nextEnabled);
      setPreferences(nextPreferences);
      setPanelOpen(nextEnabled);
      setVoiceStatus(nextEnabled ? 'connecting' : 'offline');
      setAssistantState(nextEnabled ? 'ready' : 'disabled');
      setAssistantMessage(nextEnabled ? 'Ready for commands...' : 'Twin Assistant is disabled. Enable it in Settings.');
      if (!nextEnabled || !nextPreferences.backgroundListening) stopStream();
    } catch (error) {
      console.warn('Twin Assistant settings fallback:', error.response?.data?.message || error.message);
      setEnabled(false);
      setAssistantState('disabled');
      setAssistantMessage('Twin Assistant is disabled. Enable it in Settings.');
      setVoiceStatus('offline');
      stopStream();
    }
  }, [stopStream]);

  useEffect(() => {
    Promise.resolve().then(loadSettings);
    window.addEventListener('twin-assistant-settings-updated', loadSettings);
    return () => window.removeEventListener('twin-assistant-settings-updated', loadSettings);
  }, [loadSettings]);

  useEffect(() => {
    if (enabled && preferences.backgroundListening) startStream();
    return undefined;
  }, [enabled, preferences.backgroundListening, startStream]);

  useEffect(() => {
    if (!enabled || !preferences.backgroundListening) return undefined;

    const monitor = window.setInterval(() => {
      const inputInactive = !streamRef.current;
      if (inputInactive && !processingRef.current && !isSpeakingRef.current) {
        console.warn('[Twin Assistant] Voice input inactive. Connecting listener.');
        setVoiceStatus('connecting');
        startStreamRef.current?.();
      }
    }, 2500);

    return () => window.clearInterval(monitor);
  }, [enabled, preferences.backgroundListening]);

  useEffect(() => () => stopStream(), [stopStream]);

  const toggleListening = useCallback(() => {
    setPanelOpen(true);
    if (!enabled) {
      setAssistantMessage('Twin Assistant is disabled. Enable it in Settings.');
      return;
    }
    if (!streamRef.current) startStream();
  }, [enabled, startStream]);

  const retryConnection = useCallback(() => {
    setPanelOpen(true);
    if (!enabled) return;
    stopStream();
    setAssistantState('ready');
    setAssistantMessage('Connecting voice...');
    setVoiceStatus('connecting');
    window.setTimeout(() => startStreamRef.current?.(), 200);
  }, [enabled, stopStream]);

  const submitTextCommand = useCallback((command) => submitTranscript(command), [submitTranscript]);

  const value = useMemo(() => ({
    enabled,
    transcript: displayTranscript,
    speechActive: assistantState === 'listening' && Boolean(displayTranscript.trim()),
    messages,
    assistantState,
    assistantMessage,
    voiceStatus,
    panelOpen,
    setPanelOpen,
    toggleListening,
    retryConnection,
    submitTextCommand,
  }), [assistantMessage, assistantState, displayTranscript, enabled, messages, panelOpen, retryConnection, submitTextCommand, toggleListening, voiceStatus]);

  return (
    <TwinAssistantContext.Provider value={value}>
      {children}
      <TwinAssistantButton />
    </TwinAssistantContext.Provider>
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getNavigationLogLabel(target) {
  const page = String(target || '').replace('/', '').replace(/-/g, ' ').trim() || 'PAGE';
  return page.toUpperCase();
}

async function deleteMatchingGoal(query) {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return 'Please say the goal name you want me to delete.';

  const response = await getGoalsForAssistant();
  const goals = response?.data || [];
  if (!goals.length) return 'You do not have any goals to delete yet.';

  const rankedGoals = goals
    .map((goal) => ({ goal, score: scoreGoalMatch(cleanQuery, normalizeText(goal.title)) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!rankedGoals.length) {
    return `I could not find a goal matching "${query}".`;
  }

  const bestMatch = rankedGoals[0].goal;
  await deleteGoalFromAssistant(bestMatch._id);
  return `Deleted goal: ${bestMatch.title}.`;
}

function scoreGoalMatch(query, title) {
  if (!query || !title) return 0;
  if (query === title) return 100;
  if (title.includes(query) || query.includes(title)) return 80;

  const queryWords = query.split(' ').filter((word) => word.length > 2);
  const titleWords = title.split(' ').filter((word) => word.length > 2);
  if (!queryWords.length || !titleWords.length) return 0;

  return queryWords.reduce((score, queryWord) => {
    const matched = titleWords.some((titleWord) =>
      titleWord === queryWord || titleWord.includes(queryWord) || queryWord.includes(titleWord) || levenshteinDistance(queryWord, titleWord) <= 2,
    );
    return score + (matched ? 10 : 0);
  }, 0);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeCommandText(value) {
  return normalizeText(value);
}

function isIncompleteVoiceCommand(command) {
  if (!command) return true;
  if (command.length < 3) return true;
  return /^(open|go|go to|show|delete|remove|create|add|run|start|simulate|what|what if|tell|tell me|check)$/.test(command);
}

function isAssistantEcho(transcript, assistantResponse) {
  if (!transcript || !assistantResponse) return false;
  if (transcript === assistantResponse) return true;
  if (assistantResponse.includes(transcript) && transcript.length >= 8) return true;
  if (transcript.includes(assistantResponse) && assistantResponse.length >= 8) return true;

  const transcriptWords = transcript.split(' ').filter((word) => word.length > 2);
  const responseWords = assistantResponse.split(' ').filter((word) => word.length > 2);
  if (!transcriptWords.length || !responseWords.length) return false;

  const matchedWords = transcriptWords.filter((word) =>
    responseWords.some((responseWord) =>
      responseWord === word || responseWord.includes(word) || word.includes(responseWord) || levenshteinDistance(word, responseWord) <= 1,
    ),
  );

  return matchedWords.length / transcriptWords.length >= 0.75;
}

function levenshteinDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }

  return rows[a.length][b.length];
}

function formatDashboardHealthResponse(result) {
  const metrics = getDashboardMetrics(result);
  return Number.isFinite(metrics.healthScore)
    ? `Your current health score is ${metrics.healthScore}%.`
    : 'I checked your dashboard data, but I could not find your current health score yet.';
}

function formatDashboardMetricResponse(result, metric) {
  const metrics = getDashboardMetrics(result);
  if (metric === 'healthScore' && Number.isFinite(metrics.healthScore)) return `Your current health score is ${metrics.healthScore}%.`;
  if (metric === 'financeScore' && Number.isFinite(metrics.financeScore)) return `Your current finance score is ${metrics.financeScore}%.`;
  if ((metric === 'careerScore' || metric === 'productivityScore') && Number.isFinite(metrics.productivityScore)) return `Your current productivity score is ${metrics.productivityScore}%.`;
  if (metric === 'savingsRate' && Number.isFinite(metrics.savingsRate)) return `Your current savings rate is ${metrics.savingsRate}%.`;
  return 'I checked your dashboard data, but I could not find that metric yet.';
}

function getDashboardMetrics(result) {
  const dashboard = result?.data || {};
  const profile = dashboard.profile || {};
  const analytics = dashboard.analytics || {};
  const burnoutRisk = pickNumber(analytics.burnoutRisk, profile.burnoutRisk);
  const wellnessBalance = pickNumber(analytics.wellnessBalance, profile.wellnessBalance);
  const productivityScore = pickNumber(analytics.productivityScore, profile.productivityScore);
  const financeScore = pickNumber(analytics.financialHealth, profile.financialHealth);
  const income = pickNumber(profile.monthlyIncome, 0);
  const expenditure = pickNumber(profile.monthlyExpenditure, 0);

  return {
    healthScore: Number.isFinite(burnoutRisk) && Number.isFinite(wellnessBalance)
      ? clamp(Math.round((100 - burnoutRisk) * 0.35 + wellnessBalance * 0.65), 35, 96)
      : NaN,
    financeScore: Number.isFinite(financeScore) ? clamp(Math.round(financeScore), 0, 100) : NaN,
    productivityScore: Number.isFinite(productivityScore) ? clamp(Math.round(productivityScore), 0, 100) : NaN,
    savingsRate: income > 0 ? Math.max(0, Math.round(((income - expenditure) / income) * 100)) : NaN,
  };
}

function pickNumber(...values) {
  const value = values.find((item) => Number.isFinite(Number(item)));
  return value === undefined ? NaN : Number(value);
}

function formatSavingsResponse(result) {
  const data = result?.data || {};
  const daily = data.daily || {};
  const onboarding = data.onboarding || {};
  const credited = Number(daily.moneyCredited || 0);
  const spent = Number(daily.moneySpent || 0);
  const monthlyIncome = Number(onboarding.monthlyIncome || 0);
  const monthlyExpenditure = Number(onboarding.monthlyExpenditure || 0);
  const savings = credited > 0 || spent > 0 ? credited - spent : monthlyIncome - monthlyExpenditure;
  return Number.isFinite(savings)
    ? `You currently have Rs ${Math.max(0, Math.round(savings)).toLocaleString('en-IN')} in savings.`
    : 'I checked your finance data, but I could not find your current savings yet.';
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
