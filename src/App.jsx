import { useState, useEffect, useRef } from "react";
import { FiEdit2, FiSave, FiTrash2 } from "react-icons/fi";
import "./App.css";

function App() {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [input, setInput] = useState("");
  const [listTitle, setListTitle] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");

  const inputRef = useRef(null);
// LOAD
useEffect(() => {
  const saved = localStorage.getItem("todoLists");

  if (saved) {
    const parsed = JSON.parse(saved);
    setLists(parsed);

    if (parsed.length > 0) {
      setActiveListId(parsed[0].id);
    }
  }
}, []);

// SAVE
const isFirstLoad = useRef(true);

useEffect(() => {
  if (isFirstLoad.current) {
    isFirstLoad.current = false;
    return;
  }

  localStorage.setItem("todoLists", JSON.stringify(lists));
}, [lists]);

  const activeList = lists.find(l => l.id === activeListId);

  const totalTasks = activeList ? activeList.tasks.length : 0;

const completedTasks = activeList
  ? activeList.tasks.filter((task) => task.completed).length
  : 0;

const remainingTasks = totalTasks - completedTasks;

const progress =
  totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);

  // ADD LIST
  const handleAddList = () => {
    const trimmed = listTitle.trim();
    if (!trimmed) return;

    const newList = {
      id: Date.now(),
      title: trimmed,
      tasks: []
    };

    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    setListTitle("");
  };

  // DELETE LIST
  const handleDeleteList = () => {
    if (!window.confirm("Delete this list?")) return;

    const updated = lists.filter(l => l.id !== activeListId);
    setLists(updated);
    setActiveListId(updated.length ? updated[0].id : null);
  };

  // ADD TASK
  const handleAddTask = () => {
    if (!activeList) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    const updatedLists = lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          tasks: [
            ...list.tasks,
            { id: Date.now(), text: trimmed, completed: false }
          ]
        };
      }
      return list;
    });

    setLists(updatedLists);
    setInput("");
    inputRef.current.focus();
  };

  // DELETE TASK
  const handleDelete = (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    const updatedLists = lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          tasks: list.tasks.filter(t => t.id !== taskId)
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // TOGGLE
  const toggleTask = (taskId) => {
    const updatedLists = lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          tasks: list.tasks.map(t =>
            t.id === taskId
              ? { ...t, completed: !t.completed }
              : t
          )
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // EDIT TASK
  const handleEdit = (taskId, newText) => {
    const updatedLists = lists.map(list => {
      if (list.id === activeListId) {
        return {
          ...list,
          tasks: list.tasks.map(t =>
            t.id === taskId ? { ...t, text: newText } : t
          )
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  // CLEAR ALL
  const handleClearAll = () => {
    if (!window.confirm("Clear all tasks?")) return;

    const updated = lists.map(list =>
      list.id === activeListId ? { ...list, tasks: [] } : list
    );

    setLists(updated);
  };

  // FILTER + SEARCH
  const filteredTasks =
    activeList?.tasks.filter(task => {
      if (filter === "completed" && !task.completed) return false;
      if (filter === "pending" && task.completed) return false;

      return task.text.toLowerCase().includes(search.toLowerCase());
    }) || [];

  return (
    <div className="app-page">
      <div className="todo-card">
        <header className="dashboard-header">
          <div className="dashboard-header__content">
            <h1 className="app-title">My Todo Dashboard</h1>
            <p className="dashboard-subtitle">
              Stay organized and keep track of your daily tasks.
            </p>
          </div>
        </header>

        <section className="create-list-section" aria-label="Create new list">
          <div className="input-row">
            <input
              className="text-input"
              aria-label="Create new list"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="New list title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddList();
                }
              }}
            />
            <button
              className="primary-button"
              onClick={handleAddList}
              disabled={!listTitle.trim()}
            >
              Add List
            </button>
          </div>
        </section>

        <section className="list-selector-section" aria-label="Todo lists">
          <div className="list-buttons">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={
                  list.id === activeListId
                    ? "list-button active"
                    : "list-button"
                }
              >
                {list.title}
              </button>
            ))}
          </div>
        </section>

        {activeList ? (
          <section className="selected-list-section" aria-label="Selected list">
            <div className="selected-list-workspace">
              <div className="selected-list-header">
                <h2 className="list-title">{activeList.title}</h2>
                <button className="icon-button danger-button" onClick={handleDeleteList} aria-label="Delete list">
                  <FiTrash2 size={16} />
                </button>
              </div>

            <section className="stats-section" aria-label="Task statistics">
              <div className="stat-card">
                <h3>Total Tasks</h3>
                <p>{totalTasks}</p>
              </div>

              <div className="stat-card">
                <h3>Completed</h3>
                <p>{completedTasks}</p>
              </div>

              <div className="stat-card">
                <h3>Remaining</h3>
                <p>{remainingTasks}</p>
              </div>
            </section>

            <section className="progress-section" aria-label="Task progress">
              <div className="progress-info">
                <span className="progress-label">Progress</span>
                <span className="progress-value">{progress}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </section>

            <section className="add-task-section" aria-label="Add a task">
              <div className="input-row">
                <input
                  className="text-input"
                  ref={inputRef}
                  aria-label="Add new task"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  placeholder="Add task..."
                />

                <button
                  className="primary-button"
                  onClick={handleAddTask}
                  disabled={!input.trim()}
                >
                  Add
                </button>
              </div>
            </section>

            <section className="search-filter-section" aria-label="Search and filter tasks">
              <input
                className="text-input full-width"
                aria-label="Search tasks"
                placeholder="Search tasks in this list..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="filter-actions">
                <button
  className={`filter-button ${filter === "all" ? "active" : ""}`}
  onClick={() => setFilter("all")}
>
  All
</button>
                <button
  className={`filter-button ${filter === "completed" ? "active" : ""}`}
  onClick={() => setFilter("completed")}
>
  Completed
</button>
                <button
  className={`filter-button ${filter === "pending" ? "active" : ""}`}
  onClick={() => setFilter("pending")}
>
  Pending
</button>
                <button className="secondary-button" onClick={handleClearAll}>
                  Clear All
                </button>
              </div>
            </section>

            <section className="task-list-section" aria-label="Task list">
              {filteredTasks.map(task => (
                <article className="task-card" key={task.id}>
                  <div className="task-main">
                    <input
                      type="checkbox"
                      aria-label={`Mark ${task.text} as completed`}
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />

                    {editId === task.id ? (
                      <input
                        className="task-editor"
                        aria-label="Edit task"
                        value={task.text}
                        onChange={(e) => handleEdit(task.id, e.target.value)}
                      />
                    ) : (
                      <span className={task.completed ? "task-text completed" : "task-text"}>
                        {task.text}
                      </span>
                    )}
                  </div>

                  <div className="task-actions">
  <button
    onClick={() => handleDelete(task.id)}
    aria-label="Delete task"
  >
    <FiTrash2 size={15} />
  </button>

  {editId === task.id ? (
    <button
      onClick={() => setEditId(null)}
      aria-label="Save task"
    >
      <FiSave size={15} />
    </button>
  ) : (
    <button
      onClick={() => setEditId(task.id)}
      aria-label="Edit task"
    >
      <FiEdit2 size={15} />
    </button>
  )}
</div>
                </article>
              ))}
            </section>
            </div>
          </section>
        ) : (
          lists.length === 0 && (
            <section className="empty-state-section" aria-label="Empty state">
              <p className="empty-state">Create your first list</p>
            </section>
          )
        )}
      </div>
    </div>
  );
}

export default App;