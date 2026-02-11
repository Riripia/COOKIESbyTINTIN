import fs from 'fs';

export const log = (action, adminId) => {
  const logEntry = `${new Date().toISOString()} | ADMIN:${adminId} | ${action}\n`;
  fs.appendFileSync('admin.log', logEntry);
};