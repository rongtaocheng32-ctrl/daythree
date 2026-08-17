const STORAGE_KEY = 'daythree.state.v1';
const today = isoDate(new Date());

function isoDate(date) {
  return date.toLocaleDateString('en-CA');
}

function blankState() {
  return {
    priorities: Array.from({ length: 3 }, () => ({ text: '', done: false })),
    note: '',
    habits: []
  };
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || !Array.isArray(parsed.priorities) || !Array.isArray(parsed.habits)) return blankState();
    parsed.priorities = [...parsed.priorities, ...blankState().priorities].slice(0, 3);
    return parsed;
  } catch {
    return blankState();
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderPriorities() {
  const host = document.querySelector('#priorities');
  host.replaceChildren();
  state.priorities.forEach((priority, index) => {
    const row = document.createElement('label');
    row.className = `priority${priority.done ? ' done' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = priority.done;
    checkbox.setAttribute('aria-label', `完成第 ${index + 1} 项`);
    checkbox.addEventListener('change', () => {
      state.priorities[index].done = checkbox.checked;
      saveState();
      renderPriorities();
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 80;
    input.placeholder = `第 ${index + 1} 件重要的事`;
    input.value = priority.text;
    input.addEventListener('input', () => {
      state.priorities[index].text = input.value;
      saveState();
    });

    row.append(checkbox, input);
    host.append(row);
  });

  const completed = state.priorities.filter(item => item.done && item.text.trim()).length;
  const filled = state.priorities.filter(item => item.text.trim()).length;
  document.querySelector('#progress-label').textContent = `${completed} / ${filled || 3}`;
  document.querySelector('#progress-bar').style.width = `${completed / 3 * 100}%`;
}

function lastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return { iso: isoDate(date), label: `${date.getMonth() + 1}/${date.getDate()}` };
  });
}

function streakFor(habit) {
  let streak = 0;
  const date = new Date();
  while (habit.completedDates.includes(isoDate(date))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function renderHabits() {
  const host = document.querySelector('#habits');
  host.replaceChildren();
  if (!state.habits.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '添加一个想坚持的小习惯。';
    host.append(empty);
    return;
  }

  state.habits.forEach(habit => {
    const item = document.createElement('article');
    item.className = 'habit';
    const head = document.createElement('div');
    head.className = 'habit-head';
    const title = document.createElement('span');
    title.className = 'habit-name';
    title.textContent = habit.name;
    const meta = document.createElement('span');
    meta.className = 'streak';
    meta.textContent = `连续 ${streakFor(habit)} 天`;
    const remove = document.createElement('button');
    remove.className = 'delete-habit';
    remove.textContent = '删除';
    remove.addEventListener('click', () => {
      state.habits = state.habits.filter(item => item.id !== habit.id);
      saveState();
      renderHabits();
    });
    head.append(title, meta, remove);

    const days = document.createElement('div');
    days.className = 'days';
    lastSevenDays().forEach(day => {
      const button = document.createElement('button');
      button.className = `day${habit.completedDates.includes(day.iso) ? ' done' : ''}`;
      button.textContent = day.label;
      button.title = day.iso;
      button.addEventListener('click', () => {
        habit.completedDates = habit.completedDates.includes(day.iso)
          ? habit.completedDates.filter(value => value !== day.iso)
          : [...habit.completedDates, day.iso];
        saveState();
        renderHabits();
      });
      days.append(button);
    });
    item.append(head, days);
    host.append(item);
  });
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'full'
}).format(new Date());

document.querySelector('#note').value = state.note;
document.querySelector('#note').addEventListener('input', event => {
  state.note = event.target.value;
  saveState();
});

document.querySelector('#habit-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('#habit-input');
  const name = input.value.trim();
  if (!name) return;
  state.habits.push({ id: crypto.randomUUID(), name, completedDates: [] });
  input.value = '';
  saveState();
  renderHabits();
});

document.querySelector('#export-button').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `daythree-${today}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('数据已导出');
});

document.querySelector('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported.priorities) || !Array.isArray(imported.habits)) throw new Error('invalid');
    state = { priorities: imported.priorities.slice(0, 3), habits: imported.habits, note: String(imported.note || '') };
    while (state.priorities.length < 3) state.priorities.push({ text: '', done: false });
    saveState();
    document.querySelector('#note').value = state.note;
    renderPriorities();
    renderHabits();
    showToast('数据已导入');
  } catch {
    showToast('导入失败：文件格式不正确');
  }
  event.target.value = '';
});

document.querySelector('#clear-button').addEventListener('click', () => {
  if (!window.confirm('确定清空任务、习惯和复盘内容吗？')) return;
  state = blankState();
  saveState();
  document.querySelector('#note').value = '';
  renderPriorities();
  renderHabits();
  showToast('数据已清空');
});

renderPriorities();
renderHabits();
