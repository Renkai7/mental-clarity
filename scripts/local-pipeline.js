#!/usr/bin/env node

/**
 * Local CI/CD Pipeline
 * Runs checks locally before pushing to remote repository
 */

const { spawn } = require('child_process');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}▶${colors.reset} ${colors.bright}${msg}${colors.reset}`),
};

/**
 * Run a command and return a promise
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..'),
      ...options,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Pipeline steps configuration
 */
const steps = [
  {
    name: 'Type Check',
    command: 'npx',
    args: ['tsc', '--noEmit'],
    description: 'Checking TypeScript types...',
  },
  {
    name: 'Lint',
    command: 'npm',
    args: ['run', 'lint'],
    description: 'Running ESLint...',
  },
  {
    name: 'Tests',
    command: 'npm',
    args: ['run', 'test'],
    description: 'Running tests...',
  },
  {
    name: 'Build',
    command: 'npm',
    args: ['run', 'build'],
    description: 'Building Next.js application...',
  },
];

/**
 * Run the pipeline
 */
async function runPipeline() {
  const startTime = Date.now();
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bright}🚀 Running Local CI/CD Pipeline${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  const results = [];

  for (const step of steps) {
    log.step(`Step ${results.length + 1}/${steps.length}: ${step.name}`);
    log.info(step.description);

    const stepStartTime = Date.now();

    try {
      await runCommand(step.command, step.args);
      const duration = ((Date.now() - stepStartTime) / 1000).toFixed(2);
      log.success(`${step.name} passed (${duration}s)`);
      results.push({ name: step.name, status: 'passed', duration });
    } catch (error) {
      const duration = ((Date.now() - stepStartTime) / 1000).toFixed(2);
      log.error(`${step.name} failed (${duration}s)`);
      results.push({ name: step.name, status: 'failed', duration, error: error.message });
      
      // Stop on first failure
      console.log('\n' + '='.repeat(60));
      log.error('Pipeline failed!');
      console.log('='.repeat(60) + '\n');
      printResults(results, startTime);
      process.exit(1);
    }
  }

  // All steps passed
  console.log('\n' + '='.repeat(60));
  log.success('Pipeline completed successfully! ✨');
  console.log('='.repeat(60) + '\n');
  printResults(results, startTime);
}

/**
 * Print pipeline results summary
 */
function printResults(results, startTime) {
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log('-'.repeat(60));
  
  results.forEach((result) => {
    const statusIcon = result.status === 'passed' ? '✓' : '✗';
    const statusColor = result.status === 'passed' ? colors.green : colors.red;
    console.log(`${statusColor}${statusIcon}${colors.reset} ${result.name.padEnd(20)} ${result.duration}s`);
  });
  
  console.log('-'.repeat(60));
  console.log(`${colors.bright}Total time:${colors.reset} ${totalDuration}s`);
  console.log();
}

// Parse command line arguments
const args = process.argv.slice(2);
const helpFlag = args.includes('--help') || args.includes('-h');

if (helpFlag) {
  console.log(`
${colors.bright}Local CI/CD Pipeline${colors.reset}

Runs a series of checks locally before pushing to remote repository.

${colors.bright}Usage:${colors.reset}
  npm run pipeline
  npm run pipeline:quick    # Skip build step

${colors.bright}Steps:${colors.reset}
  1. Type Check - TypeScript type checking
  2. Lint       - ESLint code quality checks
  3. Tests      - Run test suite with Vitest
  4. Build      - Build Next.js application

${colors.bright}Options:${colors.reset}
  --help, -h    Show this help message
  `);
  process.exit(0);
}

// Run the pipeline
runPipeline().catch((error) => {
  log.error(`Pipeline error: ${error.message}`);
  process.exit(1);
});
