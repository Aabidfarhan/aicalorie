import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Manages Supabase anonymous auth + syncing session data.
 * Falls back to localStorage when Supabase is not configured.
 */
export function useSession() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in anonymously on first load, reuse existing session after
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error) setUserId(data.user.id);
      }
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // --- Profile ---
  const saveProfile = useCallback(async (profile) => {
    localStorage.setItem('calorieCoachProfile', JSON.stringify(profile));
    if (!supabase || !userId) return;

    await supabase.from('user_profiles').upsert(
      { user_id: userId, profile, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }, [userId]);

  const loadProfile = useCallback(async () => {
    if (!supabase || !userId) {
      const saved = localStorage.getItem('calorieCoachProfile');
      return saved ? JSON.parse(saved) : null;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('profile')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Fall back to localStorage
      const saved = localStorage.getItem('calorieCoachProfile');
      return saved ? JSON.parse(saved) : null;
    }

    // Keep localStorage in sync
    localStorage.setItem('calorieCoachProfile', JSON.stringify(data.profile));
    return data.profile;
  }, [userId]);

  // --- Daily Log (meals + water) ---
  const saveDailyLog = useCallback(async (logData) => {
    const today = new Date().toISOString().split('T')[0];
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

  const loadDailyLog = useCallback(async () => {
    if (!supabase || !userId) {
      const saved = localStorage.getItem('calorieCoachData');
      return saved ? JSON.parse(saved) : null;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_logs')
      .select('meals, water, goal, history')
      .eq('user_id', userId)
      .eq('log_date', today)
      .single();

    if (error || !data) {
      const saved = localStorage.getItem('calorieCoachData');
      return saved ? JSON.parse(saved) : null;
    }

    const merged = {
      ...data,
      lastSavedDate: today,
    };
    localStorage.setItem('calorieCoachData', JSON.stringify(merged));
    return merged;
  }, [userId]);

  return { userId, loading, saveProfile, loadProfile, saveDailyLog, loadDailyLog };
}
