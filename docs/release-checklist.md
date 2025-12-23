# Release Checklist

Complete guide for releasing new versions of Mental Clarity.

---

## Pre-Release

Before creating a release, ensure all the following are complete:

- [ ] **All tests passing** - Run `npm test`
- [ ] **Type check passes** - Run `npm run typecheck`
- [ ] **Linting clean** - Run `npm run lint`
- [ ] **Local build successful** - Run `npm run build:web`
- [ ] **Desktop app tested locally** - Run `npm run test:production`
- [ ] **Version number decided** - Follow semantic versioning:
  - **Patch** (x.x.X): Bug fixes only
  - **Minor** (x.X.0): New features, backwards compatible
  - **Major** (X.0.0): Breaking changes
- [ ] **CHANGELOG.md updated** (if you maintain one)
- [ ] **Documentation updated** (if needed for new features)
- [ ] **Database migrations tested** (if any schema changes)
- [ ] **All changes committed** - No uncommitted changes in git

---

## Release Process

### Option 1: Quick Release (Recommended)

Use the automated release scripts:

```bash
# For bug fixes (patch)
npm run release:patch

# For new features (minor)
npm run release:minor

# For breaking changes (major)
npm run release:major
```

### Option 2: Interactive Release

Use the interactive tool to choose version type:

```bash
npm run release
```

Follow the prompts:
1. Review current version
2. Select release type (patch/minor/major/custom)
3. Confirm new version
4. Script will automatically:
   - Update `package.json`
   - Commit the version change
   - Create git tag
   - Push to GitHub
   - Trigger GitHub Actions workflow

### Option 3: Manual Release

If you prefer manual control:

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Commit changes
git add package.json package-lock.json
git commit -m "chore: bump version to X.Y.Z"

# 3. Create and push tag
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

---

## Monitor Release

After pushing the tag:

1. **Watch GitHub Actions**: https://github.com/Renkai7/mental-clarity/actions
   - Workflow should start automatically
   - Builds for Windows, macOS, and Linux in parallel
   - Takes approximately 10-20 minutes

2. **Check for build errors**:
   - If any platform fails, check the logs
   - Common issues:
     - Missing dependencies
     - Platform-specific build failures
     - Signing/notarization issues (macOS)

3. **Verify release created**: https://github.com/Renkai7/mental-clarity/releases
   - Should see new release with tag vX.Y.Z
   - All platform installers attached:
     - Windows: `.exe` (installer), `.exe.blockmap`
     - macOS: `.dmg`, `.dmg.blockmap`, `.zip` (for auto-update)
     - Linux: `.AppImage`, `.AppImage.blockmap`
   - Release should NOT be marked as draft or pre-release

---

## Post-Release Verification

### Test Auto-Update (Critical)

If you have a previous version installed:

1. **Open the old version** of Mental Clarity
2. **Wait for update notification** (appears automatically on launch)
   - Or go to Settings → Updates → "Check for Updates"
3. **Click "Download Update"**
   - Progress bar should show download
4. **Click "Install & Restart"** when ready
5. **Verify app restarts** with new version
6. **Confirm data integrity**:
   - Check that all your data is still there
   - Test creating/editing entries
   - Verify settings preserved

### Test Fresh Install

1. **Download installer** from GitHub Release
2. **Install on clean system** (or VM)
3. **Launch app** and verify it works
4. **Test core functionality**:
   - Create first entries
   - Navigate between views
   - Configure settings
   - Check for updates (should say "latest version")

### Verify Download Links

- [ ] Windows installer downloads correctly
- [ ] macOS installer downloads correctly  
- [ ] Linux installer downloads correctly
- [ ] No 404 errors or broken links

---

## Post-Release Tasks

- [ ] **Test auto-update from previous version** (most important!)
- [ ] **Update documentation** if needed
- [ ] **Close related issues** on GitHub
- [ ] **Announce release** (if applicable):
  - GitHub Discussions
  - Social media
  - Email newsletter
  - etc.
- [ ] **Monitor for issues**:
  - Watch GitHub Issues for bug reports
  - Check analytics/crash reports (if implemented)
- [ ] **Plan next release** - Update project board/roadmap

---

## Rollback Procedure

If a critical issue is discovered after release:

### Option 1: Quick Patch

```bash
# Fix the issue
git add <fixed-files>
git commit -m "fix: critical bug in X.Y.Z"

# Release patch version
npm run release:patch
```

### Option 2: Unpublish Release (Emergency Only)

1. Go to https://github.com/Renkai7/mental-clarity/releases
2. Find the problematic release
3. Click "Edit"
4. Mark as "Pre-release" to hide from auto-updater
5. Add warning note in description
6. Save changes

**Note**: This won't affect users who already downloaded/installed.

---

## Troubleshooting

### GitHub Actions Fails

**Windows build fails:**
- Check Windows-specific dependencies
- Verify `better-sqlite3` native module builds correctly
- Check code signing requirements (if enabled)

**macOS build fails:**
- Verify Node.js version compatibility
- Check for Apple-specific build requirements
- Code signing/notarization issues (requires Apple Developer account)

**Linux build fails:**
- Check AppImage dependencies
- Verify GTK/system libraries available

### Auto-Update Not Working

**Users not seeing update notification:**
- Verify release is NOT marked as draft or pre-release
- Check version number format (must be semantic: X.Y.Z)
- Ensure release has the correct assets (.dmg, .exe, .AppImage)

**Download fails:**
- Check GitHub release has `.blockmap` files
- Verify network connectivity
- Check firewall/antivirus not blocking

### Release Tag Already Exists

If you need to recreate a tag:

```bash
# Delete local tag
git tag -d vX.Y.Z

# Delete remote tag
git push origin --delete vX.Y.Z

# Create new tag
git tag vX.Y.Z
git push origin vX.Y.Z
```

---

## Version History Best Practices

- Maintain a `CHANGELOG.md` with notable changes per version
- Use conventional commits (feat:, fix:, docs:, chore:, etc.)
- Tag releases with clear, descriptive names
- Keep release notes focused on user-facing changes
- Include upgrade notes if data migrations are required

---

## First Release (v1.0.0)

For the very first production release:

1. **Verify stability** - App should be stable and usable
2. **Complete documentation** - README, usage guides, etc.
3. **Set version to 1.0.0** in package.json
4. **Run release script**: `npm run release:major` (if currently < 1.0.0)
5. **Create comprehensive release notes**
6. **Test thoroughly** - This becomes the baseline for all future updates

---

## Release Cadence

Recommended schedule:

- **Patch releases**: As needed for critical bugs (within days)
- **Minor releases**: Every 2-4 weeks for new features
- **Major releases**: Every 3-6 months for major changes

Adjust based on your development pace and user needs.
