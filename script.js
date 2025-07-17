$(document).ready(function () {
   
localStorage.removeItem("theme");
localStorage.removeItem("todoList");

  const todoInput = $("#todoInput");
  const addBtn = $("#addBtn");
  const todoList = $("#todoList");
  const taskStats = $("#taskStats");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function getPriorityBadge(priority) {
    const colors = {
      High: "danger",
      Medium: "warning",
      Low: "success",
    };
    return `<span class="badge bg-${colors[priority]}">${priority}</span>`;
  }

 function renderTasks() {
  const priorityOrder = { High: 1, Medium: 2, Low: 3 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  todoList.empty();
  let completed = 0;

  tasks.forEach((task, index) => {
    const checked = task.done ? "checked" : "";
    if (task.done) completed++;

    const listItem = $(`
      <li class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <!-- Left: Task Checkbox and Text -->
        <div class="form-check flex-grow-1">
          <input class="form-check-input me-2" type="checkbox" ${checked} data-index="${index}">
          <label class="form-check-label d-inline">
            <span class="task-text ${task.done ? 'text-decoration-line-through text-muted' : ''}">${task.text}</span>
          </label>
          <div class="warning-text text-danger small d-none mt-1">⚠️ Please check the task before deleting.</div>
        </div>

        <!-- Right: Controls and Priority Badge -->
        <div class="d-flex align-items-center flex-wrap gap-2">
          ${getPriorityBadge(task.priority)}
          <select class="form-select form-select-sm priority-dropdown d-none" data-index="${index}">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button class="btn btn-sm btn-outline-success saveBtn d-none"><i class="fas fa-check"></i></button>
          <button class="btn btn-sm btn-outline-primary editBtn"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger deleteBtn"><i class="fas fa-trash-alt"></i></button>
        </div>
      </li>
    `);

    listItem.find(".priority-dropdown").val(task.priority);
    todoList.append(listItem);
  });

  taskStats.text(`${completed} / ${tasks.length} Completed`);
  saveTasks();
}


  
  addBtn.click(function () {
    const text = todoInput.val().trim();
    const priority = $("#prioritySelect").val();
 
    $(".input-warning, .priority-warning").remove();

    let hasError = false;

    if (text === "") {
      $('<div class="text-danger input-warning small mt-1">⚠️ Please enter a task.</div>')
        .insertAfter(".input-wrapper");
      hasError = true;
    }

    if (!priority) {
      $('<div class="text-danger priority-warning small mt-1">⚠️ Please select a priority.</div>')
        .insertAfter(".dropdown-wrapper");
      hasError = true;
    }

    if (hasError) return;

    tasks.push({ text, done: false, priority });
    saveTasks();

     
    todoInput.val("");
    $("#prioritySelect").val("");

    renderTasks();
  });

   
  todoList.on("change", ".form-check-input", function () {
    const index = $(this).data("index");
    tasks[index].done = this.checked;
    renderTasks();
  });

   
  todoList.on("click", ".deleteBtn", function () {
    const li = $(this).closest("li");
    const index = li.find("input[type='checkbox']").data("index");

    if (!tasks[index].done) {
      li.find(".warning-text").removeClass("d-none");
      setTimeout(() => li.find(".warning-text").addClass("d-none"), 2500);
      return;
    }

    tasks.splice(index, 1);
    renderTasks();
  });

   
  todoList.on("click", ".editBtn", function () {
    const li = $(this).closest("li");
    const index = li.find("input[type='checkbox']").data("index");

    const task = tasks[index];
    const taskSpan = li.find(".task-text");
    const currentText = task.text;

   
    taskSpan.replaceWith(`<input type="text" class="form-control form-control-sm task-edit-input mt-1" value="${currentText}" style="max-width: 250px;">`);

    li.find(".editBtn").addClass("d-none");
    li.find(".saveBtn").removeClass("d-none");
    li.find(".priority-dropdown").removeClass("d-none").val(task.priority);
  });

   
  todoList.on("click", ".saveBtn", function () {
    const li = $(this).closest("li");
    const index = li.find("input[type='checkbox']").data("index");

    const newText = li.find(".task-edit-input").val().trim();
    const newPriority = li.find(".priority-dropdown").val();

    if (newText) {
      tasks[index].text = newText;
      tasks[index].priority = newPriority;
    }

    renderTasks();
  });

  renderTasks();
});
