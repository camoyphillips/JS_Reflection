var tasks = [];
var activeTaskId = null;
var startTime = null;
var timerInterval = null;
var commentTaskId = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('visible');
  });
  const target = document.getElementById(id);
  if (target) target.classList.add('visible');
}

function addTask() {
  const nameInput = document.getElementById("task-name");
  const timeInput = document.getElementById("estimated-time");

  const name = nameInput.value.trim();
  const estimatedTime = parseInt(timeInput.value);

  if (!name || isNaN(estimatedTime)) return;

  const task = {
    id: Date.now(),
    name,
    estimatedTime,
    completed: false,
    actualTime: null,
    comment: ""
  };

  tasks.push(task);
  nameInput.value = "";
  timeInput.value = "";
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  let allComplete = true;

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "task";

    const title = document.createElement("strong");
    title.textContent = task.name;

    const estimate = document.createElement("div");
    estimate.textContent = `Estimated: ${task.estimatedTime} min`;

    div.appendChild(title);
    div.appendChild(document.createElement("br"));
    div.appendChild(estimate);

    if (task.completed) {
      const completedMsg = document.createElement("p");
      completedMsg.innerHTML = `<strong>✔ Completed</strong> (${task.actualTime} min)`;
      div.appendChild(completedMsg);
    } else {
      const startBtn = document.createElement("button");
      startBtn.textContent = "Start";
      startBtn.onclick = () => startTask(task.id);
      div.appendChild(startBtn);

      const commentBtn = document.createElement("button");
      commentBtn.textContent = "Add Comment";
      commentBtn.onclick = () => openComment(task.id);
      div.appendChild(commentBtn);

      allComplete = false;
    }

    if (task.comment) {
      const commentPara = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = "Comment:";
      commentPara.appendChild(em);
      commentPara.append(` ${task.comment}`);
      div.appendChild(commentPara);
    }

    list.appendChild(div);
  });

  const msg = document.getElementById("completion-message");
  msg.style.display = (tasks.length > 0 && allComplete) ? "block" : "none";

  if (tasks.length > 0 && allComplete) {
    showScreen("completion-screen");
    if (typeof completionSound !== "undefined") {
      completionSound.play();
    }
  }
}

function startTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  activeTaskId = id;
  startTime = Date.now();

  const nameElem = document.getElementById("active-task-name");
  if (nameElem) nameElem.textContent = task.name;

  const timeElem = document.getElementById("elapsed-time");
  if (timeElem) timeElem.textContent = "0:00";

  showScreen("task-active-screen");
  updateElapsedTime();
}

function updateElapsedTime() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const now = Date.now();
    const diff = now - startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const timeElem = document.getElementById("elapsed-time");
    if (timeElem) {
      timeElem.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

function completeTask() {
  clearInterval(timerInterval);

  const elapsedMin = Math.round((Date.now() - startTime) / 60000);
  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return;

  task.completed = true;
  task.actualTime = elapsedMin;

  document.getElementById("completed-task-name").textContent = task.name;
  document.getElementById("completed-estimate").textContent = task.estimatedTime;
  document.getElementById("completed-actual").textContent = task.actualTime;

  showScreen("task-complete-screen");
  renderTasks();
}

function openComment(id) {
  commentTaskId = id;
  const commentBox = document.getElementById("comment-text");
  if (commentBox) commentBox.value = "";
  showScreen("add-comment-screen");
}

function submitComment() {
  const text = document.getElementById("comment-text").value.trim();
  if (commentTaskId !== null && text) {
    const task = tasks.find(t => t.id === commentTaskId);
    if (task) {
      task.comment = text;
    }
    commentTaskId = null;
    renderTasks();
  }
  showScreen("task-list-screen");
}

function cancelComment() {
  commentTaskId = null;
  showScreen("task-list-screen");
}
