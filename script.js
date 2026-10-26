var SUPABASE_URL = "https://yuzsogcdyuoxaasjnhzj.supabase.co";
var SUPABASE_KEY = "sb_publishable_VonP9awr3vLQqBNw5LPdxQ_A1Y1BY7V";
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

var todos = [];
render();
loadTodos();

function dateKey(date) {
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + m + "-" + d;
}

function api(method, query, body) {
  var options = {
    method: method,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }
  };
  if (body) {
    options.body = JSON.stringify(body);
    options.headers.Prefer = "return=representation";
  }
  return fetch(SUPABASE_URL + "/rest/v1/todos" + query, options).then(function (res) {
    if (!res.ok) throw new Error("저장소 응답 " + res.status);
    return res.status === 204 ? null : res.json();
  });
}

function failed() {
  alert("저장소와 연결하지 못했어요. 인터넷을 확인하고 다시 해 주세요.");
}

// 표의 한 줄을 화면에서 쓰는 모양으로 바꾼다
function toTodo(row) {
  return {
    id: row.id,
    text: row.text,
    done: row.done,
    star: row.star,
    date: row.due_date
  };
}

function loadTodos() {
  api("GET", "?select=id,text,done,star,due_date&order=id.asc")
    .then(function (rows) {
      todos = rows.map(toTodo);
      render();
    })
    .catch(failed);
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
      var done = check.checked;
      api("PATCH", "?id=eq." + todo.id, { done: done })
        .then(function () {
          todos[index].done = done;
          render();
        })
        .catch(function () {
          failed();
          render();
        });
    });

    var text = document.createElement("span");
    text.textContent = todo.text;

    var when = document.createElement("time");
    when.dateTime = todo.date;
    when.textContent = Number(todo.date.slice(5, 7)) + "월 " + Number(todo.date.slice(8, 10)) + "일";

    var star = document.createElement("button");
    star.type = "button";
    star.className = todo.star ? "star on" : "star";
    star.textContent = "★";
    star.setAttribute("aria-label", "중요 표시");
    star.setAttribute("aria-pressed", todo.star ? "true" : "false");
    star.addEventListener("click", function () {
      var on = !todos[index].star;
      api("PATCH", "?id=eq." + todo.id, { star: on })
        .then(function () {
          todos[index].star = on;
          render();
        })
        .catch(failed);
    });

    var del = document.createElement("button");
    del.type = "button";
    del.textContent = "삭제";
    del.addEventListener("click", function () {
      if (!confirm("정말 지울까요?")) return;
      api("DELETE", "?id=eq." + todo.id)
        .then(function () {
          todos.splice(index, 1);
          render();
        })
        .catch(failed);
    });

    li.append(check, text, when, star, del);
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
  if (text.length > 200) {
    alert("할 일은 200자까지 적을 수 있어요.");
    return;
  }
  api("POST", "", { text: text, due_date: selected })
    .then(function (rows) {
      todos.push(toTodo(rows[0]));
      item.value = "";
      render();
    })
    .catch(failed);
}

addButton.addEventListener("click", add);

item.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.isComposing) add();
});

clearButton.addEventListener("click", function () {
  var gone = todos.filter(function (t) {
    return t.date === selected && t.done;
  });
  if (gone.length === 0) return;
  if (!confirm("완료한 할 일을 모두 지울까요?")) return;
  var ids = gone.map(function (t) { return t.id; });
  api("DELETE", "?id=in.(" + ids.join(",") + ")")
    .then(function () {
      todos = todos.filter(function (t) { return ids.indexOf(t.id) === -1; });
      render();
    })
    .catch(failed);
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
