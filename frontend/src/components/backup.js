import { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { createPortal } from "react-dom";

const KanbanBoard = () => {
  const [columns, setColumns] = useState([]);
  const [columnId, setColumnId] = useState("");
  const [colName, setColName] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Create a div for rendering dragged items in a portal
  const dragLayerRef = useRef(document.createElement("div"));

  useEffect(() => {
    // Append drag layer to body
    document.body.appendChild(dragLayerRef.current);
    return () => {
      document.body.removeChild(dragLayerRef.current);
    };
  }, []);

  useEffect(() => {
    getTasks();
  }, []);

  const refetchData = () => getTasks();

  async function handleAddColumn(e) {
    e.preventDefault();
    setMessage("");
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
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();
    setMessage("");
    if (!title || !columnId) {
      setMessage("❌ Please fill all fields.");
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
    }
  }

  async function getTasks() {
    const { data } = await axios.get("/api/board");
    if (data && Object.keys(data).length) {
      setColumns(data.columns);
    }
  }

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const sourceColIndex = columns.findIndex(
      (col) => col._id === source.droppableId
    );
    const destColIndex = columns.findIndex(
      (col) => col._id === destination.droppableId
    );
    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];
    const draggedTask = sourceCol.tasks[source.index];

    const updatedSourceTasks = [...sourceCol.tasks];
    updatedSourceTasks.splice(source.index, 1);
    const updatedDestTasks = [...destCol.tasks];
    updatedDestTasks.splice(destination.index, 0, draggedTask);

    const updatedColumns = [...columns];
    updatedColumns[sourceColIndex] = {
      ...sourceCol,
      tasks: updatedSourceTasks,
    };
    updatedColumns[destColIndex] = {
      ...destCol,
      tasks: updatedDestTasks,
    };

    setColumns(updatedColumns);
    try {
      await axios.put(`/api/task/${draggableId}`, {
        taskId: draggableId,
        columnId: destination.droppableId,
      });
      setMessage("✅ Task moved successfully");
    } catch (error) {
      setMessage("❌ Failed to move task. Please try again.");
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

  return (
    <div
      className="container-fluid bg-light py-5"
      style={{ minHeight: "100vh" }}
    >
      <div className="row align-items-center mb-4 px-4">
        <h2 className="text-center mb-0 display-5 fw-semibold text-primary col">
          Kanban Board
        </h2>
        <div className="col-auto">
          <button
            className="btn btn-sm btn-primary me-2 px-3"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#colModal"
            onClick={() => setMessage("")}
          >
            Add Column
          </button>
          <button
            className="btn btn-sm btn-outline-primary px-3"
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#taskModal"
            onClick={() => setMessage("")}
          >
            Add Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="row gx-4 gy-4 px-4">
          {columns.length > 0 ? (
            columns.map((col) => (
              <div key={col._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header bg-primary text-white fw-bold text-center">
                    {col.title}
                  </div>
                  <Droppable droppableId={col._id}>
                    {(provided) => (
                      <div
                        className="card-body bg-white"
                        style={{ minHeight: "100px", overflowY: "auto" }}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {col.tasks.length > 0 ? (
                          col.tasks.map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                const draggableNode = (
                                  <div
                                    className={`card mb-3 p-2 shadow-sm border-start border-4 border-primary task-item position-relative d-flex ${
                                      snapshot.isDragging ? "dragging" : ""
                                    }`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      backgroundColor: snapshot.isDragging
                                        ? "#e0f7fa"
                                        : "white",
                                      boxShadow: snapshot.isDragging
                                        ? "0 8px 16px rgba(0,0,0,0.3)"
                                        : "0 2px 4px rgba(0,0,0,0.1)",
                                      opacity: snapshot.isDragging ? 0.9 : 1,
                                      transform: snapshot.isDragging
                                        ? `${provided.draggableProps.style.transform} rotate(3deg)`
                                        : provided.draggableProps.style
                                            .transform,
                                      transition:
                                        "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
                                      zIndex: snapshot.isDragging ? 1000 : 1,
                                    }}
                                  >
                                    <span>{task.title}</span>
                                    <button
                                      type="button"
                                      className="btn-close position-absolute end-0 top-0 m-2 task-delete"
                                      aria-label="Delete"
                                      onClick={() =>
                                        handleDeleteTask(task._id, col._id)
                                      }
                                    ></button>
                                  </div>
                                );

                                return snapshot.isDragging
                                  ? createPortal(
                                      draggableNode,
                                      dragLayerRef.current
                                    )
                                  : draggableNode;
                              }}
                            </Draggable>
                          ))
                        ) : (
                          <p className="text-muted text-center">
                            No tasks available
                          </p>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No Columns Available</p>
          )}
        </div>
      </DragDropContext>

      <Modal id="colModal">{/* Modal content for adding column */}</Modal>
      <Modal id="taskModal">{/* Modal content for adding task */}</Modal>
    </div>
  );
};

export default KanbanBoard;
