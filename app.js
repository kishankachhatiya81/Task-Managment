const STORAGE_KEY = 'daymark-tasks-v1';
const BUDGET_STORAGE_KEY = 'daymark-daily-budgets-v1';
const projects = [
  { name: 'Coursework', color: 'mint' },
  { name: 'Personal', color: 'coral' },
  { name: 'Campus life', color: 'blue' },
];

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const starterTasks = [
  { id: 't1', title: 'Finish the research outline', project: 'Coursework', priority: 'high', due: localDate(), completed: false, note: 'Narrow the question and add three sources.' },
  { id: 't2', title: 'Read chapter 6 for seminar', project: 'Coursework', priority: 'medium', due: localDate(), completed: false, note: '' },
  { id: 't3', title: 'Pick up groceries for the week', project: 'Personal', priority: 'low', due: localDate(1), completed: false, note: '' },
  { id: 't4', title: 'Meet Maya at the library', project: 'Campus life', priority: 'medium', due: localDate(2), completed: false, note: 'Bring the notes from Tuesday.' },
  { id: 't5', title: 'Submit statistics problem set', project: 'Coursework', priority: 'high', due: localDate(-1), completed: false, note: '' },
  { id: 't6', title: 'Book a dentist appointment', project: 'Personal', priority: 'low', due: localDate(4), completed: true, note: '' },
];

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterTasks;
  } catch {
    return starterTasks;
  }
}

