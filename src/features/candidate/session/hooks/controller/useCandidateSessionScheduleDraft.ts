import { useCallback, useMemo, useState } from 'react';
import {
  buildSchedulePreview,
  isScheduleDateInPast,
  isScheduleDateOutsideBookingWindow,
  isValidIanaTimezone,
  isWeekendDateInput,
  toDateInputInTimezone,
} from '../../utils/scheduleUtils';
import type { CandidateSessionScheduleParams } from './useCandidateSessionSchedule.types';
import { validateScheduleDraft } from './useValidateScheduleDraft';
type Params = Pick<
  CandidateSessionScheduleParams,
  'bootstrap' | 'detectedTimezone'
>;

export function useCandidateSessionScheduleDraft({
  bootstrap,
  detectedTimezone,
}: Params) {
  const [scheduleDateState, setScheduleDate] = useState<string | null>(null);
  const [scheduleTimezoneState, setScheduleTimezone] = useState<string | null>(
    null,
  );
  const [scheduleGithubUsernameState, setScheduleGithubUsername] = useState<
    string | null
  >(null);
  const [scheduleDateError, setScheduleDateError] = useState<string | null>(
    null,
  );
  const [scheduleTimezoneError, setScheduleTimezoneError] = useState<
    string | null
  >(null);
  const [scheduleGithubUsernameError, setScheduleGithubUsernameError] =
    useState<string | null>(null);
  const [scheduleSubmitError, setScheduleSubmitError] = useState<string | null>(
    null,
  );
  const [includeWeekends, setIncludeWeekends] = useState(false);

  const scheduleTimezoneValue =
    scheduleTimezoneState ??
    bootstrap?.candidateTimezone ??
    detectedTimezone ??
    'UTC';
  const scheduleGithubUsernameValue =
    scheduleGithubUsernameState ?? bootstrap?.githubUsername ?? '';
  const bootstrapScheduleDate =
    bootstrap?.scheduledStartAt && scheduleTimezoneValue
      ? toDateInputInTimezone(bootstrap.scheduledStartAt, scheduleTimezoneValue)
      : null;
  const scheduleDateValue = scheduleDateState ?? bootstrapScheduleDate ?? '';

  const clearScheduleErrors = useCallback(() => {
    setScheduleDateError(null);
    setScheduleTimezoneError(null);
    setScheduleGithubUsernameError(null);
    setScheduleSubmitError(null);
  }, []);

  const resetScheduleDraft = useCallback(() => {
    setScheduleDate(null);
    setScheduleTimezone(null);
    setScheduleGithubUsername(null);
    setIncludeWeekends(false);
    clearScheduleErrors();
  }, [clearScheduleErrors]);

  const schedulePreviewWindows = useMemo(() => {
    const timezoneValue = scheduleTimezoneValue.trim();
    if (!scheduleDateValue || !isValidIanaTimezone(timezoneValue)) return [];
    try {
      return buildSchedulePreview({
        dateInput: scheduleDateValue,
        timezone: timezoneValue,
      });
    } catch {
      return [];
    }
  }, [scheduleDateValue, scheduleTimezoneValue]);

  const scheduleCanContinue = useMemo(() => {
    const timezoneValue = scheduleTimezoneValue.trim();
    if (!scheduleDateValue || !isValidIanaTimezone(timezoneValue)) return false;
    try {
      if (
        isScheduleDateInPast({
          dateInput: scheduleDateValue,
          timezone: timezoneValue,
        })
      ) {
        return false;
      }
      if (
        isScheduleDateOutsideBookingWindow({
          dateInput: scheduleDateValue,
          timezone: timezoneValue,
        })
      ) {
        return false;
      }
      if (
        isWeekendDateInput({
          dateInput: scheduleDateValue,
          timezone: timezoneValue,
        }) &&
        !includeWeekends
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [scheduleDateValue, scheduleTimezoneValue, includeWeekends]);

  const validateForm = useCallback(
    () =>
      validateScheduleDraft({
        scheduleDateValue,
        scheduleTimezoneValue,
        scheduleGithubUsernameValue,
        scheduleTimezoneState,
        scheduleGithubUsernameState,
        scheduleIncludeWeekends: includeWeekends,
        setScheduleTimezone,
        setScheduleGithubUsername,
        setScheduleSubmitError,
        setScheduleDateError,
        setScheduleTimezoneError,
        setScheduleGithubUsernameError,
      }),
    [
      scheduleDateValue,
      scheduleGithubUsernameState,
      scheduleGithubUsernameValue,
      includeWeekends,
      scheduleTimezoneState,
      scheduleTimezoneValue,
      setScheduleTimezone,
      setScheduleGithubUsername,
      setScheduleSubmitError,
      setScheduleDateError,
      setScheduleTimezoneError,
      setScheduleGithubUsernameError,
    ],
  );

  const onScheduleDateChange = useCallback(
    (value: string) => {
      setScheduleDate(value);
      setScheduleSubmitError(null);
      const timezoneValue = scheduleTimezoneValue.trim();
      if (!value || !isValidIanaTimezone(timezoneValue)) {
        setScheduleDateError(null);
        return;
      }
      try {
        if (
          isScheduleDateInPast({ dateInput: value, timezone: timezoneValue })
        ) {
          setScheduleDateError('Start date cannot be in the past.');
          return;
        }
        if (
          isScheduleDateOutsideBookingWindow({
            dateInput: value,
            timezone: timezoneValue,
          })
        ) {
          setScheduleDateError(
            'Pick a start date within the next 14 days — Winoe keeps Trials time-bound so work stays realistic.',
          );
          return;
        }
        if (
          isWeekendDateInput({ dateInput: value, timezone: timezoneValue }) &&
          !includeWeekends
        ) {
          setScheduleDateError(
            'That date falls on a weekend. Turn on "Show weekends" below, or pick a weekday.',
          );
          return;
        }
        setScheduleDateError(null);
      } catch {
        setScheduleDateError('Select a valid start date.');
      }
    },
    [scheduleTimezoneValue, includeWeekends],
  );

  const onScheduleTimezoneChange = useCallback(
    (value: string) => {
      setScheduleTimezone(value);
      setScheduleTimezoneError(null);
      setScheduleSubmitError(null);
      const timezoneValue = value.trim();
      if (!scheduleDateValue || !isValidIanaTimezone(timezoneValue)) {
        setScheduleDateError(null);
        return;
      }
      try {
        if (
          !scheduleDateValue ||
          isScheduleDateInPast({
            dateInput: scheduleDateValue,
            timezone: timezoneValue,
          })
        ) {
          setScheduleDateError(
            scheduleDateValue ? 'Start date cannot be in the past.' : null,
          );
          return;
        }
        if (
          isScheduleDateOutsideBookingWindow({
            dateInput: scheduleDateValue,
            timezone: timezoneValue,
          })
        ) {
          setScheduleDateError(
            'Pick a start date within the next 14 days — Winoe keeps Trials time-bound so work stays realistic.',
          );
          return;
        }
        if (
          isWeekendDateInput({
            dateInput: scheduleDateValue,
            timezone: timezoneValue,
          }) &&
          !includeWeekends
        ) {
          setScheduleDateError(
            'That date falls on a weekend. Turn on "Show weekends" below, or pick a weekday.',
          );
          return;
        }
        setScheduleDateError(null);
      } catch {
        setScheduleDateError('Select a valid start date.');
      }
    },
    [scheduleDateValue, includeWeekends],
  );

  const onScheduleGithubUsernameChange = useCallback((value: string) => {
    setScheduleGithubUsername(value);
    setScheduleGithubUsernameError(null);
    setScheduleSubmitError(null);
  }, []);

  const onIncludeWeekendsChange = useCallback(
    (value: boolean) => {
      setIncludeWeekends(value);
      setScheduleSubmitError(null);
      const timezoneValue = scheduleTimezoneValue.trim();
      if (!scheduleDateValue || !isValidIanaTimezone(timezoneValue)) {
        return;
      }
      try {
        if (
          isWeekendDateInput({
            dateInput: scheduleDateValue,
            timezone: timezoneValue,
          }) &&
          value
        ) {
          setScheduleDateError(null);
          return;
        }
        if (
          isWeekendDateInput({
            dateInput: scheduleDateValue,
            timezone: timezoneValue,
          }) &&
          !value
        ) {
          setScheduleDateError(
            'That date falls on a weekend. Turn on "Show weekends" below, or pick a weekday.',
          );
          return;
        }
        if (
          isScheduleDateOutsideBookingWindow({
            dateInput: scheduleDateValue,
            timezone: timezoneValue,
          })
        ) {
          setScheduleDateError(
            'Pick a start date within the next 14 days — Winoe keeps Trials time-bound so work stays realistic.',
          );
          return;
        }
        setScheduleDateError(null);
      } catch {
        setScheduleDateError('Select a valid start date.');
      }
    },
    [scheduleDateValue, scheduleTimezoneValue],
  );

  return {
    scheduleDateValue,
    scheduleTimezoneValue,
    scheduleGithubUsernameValue,
    scheduleIncludeWeekends: includeWeekends,
    scheduleDateError,
    scheduleTimezoneError,
    scheduleGithubUsernameError,
    scheduleSubmitError,
    schedulePreviewWindows,
    scheduleCanContinue,
    setScheduleDateError,
    setScheduleTimezoneError,
    setScheduleGithubUsernameError,
    setScheduleSubmitError,
    clearScheduleErrors,
    resetScheduleDraft,
    validateForm,
    onScheduleDateChange,
    onScheduleTimezoneChange,
    onScheduleGithubUsernameChange,
    onIncludeWeekendsChange,
  };
}
