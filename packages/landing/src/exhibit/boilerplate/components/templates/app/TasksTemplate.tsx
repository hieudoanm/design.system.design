'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';

type Filter = 'all' | 'active' | 'done';

interface Task {
  id: string;
  title: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Write onboarding docs', done: false },
  { id: 't2', title: 'Fix login bug', done: true },
  { id: 't3', title: 'Deploy staging', done: false },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Done' },
];

const getFiltered = (tasks: Task[], filter: Filter): Task[] => {
  if (filter === 'active') return tasks.filter((task) => !task.done);
  if (filter === 'done') return tasks.filter((task) => task.done);
  return tasks;
};

export const TasksTemplate: FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<Filter>('all');
  const [newTitle, setNewTitle] = useState('');

  const addTask = () => {
    const title = newTitle.trim() || 'Untitled task';
    setTasks((prev) => [...prev, { id: `t${Date.now()}`, title, done: false }]);
    setNewTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const visible = getFiltered(tasks, filter);
  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track what needs to be done today.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="mb-4 flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add a task..."
                aria-label="New task"
                className="input input-bordered input-sm flex-1"
              />
              <button onClick={addTask} className="btn btn-primary btn-sm">
                <FiPlus />
                Add
              </button>
            </div>

            <div className="tabs tabs-boxed tabs-sm mb-4 w-fit">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={`tab ${filter === item.id ? 'tab-active' : ''}`}>
                  {item.label}
                </button>
              ))}
            </div>

            <p className="text-base-content/50 mb-3 text-sm">
              {doneCount} of {tasks.length} done
            </p>

            {visible.length === 0 ? (
              <p className="text-base-content/50 text-sm">No tasks</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {visible.map((task) => (
                  <li
                    key={task.id}
                    className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-lg border px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`Toggle ${task.title}`}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                    <span
                      className={`min-w-0 flex-1 text-sm ${
                        task.done ? 'text-base-content/40 line-through' : ''
                      }`}>
                      {task.title}
                    </span>
                    {task.done && (
                      <FiCheck className="text-success h-4 w-4 shrink-0" />
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                      className="btn btn-ghost btn-xs btn-square hover:text-error">
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

TasksTemplate.displayName = 'TasksTemplate';
