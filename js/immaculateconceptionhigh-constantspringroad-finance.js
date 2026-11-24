/*
 Course: CIT2011 Web Programming
    Project: Group Project - Immaculate Conception High School Portal
    File: immaculateconceptionhigh-constantspringroad-finance.js
    Lab: Friday 8-9:50AM
    
    Group Members:
    1. Avalei March - 2509865
    2. Alexia Burkley - 2408730
    3. Brandon Cole - 2405942
    4. Gerry Brown - 2506281
    5. Antonique Tulloch - 2401011
*/


/*-------- 1. Load student records and saved payments --------*/

let registeredStudents = JSON.parse(localStorage.getItem("cit2011.students")) || [];

let savedFinance = JSON.parse(localStorage.getItem("financeStudents")) || [];

let students = registeredStudents.map(function(student) {
    let saved = savedFinance.find(function(record) {
        return String(record.id) === String(student.studentId);
    });

    return {
        id: student.studentId,
        name: student.fullName,
        fees: saved ? saved.fees : 20000,
        paid: saved ? saved.paid : 0
    };
});

localStorage.setItem("financeStudents", JSON.stringify(students));

/*----------2. Display financial records ------------- */

function updateFinance() {
    let table = document.getElementById("financeRecords");
    let search = document.getElementById("search").value.toLowerCase().trim();
    let filter = document.getElementById("statusFilter").value;

    table.innerHTML = "";

    students.forEach(function(student) {
        let balance = student.fees - student.paid;
        let status;

        if (balance === 0) {
            status = "Paid";
        } else if (student.paid > 0) {
            status = "Pending";
        } else {
            status = "Outstanding";
        }

        /* Search and filter records */

        if (!student.name.toLowerCase().includes(search) &&
            !String(student.id).toLowerCase().includes(search)) {
            return;
        }

        if (filter !== "All" && status !== filter) {
            return;
        }

        let row = table.insertRow();

        row.insertCell().textContent = student.id;
        row.insertCell().textContent = student.name;
        row.insertCell().textContent = "J$" + student.fees.toLocaleString();
        row.insertCell().textContent = "J$" + student.paid.toLocaleString();
        row.insertCell().textContent = "J$" + balance.toLocaleString();
        row.insertCell().textContent = status;
    });

    /*---------3. Calculate totals ----------- */

    let totalFees = 0;
    let totalPayments = 0;

    students.forEach(function(student) {
        totalFees += student.fees;
        totalPayments += student.paid;
    });

    let totalBalance = totalFees - totalPayments;

    document.getElementById("totalFees").textContent =
        "J$" + totalFees.toLocaleString();

    document.getElementById("totalPayments").textContent =
        "J$" + totalPayments.toLocaleString();

    document.getElementById("totalBalance").textContent =
        "J$" + totalBalance.toLocaleString();
}

/*--------4. Record payments--------- */

document.getElementById("paymentForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let id = document.getElementById("studentId").value.trim().toUpperCase();
    let amount = Number(document.getElementById("amount").value);

    let student = students.find(function(student) {
        return String(student.id).toUpperCase() === id;
    });

    if (!student) {
        alert("Student not found.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0 ||
        amount > student.fees - student.paid) {
        alert("Invalid payment amount.");
        return;
    }

    student.paid += amount;

    localStorage.setItem("financeStudents", JSON.stringify(students));

    updateFinance();

    document.getElementById("paymentForm").reset();

    alert("Payment recorded successfully.");
});

document.getElementById("search").addEventListener("input", updateFinance);

document.getElementById("statusFilter").addEventListener("change", updateFinance);

updateFinance();