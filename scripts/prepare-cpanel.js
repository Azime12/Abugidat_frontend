/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
 
const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const zipOutputPath = path.join(rootDir, 'cpanel-deploy.zip');
const tarOutputPath = path.join(rootDir, 'cpanel-deploy.tar.gz');

/**
 * Recursively copies a folder, following symlinks so we get real files.
 * Skips node_modules to keep the zip lean — cPanel manages node_modules via
 * CloudLinux virtual environment (symlink), so we must NOT ship our own.
 */
function copyFolderSync(from, to, { excludeNodeModules = false } = {}) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });

  const entries = fs.readdirSync(from);
  for (const entry of entries) {
    if (excludeNodeModules && entry === 'node_modules') {
      continue; // CloudLinux manages this — skip it
    }

    const srcPath = path.join(from, entry);
    const destPath = path.join(to, entry);

    try {
      const stat = fs.statSync(srcPath); // follows symlinks
      if (stat.isDirectory()) {
        copyFolderSync(srcPath, destPath, { excludeNodeModules });
      } else if (stat.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (err) {
      console.warn(`Warning: Could not copy ${srcPath}:`, err.message);
    }
  }
}

async function createZipArchive(sourceDir, targetZipPath) {
  console.log(`📦 Zipping contents of ${sourceDir} -> ${targetZipPath}...`);
  console.log('ℹ️  node_modules is excluded — cPanel will install them via "Run npm install"');

  // Try JSZip first
  try {
    const JSZip = require('jszip');
    const zip = new JSZip();

    function addFilesToZip(currentPath, zipFolder) {
      const entries = fs.readdirSync(currentPath);
      for (const entry of entries) {
        if (entry === 'node_modules') continue; // CloudLinux manages this

        const fullPath = path.join(currentPath, entry);
        try {
          const stat = fs.statSync(fullPath); // follows symlinks
          if (stat.isDirectory()) {
            const nextZipFolder = zipFolder.folder(entry);
            addFilesToZip(fullPath, nextZipFolder);
          } else if (stat.isFile()) {
            const fileData = fs.readFileSync(fullPath);
            zipFolder.file(entry, fileData);
          }
        } catch (err) {
          console.warn(`Warning: Could not zip ${fullPath}:`, err.message);
        }
      }
    }

    addFilesToZip(sourceDir, zip);

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    fs.writeFileSync(targetZipPath, buffer);
    console.log(`✅ Created ${targetZipPath} via JSZip (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
    return;
  } catch (err) {
    console.warn('JSZip failed, falling back to system zip...', err.message);
  }

  // Fallback: system zip, excluding node_modules
  try {
    if (fs.existsSync(targetZipPath)) fs.unlinkSync(targetZipPath);
    execSync(
      `cd "${sourceDir}" && zip -r "${targetZipPath}" . --exclude "*/node_modules/*" --exclude "node_modules/*"`,
      { stdio: 'inherit' }
    );
    console.log(`✅ Created ${targetZipPath} via system zip command.`);
  } catch (err) {
    console.error('❌ Failed to zip:', err.message);
    throw err;
  }
}

function createTarGzArchive(sourceDir, targetTarPath) {
  console.log(`📦 Creating tar.gz archive: ${sourceDir} -> ${targetTarPath}...`);
  try {
    if (fs.existsSync(targetTarPath)) fs.unlinkSync(targetTarPath);
    execSync(
      `tar --exclude="node_modules" -czf "${targetTarPath}" -C "${sourceDir}" .`,
      { stdio: 'inherit' }
    );
    const stat = fs.statSync(targetTarPath);
    console.log(`✅ Created ${targetTarPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.warn('⚠️ Could not create tar.gz archive:', err.message);
  }
}

async function prepareCpanel() {
  console.log('🚀 Starting cPanel / Yegara Host deployment build process...\n');

  // 1. Run build
  console.log('🔨 Step 1: Running next build...');
  try {
    execSync('pnpm build', { cwd: rootDir, stdio: 'inherit' });
  } catch {
    console.log('Falling back to npx next build...');
    execSync('npx next build --webpack', { cwd: rootDir, stdio: 'inherit' });
  }

  if (!fs.existsSync(standaloneDir)) {
    throw new Error(
      '❌ .next/standalone not found after build. Ensure output: "standalone" is set in next.config.ts'
    );
  }

  // 2. Copy public/ into .next/standalone/public/
  console.log('\n📂 Step 2: Copying public/ ...');
  copyFolderSync(path.join(rootDir, 'public'), path.join(standaloneDir, 'public'));

  // 3. Copy .next/static/ into .next/standalone/.next/static/
  console.log('📂 Step 3: Copying .next/static/ ...');
  copyFolderSync(
    path.join(rootDir, '.next', 'static'),
    path.join(standaloneDir, '.next', 'static')
  );

  // 4. Set up server.js entry point
  console.log('📄 Step 4: Configuring server.js entry point...');
  const generatedServerFile = path.join(standaloneDir, 'server.js');
  const renamedNextServerFile = path.join(standaloneDir, 'next-server.js');
  const rootServerFile = path.join(rootDir, 'server.js');

  if (fs.existsSync(generatedServerFile)) {
    fs.renameSync(generatedServerFile, renamedNextServerFile);
  }
  fs.copyFileSync(rootServerFile, generatedServerFile);

  // 5. Generate complete package.json for cPanel npm install
  // CloudLinux NodeJS Selector installs deps into a virtual env symlinked as node_modules,
  // so we include ALL runtime dependencies so `npm install` gives us a complete flat tree.
  console.log('📄 Step 5: Generating package.json for cPanel npm install...');
  const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

  // Always include styled-jsx explicitly — it is a peer dep of next that
  // pnpm resolves through its virtual store but npm needs declared directly.
  const cleanPackageJson = {
    name: 'frontend-cpanel',
    version: rootPkg.version || '0.1.0',
    private: true,
    scripts: {
      start: 'node server.js',
    },
    dependencies: {
      ...rootPkg.dependencies,
      'styled-jsx': '5.1.1', // peer dep of next — ensure it is present
    },
    engines: {
      node: '>=18.0.0',
    },
  };

  fs.writeFileSync(
    path.join(standaloneDir, 'package.json'),
    JSON.stringify(cleanPackageJson, null, 2),
    'utf-8'
  );

  // 6. Write .npmrc with legacy-peer-deps so cPanel's npm install handles
  //    React 19 peer-dep conflicts (e.g. react-simple-maps expects React <=18)
  console.log('📄 Step 6: Writing .npmrc (legacy-peer-deps=true) ...');
  fs.writeFileSync(
    path.join(standaloneDir, '.npmrc'),
    'legacy-peer-deps=true\n',
    'utf-8'
  );

  // 7. Copy .env.production if it exists
  const envProdSrc = path.join(rootDir, '.env.production');
  const envProdDest = path.join(standaloneDir, '.env.production');
  if (fs.existsSync(envProdSrc)) {
    console.log('📄 Step 7: Copying .env.production ...');
    fs.copyFileSync(envProdSrc, envProdDest);
  }

  // 8. Copy .htaccess & .well-known to standalone root (bypasses Passenger for SSL validation)
  const htaccessSrc = path.join(rootDir, 'public', '.htaccess');
  const htaccessDest = path.join(standaloneDir, '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    console.log('📄 Step 8: Copying .htaccess to standalone root...');
    fs.copyFileSync(htaccessSrc, htaccessDest);
  }

  const wellKnownSrc = path.join(rootDir, 'public', '.well-known');
  const wellKnownDest = path.join(standaloneDir, '.well-known');
  if (fs.existsSync(wellKnownSrc)) {
    console.log('📄 Step 8b: Copying .well-known folder to standalone root...');
    copyFolderSync(wellKnownSrc, wellKnownDest);
  }

  // 9. Create deployment archives (excluding node_modules — CloudLinux manages it)
  console.log('\n🤐 Step 9: Creating deployment archives (node_modules excluded)...');
  createTarGzArchive(standaloneDir, tarOutputPath);
  await createZipArchive(standaloneDir, zipOutputPath);

  console.log('\n🎉 Build complete!');
  console.log(`📌 RECOMMENDED (Bypasses cPanel Foxhole.JS_Zip antivirus false-positive):`);
  console.log(`   👉 ${tarOutputPath}`);
  console.log(`📌 Alternative ZIP archive (may trigger Foxhole.JS_Zip on some shared hosts):`);
  console.log(`   👉 ${zipOutputPath}`);
  console.log('\n📋 After extracting on cPanel:');
  console.log('   1. In cPanel "Setup Node.js App", click "Run npm install"');
  console.log('      (or from terminal: npm install --legacy-peer-deps)');
  console.log('   2. Set Startup File to: server.js');
  console.log('   3. Click "Restart Application"');
}

prepareCpanel().catch((err) => {
  console.error('\n❌ Build process failed:', err);
  process.exit(1);
});
