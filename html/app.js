/*
 * Student Registry + Academic Matrix
 * Shared browser contract is documented in HANDOFF.md.
 * No names, courses, grade bands or login assumptions are preloaded.
 */
(() => {
  'use strict';
  const STORAGE = Object.freeze({ students: 'cit2011.students', subjects: 'cit2011.subjects', grades: 'cit2011.grades' });
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const read = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
    catch { return fallback; }
  };
  const state = { students: read(STORAGE.students, []), subjects: read(STORAGE.subjects, []), grades: read(STORAGE.grades, []) };
  const save = (key) => { try { localStorage.setItem(STORAGE[key], JSON.stringify(state[key])); return true; } catch { toast('Could not save. Browser storage may be full or disabled.'); return false; } };
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const dateLabel = (value) => { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { year:'numeric', month:'short', day:'numeric' }).format(date); };
  const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  let toastTimer;
  function toast(message) { const node = $('#toast'); node.textContent = message; node.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2600); }
  function showDialog(dialog) { if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', ''); }
  function closeDialog(dialog) { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
  $$('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  $$('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(dialog); }));

  function renderStats() {
    $('#student-count').textContent = state.students.length;
    $('#grade-count').textContent = state.grades.length;
    const semester = state.students.map((student) => student.activeSemester).filter(Boolean);
    const mostCommon = semester.sort((a,b) => semester.filter((value) => value === b).length - semester.filter((value) => value === a).length)[0];
    $('#active-semester').textContent = mostCommon || 'Not set';
  }
  function renderSemesters() {
    const current = $('#semester-filter').value;
    const semesters = [...new Set(state.students.map((student) => student.activeSemester).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    $('#semester-filter').innerHTML = '<option value="">All semesters</option>' + semesters.map((semester) => `<option value="${escapeHTML(semester)}">${escapeHTML(semester)}</option>`).join('');
    if (semesters.includes(current)) $('#semester-filter').value = current;
  }
  function renderStudents() {
    renderSemesters();
    const query = $('#student-search').value.trim().toLowerCase();
    const semester = $('#semester-filter').value;
    const filtered = state.students.filter((student) => (!semester || student.activeSemester === semester) && `${student.fullName} ${student.studentId} ${student.email}`.toLowerCase().includes(query)).sort((a,b) => a.fullName.localeCompare(b.fullName));
    $('#student-result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'student' : 'students'}`;
    $('#student-rows').innerHTML = filtered.map((student) => `<tr><td><div class="student-cell"><span class="student-initial">${escapeHTML(initials(student.fullName))}</span>${escapeHTML(student.fullName)}</div></td><td><span class="id-pill">${escapeHTML(student.studentId)}</span></td><td>${escapeHTML(student.email || '—')}</td><td>${escapeHTML(student.activeSemester || '—')}</td><td>${escapeHTML(dateLabel(student.createdAt))}</td><td><div class="row-actions"><button class="icon-button" data-edit-student="${escapeHTML(student.studentId)}" aria-label="Edit ${escapeHTML(student.fullName)}">Edit</button><button class="icon-button danger" data-delete-student="${escapeHTML(student.studentId)}" aria-label="Delete ${escapeHTML(student.fullName)}">Delete</button></div></td></tr>`).join('');
    $('#students-empty').classList.toggle('visible', filtered.length === 0);
    $('#student-rows').closest('table').style.display = filtered.length ? 'table' : 'none';
    $('#student-rows').querySelectorAll('[data-edit-student]').forEach((button) => button.addEventListener('click', () => openStudent(button.dataset.editStudent)));
    $('#student-rows').querySelectorAll('[data-delete-student]').forEach((button) => button.addEventListener('click', () => deleteStudent(button.dataset.deleteStudent)));
    renderStats();
  }
  function openStudent(studentId = '') {
    const student = state.students.find((row) => row.studentId === studentId);
    $('#student-dialog-title').textContent = student ? 'Edit student' : 'Add student';
    $('#student-original-id').value = student?.studentId || '';
    $('#student-name').value = student?.fullName || '';
    $('#student-id').value = student?.studentId || '';
    $('#student-id').readOnly = Boolean(student);
    $('#student-email').value = student?.email || '';
    $('#student-semester').value = student?.activeSemester || '';
    showDialog($('#student-dialog'));
  }
  $('#student-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const originalId = $('#student-original-id').value;
    const student = { fullName: $('#student-name').value.trim(), studentId: $('#student-id').value.trim(), email: $('#student-email').value.trim(), activeSemester: $('#student-semester').value.trim() };
    if (!student.fullName || !student.studentId || !student.activeSemester) return;
    if (!originalId && state.students.some((row) => row.studentId.toLowerCase() === student.studentId.toLowerCase())) { toast('That student ID is already registered.'); return; }
    if (originalId) state.students = state.students.map((row) => row.studentId === originalId ? { ...row, ...student } : row);
    else state.students.push({ ...student, createdAt: new Date().toISOString() });
    save('students'); closeDialog($('#student-dialog')); renderAll(); toast(originalId ? 'Student record updated.' : 'Student registered.');
  });
  function deleteStudent(studentId) {
    const student = state.students.find((row) => row.studentId === studentId);
    if (!student || !confirm(`Remove ${student.fullName} and their saved grade entries?`)) return;
    state.students = state.students.filter((row) => row.studentId !== studentId);
    state.grades = state.grades.filter((row) => row.studentId !== studentId);
    save('students'); save('grades'); renderAll(); toast('Student record removed.');
  }
  function renderSubjects() {
    const selected = $('#subject-filter').value;
    const sorted = [...state.subjects].sort((a,b) => a.localeCompare(b));
    $('#subject-filter').innerHTML = '<option value="">All subjects</option>' + sorted.map((subject) => `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`).join('');
    if (sorted.includes(selected)) $('#subject-filter').value = selected;
    $('#grade-subject').innerHTML = sorted.map((subject) => `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`).join('');
    $('#subject-list').innerHTML = sorted.length ? sorted.map((subject) => `<li><span>${escapeHTML(subject)}</span><button type="button" data-remove-subject="${escapeHTML(subject)}" aria-label="Remove ${escapeHTML(subject)}">Remove</button></li>`).join('') : '<li class="empty-subjects">No subjects added yet.</li>';
    $('#subject-list').querySelectorAll('[data-remove-subject]').forEach((button) => button.addEventListener('click', () => removeSubject(button.dataset.removeSubject)));
  }
  function renderStudentOptions(selectedId = '') {
    $('#grade-student').innerHTML = state.students.slice().sort((a,b) => a.fullName.localeCompare(b.fullName)).map((student) => `<option value="${escapeHTML(student.studentId)}">${escapeHTML(student.fullName)} · ${escapeHTML(student.studentId)}</option>`).join('');
    if (selectedId) $('#grade-student').value = selectedId;
  }
  function renderGrades() {
    renderSubjects();
    const query = $('#grade-search').value.trim().toLowerCase();
    const subjectFilter = $('#subject-filter').value;
    const filtered = state.grades.filter((grade) => {
      const student = state.students.find((row) => row.studentId === grade.studentId);
      return student && (!subjectFilter || grade.subject === subjectFilter) && `${student.fullName} ${student.studentId}`.toLowerCase().includes(query);
    }).sort((a,b) => a.subject.localeCompare(b.subject) || a.studentId.localeCompare(b.studentId));
    $('#grade-result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`;
    $('#grade-rows').innerHTML = filtered.map((grade) => { const student = state.students.find((row) => row.studentId === grade.studentId); const key = `${grade.studentId}::${grade.subject}::${grade.semester}`; return `<tr><td><div class="student-cell"><span class="student-initial">${escapeHTML(initials(student.fullName))}</span>${escapeHTML(student.fullName)}</div></td><td><span class="id-pill">${escapeHTML(student.studentId)}</span></td><td>${escapeHTML(grade.subject)}</td><td>${escapeHTML(grade.semester)}</td><td><span class="grade-pill">${escapeHTML(grade.score)}%</span></td><td>${escapeHTML(dateLabel(grade.updatedAt))}</td><td><div class="row-actions"><button class="icon-button" data-edit-grade="${escapeHTML(key)}">Edit</button><button class="icon-button danger" data-delete-grade="${escapeHTML(key)}">Delete</button></div></td></tr>`; }).join('');
    $('#grades-empty').classList.toggle('visible', filtered.length === 0);
    $('#grade-rows').closest('table').style.display = filtered.length ? 'table' : 'none';
    $('#grade-rows').querySelectorAll('[data-edit-grade]').forEach((button) => button.addEventListener('click', () => openGrade(button.dataset.editGrade)));
    $('#grade-rows').querySelectorAll('[data-delete-grade]').forEach((button) => button.addEventListener('click', () => deleteGrade(button.dataset.deleteGrade)));
    renderStats();
  }
  function subjectKey(subject) { return String(subject).trim().toLowerCase(); }
  function gradeKey(grade) { return `${grade.studentId}::${grade.subject}::${grade.semester}`; }
  function openGrade(key = '') {
    if (!state.students.length) { toast('Add a student before entering results.'); return; }
    if (!state.subjects.length) { toast('Add an agreed subject before entering results.'); showDialog($('#subjects-dialog')); return; }
    const grade = state.grades.find((row) => gradeKey(row) === key);
    $('#grade-dialog-title').textContent = grade ? 'Edit result' : 'Add result';
    $('#grade-original-key').value = grade ? key : '';
    renderStudentOptions(grade?.studentId);
    if (grade) $('#grade-subject').value = grade.subject;
    $('#grade-semester').value = grade?.semester || state.students.find((row) => row.studentId === $('#grade-student').value)?.activeSemester || '';
    $('#grade-score').value = grade?.score ?? '';
    showDialog($('#grade-dialog'));
  }
  $('#grade-student').addEventListener('change', () => { if (!$('#grade-original-key').value) $('#grade-semester').value = state.students.find((row) => row.studentId === $('#grade-student').value)?.activeSemester || ''; });
  $('#grade-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const originalKey = $('#grade-original-key').value;
    const grade = { studentId: $('#grade-student').value, subject: $('#grade-subject').value, semester: $('#grade-semester').value.trim(), score: Number($('#grade-score').value), updatedAt: new Date().toISOString() };
    if (!grade.studentId || !grade.subject || !grade.semester || !Number.isFinite(grade.score) || grade.score < 0 || grade.score > 100) { toast('Enter a score from 0 to 100.'); return; }
    if (state.grades.some((row) => gradeKey(row) === gradeKey(grade) && gradeKey(row) !== originalKey)) { toast('A result already exists for this student, subject and semester. Edit that entry to update it.'); return; }
    state.grades = state.grades.filter((row) => gradeKey(row) !== originalKey);
    state.grades.push(grade); save('grades'); closeDialog($('#grade-dialog')); renderAll(); toast(originalKey ? 'Result updated.' : 'Result saved.');
  });
  function deleteGrade(key) { const grade = state.grades.find((row) => gradeKey(row) === key); if (!grade || !confirm(`Remove the ${grade.subject} result for this student?`)) return; state.grades = state.grades.filter((row) => gradeKey(row) !== key); save('grades'); renderAll(); toast('Result removed.'); }
  function removeSubject(subject) {
    if (state.grades.some((grade) => subjectKey(grade.subject) === subjectKey(subject))) { toast('This subject has saved results. Remove those results before removing the subject.'); return; }
    state.subjects = state.subjects.filter((item) => subjectKey(item) !== subjectKey(subject)); save('subjects'); renderSubjects(); toast('Subject removed.');
  }
  $('#subject-form').addEventListener('submit', (event) => {
    event.preventDefault(); const input = $('#subject-name'); const subject = input.value.trim(); if (!subject) return;
    if (state.subjects.some((item) => subjectKey(item) === subjectKey(subject))) { toast('That subject is already on the list.'); return; }
    state.subjects.push(subject); save('subjects'); input.value = ''; renderSubjects(); toast('Subject added.');
  });
  function renderAll() { renderStudents(); renderGrades(); }
  $('#add-student').addEventListener('click', () => openStudent());
  $('#empty-add').addEventListener('click', () => openStudent());
  $('#add-grade').addEventListener('click', () => openGrade());
  $('#empty-grade').addEventListener('click', () => openGrade());
  $('#manage-subjects').addEventListener('click', () => showDialog($('#subjects-dialog')));
  $('#student-search').addEventListener('input', renderStudents);
  $('#semester-filter').addEventListener('change', renderStudents);
  $('#grade-search').addEventListener('input', renderGrades);
  $('#subject-filter').addEventListener('change', renderGrades);
  $('#today').textContent = new Intl.DateTimeFormat(undefined, { weekday:'short', month:'short', day:'numeric' }).format(new Date());
  renderAll();
})();
