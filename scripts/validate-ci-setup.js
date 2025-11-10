#!/usr/bin/env node

/**
 * CI/CD Setup Validation Script
 * 
 * This script checks if your environment is properly configured
 * for building the app locally and via GitHub Actions.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FILES = [
  '.github/workflows/build-macos.yml',
  '.github/workflows/release-build.yml',
  'package.json',
  'electron/main/index.ts',
  'electron/preload/index.ts',
];

const REQUIRED_SCRIPTS = [
  'build',
  'build:renderer',
  'build:electron',
  'build:mac',
  'build:win-installer',
];

let hasErrors = false;
let hasWarnings = false;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
  hasErrors = true;
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  WARNING: ${message}`, 'yellow');
  hasWarnings = true;
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  log(`\n${'='.repeat(50)}`, 'blue');
  log(title, 'blue');
  log('='.repeat(50), 'blue');
}

// Check if file exists
function checkFile(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// Check Node.js version
function checkNodeVersion() {
  section('Node.js Version Check');
  
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  info(`Current Node.js version: ${nodeVersion}`);
  
  if (major >= 18) {
    success('Node.js version is compatible (>=18.x)');
  } else {
    error(`Node.js version ${nodeVersion} is too old. Requires >=18.x`);
  }
}

// Check npm version
function checkNpmVersion() {
  section('npm Version Check');
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    info(`Current npm version: ${npmVersion}`);
    
    const major = parseInt(npmVersion.split('.')[0]);
    if (major >= 9) {
      success('npm version is compatible (>=9.x)');
    } else {
      warning(`npm version ${npmVersion} is old. Recommended >=9.x`);
    }
  } catch (err) {
    error('npm is not installed or not in PATH');
  }
}

// Check required files
function checkRequiredFiles() {
  section('Required Files Check');
  
  let allFilesExist = true;
  
  REQUIRED_FILES.forEach(file => {
    if (checkFile(file)) {
      success(`Found: ${file}`);
    } else {
      error(`Missing: ${file}`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Check package.json configuration
function checkPackageJson() {
  section('package.json Configuration Check');
  
  const pkgPath = path.join(__dirname, '..', 'package.json');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check scripts
    info('Checking build scripts...');
    REQUIRED_SCRIPTS.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        success(`Script found: ${script}`);
      } else {
        error(`Script missing: ${script}`);
      }
    });
    
    // Check electron-builder configuration
    info('\nChecking electron-builder configuration...');
    if (pkg.build) {
      success('electron-builder config found');
      
      if (pkg.build.mac) {
        success('macOS build config found');
        
        if (pkg.build.mac.target) {
          const targets = Array.isArray(pkg.build.mac.target) 
            ? pkg.build.mac.target 
            : [pkg.build.mac.target];
          
          const hasDmg = targets.some(t => 
            (typeof t === 'string' && t === 'dmg') || 
            (typeof t === 'object' && t.target === 'dmg')
          );
          
          if (hasDmg) {
            success('DMG target configured');
          } else {
            warning('DMG target not found in mac.target');
          }
        } else {
          warning('mac.target not specified');
        }
      } else {
        error('macOS build configuration missing');
      }
      
      if (pkg.build.win) {
        success('Windows build config found');
      } else {
        warning('Windows build configuration not found (optional)');
      }
    } else {
      error('electron-builder configuration missing in package.json');
    }
    
    // Check dependencies
    info('\nChecking key dependencies...');
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    ['electron', 'electron-builder', 'react', 'vite'].forEach(dep => {
      if (deps[dep]) {
        success(`Dependency found: ${dep}@${deps[dep]}`);
      } else {
        error(`Missing dependency: ${dep}`);
      }
    });
    
  } catch (err) {
    error(`Failed to read package.json: ${err.message}`);
  }
}

// Check GitHub Actions workflows
function checkWorkflows() {
  section('GitHub Actions Workflows Check');
  
  const macosWorkflow = path.join(__dirname, '..', '.github', 'workflows', 'build-macos.yml');
  const releaseWorkflow = path.join(__dirname, '..', '.github', 'workflows', 'release-build.yml');
  
  if (fs.existsSync(macosWorkflow)) {
    success('macOS build workflow found');
    
    const content = fs.readFileSync(macosWorkflow, 'utf8');
    if (content.includes('macos-latest')) {
      success('Uses macos-latest runner');
    } else {
      warning('macOS runner version not specified or incorrect');
    }
    
    if (content.includes('electron-builder')) {
      success('electron-builder command found');
    } else {
      error('electron-builder command not found in workflow');
    }
    
    if (content.includes('upload-artifact')) {
      success('Artifact upload configured');
    } else {
      warning('Artifact upload not configured');
    }
  } else {
    error('macOS build workflow not found');
  }
  
  if (fs.existsSync(releaseWorkflow)) {
    success('Release build workflow found');
  } else {
    warning('Release build workflow not found (optional but recommended)');
  }
}

// Check if node_modules exists
function checkNodeModules() {
  section('Dependencies Installation Check');
  
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  
  if (fs.existsSync(nodeModulesPath)) {
    success('node_modules directory exists');
    
    // Check for key modules
    const requiredModules = ['electron', 'electron-builder', 'react', 'vite'];
    requiredModules.forEach(module => {
      if (fs.existsSync(path.join(nodeModulesPath, module))) {
        success(`Module installed: ${module}`);
      } else {
        error(`Module not installed: ${module}`);
      }
    });
  } else {
    error('node_modules not found. Run: npm install');
  }
}

// Check Git configuration
function checkGit() {
  section('Git Configuration Check');
  
  try {
    execSync('git --version', { stdio: 'ignore' });
    success('Git is installed');
    
    try {
      const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
      success('Inside a Git repository');
      
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      info(`Current branch: ${currentBranch || '(detached HEAD)'}`);
      
      try {
        const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
        if (remote.includes('github.com')) {
          success('GitHub remote configured');
          info(`Remote: ${remote}`);
        } else {
          warning('Remote is not GitHub. GitHub Actions requires GitHub hosting.');
        }
      } catch (err) {
        warning('No remote "origin" configured');
      }
      
    } catch (err) {
      error('Not inside a Git repository. Initialize with: git init');
    }
    
  } catch (err) {
    error('Git is not installed or not in PATH');
  }
}

// Check build directory
function checkBuildDirectory() {
  section('Build Output Check');
  
  const releaseDir = path.join(__dirname, '..', 'release');
  
  if (fs.existsSync(releaseDir)) {
    info('Release directory exists');
    
    const files = fs.readdirSync(releaseDir);
    const dmgFiles = files.filter(f => f.endsWith('.dmg'));
    const exeFiles = files.filter(f => f.endsWith('.exe'));
    
    if (dmgFiles.length > 0) {
      info(`Found ${dmgFiles.length} DMG file(s):`);
      dmgFiles.forEach(f => info(`  - ${f}`));
    }
    
    if (exeFiles.length > 0) {
      info(`Found ${exeFiles.length} EXE file(s):`);
      exeFiles.forEach(f => info(`  - ${f}`));
    }
    
    if (dmgFiles.length === 0 && exeFiles.length === 0) {
      info('No build artifacts found (this is OK if you haven\'t built yet)');
    }
  } else {
    info('Release directory doesn\'t exist yet (will be created on first build)');
  }
}

// Provide recommendations
function provideRecommendations() {
  section('Recommendations');
  
  info('Before pushing to GitHub:');
  console.log('  1. Test local build: npm run build:mac');
  console.log('  2. Verify the DMG works on your machine');
  console.log('  3. Update README badges with your GitHub username/repo');
  console.log('  4. Review the workflow files in .github/workflows/');
  
  info('\nFor production releases:');
  console.log('  1. Set up code signing certificates (see docs)');
  console.log('  2. Add GitHub Secrets for signing');
  console.log('  3. Test with a git tag: git tag v1.0.0 && git push origin v1.0.0');
  
  info('\nDocumentation:');
  console.log('  - docs/setup/MACOS_CI_BUILD.md - Complete guide');
  console.log('  - docs/setup/CI_CD_QUICKSTART.md - Quick reference');
  console.log('  - .github/README.md - Workflow documentation');
}

// Main execution
function main() {
  log('\n╔══════════════════════════════════════════════════╗', 'cyan');
  log('║   Sekersoft CI/CD Setup Validation Script      ║', 'cyan');
  log('╚══════════════════════════════════════════════════╝', 'cyan');
  
  checkNodeVersion();
  checkNpmVersion();
  checkGit();
  checkRequiredFiles();
  checkPackageJson();
  checkWorkflows();
  checkNodeModules();
  checkBuildDirectory();
  provideRecommendations();
  
  // Summary
  section('Validation Summary');
  
  if (hasErrors) {
    error('Validation failed! Please fix the errors above.');
    process.exit(1);
  } else if (hasWarnings) {
    warning('Validation passed with warnings. Review the warnings above.');
    log('\n✅ Your setup is functional but could be improved.', 'green');
    process.exit(0);
  } else {
    success('All checks passed! Your CI/CD setup is ready.');
    log('\n🎉 You can now push to GitHub to trigger automated builds!', 'green');
    process.exit(0);
  }
}

// Run the script
main();

