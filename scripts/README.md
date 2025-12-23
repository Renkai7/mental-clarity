# Scripts Directory

This directory contains automation scripts for Mental Clarity development and release processes.

## Release Management

### Quick Release Commands

```bash
# Patch release (bug fixes: 1.0.0 → 1.0.1)
npm run release:patch

# Minor release (new features: 1.0.0 → 1.1.0)
npm run release:minor

# Major release (breaking changes: 1.0.0 → 2.0.0)
npm run release:major

# Interactive release tool (choose version type)
npm run release
```

**What these commands do:**
1. Update version in `package.json`
2. Commit the version change
3. Create a git tag (e.g., `v1.0.1`)
4. Push commit and tag to GitHub
5. Trigger GitHub Actions to build and publish release

**The interactive tool (`npm run release`):**
- Checks for uncommitted changes
- Shows current version
- Offers patch/minor/major/custom options
- Provides confirmation before proceeding
- Displays links to monitor release progress

---

## Local CI/CD Pipeline

## Available Pipelines

### Full Pipeline (`npm run pipeline`)

Runs all checks including build:
1. ✅ **Type Check** - TypeScript type checking (`tsc --noEmit`)
2. ✅ **Lint** - ESLint code quality checks
3. ✅ **Tests** - Full test suite with Vitest
4. ✅ **Build** - Next.js production build

**When to use:**
- Before creating a pull request
- Before pushing to main branch
- When you want maximum confidence in your changes

**Typical run time:** 2-5 minutes (depending on project size)

### Quick Pipeline (`npm run pipeline:quick`)

Runs essential checks only (no build):
1. ✅ **Type Check** - TypeScript type checking
2. ✅ **Lint** - ESLint code quality checks
3. ✅ **Tests** - Full test suite with Vitest

**When to use:**
- During active development for quick feedback
- Before committing changes
- For rapid iteration cycles

**Typical run time:** 30-90 seconds

## Usage

### Run Full Pipeline
```bash
npm run pipeline
```

### Run Quick Pipeline
```bash
npm run pipeline:quick
```

### Get Help
```bash
npm run pipeline -- --help
```

### Individual Commands

You can also run individual steps:

```bash
# Type checking only
npm run typecheck

# Linting only
npm run lint

# Tests only
npm run test

# Build only
npm run build
```

## Pipeline Behavior

### Exit Codes
- `0` - All steps passed successfully
- `1` - One or more steps failed

### Failure Handling
The pipeline stops at the first failure. This provides immediate feedback and saves time by not running subsequent steps that would likely fail anyway.

### Output
- **Color-coded output** for easy scanning
- **Step-by-step progress** with timing information
- **Summary report** at the end showing:
  - Status of each step (✓ passed / ✗ failed)
  - Duration of each step
  - Total pipeline time

## Integration with Git Hooks

### Pre-commit Hook (Quick Pipeline)

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run pipeline:quick
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Pre-push Hook (Full Pipeline)

Add to `.git/hooks/pre-push`:

```bash
#!/bin/sh
npm run pipeline
```

Make it executable:
```bash
chmod +x .git/hooks/pre-push
```

### Using Husky

If you want to use Husky for git hooks:

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky init

# Add pre-commit hook
echo "npm run pipeline:quick" > .husky/pre-commit

# Add pre-push hook
echo "npm run pipeline" > .husky/pre-push
```

## CI/CD Integration

These local pipelines mirror what runs in your CI/CD environment (GitHub Actions, etc.). By running them locally, you can:

- ✅ Catch issues before they reach CI
- ✅ Save CI/CD minutes
- ✅ Get faster feedback
- ✅ Reduce failed builds
- ✅ Improve team productivity

## Troubleshooting

### Pipeline hangs or freezes
- Check if any tests are waiting for timeouts
- Ensure no dev servers are already running on required ports
- Try running individual steps to isolate the issue

### Type check fails but IDE shows no errors
- Try restarting your TypeScript server
- Run `npm run typecheck` to see the full error output
- Check for issues in imported dependencies

### Tests fail locally but pass in CI (or vice versa)
- Ensure your Node.js version matches CI environment
- Check for environment-specific code or dependencies
- Verify test data/fixtures are committed

### Build fails with memory errors
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
- Close other applications to free up memory
- Consider using `pipeline:quick` during development

## Customization

You can customize the pipeline by editing:

- [`scripts/local-pipeline.js`](./local-pipeline.js) - Full pipeline configuration
- [`scripts/quick-pipeline.js`](./quick-pipeline.js) - Quick pipeline configuration

### Adding New Steps

To add a new step, edit the `steps` array in either script:

```javascript
const steps = [
  // Existing steps...
  {
    name: 'Security Audit',
    command: 'npm',
    args: ['audit', '--audit-level=high'],
    description: 'Checking for security vulnerabilities...',
  },
];
```

### Modifying Step Order

Simply reorder the items in the `steps` array. The pipeline runs steps sequentially in the order defined.

### Parallel Execution

For advanced use cases where steps can run in parallel, you can modify the pipeline to use `Promise.all()` instead of sequential execution.

## Best Practices

1. **Run quick pipeline frequently** during development
2. **Run full pipeline before pushing** to remote
3. **Don't skip failures** - fix issues immediately
4. **Keep tests fast** - slow tests discourage frequent runs
5. **Use git hooks** to automate pipeline execution
6. **Update pipeline** as your project evolves

## Performance Tips

- **Use incremental type checking** (already configured in `tsconfig.json`)
- **Run tests in parallel** when possible (Vitest does this by default)
- **Cache dependencies** (npm/pnpm/yarn handle this automatically)
- **Use `pipeline:quick`** for rapid feedback during development
- **Profile slow tests** and optimize or mark as integration tests

## Example Output

```
============================================================
🚀 Running Local CI/CD Pipeline
============================================================

▶ Step 1/4: Type Check
ℹ Checking TypeScript types...
✓ Type Check passed (3.42s)

▶ Step 2/4: Lint
ℹ Running ESLint...
✓ Lint passed (2.18s)

▶ Step 3/4: Tests
ℹ Running tests...
✓ Tests passed (8.73s)

▶ Step 4/4: Build
ℹ Building Next.js application...
✓ Build passed (45.21s)

============================================================
✓ Pipeline completed successfully! ✨
============================================================

Summary:
------------------------------------------------------------
✓ Type Check          3.42s
✓ Lint                2.18s
✓ Tests               8.73s
✓ Build               45.21s
------------------------------------------------------------
Total time: 59.54s
```

---

**Happy coding! 🚀**
