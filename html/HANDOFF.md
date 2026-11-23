# Admin Dashboard Notes

## Open the page

Keep `index.html`, `styles.css` and `app.js` together in one folder. Open `index.html` in a web browser. The page starts empty; enter the student and subject information used by the group.

## What it does

The registry lets you add, edit, search, filter and remove student records. Each record has a name, student ID, email and active semester.

The grades matrix lets you add subjects and enter, edit, search, filter and remove results. Each result belongs to one student, subject and semester. A score must be between 0 and 100. The same student cannot have two results for the same subject and semester.

## Saving data

The page saves three lists in the browser: `cit2011.students`, `cit2011.subjects` and `cit2011.grades`. Data remains in the same browser profile on the same device. It is not sent to a shared database, and the page does not include a login.

Student records use these fields:

```json
{
  "fullName": "",
  "studentId": "",
  "email": "",
  "activeSemester": "",
  "createdAt": ""
}
```

Grade records use these fields:

```json
{
  "studentId": "",
  "subject": "",
  "semester": "",
  "score": 0,
  "updatedAt": ""
}
```

The student ID connects a grade to a student record. Before joining this page with the other group sections, agree on the student ID, semester names, subject names or codes, and grading rules. Lexi's login and data setup, Gerry's teacher grade entry, Antonique's tuition ledger, and Avalei's shared layout may each need to use the same choices.

## Files

- `index.html` contains the page sections, tables and forms.
- `styles.css` controls the appearance and mobile layout.
- `app.js` loads and saves the lists, checks form entries and refreshes the tables.

## Quick check

1. Open the page and add a test student.
2. Refresh the page and confirm the student is still listed.
3. Edit the student, then search and filter the registry.
4. Add a subject and a test grade. Edit it and try entering a duplicate for the same student, subject and semester.
5. Remove the test grade and student when finished. Removing a student also removes that student's grades.

The JavaScript syntax and main page elements were checked. Run through the steps above in a browser before showing the page to the group.
