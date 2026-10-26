var KEY = "todos";
var item = document.getElementById("item");
var addButton = document.getElementById("add");
var list = document.getElementById("list");
var count = document.getElementById("count");
var empty = document.getElementById("empty");
var calendar = document.getElementById("calendar");
var themeButton = document.getElementById("theme");

var todos = load();
render();
renderCalendar();

function load() {
  try {
    var saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
  } catch (e) {}
}

function render() {
  list.textContent = "";
  var order = todos.map(function (t, i) { return i; }).sort(function (a, b) {
    return (todos[b].star ? 1 : 0) - (todos[a].star ? 1 : 0) || a - b;
  });
  order.forEach(function (index) {
    var todo = todos[index];
    var li = document.createElement("li");
    if (todo.done) li.className = "done";

    var check = document.createElement("input");
    check.type = "checkbox";
    check.checked = todo.done;
    check.addEventListener("change", function () {
      todos[index].done = check.checked;
      save();
      render();
    });

    var text = document.createElement("span");
    text.textContent = todo.text;

    var star = document.createElement("button");
    star.type = "button";
    star.className = todo.star ? "star on" : "star";
    star.textContent = "★";
    star.setAttribute("aria-label", "중요 표시");
    star.setAttribute("aria-pressed", todo.star ? "true" : "false");
    star.addEventListener("click", function () {
      todos[index].star = !todos[index].star;
      save();
      render();
    });

    var del = document.createElement("button");
    del.type = "button";
    del.textContent = "삭제";
    del.addEventListener("click", function () {
      todos.splice(index, 1);
      save();
      render();
    });

    li.append(check, text, star, del);
    list.appendChild(li);
  });

  count.textContent = todos.filter(function (t) { return !t.done; }).length;
  empty.hidden = todos.length > 0;
}

addButton.addEventListener("click", function () {
  var text = item.value.trim();
  if (text === "") return;
  todos.push({ text: text, done: false });
  item.value = "";
  save();
  render();
});

function renderCalendar() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth();
  var first = new Date(year, month, 1).getDay();
  var days = new Date(year, month + 1, 0).getDate();

  calendar.textContent = "";

  var title = document.createElement("div");
  title.className = "cal-title";
  title.textContent = year + "년 " + (month + 1) + "월";
  calendar.appendChild(title);

  var grid = document.createElement("div");
  grid.className = "cal-grid";
  ["일", "월", "화", "수", "목", "금", "토"].forEach(function (name) {
    var head = document.createElement("span");
    head.className = "cal-head";
    head.textContent = name;
    grid.appendChild(head);
  });
  for (var i = 0; i < first; i++) {
    grid.appendChild(document.createElement("span"));
  }
  for (var d = 1; d <= days; d++) {
    var cell = document.createElement("span");
    cell.textContent = d;
    if (d === now.getDate()) cell.className = "today";
    grid.appendChild(cell);
  }
  calendar.appendChild(grid);
}

function applyTheme(light) {
  document.body.classList.toggle("light", light);
  themeButton.textContent = light ? "어두운 화면으로" : "밝은 화면으로";
}

try {
  applyTheme(localStorage.getItem("theme") === "light");
} catch (e) {}

themeButton.addEventListener("click", function () {
  var light = !document.body.classList.contains("light");
  applyTheme(light);
  try {
    localStorage.setItem("theme", light ? "light" : "dark");
  } catch (e) {}
});
