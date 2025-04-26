import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

const KanbanBoard = () => {
  const [columns, setColumns] = useState([]);
  const [columnId, setColumnId] = useState("");
  const [colName, setColName] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTask, setActiveTask] = useState(null); // Track dragged task for overlay
  const [loading, setLoading] = useState(false); // Loading state for async operations

  // Setup sensors for pointer-based dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    })
  );

  useEffect(() => {
    getTasks();
  }, []);

  const refetchData = () => getTasks();

  async function handleAddColumn(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/column", { title: colName });
      const newColumn = {
        _id: data?._id || Date.now(),
        title: colName,
        tasks: [],
      };
      setColumns([...columns, newColumn]);
      setColName("");
      setMessage("✅ Column added successfully!");
      const modalEl = document.getElementById("colModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      refetchData();
    } catch (error) {
      console.error("Error adding column:", error);
      setMessage("❌ Failed to add column. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    if (!title || !columnId) {
      setMessage("❌ Please fill all fields.");
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.post("/api/task", {
        title,
        columnId,
        description,
      });
      const updatedColumns = columns.map((col) =>
        col._id === columnId
          ? { ...col, tasks: [...col.tasks, data.task] }
          : col
      );
      setColumns(updatedColumns);
      setTitle("");
      setColumnId("");
      setDescription("");
      setMessage("✅ Task added successfully!");
      const modalEl = document.getElementById("taskModal");
      const modal = window.bootstrap.Modal.getInstance(modalEl);
      modal.hide();
      refetchData();
    } catch (error) {
      console.error(
        "Error adding task:",
        error.response?.data || error.message
      );
      setMessage("❌ Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function getTasks() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/board");
      if (data && Object.keys(data).length) {
        setColumns(data.columns);
      }
    } catch (error) {
      console.error("Error fetching board:", error);
      setMessage("❌ Failed to fetch board. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleDragStart = (event) => {
    const { active } = event;
    // Find the dragged task
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null); // Clear overlay
    if (!over) return;

    const taskId = active.id;
    let newColumnId = over.id;

    // If over.id is a task id, find the column containing that task
    const isOverTask = columns.some((col) =>
      col.tasks.some((task) => task._id === over.id)
    );
    if (isOverTask) {
      const overTaskColumn = columns.find((col) =>
        col.tasks.some((task) => task._id === over.id)
      );
      newColumnId = overTaskColumn._id;
    }

    // Find the source column and task
    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task._id === taskId)
    );
    const task = sourceColumn.tasks.find((task) => task._id === taskId);

    if (sourceColumn._id === newColumnId) return; // No change if dropped in same column

    // Update local state
    const updatedColumns = columns.map((col) => {
      if (col._id === sourceColumn._id) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t._id !== taskId),
        };
      }
      if (col._id === newColumnId) {
        return {
          ...col,
          tasks: [...col.tasks, task],
        };
      }
      return col;
    });

    setColumns(updatedColumns);

    // Update backend
    try {
      await axios.put(`/api/task/${taskId}`, {
        taskId,
        columnId: newColumnId,
      });
      setMessage("✅ Task moved successfully");
    } catch (error) {
      console.error("Error moving task:", error);
      setMessage("❌ Failed to move task. Please try again.");
      refetchData();
    }
  };

  const handleDeleteTask = async (taskId, columnId) => {
    try {
      await axios.delete(`/api/task/${taskId}`);
      const updatedColumns = columns.map((col) => {
        if (col._id === columnId) {
          return {
            ...col,
            tasks: col.tasks.filter((task) => task._id !== taskId),
          };
        }
        return col;
      });
      setColumns(updatedColumns);
      setMessage("✅ Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      setMessage("❌ Failed to delete task. Please try again.");
    }
  };

  // Droppable Column Component
  const DroppableColumn = ({ column }) => {
    // Use useDroppable to make column a droppable container but not draggable
    const { setNodeRef } = useDroppable({
      id: column._id,
    });

    const handleDeleteColumn = async () => {
      setMessage("");
      try {
        await axios.delete(`/api/column/${column._id}`);
        setColumns(columns.filter((col) => col._id !== column._id));
        setMessage("✅ Column deleted successfully!");
      } catch (error) {
        console.error("Error deleting column:", error);
        setMessage("❌ Failed to delete column. Please try again.");
      }
    };

    return (
      <div ref={setNodeRef} className="card shadow-sm border-0 h-100">
        <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
          <span>{column.title}</span>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Delete"
            onClick={handleDeleteColumn}
          ></button>
        </div>
        <div
          className="card-body bg-white"
          style={{ minHeight: "100px", overflowY: "auto" }}
        >
          <SortableContext
            items={column?.tasks?.map((task) => task._id)}
            strategy={verticalListSortingStrategy}
          >
            {column?.tasks?.length > 0 ? (
              column?.tasks?.map((task) => (
                <SortableTask
                  key={task._id}
                  task={task}
                  columnId={column._id}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <p className="text-muted text-center">No tasks available</p>
            )}
          </SortableContext>
        </div>
      </div>
    );
  };

  // Sortable Task Component
  const SortableTask = ({ task, columnId, onDelete }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task._id });

    const style = {
      transform: CSS.Transform.toString({
        ...transform,
        scaleX: isDragging ? 1.05 : 1,
        scaleY: isDragging ? 1.05 : 1,
      }), // Slight scale for drag effect
      transition: transition || "transform 0.2s ease, opacity 0.2s ease",
      backgroundColor: isDragging ? "#e0f7fa" : "white",
      boxShadow: isDragging
        ? "0 12px 24px rgba(0,0,0,0.4)"
        : "0 2px 4px rgba(0,0,0,0.1)",
      opacity: isDragging ? 0.85 : 1,
      zIndex: isDragging ? 1000 : 1,
      border: isDragging ? "2px solid #0288d1" : "none",
      cursor: isDragging ? "grabbing" : "grab",
      transformOrigin: "center",
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="card mb-3 p-2 shadow-sm border-start border-4 border-primary task-item position-relative d-flex"
      >
        <span>{task.title}</span>
        <button
          type="button"
          className="btn-close position-absolute end-0 top-0 m-2 task-delete"
          aria-label="Delete"
          onClick={() => onDelete(task._id, columnId)}
        ></button>
      </div>
    );
  };

  // Drag Overlay Component
  const TaskDragOverlay = ({ task }) => {
    return (
      <div
        className="card p-2 shadow-sm border-start border-4 border-primary task-item d-flex"
        style={{
          backgroundColor: "#e0f7fa",
          boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
          opacity: 0.85,
          border: "2px solid #0288d1",
          transform: "rotate(4deg)", // Slight rotation for dynamic effect
          zIndex: 1001, // Above all elements
          cursor: "grabbing",
          width: "100%", // Match task width
          maxWidth: "280px", // Match column card width (adjust as needed)
        }}
      >
        <span>{task.title}</span>
      </div>
    );
  };

  const navigate = useNavigate();

  return (
    <div
      className="container-fluid bg-light py-5"
      style={{ minHeight: "100vh" }}
    >
      <div className="row align-items-center mb-4 px-4">
        <h2 className="text-center mb-0 display-5 fw-semibold text-primary col">
          Kanban Board
        </h2>
        <div className="col-auto d-flex align-items-center">
          {loading && (
            <div className="spinner-border text-primary me-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
          <button
            className="btn btn-sm btn-primary me-2 px-3"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#colModal"
            onClick={() => setMessage("")}
            disabled={loading}
          >
            Add Column
          </button>
          <button
            className="btn btn-sm btn-outline-primary px-3 me-3"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#taskModal"
            onClick={() => setMessage("")}
            disabled={loading}
          >
            Add Task
          </button>
          <button
            className="btn btn-sm btn-danger px-3"
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              // Clear axios default Authorization header safely
              if (!axios.defaults.headers) {
                axios.defaults.headers = {};
              }
              if (!axios.defaults.headers.common) {
                axios.defaults.headers.common = {};
              }
              axios.defaults.headers.common["Authorization"] = null;
              window.location.href = "/login";
            }}
            disabled={loading}
          >
            Logout
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="row gx-4 gy-4 px-4">
          {columns.length > 0 ? (
            columns.map((col) => (
              <div key={col._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <DroppableColumn column={col} />
              </div>
            ))
          ) : (
            <p className="text-muted">No Columns Available</p>
          )}
        </div>
        <DragOverlay>
          {activeTask ? <TaskDragOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <Modal id="colModal">
        <div className="modal-header">
          <h1 className="modal-title fs-5">New Column</h1>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <form onSubmit={handleAddColumn}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="col-form-label">Column Name</label>
              <input
                type="text"
                className="form-control"
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Add Column
            </button>
          </div>
        </form>
      </Modal>

      <Modal id="taskModal">
        <form onSubmit={handleAddTask}>
          <div className="modal-header">
            <h1 className="modal-title fs-5">New Task</h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="col-form-label">Task Name</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label className="col-form-label">Description</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="col-form-label">Select Column</label>
              <select
                className="form-select"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                required
              >
                <option value="">-- Select Column --</option>
                {columns.map((col) => (
                  <option key={col._id} value={col._id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KanbanBoard;
