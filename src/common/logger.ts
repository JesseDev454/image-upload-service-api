export const logger = {
  info: (message: string, payload?: Record<string, unknown>): void => {
    if (payload) {
      console.info(message, payload);
      return;
    }

    console.info(message);
  },
  error: (message: string, payload?: Record<string, unknown>): void => {
    if (payload) {
      console.error(message, payload);
      return;
    }

    console.error(message);
  }
};