function loadBudgets() {
  try {
    return JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

const state = {
  tasks: loadTasks(),
  budgets: loadBudgets(),
  budgetDate: localDate(),
  view: 'Today',
  projectFilter: 'All tasks',
  query: '',
  priorityFilter: 'All priorities',
  sort: 'Due date',
  showFilters: false,
  menuTask: null,
  editingTask: null,
};

const root = document.querySelector('#root');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function icon(name, size = 17) {
  const paths = {
    check: '<path d="m5 12 4 4L19 6"/>',
    inbox: '<path d="M4 4h16v16H4z"/><path d="M4 13h4l2 3h4l2-3h4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    completed: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    chevron: '<path d="m7 10 5 5 5-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    filter: '<path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="2"/><circle cx="15" cy="12" r="2"/>',
    sort: '<path d="M4 7h10M4 12h7m-7 5h4M18 4v16m-4-4 4 4 4-4"/>',
    sliders: '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 6h4"/>',
    trash: '<path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6"/>',
    close: '<path d="m18 6-12 12M6 6l12 12"/>',
    sparkle: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3ZM19 14l1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}

function formatDate(dateString) {
  if (!dateString) return 'No date';
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dueLabel(task) {
  if (!task.due) return 'No date';
  const offset = Math.round((new Date(`${task.due}T12:00:00`) - new Date(`${localDate()}T12:00:00`)) / 86400000);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  return formatDate(task.due);
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch {
    // Keep the task list usable when browser storage is disabled.
  }
}

function budgetForDate(date = state.budgetDate) {
  return state.budgets[date] || { limit: 3000, expenses: [] };
}

function saveBudgets() {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(state.budgets));
  } catch {
    // Keep budget controls usable when browser storage is disabled.
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(amount) || 0);
}

function budgetDateLabel(date) {
  if (date === localDate()) return 'Today';
  if (date === localDate(-1)) return 'Yesterday';
  if (date === localDate(1)) return 'Tomorrow';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function renderDailyBudget() {
  const budget = budgetForDate();
  const limit = Math.max(0, Number(budget.limit) || 0);
  const spent = budget.expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  const remaining = limit - spent;
  const progress = limit ? Math.min(100, Math.round((spent / limit) * 100)) : (spent ? 100 : 0);
  const expenses = budget.expenses.length
    ? budget.expenses.map((expense) => `<li class="budget-expense"><span class="expense-marker"></span><span class="expense-name">${escapeHtml(expense.title)}</span><strong>${formatMoney(expense.amount)}</strong><button class="expense-remove" data-action="remove-expense" data-id="${escapeHtml(expense.id)}" title="Remove expense" aria-label="Remove ${escapeHtml(expense.title)}">${icon('close', 14)}</button></li>`).join('')
    : '<li class="budget-empty">No expenses added for this day.</li>';

  return `<section class="daily-budget">
    <div class="budget-heading"><div><span class="budget-kicker">MONEY CHECK-IN</span><h2>Daily budget</h2></div><div class="budget-date-control"><button class="budget-day-button" data-action="budget-day" data-offset="-1" title="Previous day" aria-label="Previous day">‹</button><span>${budgetDateLabel(state.budgetDate)} <small>${formatDate(state.budgetDate)}</small></span><button class="budget-day-button" data-action="budget-day" data-offset="1" title="Next day" aria-label="Next day">›</button></div></div>
    <div class="budget-summary"><div class="budget-balance"><span class="budget-caption">${remaining >= 0 ? 'LEFT TO SPEND' : 'OVER BUDGET'}</span><strong class="${remaining < 0 ? 'over-budget' : ''}">${formatMoney(Math.abs(remaining))}</strong><span class="budget-detail">of ${formatMoney(limit)} daily limit</span></div><label class="budget-limit-field"><span>Daily limit</span><span class="currency-input"><b>₹</b><input type="number" min="0" step="0.01" value="${limit.toFixed(2)}" data-input="budget-limit" aria-label="Daily budget limit"></span></label><div class="budget-progress-wrap"><div class="budget-progress-label"><span>Spent ${formatMoney(spent)}</span><span>${progress}%</span></div><div class="budget-progress ${remaining < 0 ? 'over' : ''}"><span style="width:${progress}%"></span></div></div></div>
    <form class="expense-form" data-form="budget-expense"><label><span class="visually-hidden">Expense name</span><input name="title" placeholder="What did you spend on?" required></label><label><span class="visually-hidden">Expense amount</span><span class="expense-amount-input"><b>₹</b><input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></span></label><button type="submit" title="Add expense" aria-label="Add expense">${icon('plus', 17)}</button></form>
    <ul class="budget-expenses">${expenses}</ul>
  </section>`;
}

function taskCounts() {
  return {
    Today: state.tasks.filter((task) => task.due === localDate() && !task.completed).length,
    Upcoming: state.tasks.filter((task) => task.due > localDate() && !task.completed).length,
    Completed: state.tasks.filter((task) => task.completed).length,
    Inbox: state.tasks.filter((task) => !task.completed).length,
  };
}

function visibleTasks() {
  const result = state.tasks.filter((task) => {
    let matchesView = !task.completed;
    if (state.view === 'Today') matchesView = task.due === localDate() && !task.completed;
    if (state.view === 'Upcoming') matchesView = task.due > localDate() && !task.completed;
    if (state.view === 'Completed') matchesView = task.completed;
    const text = `${task.title} ${task.note} ${task.project}`.toLowerCase();
    return matchesView
      && (state.projectFilter === 'All tasks' || task.project === state.projectFilter)
      && (state.priorityFilter === 'All priorities' || task.priority === state.priorityFilter.toLowerCase())
      && text.includes(state.query.toLowerCase());
  });
  return result.sort((first, second) => {
    if (state.sort === 'Priority') return ['high', 'medium', 'low'].indexOf(first.priority) - ['high', 'medium', 'low'].indexOf(second.priority);
    if (state.sort === 'Recently added') return second.id.localeCompare(first.id);
    return (first.due || '9999-12-31').localeCompare(second.due || '9999-12-31');
  });
}

function projectColor(name) {
  return projects.find((project) => project.name === name)?.color || 'mint';
}

function renderSidebar(counts, completedCount, completion) {
  const viewIcons = { Inbox: 'inbox', Today: 'sun', Upcoming: 'calendar', Completed: 'completed' };
  const views = Object.keys(viewIcons).map((name) => `<button class="nav-item ${state.view === name && state.projectFilter === 'All tasks' ? 'active' : ''}" data-action="view" data-view="${name}">${icon(viewIcons[name])}<span>${name}</span><span class="nav-count">${counts[name]}</span></button>`).join('');
  const projectItems = projects.map((project) => `<button class="project-item ${state.projectFilter === project.name ? 'selected' : ''}" data-action="project" data-project="${escapeHtml(project.name)}"><span class="project-dot ${project.color}"></span><span>${escapeHtml(project.name)}</span><span class="nav-count">${state.tasks.filter((task) => task.project === project.name && !task.completed).length}</span></button>`).join('');

  return `<aside class="sidebar"><a class="brand" href="#home" data-action="home"><span class="brand-mark">${icon('check', 17)}</span><span>daymark<span class="brand-period">.</span></span></a>
    <div class="workspace-switcher"><span class="avatar">J</span><span class="workspace-copy"><strong>Jordan's space</strong><small>Personal workspace</small></span>${icon('chevron', 15)}</div>
    <div class="side-label">WORKSPACE</div><nav class="primary-nav" aria-label="Task views">${views}</nav>
    <div class="projects-heading"><span class="side-label">PROJECTS</span></div><nav class="project-nav" aria-label="Projects">${projectItems}</nav>
    <div class="sidebar-bottom"><div class="week-card"><div class="week-card-head"><span>TASKS DONE</span>${icon('sparkle', 15)}</div><div class="week-number">${completedCount}<span> / ${state.tasks.length}</span></div><div class="progress-track"><span style="width:${completion}%"></span></div><p>A little progress adds up.</p></div>
      <button class="help-link">${icon('help', 16)} Help &amp; feedback</button><div class="profile-row"><span class="avatar profile-avatar">JD</span><span class="workspace-copy"><strong>Jordan Davis</strong><small>Student account</small></span>${icon('more', 18)}</div></div></aside>`;
}

function renderTask(task) {
  const safeTitle = escapeHtml(task.title);
  const safeNote = escapeHtml(task.note || '');
  const overdue = task.due && task.due < localDate() && !task.completed;
  const menu = state.menuTask === task.id ? `<div class="task-menu"><button data-action="edit" data-id="${escapeHtml(task.id)}">Edit task</button><button class="delete-option" data-action="delete" data-id="${escapeHtml(task.id)}">${icon('trash', 14)} Delete task</button></div>` : '';
  return `<article class="task-row ${task.completed ? 'is-complete' : ''}"><button class="task-check ${task.completed ? 'checked' : ''}" data-action="complete" data-id="${escapeHtml(task.id)}" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">${task.completed ? icon('check', 13) : ''}</button>
    <button class="task-main" data-action="edit" data-id="${escapeHtml(task.id)}"><span class="task-title">${safeTitle}</span>${safeNote ? `<span class="task-note">${safeNote}</span>` : ''}<span class="task-mobile-meta"><span class="project-tag ${projectColor(task.project)}">${escapeHtml(task.project)}</span><span class="priority-text ${task.priority}">${escapeHtml(task.priority)}</span></span></button>
    <span class="project-tag desktop-project ${projectColor(task.project)}">${escapeHtml(task.project)}</span><span class="priority-pill ${task.priority}"><i></i>${escapeHtml(task.priority)}</span><span class="due-date ${overdue ? 'overdue' : ''}">${icon('calendar', 14)}${dueLabel(task)}</span>
    <div class="task-menu-wrap"><button class="icon-button task-more" data-action="menu" data-id="${escapeHtml(task.id)}" title="Task options">${icon('more', 18)}</button>${menu}</div></article>`;
}

function renderFilterPanel() {
  if (!state.showFilters) return '';
  const options = ['All priorities', 'High', 'Medium', 'Low'].map((priority) => `<button class="filter-choice ${state.priorityFilter === priority ? 'chosen' : ''}" data-action="priority-filter" data-priority="${priority}">${priority}</button>`).join('');
  return `<div class="filter-panel">${icon('sliders', 15)}<span>Priority</span><div class="filter-options">${options}</div><button class="clear-filter" data-action="clear-filter">Clear</button></div>`;
}

function renderModal() {
  if (!state.editingTask) return '';
  const task = state.editingTask;
  const editing = Boolean(task.id);
  const projectOptions = projects.map((project) => `<option${(task.project || 'Coursework') === project.name ? ' selected' : ''}>${project.name}</option>`).join('');
  return `<div class="modal-backdrop"><form class="task-modal task-form"><div class="modal-top"><span class="modal-eyebrow">${editing ? 'TASK DETAILS' : 'MAKE A NOTE OF IT'}</span><button type="button" class="icon-button" data-action="close-modal" title="Close">${icon('close', 19)}</button></div>
    <h2>${editing ? 'Edit task' : 'New task'}<span class="heading-period">.</span></h2>
    <label class="form-field title-field"><span>Task name</span><input name="title" autofocus value="${escapeHtml(task.title || '')}" placeholder="What needs doing?" required></label>
    <label class="form-field"><span>Notes <em>Optional</em></span><textarea name="note" placeholder="Add a little context..." rows="3">${escapeHtml(task.note || '')}</textarea></label>
    <div class="form-grid"><label class="form-field"><span>Project</span><select name="project">${projectOptions}</select></label><label class="form-field"><span>Priority</span><select name="priority"><option value="low"${task.priority === 'low' ? ' selected' : ''}>Low</option><option value="medium"${(!task.priority || task.priority === 'medium') ? ' selected' : ''}>Medium</option><option value="high"${task.priority === 'high' ? ' selected' : ''}>High</option></select></label></div>
    <label class="form-field"><span>Due date</span><input name="due" type="date" value="${escapeHtml(task.due || localDate())}"></label>
    <div class="modal-actions"><button type="button" class="button-quiet" data-action="close-modal">Cancel</button><button class="button-primary" type="submit">${icon('check', 16)} ${editing ? 'Save changes' : 'Create task'}</button></div></form></div>`;
}

function render() {
  const tasks = visibleTasks();
  const counts = taskCounts();
  const completedCount = state.tasks.filter((task) => task.completed).length;
  const completion = state.tasks.length ? Math.round((completedCount / state.tasks.length) * 100) : 0;
  const pageTitle = state.projectFilter !== 'All tasks' ? state.projectFilter : state.view;
  const dateHeading = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const subtitle = state.view === 'Today' && state.projectFilter === 'All tasks' ? 'A clear head starts with a clear plan.' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} to keep things moving.`;
  const taskList = tasks.length ? tasks.map(renderTask).join('') : `<div class="empty-state"><span class="empty-icon">${icon('check', 22)}</span><h3>${state.query ? 'No matching tasks' : state.view === 'Today' ? 'A little breathing room.' : 'Nothing on the list yet.'}</h3><p>${state.query ? 'Try another search or adjust your filters.' : 'Add a task when something comes to mind.'}</p>${!state.query ? `<button class="text-action" data-action="new-task">${icon('plus', 15)} Create a task</button>` : ''}</div>`;
  const openTasks = state.tasks.filter((task) => !task.completed).length;

  root.innerHTML = `<div class="app-shell">${renderSidebar(counts, completedCount, completion)}<main class="main-panel">
    <header class="topbar"><div class="breadcrumb"><span>Workspace</span><span class="crumb-slash">/</span><strong>${escapeHtml(pageTitle)}</strong></div><div class="top-actions"><label class="search-box">${icon('search', 16)}<input id="task-search" value="${escapeHtml(state.query)}" placeholder="Search tasks" aria-label="Search tasks"><kbd>⌘ K</kbd></label><button class="icon-button top-help" title="Help">${icon('help', 18)}</button><span class="avatar top-avatar">JD</span></div></header>
    <div class="content-wrap"><section class="page-heading"><div class="date-kicker"><span class="date-line"></span>${state.view === 'Today' && state.projectFilter === 'All tasks' ? dateHeading : 'YOUR WORKSPACE'}</div><div class="heading-row"><div><h1>${escapeHtml(pageTitle)}<span class="heading-period">.</span></h1><p class="heading-subtitle">${subtitle}</p></div><button class="button-primary" data-action="new-task">${icon('plus')} New task</button></div></section>
      <section class="quick-add-wrap"><form class="quick-add" data-form="quick-add">${icon('plus', 18)}<input name="title" placeholder="Add a task and press Enter..." aria-label="Quick add task" required><button type="submit">Add task <span>↵</span></button></form></section>
      ${renderDailyBudget()}
      <section class="task-section"><div class="list-toolbar"><div class="list-heading"><h2>${state.view === 'Today' && state.projectFilter === 'All tasks' ? 'Your focus' : 'Task list'}</h2><span class="task-total">${tasks.length}</span></div><div class="list-controls"><button class="control-button ${state.showFilters ? 'control-on' : ''}" data-action="toggle-filters">${icon('filter', 15)} Filter${state.priorityFilter !== 'All priorities' ? '<span class="filter-dot"></span>' : ''}</button><label class="sort-control">${icon('sort', 15)}<select id="task-sort" aria-label="Sort tasks"><option${state.sort === 'Due date' ? ' selected' : ''}>Due date</option><option${state.sort === 'Priority' ? ' selected' : ''}>Priority</option><option${state.sort === 'Recently added' ? ' selected' : ''}>Recently added</option></select>${icon('chevron', 13)}</label></div></div>
        ${renderFilterPanel()}<div class="task-list">${taskList}</div></section><footer class="list-footer"><span>${icon('clock', 14)} ${openTasks} open tasks across your workspace</span><span>Made for the things that matter.</span></footer></div></main></div>${renderModal()}`;
}

function makeId() {
  return globalThis.crypto?.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) {
    if (event.target.classList.contains('modal-backdrop')) {
      state.editingTask = null;
      render();
    }
    return;
  }
  const { action, id } = button.dataset;
  if (action === 'home') {
    event.preventDefault();
    state.view = 'Today';
    state.projectFilter = 'All tasks';
  } else if (action === 'view') {
    state.view = button.dataset.view;
    state.projectFilter = 'All tasks';
  } else if (action === 'project') {
    state.projectFilter = button.dataset.project;
    state.view = 'Inbox';
  } else if (action === 'new-task') {
    state.editingTask = { project: state.projectFilter === 'All tasks' ? 'Coursework' : state.projectFilter };
  } else if (action === 'edit') {
    state.editingTask = state.tasks.find((task) => task.id === id);
    state.menuTask = null;
  } else if (action === 'close-modal') {
    state.editingTask = null;
  } else if (action === 'complete') {
    state.tasks = state.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
    saveTasks();
  } else if (action === 'delete') {
    state.tasks = state.tasks.filter((task) => task.id !== id);
    state.menuTask = null;
    saveTasks();
  } else if (action === 'menu') {
    state.menuTask = state.menuTask === id ? null : id;
  } else if (action === 'toggle-filters') {
    state.showFilters = !state.showFilters;
  } else if (action === 'priority-filter') {
    state.priorityFilter = button.dataset.priority;
  } else if (action === 'clear-filter') {
    state.priorityFilter = 'All priorities';
  } else if (action === 'budget-day') {
    const date = new Date(`${state.budgetDate}T12:00:00`);
    date.setDate(date.getDate() + Number(button.dataset.offset));
    state.budgetDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  } else if (action === 'remove-expense') {
    const budget = budgetForDate();
    state.budgets[state.budgetDate] = { ...budget, expenses: budget.expenses.filter((expense) => expense.id !== id) };
    saveBudgets();
  }
  render();
});

root.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  if (form.matches('[data-form="quick-add"]')) {
    const fields = new FormData(form);
    const title = fields.get('title').trim();
    if (!title) return;
    state.tasks.unshift({ id: makeId(), title, note: '', project: state.projectFilter === 'All tasks' ? 'Coursework' : state.projectFilter, priority: 'medium', due: localDate(), completed: false });
    saveTasks();
  } else if (form.matches('[data-form="budget-expense"]')) {
    const fields = new FormData(form);
    const title = fields.get('title').trim();
    const amount = Number(fields.get('amount'));
    if (!title || !Number.isFinite(amount) || amount <= 0) return;
    const budget = budgetForDate();
    state.budgets[state.budgetDate] = { ...budget, expenses: [...budget.expenses, { id: makeId(), title, amount }] };
    saveBudgets();
  } else if (form.matches('.task-form')) {
    const fields = new FormData(form);
    const task = {
      id: state.editingTask.id || makeId(),
      title: fields.get('title').trim(),
      note: (fields.get('note') || '').trim(),
      project: fields.get('project') || 'Coursework',
      priority: fields.get('priority') || 'medium',
      due: fields.get('due') || '',
      completed: state.editingTask.completed || false,
    };
    if (!task.title) return;
    const exists = state.tasks.some((item) => item.id === task.id);
    state.tasks = exists ? state.tasks.map((item) => item.id === task.id ? task : item) : [task, ...state.tasks];
    state.editingTask = null;
    saveTasks();
  }
  render();
});

root.addEventListener('input', (event) => {
  if (event.target.id !== 'task-search') return;
  state.query = event.target.value;
  const position = event.target.selectionStart;
  render();
  const search = root.querySelector('#task-search');
  search.focus();
  search.setSelectionRange(position, position);
});

root.addEventListener('change', (event) => {
  if (event.target.id === 'task-sort') {
    state.sort = event.target.value;
    render();
  } else if (event.target.dataset.input === 'budget-limit') {
    const budget = budgetForDate();
    const limit = Math.max(0, Number(event.target.value) || 0);
    state.budgets[state.budgetDate] = { ...budget, limit };
    saveBudgets();
    render();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && (state.editingTask || state.menuTask)) {
    state.editingTask = null;
    state.menuTask = null;
    render();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    root.querySelector('#task-search')?.focus();
  }
});

render();