# Team Collaboration Guide

This document outlines how we will work together on the `edu2job_teamA` project. Following these guidelines will help us avoid conflicts and keep our code organized.

## 1. Getting Started

If you haven't already, clone the repository to your local machine:

```bash
git clone https://github.com/EDU2JOB-Team-A/edu2job_teamA.git
cd edu2job_teamA
```

## 2. Core Workflow

We will follow a **Feature Branch Workflow**. This means you should **never** push directly to the `master` (or `main`) branch. Always work in a separate branch for each task.

### Step-by-Step Cycle:

1.  **Update your local master:**
    Before starting new work, make sure you have the latest code.
    ```bash
    git checkout master
    git pull origin master
    ```

2.  **Create a new branch:**
    Name your branch descriptively (e.g., `feature/login-page`, `fix/navbar-bug`, `docs/update-readme`).
    ```bash
    git checkout -b feature/your-feature-name
    ```

3.  **Make your changes:**
    Write your code, save files, etc.

4.  **Commit your changes:**
    Stage and commit your work often.
    ```bash
    git add .
    git commit -m "Add descriptive message about what you changed"
    ```

5.  **Push your branch:**
    Push your `feature` branch to GitHub.
    ```bash
    git push origin feature/your-feature-name
    ```

6.  **Create a Pull Request (PR):**
    *   Go to the repository on GitHub.
    *   You should see a prompt to "Compare & pull request". Click it.
    *   Add a title and description explaining your changes.
    *   Add reviewers (your team members).
    *   Click "Create pull request".

7.  **Code Review & Merge:**
    *   Team members will review your code.
    *   Address any comments or requested changes.
    *   Once approved, merge the PR into `master` (usually via the GitHub UI).

## 3. Handling conflicts

If someone else modified the same file as you, you might get a "merge conflict".

1.  **Pull changes from master into your branch:**
    ```bash
    git checkout feature/your-branch
    git pull origin master
    ```
2.  **Fix conflicts:**
    *   Open the conflicted files in your editor (VS Code).
    *   Look for `<<<<<<<`, `=======`, `>>>>>>>` markers.
    *   Decide which code to keep (or combine both).
    *   Save the file.
3.  **Commit the fix:**
    ```bash
    git add .
    git commit -m "Resolve merge conflicts"
    git push origin feature/your-branch
    ```

## 4. Best Practices

*   **Small, Frequent Commits:** Don't wait until the end of the day to commit.
*   **Descriptive Messages:** Use messages like "Fix login button alignment" instead of "Update".
*   **Communicate:** Let the team know what you are working on to avoid duplicate work.
