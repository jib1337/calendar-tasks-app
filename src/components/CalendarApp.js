import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const CalendarApp = () => {
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskInput, setTaskInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [modalTaskIndex, setModalTaskIndex] = useState(null);
  const [modalTaskDate, setModalTaskDate] = useState(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('calendarTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!selectedDate || !taskInput) return;
    const newTask = { text: taskInput, description: descriptionInput, completed: false };
    setTasks({
      ...tasks,
      [selectedDate]: [...(tasks[selectedDate] || []), newTask]
    });
    setTaskInput('');
    setDescriptionInput('');
  };

  const toggleTaskCompletion = (date, index) => {
    if (!tasks[date] || index === null || index < 0) return;
    const updatedTasks = { ...tasks };
    updatedTasks[date][index].completed = !updatedTasks[date][index].completed;
    setTasks(updatedTasks);
    setShowModal(false);
  };

  const deleteTask = (date, index) => {
    if (!tasks[date] || index === null || index < 0) return;
    const updatedTasks = { ...tasks };
    updatedTasks[date].splice(index, 1);
    if (updatedTasks[date].length === 0) {
      delete updatedTasks[date];
    }
    setTasks(updatedTasks);
    setShowModal(false);
  };

  const openTaskModal = (task, date, index) => {
    if (!date || index === null) return;
    setModalContent(task);
    setModalTaskDate(date);
    setModalTaskIndex(index);
    setShowModal(true);
  };

  const selectDateFromCalendar = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const calendarDays = Array.from({ length: 42 }, (_, i) => {
      const day = i - firstDay + 1;
      const date = day > 0 && day <= daysInMonth ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
      return { day, date };
    });

    return calendarDays;
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const calendar = generateCalendar();
  const today = new Date().toISOString().split('T')[0];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 w-full h-full mx-auto flex gap-4">
      <div className="w-1/5">
        <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
        <div className="mb-4">
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="mb-2" />
          <Input type="text" placeholder="Enter task" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} className="mb-2 text-base border border-gray-300 rounded" />
          <textarea placeholder="Enter description" value={descriptionInput} onChange={(e) => setDescriptionInput(e.target.value)} className="mb-2 text-base border border-gray-300 rounded w-full p-2 resize-y" rows="23"></textarea>
          <Button onClick={handleAddTask}>Add Task</Button>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => changeMonth(-1)}>Previous Month</Button>
          <h2 className="text-xl font-bold">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <Button onClick={() => changeMonth(1)}>Next Month</Button>
        </div>

      <div className="flex-1">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center font-bold">{day}</div>
          ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {calendar.map((day, index) => (
            <div key={index} className={`border p-2 min-h-24 h-auto overflow-y-auto ${day.date === today ? 'bg-yellow-200' : ''}`} onClick={() => selectDateFromCalendar(day.date)}>
              {day.date && (
                <div>
                  <div className="font-bold mb-1">{day.day}</div>
                  <div className="text-xs space-y-1">
                    {(tasks[day.date] || []).map((task, idx) => (
                      <div key={idx} className={`p-1 rounded cursor-pointer ${task.completed ? 'bg-green-200 line-through' : 'bg-blue-100'}`} onClick={(e) => { e.stopPropagation(); openTaskModal(task, day.date, idx); }}>
                        {task.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border border-gray-300 rounded p-4">
          {Object.entries(tasks).map(([date, taskList]) => (
            <Card key={date} className="mb-4">
              <CardContent>
                <h2 className="text-xl font-semibold mb-4 pt-4">{date}</h2>
                <div className="pl-4">
                  {taskList.map((task, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-100 rounded shadow-sm">
                      <div>
                        <strong>{task.text}</strong>
                        <div className="whitespace-pre-wrap mt-2">{task.description}</div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => toggleTaskCompletion(date, index)} variant="secondary">
                          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                        <Button onClick={() => deleteTask(date, index)} variant="destructive">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-2/3">
            <h3 className="text-xl font-bold mb-4">{modalContent.text}</h3>
            <p className="whitespace-pre-wrap mb-6">{modalContent.description}</p>
            <div className="flex gap-2">
              <Button onClick={() => toggleTaskCompletion(modalTaskDate, modalTaskIndex)}>{modalContent.completed ? 'Mark Incomplete' : 'Mark Complete'}</Button>
              <Button onClick={() => deleteTask(modalTaskDate, modalTaskIndex)} variant="destructive">Delete</Button>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
