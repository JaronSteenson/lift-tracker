Write a conventional commit message for the current changes.

# Context

Focus on clarity and intent, not low-level details
Use format: <type>(scope): summary
Prefer chore(ai) or feat(ai) where appropriate
``
# Include

1 short summary line
Optional bullet points for key changes (if useful).
Keep it concise and professional. No fluff.

**Never add literal \r\n  or \n in the commit message**

# Execute
```shell 
run `npm run lint-fix` # if not already run
git add;
git commit; # using our crafted message
git push; 
```

