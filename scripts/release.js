#!/usr/bin/env node
/**
 * Interactive release script for Mental Clarity
 * Helps automate version bumping and tag creation
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) console.log(output);
    return output.trim();
  } catch (error) {
    console.error(`Error executing: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('\n🚀 Mental Clarity Release Tool\n');

  // Check for uncommitted changes
  try {
    const status = exec('git status --porcelain', true);
    if (status) {
      console.log('⚠️  Warning: You have uncommitted changes:');
      console.log(status);
      const proceed = await question('\nContinue anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Release cancelled.');
        rl.close();
        process.exit(0);
      }
    }
  } catch (error) {
    console.error('Error checking git status. Are you in a git repository?');
    rl.close();
    process.exit(1);
  }

  // Get current version
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;

  console.log(`Current version: ${currentVersion}\n`);
  console.log('Select release type:');
  console.log('  1) Patch (bug fixes)          - e.g., 1.0.0 → 1.0.1');
  console.log('  2) Minor (new features)       - e.g., 1.0.0 → 1.1.0');
  console.log('  3) Major (breaking changes)   - e.g., 1.0.0 → 2.0.0');
  console.log('  4) Custom version');
  console.log('  5) Cancel\n');

  const choice = await question('Enter choice (1-5): ');
  
  let releaseType;
  let newVersion;

  switch (choice.trim()) {
    case '1':
      releaseType = 'patch';
      break;
    case '2':
      releaseType = 'minor';
      break;
    case '3':
      releaseType = 'major';
      break;
    case '4':
      const customVersion = await question('Enter custom version (e.g., 1.2.3): ');
      newVersion = customVersion.trim();
      if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
        console.error('Invalid version format. Must be X.Y.Z');
        rl.close();
        process.exit(1);
      }
      break;
    case '5':
      console.log('Release cancelled.');
      rl.close();
      process.exit(0);
      break;
    default:
      console.error('Invalid choice');
      rl.close();
      process.exit(1);
  }

  // Calculate new version if using semver type
  if (releaseType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    if (releaseType === 'patch') {
      newVersion = `${major}.${minor}.${patch + 1}`;
    } else if (releaseType === 'minor') {
      newVersion = `${major}.${minor + 1}.0`;
    } else if (releaseType === 'major') {
      newVersion = `${major + 1}.0.0`;
    }
  }

  console.log(`\n📦 New version will be: ${newVersion}`);
  console.log(`🏷️  Git tag will be: v${newVersion}`);
  
  const confirm = await question('\nProceed with release? (y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Release cancelled.');
    rl.close();
    process.exit(0);
  }

  console.log('\n🔧 Updating version...');
  
  try {
    // Update package.json version
    if (releaseType) {
      exec(`npm version ${releaseType} --no-git-tag-version`, true);
    } else {
      exec(`npm version ${newVersion} --no-git-tag-version`, true);
    }

    // Commit version change
    console.log('📝 Committing version change...');
    exec('git add package.json package-lock.json', true);
    exec(`git commit -m "chore: bump version to ${newVersion}"`, true);

    // Create git tag
    console.log('🏷️  Creating git tag...');
    exec(`git tag v${newVersion}`, true);

    // Push to remote
    console.log('⬆️  Pushing to remote...');
    exec('git push origin main', true);
    exec(`git push origin v${newVersion}`, true);

    console.log('\n✅ Release complete!');
    console.log(`\nVersion ${newVersion} has been released.`);
    console.log(`\n📦 GitHub Actions will now build and publish the release.`);
    console.log(`   Monitor progress: https://github.com/Renkai7/mental-clarity/actions`);
    console.log(`   View release: https://github.com/Renkai7/mental-clarity/releases/tag/v${newVersion}`);

  } catch (error) {
    console.error('\n❌ Release failed!');
    console.error(error.message);
    console.log('\nYou may need to manually clean up:');
    console.log(`  git tag -d v${newVersion}`);
    console.log('  git reset HEAD~1');
    rl.close();
    process.exit(1);
  }

  rl.close();
}

main().catch(error => {
  console.error('Unexpected error:', error);
  rl.close();
  process.exit(1);
});
