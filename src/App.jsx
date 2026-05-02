import { useState, useEffect, useRef } from "react";
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
  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem("todoLists", JSON.stringify(lists));
    }
  }, [lists]);

  const activeList = lists.find(l => l.id === activeListId);

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
        <h2 className="app-title">Todo Lists</h2>

        {/* CREATE LIST */}
        <div className="section">
          <div className="input-row">
            <input
              className="text-input"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="New list title..."
            />
            <button
              className="primary-button"
              onClick={handleAddList}
              disabled={!listTitle.trim()}
            >
              Add List
            </button>
          </div>
        </div>

        {/* LIST SWITCH */}
        <div className="section">
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
        </div>

        {/* ACTIVE LIST */}
        {activeList && (
          <>
            <h3 className="list-title">{activeList.title}</h3>

            <button onClick={handleDeleteList}>Delete List</button>

            <div className="input-row">
              <input
                className="text-input"
                ref={inputRef}
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

            {/* SEARCH */}
            <input
              className="text-input full-width"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* FILTER */}
            <div>
              <button onClick={() => setFilter("all")}>All</button>
              <button onClick={() => setFilter("completed")}>Done</button>
              <button onClick={() => setFilter("pending")}>Pending</button>
              <button onClick={handleClearAll}>Clear All</button>
            </div>

            {/* TASKS */}
            {filteredTasks.map(task => (
              <div className="task-item" key={task.id}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

                {editId === task.id ? (
                  <input
                    value={task.text}
                    onChange={(e) => handleEdit(task.id, e.target.value)}
                  />
                ) : (
                  <span className={task.completed ? "task-text completed" : "task-text"}>
                    {task.text}
                  </span>
                )}

                <button onClick={() => handleDelete(task.id)}>❌</button>
                <button onClick={() => setEditId(task.id)}>✏️</button>
                <button onClick={() => setEditId(null)}>💾</button>
              </div>
            ))}
          </>
        )}

        {lists.length === 0 && <p>Create your first list</p>}
      </div>
    </div>
  );
}

export default App;