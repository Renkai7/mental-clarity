# 🧭 GitHub Commit Message Instructions for Copilot

**Purpose:**  
Every commit message should clearly explain *what was changed*, *why it was changed*, and *how it impacts the project*.  
The goal is to make the project history readable, searchable, and self-documenting.

---

## 🧩 Commit Message Format

Use this structure:

```
<type>(<scope>): <short summary>

<body>

<footer>
```

---

## 🧠 Examples

**Example 1**
```
feat(auth): add Google login using Firebase

Added new OAuth flow with Google to simplify authentication.
Updated user schema to include provider ID for multi-login support.

Closes #32
```

**Example 2**
```
fix(ui): resolve broken modal animation in Issue Tracker

Adjusted transition duration and easing curve for smoother exit animation.
Also corrected missing dependency in the modal component.

Related: #56
```

**Example 3**
```
docs(readme): update setup guide for PostgreSQL

Clarified environment variable setup and updated example connection string.
```

---

## 🧱 Commit Types

Use one of these **prefixes**:

| Type | Meaning |
|------|----------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style (formatting, spacing, no logic changes) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or modifying tests |
| `build` | Build system or dependency changes |
| `ci` | CI/CD configuration or pipeline changes |
| `chore` | Maintenance tasks (e.g., cleaning up, updating dependencies) |
| `revert` | Reverting a previous commit |

---

## 🪶 Rules to Follow

1. Limit the **summary line to 72 characters**.  
2. Use **sentence case** (capitalize only the first letter).  
3. Do **not** end the summary line with a period.  
4. Explain the *“why”* in the body if it isn’t obvious.  
5. Wrap body lines at ~72 characters for readability.  
6. Reference issues or PRs using `Closes #` or `Related: #`.  
7. Use **imperative mood** (e.g., “add feature,” not “added feature”).  
8. Avoid vague messages like “update code” or “fix bug.”  
9. If multiple changes exist, summarize the **main purpose**.

---

## 🧠 Example Prompts for Copilot

When committing, you can say:

> “Copilot, create a conventional commit message summarizing the staged changes, following the commit message instructions.”

or

> “Copilot, generate a commit message using the format:  
> `<type>(<scope>): <summary>` + detailed explanation + issue reference.”

---

## 🧩 Optional Enhancements

You may also include a `Co-authored-by:` line if working with agents or collaborators:

```
Co-authored-by: GitHub Copilot <copilot@github.com>
```

---

*This guide ensures consistent, high-quality commit messages across all repositories.*
