import { icons } from "./data.js";

import {
  changeStatusNote,
  deleteNote,
  getActive,
  getArchive,
  getStatistics,
  createNote,
  editNote,
} from "./service.js";

const listOfNotesTbody = document.querySelector(".list-of-notes__body");
const statisticsTbody = document.querySelector(".statistics__body");
const noteTemplate = document.querySelector("#note-template");
const categoryTemplate = document.querySelector("#category-template");
const addNoteButton = document.querySelector("#addNote");
const cancelButton = document.querySelector("#cancel");
const form = document.querySelector("#form");
const dialog = document.querySelector("#dialog");
const toggle = document.querySelector("#toggle");
const errorMessage = document.querySelector(".error-message");

const addNote = (note) => {
  const clone = noteTemplate.content.cloneNode(true);

  clone.querySelector(".logo .circle").innerHTML = icons[note.category];

  clone.querySelector(".name").textContent = note.name;
  clone.querySelector(".created").textContent = note.created;
  clone.querySelector(".category").textContent = note.category;
  clone.querySelector(".content").textContent = note.content;
  clone.querySelector(".dates").textContent = note.dates;

  clone
    .querySelector(".edit")
    .addEventListener("click", () => showDialog("edit", note), false);
  clone.querySelector(".archive").addEventListener(
    "click",
    () => {
      changeStatusNote(note.id);
      updateTables();
    },
    false
  );
  clone.querySelector(".archive").innerHTML =
    listOfNotesTbody.dataset.status === "active"
      ? '<i class="bi bi-box-arrow-in-down"></i>'
      : '<i class="bi bi-box-arrow-in-up"></i>';
  clone.querySelector(".delete").addEventListener(
    "click",
    () => {
      deleteNote(note.id);
      updateTables();
    },
    false
  );

  listOfNotesTbody.appendChild(clone);
};

const addCategory = (category) => {
  const clone = categoryTemplate.content.cloneNode(true);

  clone.querySelector(".logo .circle").innerHTML = icons[category.name];

  clone.querySelector(".category").textContent = category.name;
  clone.querySelector(".active-count").textContent = category.active;
  clone.querySelector(".archive-count").textContent = category.archived;

  statisticsTbody.appendChild(clone);
};

const clearTable = (table) => {
  table.innerHTML = "";
};

const fillTable = (table, tableContent) => {
  table === listOfNotesTbody
    ? tableContent.forEach((element) => addNote(element))
    : tableContent.forEach((element) => addCategory(element));
};

const showDialog = (mode = "create", note) => {
  form.dataset.mode = mode;
  form.dataset.noteId = note?.id;

  if (note) {
    form.querySelector("#name").value = note.name;
    form.querySelector("#category").value = note.category;
    form.querySelector("#content").value = note.content;
  }

  dialog.showModal();

  cancelButton.addEventListener("click", () => {
    resetForm();
  });
};

const updateTables = () => {
  clearTable(listOfNotesTbody);
  clearTable(statisticsTbody);

  listOfNotesTbody.dataset.status === "active"
    ? fillTable(listOfNotesTbody, getActive())
    : fillTable(listOfNotesTbody, getArchive());

  fillTable(statisticsTbody, getStatistics());
};

addNoteButton.addEventListener("click", () => showDialog(), false);

toggle.addEventListener(
  "click",
  () => {
    clearTable(listOfNotesTbody);

    if (listOfNotesTbody.dataset.status === "active") {
      toggle.innerHTML =
        '<div><i class="bi bi-arrow-repeat"></i>Archive Notes</div>';
      listOfNotesTbody.dataset.status = "archive";
      fillTable(listOfNotesTbody, getArchive());
    } else {
      toggle.innerHTML =
        '<div><i class="bi bi-arrow-repeat"></i>Active Notes</div>';
      listOfNotesTbody.dataset.status = "active";
      fillTable(listOfNotesTbody, getActive());
    }
  },
  false
);

const resetForm = () => {
  errorMessage.textContent = "";
  form.reset();
  dialog.close();
};

form.addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.target).entries());

    if (!formData.name.trim() || !formData.content.trim()) {
      errorMessage.textContent = "Please fill the form.";
      return;
    }
    errorMessage.textContent = "";

    form.dataset.mode === "edit"
      ? editNote(formData, form.dataset.noteId)
      : createNote(formData);

    resetForm();

    fillTable(listOfNotesTbody, getActive());
    fillTable(statisticsTbody, getStatistics());
    updateTables();
  },
  false
);

form.addEventListener("input", () => (errorMessage.textContent = ""));

fillTable(listOfNotesTbody, getActive());
fillTable(statisticsTbody, getStatistics());
