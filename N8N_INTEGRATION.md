# Connecting Edu2Job to n8n (Cloud Database Guide)

Since you are using a Cloud Database (Aiven) and have successfully connected the MySQL node, here is how to configure the **AI Agent**.

## 1. Configure the AI Agent Node

To make the AI Agent understand your database, you must give it a **System Prompt**.

1.  Double-click the **AI Agent** node.
2.  Look for **"System Prompt"** or **"Instructions"** (depending on the model).
3.  Paste the following text. This tells the AI about your specific tables so it knows how to write the SQL.

### Copy Data for System Prompt:

```text
ROLE:
You are an expert MySQL Database Engineer for Edu2Job.
Your ONLY task is to generate valid, efficient MySQL queries based on the user's request.

INSTRUCTION:
1. Analyze the user's request.
2. If asking for a count -> `SELECT count(*) ...`
3. If asking for specific user data -> `JOIN` with `users_user`.
4. Do NOT hallucinate names (like 'Bob') or filters (like 'date < 2023') that are not in the request.
5. If the request is unrelated to the schema, return "I cannot answer that."

SCHEMA:
1. users_user (id, username, email, role['admin', 'user'], first_name, last_name, profile_photo, banner_image)
2. users_education (id, user_id, institution, degree, start_year, end_year, grade, cgpa)
3. users_jobhistory (id, user_id, company, role, start_date, end_date, description)
4. users_skill (id, user_id, name, proficiency)
5. users_certification (id, user_id, name, issuing_organization, issue_date, expiration_date, credential_id, credential_url)
6. users_careerprediction (id, user_id, predicted_role, match_percentage, missing_skills, created_at, updated_at)

RELATIONSHIPS:
- All tables link to `users_user.id` via `user_id`.
- To filter by username/name, you MUST join `users_user`.

FEW-SHOT EXAMPLES:
Input: "How many users are there?"
SQL: `SELECT count(*) FROM users_user;`

Input: "List all admins"
SQL: `SELECT username, email FROM users_user WHERE role = 'admin' LIMIT 10;`

Input: "What skills does Rajesh have?"
SQL: `SELECT s.name, s.proficiency FROM users_skill s JOIN users_user u ON s.user_id = u.id WHERE u.username LIKE '%rajesh%';`

Input: "Show me career predictions for user 'alice'"
SQL: `SELECT p.predicted_role, p.match_percentage FROM users_careerprediction p JOIN users_user u ON p.user_id = u.id WHERE u.username LIKE '%alice%';`
```

## 2. Configure the "Execute SQL" Tool

1.  In your screenshot, you have **"Tool Description"** set to "Set Automatically".
    *   This is usually enough, but if the AI gets confused, change it to **"Manual"** and enter:
    *   `Execute a MySQL query. Use this to get data from the database.`
2.  **Query Field**:
    *   **CRITICAL**: You must map this to the AI's output.
    *   Click the **Gear Icon** next to the field -> **Add Expression**.
    *   Select `Input` -> `fromAI` -> `toolInput` -> `query` (or similar, depending on your n8n version).
    *   *Alternative*: If using the latest n8n AI Agent structure, the AI might pass the argument automatically. **Leave the Query field EMPTY**. Do not put `1` there.

## 3. Testing with Chat

Now, test it in the chat window:

*   **User**: "List all users who have a role of 'admin'."
*   **AI Action**: Should generate `SELECT * FROM users_user WHERE role = 'admin';`
*   **Result**: Returns the admin details.

*   **User**: "Show me the education details for user 'rajesh'."
*   **AI Action**: Should generate a JOIN query between `users_user` and `users_education`.

## 4. Critical: Configuring the "Query" Field

**The Problem:**
You typed `1` in the Query box. This forces n8n to always run the command `1`, which is not valid SQL. We want n8n to run **whatever the AI tells it to run**.

**The Fix (Choose ONE method):**

### Method 1: The "Clean and Simple" (Try this first)
1.  **Delete the text**: Click inside the "Query" box and backspace until it is completely empty.
2.  **Save and Close**: Click "Back to Canvas".
3.  **Test the Agent**: Go to the chat window and ask "How many users?". If the AI Agent is set up correctly, it automatically fills this empty field with the SQL it generates.

### Method 2: The "Manual Connection" (If Method 1 fails)
If Method 1 doesn't work, we force the connection.

1.  **Clear the field**: Delete the `1`.
2.  **Turn on Expressions**:
    *   Hover over the **Query** field name.
    *   Click the **Expression** button (it looks like `x` or `{{}}` or `Fixed/Expression` toggle).
    *   The input box should change color (usually gray).
3.  **Enter the Code**:
    *   In the box, copy and paste this exact text:
        ```javascript
        {{ $fromAI("query") }}
        ```
    *   This code literally means: "Get the value labeled 'query' that the AI sent."

## 5. Troubleshooting Common Errors

### Error: `Query was empty` (code: `ER_EMPTY_QUERY`)

**STOP! Do not click standard "Execute Step" button.**

*   **The Cause**: The "Query" box is empty. When you click "Execute Step", n8n tries to run "nothing", so it gives an error.
*   **The Solution**: This node is a **Tool** for the AI. It waits for the AI to give it code. It cannot run by itself.
    1.  **Close** the MySQL node settings (Back to Canvas).
    2.  Click the **Chat** button (bottom of the screen).
    3.  Type: `"How many users are there?"` and send.
    4.  The AI will **automatically fill** that empty box with `SELECT count(*) FROM users_user;` and run it for you.

### "Total Users" returns a list of Admins? (AI Confusion)
*   **The Cause**: The AI model has "Memory". If you previously asked for "Admins", and then ask "How many users?", it might get confused and think you still want admins.
*   **The Solution**:
    1.  **Clear Chat History**: Click the "Trash can" or "Reset" icon in the n8n Chat window.
    2.  **Start Fresh**: Ask the question again.
    3.  **Be Specific**: Ask "Count total number of users" instead of just "users".

### Error: `sql: undefined`
*   **Cause**: Similar to above. You are likely testing manually.
*   **Solution**: Test via the Chat window only.

### Error: `Connection refused`
*   **Cause**: n8n cannot reach your database.
*   **Solution**: Check your Host setting. If using Docker, use `host.docker.internal`. If Cloud, check your public IP/ngrok.

