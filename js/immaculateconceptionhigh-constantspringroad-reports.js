/*
 Course: CIT2011 Web Programming
    Project: Group Project - Immaculate Conception High School Portal
    File: immaculateconceptionhigh-constantspringroad-report.js
    Lab: Friday 8-9:50AM
    
    Group Members:
    1. Avalei March - 2509865
    2. Alexia Burkley - 2408730
    3. Brandon Cole - 2405942
    4. Gerry Brown - 2506281
    5. Antonique Tulloch - 2401011
*/


/*-------- 1. Search student records --------*/

document.getElementById("reportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let students = JSON.parse(localStorage.getItem("financeStudents")) || [];
    let search = document.getElementById("reportSearch").value.toLowerCase().trim();

    let student = students.find(function(student) {
        return String(student.id).toLowerCase() === search ||
               student.name.toLowerCase().includes(search);
    });

    document.getElementById("studentInformation").textContent = "";
    document.getElementById("academicReport").textContent = "";
    document.getElementById("financialStatement").textContent = "";

    if (search === "" || !student) {
        alert("Student record not found.");
        return;
    }

    /*-------- 2. Student information --------*/

    document.getElementById("studentInformation").textContent =
        "Student ID: " + student.id + "\n" +
        "Student Name: " + student.name;

    /*-------- 3. Academic report --------*/

    let grades = JSON.parse(localStorage.getItem("cit2011.grades")) || [];

    let studentGrades = grades.filter(function(grade) {
        return String(grade.studentId) === String(student.id);
    });

    let academicReport = document.getElementById("academicReport");

    if (studentGrades.length === 0) {
        academicReport.textContent = "No academic grades available.";
    } else {
        studentGrades.forEach(function(grade) {
            let result = document.createElement("p");

            result.textContent = grade.subject + ": " +
                grade.score + "% (" + grade.semester + ")";

            academicReport.appendChild(result);
        });
    }

    /*-------- 4. Financial statement --------*/

    let balance = student.fees - student.paid;
    let status;

    if (balance === 0) {
        status = "Paid";
    } else if (student.paid > 0) {
        status = "Pending";
    } else {
        status = "Outstanding";
    }

    document.getElementById("financialStatement").textContent =
        "Total Fees: J$" + student.fees.toLocaleString() + "\n" +
        "Amount Paid: J$" + student.paid.toLocaleString() + "\n" +
        "Outstanding Balance: J$" + balance.toLocaleString() + "\n" +
        "Payment Status: " + status;
});

/*-------- 5. Print report --------*/

document.getElementById("printReport").addEventListener("click", function() {
    if (document.getElementById("studentInformation").textContent === "") {
        alert("Please search for a student first.");
        return;
    }

    window.print();
});