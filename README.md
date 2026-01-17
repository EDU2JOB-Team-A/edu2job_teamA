# edu2job_teamA

This is the repository for the `edu2job_teamA` project.

## Getting Started

To get started with the project, clone the repository to your local machine:

```bash
git clone https://github.com/EDU2JOB-Team-A/edu2job_teamA.git
cd edu2job_teamA
```

## Collaboration Workflow

To ensure smooth collaboration among the 5 team members, please follow this workflow:

1.  **Pull the latest changes:**
    Always start by pulling the latest changes from the `master` branch to avoid conflicts.
    ```bash
    git checkout master
    git pull origin master
    ```

2.  **Create a Feature Branch:**
    Never work directly on the `master` branch. Create a new branch for your specific task or feature. Use a descriptive name (e.g., `feature-login-page`, `bugfix-navbar`).
    ```bash
    git checkout -b feature-your-feature-name
    ```

3.  **Make Changes and Commit:**
    Work on your feature. Once you are done, stage and commit your changes.
    ```bash
    git add .
    git commit -m "Descriptive message about your changes"
    ```

4.  **Push Your Branch:**
    Push your feature branch to the remote repository.
    ```bash
    git push -u origin feature-your-feature-name
    ```

5.  **Merge Changes (or Create a Pull Request):**
    *If we are using Pull Requests (Recommended):* Go to GitHub and open a Pull Request from your branch to `master`.
    *If merging locally (be careful):*
    ```bash
    git checkout master
    git pull origin master  # Ensure master is still up to date
    git merge feature-your-feature-name
    git push origin master
    ```

6.  **Resolve Conflicts:**
    If you encounter merge conflicts, text the group chat or ask for help. Do not force push!

