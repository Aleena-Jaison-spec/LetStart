document.addEventListener("DOMContentLoaded", () => {

  // ====== ELEMENT REFERENCES ======
  const subjectInput = document.getElementById("subjectInput");
  const addSubjectBtn = document.getElementById("addSubject");
  const subjectSelect = document.getElementById("subjectSelect");
  const activeSubjectText = document.getElementById("activeSubject");

  const examDateInput = document.getElementById("examDate");
  const saveExamDateBtn = document.getElementById("saveExamDate");
  const daysLeftText = document.getElementById("daysLeft");

  // ====== LOAD SUBJECTS ======
  function loadSubjects(selectedSubject = "") {
    chrome.storage.local.get("subjects", data => {
      const subjects = data.subjects || {};
      subjectSelect.innerHTML = "";

      Object.keys(subjects).forEach(subject => {
        const option = new Option(subject, subject);
        subjectSelect.add(option);
      });

      // Auto-select newly added subject
      if (selectedSubject && subjects[selectedSubject]) {
        subjectSelect.value = selectedSubject;
      }

      updateSubjectView();
    });
  }

  // ====== ADD SUBJECT ======
  addSubjectBtn.addEventListener("click", () => {
    const subjectName = subjectInput.value.trim();
    if (!subjectName) return;

    chrome.storage.local.get("subjects", data => {
      const subjects = data.subjects || {};

      if (!subjects[subjectName]) {
        subjects[subjectName] = { examDate: "" };
      }

      chrome.storage.local.set(
        { subjects },
        () => loadSubjects(subjectName)
      );
    });

    subjectInput.value = "";
  });

  // ====== SAVE EXAM DATE ======
  saveExamDateBtn.addEventListener("click", () => {
    const subject = subjectSelect.value;
    const examDate = examDateInput.value;
    if (!subject || !examDate) return;

    chrome.storage.local.get("subjects", data => {
      data.subjects[subject].examDate = examDate;
      chrome.storage.local.set(
        { subjects: data.subjects },
        updateSubjectView
      );
    });
  });

  // ====== UPDATE SUBJECT VIEW ======
  function updateSubjectView() {
    const subject = subjectSelect.value;

    if (!subject) {
      activeSubjectText.textContent = "No subject selected";
      daysLeftText.textContent = "";
      examDateInput.value = "";
      return;
    }

    chrome.storage.local.get("subjects", data => {
      const subjectData = data.subjects[subject];

      activeSubjectText.textContent = `Active Subject: ${subject}`;
      examDateInput.value = subjectData.examDate || "";

      if (subjectData.examDate) {
        const today = new Date();
        const exam = new Date(subjectData.examDate);

        today.setHours(0, 0, 0, 0);
        exam.setHours(0, 0, 0, 0);

        const diffTime = exam - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        daysLeftText.textContent =
          daysLeft >= 0
            ? `📘 ${daysLeft} days left for exam`
            : `✅ Exam completed`;
      } else {
        daysLeftText.textContent = "📅 Exam date not set";
      }
    });
  }

  // ====== SUBJECT CHANGE ======
  subjectSelect.addEventListener("change", updateSubjectView);

  // ====== INITIAL LOAD ======
  loadSubjects();

});





