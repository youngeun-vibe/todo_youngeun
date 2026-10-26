var KEY = "todos";
var item = document.getElementById("item");
var addButton = document.getElementById("add");
var list = document.getElementById("list");
var clearButton = document.getElementById("clear");
var count = document.getElementById("count");
var empty = document.getElementById("empty");
var calendar = document.getElementById("calendar");
var themeButton = document.getElementById("theme");

var today = new Date();
var selected = dateKey(today);
var viewYear = today.getFullYear();
var viewMonth = today.getMonth();

var todos = load();
render();

function dateKey(date) {
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + m + "-" + d;
}

function load() {
  try {
    var saved = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(saved)) return [];
    // 날짜가 없던 옛 할 일은 오늘 할 일로 본다
    saved.forEach(function (t) {
      if (!t.date) t.date = dateKey(new Date());
    });
    return saved;
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

  // 선택한 날짜의 할 일만, 완료 안 한 것 → 별표 → 추가한 순서로 보여 준다
  var order = todos.map(function (t, i) { return i; }).filter(function (i) {
    return todos[i].date === selected;
  }).sort(function (a, b) {
    return (todos[a].done ? 1 : 0) - (todos[b].done ? 1 : 0) ||
      (todos[b].star ? 1 : 0) - (todos[a].star ? 1 : 0) || a - b;
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
      if (!confirm("정말 지울까요?")) return;
      todos.splice(index, 1);
      save();
      render();
    });

    li.append(check, text, star, del);
    list.appendChild(li);
  });

  var shown = order.map(function (i) { return todos[i]; });
  count.textContent = shown.filter(function (t) { return !t.done; }).length;
  empty.hidden = shown.length > 0;
  clearButton.hidden = !shown.some(function (t) { return t.done; });
  renderCalendar();
}

function add() {
  var text = item.value.trim();
  if (text === "") return;
  todos.push({ text: text, done: false, star: false, date: selected });
  item.value = "";
  save();
  render();
}

addButton.addEventListener("click", add);

item.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.isComposing) add();
});

clearButton.addEventListener("click", function () {
  if (!confirm("완료한 할 일을 모두 지울까요?")) return;
  todos = todos.filter(function (t) {
    return !(t.date === selected && t.done);
  });
  save();
  render();
});

function renderCalendar() {
  var first = new Date(viewYear, viewMonth, 1).getDay();
  var days = new Date(viewYear, viewMonth + 1, 0).getDate();
  var todayKey = dateKey(new Date());

  calendar.textContent = "";

  var head = document.createElement("div");
  head.className = "cal-title";

  var prev = document.createElement("button");
  prev.type = "button";
  prev.className = "cal-nav";
  prev.textContent = "‹";
  prev.setAttribute("aria-label", "이전 달");
  prev.addEventListener("click", function () { moveMonth(-1); });

  var title = document.createElement("span");
  title.textContent = viewYear + "년 " + (viewMonth + 1) + "월";

  var next = document.createElement("button");
  next.type = "button";
  next.className = "cal-nav";
  next.textContent = "›";
  next.setAttribute("aria-label", "다음 달");
  next.addEventListener("click", function () { moveMonth(1); });

  head.append(prev, title, next);
  calendar.appendChild(head);

  var grid = document.createElement("div");
  grid.className = "cal-grid";
  ["일", "월", "화", "수", "목", "금", "토"].forEach(function (name) {
    var label = document.createElement("span");
    label.className = "cal-head";
    label.textContent = name;
    grid.appendChild(label);
  });
  for (var i = 0; i < first; i++) {
    grid.appendChild(document.createElement("span"));
  }
  for (var d = 1; d <= days; d++) {
    var key = dateKey(new Date(viewYear, viewMonth, d));
    var cell = document.createElement("button");
    cell.type = "button";
    cell.textContent = d;
    cell.dataset.date = key;
    var classes = [];
    if (key === todayKey) classes.push("today");
    if (key === selected) classes.push("selected");
    if (todos.some(function (t) { return t.date === key; })) classes.push("has");
    cell.className = classes.join(" ");
    cell.addEventListener("click", function () {
      selected = this.dataset.date;
      render();
    });
    grid.appendChild(cell);
  }
  calendar.appendChild(grid);
}

function moveMonth(step) {
  var moved = new Date(viewYear, viewMonth + step, 1);
  viewYear = moved.getFullYear();
  viewMonth = moved.getMonth();
  renderCalendar();
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
