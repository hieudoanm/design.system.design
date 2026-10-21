type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const levels: Level[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

const log = (level: Level, ...args: unknown[]) => {
  const ts = new Date().toISOString();
  const fn = level === 'fatal' ? 'error' : level;

  console[fn](`[${ts}] [${level.toUpperCase()}]`, ...args);
};

export const logger = Object.fromEntries(
  levels.map((level) => [level, (...args: unknown[]) => log(level, ...args)]),
) as Record<Level, (...args: unknown[]) => void>;

export default logger;
