import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/browser";

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [browserTracingIntegration()],
      tracesSampleRate: 0.1,
      environment: 'production'
    });
  }
};

export const captureException = (error) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
};

export const captureMessage = (message) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message);
  } else {
    console.log(message);
  }
};
