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
      if (task.done) completed++;

      const listItem = $(`
       <li class="list-group-item p-3 rounded shadow-sm mb-2 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 flex-wrap">

          <div class="flex-grow-1">
            <span class="task-text ${task.done ? "text-decoration-line-through text-muted" : ""
        }" data-index="${index}" style="cursor: pointer;">${task.text
        }</span>
            <div class="warning-text text-danger small d-none mt-1">⚠️ Please check the task before deleting.</div>
          </div>

         <div class="delete-container d-flex align-items-center gap-2">
  ${getPriorityBadge(task.priority)}
  <select class="form-select form-select-sm priority-dropdown d-none" data-index="${index}">
    <option value="High">High</option>
    <option value="Medium">Medium</option>
    <option value="Low">Low</option>
  </select>
  <button class="btn btn-sm btn-outline-danger deleteBtn">
    <i class="fas fa-trash-alt"></i>
  </button>
</div>

        </li>
      `);

      listItem.find(".priority-dropdown").val(task.priority);
      todoList.append(listItem);
    });

    taskStats.text(`${completed} / ${tasks.length} Completed`);
    saveTasks();
  }

  // Add task
  addBtn.click(function () {
    const text = todoInput.val().trim();
    const priority = $("#prioritySelect").val();

    $(".input-warning, .priority-warning").remove();

    let hasError = false;

    if (text === "") {
      $(
        '<div class="text-danger input-warning small mt-1">⚠️ Please enter a task.</div>'
      ).insertAfter("#todoInput");
      hasError = true;
    }

    if (!priority) {
      $(
        '<div class="text-danger priority-warning small mt-1">⚠️ Please select a priority.</div>'
      ).insertAfter("#prioritySelect");
      hasError = true;
    }

    if (hasError) return;

    tasks.push({ text, done: false, priority });
    saveTasks();

    todoInput.val("");
    $("#prioritySelect").val("");

    renderTasks();
  });

  todoInput.on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();  
    }
  });

  $("#prioritySelect").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();
    }
  });

  // Delete task
  todoList.on("click", ".deleteBtn", function (e) {
    e.stopPropagation();
    const li = $(this).closest("li");
    const index = todoList.find("li").index(li); // Reliable index

    if (index === -1 || !tasks[index]) return; // Safety check

    tasks.splice(index, 1);
    renderTasks();
  });

  
  todoList.on("click", ".task-text", function () {
    const index = $(this).data("index");
    const $span = $(this);
    const $li = $span.closest("li");
    const $actionArea = $li.find(".action-area");
    const originalText = tasks[index].text;
 
    $actionArea.fadeOut(200);

    const $input = $(
      `<input type="text" class="form-control form-control-sm task-edit-input" style="max-width: 250px;">`
    ).val(originalText);
    $span.replaceWith($input);
    $input.hide().fadeIn(200).focus();

    $input.on("blur", function () {
      const newText = $input.val().trim();
      if (newText !== "") {
        tasks[index].text = newText;
      }
      renderTasks();
    });

    $input.on("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        $input.blur();  
      }
    });
  });

  renderTasks();
});

 
$(document).on("keydown", "#todoInput, .task-edit-input", function (e) {
  if (e.key === "Tab") {
    e.preventDefault();

    const $input = $(this);
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const value = $input.val();

     
    $input.val(value.substring(0, start) + "\t" + value.substring(end));

    
    this.selectionStart = this.selectionEnd = start + 1;
  }
});
