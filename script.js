var KEY = "todos";
var item = document.getElementById("item");
var addButton = document.getElementById("add");
var list = document.getElementById("list");
var count = document.getElementById("count");
var empty = document.getElementById("empty");

var todos = load();
render();

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
  todos.forEach(function (todo, index) {
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

    var del = document.createElement("button");
    del.type = "button";
    del.textContent = "삭제";
    del.addEventListener("click", function () {
      todos.splice(index, 1);
      save();
      render();
    });

    li.append(check, text, del);
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
