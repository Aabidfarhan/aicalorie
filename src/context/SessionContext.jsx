import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const SessionContext = createContext(null);

const EMPTY_LOG = {
  lastSavedDate: new Date().toISOString().split('T')[0],
  meals: {
    breakfast: { calories: 0, items: [] },
    lunch:     { calories: 0, items: [] },
    dinner:    { calories: 0, items: [] },
    snacks:    { calories: 0, items: [] },
  },
  water: 0,
  history: [],
};

function calcGoal(profile) {
  if (!profile) return 2400;
  const { gender, weight, height, age, activity, goal } = profile;
  if (!weight || !height || !age) return 2400;
  let bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  let tdee = bmr * (multipliers[activity] || 1.2);
  if (goal === 'lose') tdee -= 500;
  if (goal === 'gain') tdee += 500;
  return Math.round(tdee);
}

export function SessionProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('calorieCoachProfile');
    return saved ? JSON.parse(saved) : null;
  });

  // Live daily log state — shared across all components
  const [dailyLog, setDailyLog] = useState(() => {
    const saved = localStorage.getItem('calorieCoachData');
    return saved ? JSON.parse(saved) : EMPTY_LOG;
  });

  const calorieGoal = calcGoal(profile);
  const activityTargets = {
    burnedGoal: profile?.burnedGoal || 450,
    stepsGoal:  profile?.stepsGoal  || 6000,
    distanceGoal: profile?.distanceGoal || 3.2,
  };

  // Auth init
  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setIsAnonymous(session.user.is_anonymous ?? false);
      } else {
        setIsAnonymous(true);
      }
      setAuthReady(true);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setIsAnonymous(session ? (session.user?.is_anonymous ?? false) : true);
      if (session) setAuthReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem('calorieCoachProfile');
    localStorage.removeItem('calorieCoachData');
    setProfile(null);
    setDailyLog(EMPTY_LOG);
    setUserId(null);
    setIsAnonymous(true);
  }, []);

  // Load profile from Supabase once userId is ready
  useEffect(() => {
    if (!supabase || !userId) return;
    supabase
      .from('user_profiles')
      .select('profile')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.profile) {
          setProfile(data.profile);
          localStorage.setItem('calorieCoachProfile', JSON.stringify(data.profile));
        }
      });
  }, [userId]);

  const saveProfile = useCallback(async (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('calorieCoachProfile', JSON.stringify(newProfile));
    if (!supabase || !userId) return;
    await supabase.from('user_profiles').upsert(
      { user_id: userId, profile: newProfile, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }, [userId]);

  // --- Daily Log ---
  const saveDailyLog = useCallback(async (logData) => {
    const today = new Date().toISOString().split('T')[0];
    setDailyLog(logData);  // update shared state so Sidebar re-renders
    localStorage.setItem('calorieCoachData', JSON.stringify(logData));
    if (!supabase || !userId) return;
    await supabase.from('daily_logs').upsert(
      {
        user_id: userId,
        log_date: today,
        meals: logData.meals,
        water: logData.water,
        goal: logData.goal,
        history: logData.history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,log_date' }
    );
  }, [userId]);

  const loadDailyLog = useCallback(async (dateOverride) => {
    if (!supabase || !userId) {
      const saved = localStorage.getItem('calorieCoachData');
      const data = saved ? JSON.parse(saved) : null;
      if (data) setDailyLog(data);
      return data;
    }
    const fetchDate = dateOverride || new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_logs')
      .select('meals, water, goal, history')
      .eq('user_id', userId)
      .eq('log_date', fetchDate)
      .single();
    if (!data) {
      const saved = localStorage.getItem('calorieCoachData');
      const local = saved ? JSON.parse(saved) : null;
      if (local) setDailyLog(local);
      return local;
    }
    const merged = { ...data, lastSavedDate: fetchDate };
    setDailyLog(merged);
    localStorage.setItem('calorieCoachData', JSON.stringify(merged));
    return merged;
  }, [userId]);

  return (
    <SessionContext.Provider value={{
      userId,
      isAnonymous,
      authReady,
      profile,
      calorieGoal,
      activityTargets,
      dailyLog,
      signOut,
      saveProfile,
      saveDailyLog,
      loadDailyLog,
      selectedDate,
      setSelectedDate,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}
