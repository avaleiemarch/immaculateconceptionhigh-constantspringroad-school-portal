# CIT2011 Admin Dashboard — Brandon's handoff

This folder is a self-contained, beginner-readable implementation of the **Student Registry** and **Grades Grid / Academic Matrix** responsibilities identified for Brandon in the referenced conversation. It is built with plain HTML, CSS and JavaScript and uses the browser's `localStorage`.

## Run it

1. Keep `index.html`, `styles.css` and `app.js` together in the same folder.
2. Open `index.html` in a current browser (Chrome, Edge or Firefox).
3. Add real student and subject data agreed by your group. Nothing is prefilled.

This is a browser-only prototype: it has no server, shared database or real admin login. Browser storage belongs to that browser profile on that device. Opening the page on another computer will not share records. Do not enter sensitive student information until your group agrees that local browser storage is appropriate.

## What the page does

- **Student registry:** add records with full name, student ID, email and active-semester label; edit a record; search by name or ID; filter by semester; remove a record.
- **Grades matrix:** add agreed subject names; add, view, edit, search, filter and remove a numeric score for a student, subject and semester. Duplicate results for the same student, subject and semester are prevented.
- **Persistence:** each save is stored in `localStorage`. Reloading the same page in the same browser profile retains the data.
- **Validation:** student IDs are required and unique ignoring case; email uses the browser's email input validation; scores are restricted to 0–100. No letter-grade, pass/fail, weighting or GPA rule is invented.
- **Accessibility and layout:** labelled form fields, keyboard-operable controls, status announcements, mobile layout and escaped user-entered text.

## Proposed shared data contract

The assignment attachment was not available for direct inspection in this workspace, and no teammate source code or agreed schema was present. The keys and fields below are therefore a **proposed contract for discussion**, not a claim about what Lexi, Gerry or Antoni have implemented. Agree on one canonical student ID, semester format, subject/course identifier and grade scale with the group before merging.

```js
// localStorage key: cit2011.students
[
  {
    fullName: "...",
    studentId: "...",        // stable unique ID shared with Finance and Teacher modules
    email: "...",
    activeSemester: "...",    // group must agree the exact semester naming convention
    createdAt: "ISO-8601 timestamp"
  }
]

// localStorage key: cit2011.subjects
["...", "..."]               // user/group-entered; ideally agree canonical course codes

// localStorage key: cit2011.grades
[
  {
    studentId: "...",        // joins to students[].studentId
    subject: "...",           // agree course code vs display name
    semester: "...",          // use the same convention as the registry/teacher module
    score: 0,                  // numeric percentage 0–100 in this prototype
    updatedAt: "ISO-8601 timestamp"
  }
]
```

The grade identity is the combination `(studentId, subject, semester)`. If the teacher module needs multiple assessments per subject (for example coursework plus exam), agree extra fields such as assessment ID/type and weighting before integration; the current one-score-per-subject model does not assume those details.

## Integration points to confirm with teammates

- **Lexi (login/data):** confirm the shared student schema, canonical storage keys, ID rules and whether these pages should require an authenticated admin session. This prototype does not implement authentication.
- **Gerry (teacher module):** confirm the subject/course identifier, semester label, grade field names, score scale, assessment structure and whether teacher-entered scores should appear here. Both sides must read/write the agreed structure.
- **Antonique (finance):** confirm which student fields and stable ID the tuition ledger uses. Keep that identifier consistent; avoid copying or separately inventing a second student table.
- **Avalei (UI/UX):** replace the prototype's styles/navigation with the shared design and route/page structure while retaining the form IDs or updating the event wiring in `app.js`.

For a later server/database integration, replace the `read()` and `save()` functions near the top of `app.js` with the team's agreed API calls. Keep rendering and form validation separate from persistence. The existing browser key names are namespaced with `cit2011.` so they are easier to locate and less likely to collide with unrelated pages.

## Viva-friendly code tour

- `index.html` contains the page sections, tables, forms and dialogs.
- `styles.css` controls the visual design, including the mobile breakpoint.
- `app.js` loads stored arrays into `state`; render functions turn those arrays into table rows; form handlers update the arrays and call `save()`.
- `escapeHTML()` encodes text before putting it into table markup, so typed names and labels are displayed as text.
- `localStorage` stores strings only, so `JSON.stringify()` saves arrays and `JSON.parse()` reads them back. The `try/catch` prevents a broken/disabled storage value from crashing the page.
- Student IDs are the join between the registry, grades and (after agreement) the other modules.

## Manual check checklist

1. Open the page and confirm it starts with empty tables and zero counts.
2. Add a student with a made-up test entry, then refresh: the record should remain.
3. Edit the student; search by name and ID; filter by semester.
4. Add a test subject and score; edit it; check that a duplicate student/subject/semester result is rejected.
5. Search/filter the matrix, then remove the test result and student. Student removal also removes that student's grades.
6. Open the page in another browser profile: it should have separate storage, demonstrating that this prototype is not a shared group database.
7. Clear the test data after the check. The delete controls ask before removing records.

No formal tests were run; use this checklist for a browser walkthrough after the group confirms its data rules.
