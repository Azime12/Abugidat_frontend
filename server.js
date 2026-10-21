/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');

/**
 * Root server.js entry point for cPanel (Phusion Passenger) & production execution.
 * Sets production environment variables and loads the Next.js standalone server engine.
 */
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3001;
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

const localStandalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
const deployedNextServerPath = path.join(__dirname, 'next-server.js');

if (fs.existsSync(deployedNextServerPath)) {
  require(deployedNextServerPath);
} else if (fs.existsSync(localStandalonePath)) {
  require(localStandalonePath);
} else {
  console.error('Error: Next.js standalone server entry point not found.');
  console.error('Ensure that `pnpm build:cpanel` has been executed.');
  process.exit(1);
}
