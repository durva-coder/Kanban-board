import { useState } from "react";

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    {
      id: 1,
      title: "To Do",
      tasks: ["Task A", "Task B"],
    },
    {
      id: 2,
      title: "In Progress",
      tasks: ["Task C"],
    },
    {
      id: 3,
      title: "Done",
      tasks: ["Task D", "Task E"],
    },
    {
      id: 3,
      title: "Done",
      tasks: ["Task D", "Task E"],
    },
    {
      id: 3,
      title: "Done",
      tasks: ["Task D", "Task E"],
    },
    {
      id: 3,
      title: "Done",
      tasks: ["Task D", "Task E"],
    },
    {
      id: 3,
      title: "Done",
      tasks: ["Task D", "Task E"],
    },
    {
      id: 3,
      title: "Done",
      tasks: ["Task D", "Task E"],
    },
  ]);
  return (
    <>
      <div
        className="d-flex p-5"
        style={{
          height: "100vh",
          gap: "10px",
          overflowX: "auto",
          padding: "2rem",
          justifyContent: "flex-start",
        }}
      >
        {columns.length > 0 ? (
          columns.map((col) => (
            <div
              key={col.id}
              className="card"
              style={{
                minWidth: "300px",
                maxWidth: "400px",
                width: "100%",
                flex: "0 0 350px",
              }}
            >
              <strong className="text-center mb-2">{col.title}</strong>

              <div>
                {col.tasks.length > 0 ? (
                  col.tasks.map((t) => (
                    <div key={t} className="card-body">
                      <p>{t}</p>
                    </div>
                  ))
                ) : (
                  <div>No Task Available</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>No Columns Available</div>
        )}
      </div>
    </>
  );

  // return (
  //   <div className="container-fluid py-4 bg-light min-vh-100">
  //     <h2 className="text-center mb-4">Kanban Board</h2>
  //     <div className="row">
  //       {columns.map((column) => (
  //         <div key={column.id} className="col-md-6 col-lg-3 mb-4">
  //           <div className="card shadow-sm h-100">
  //             <div className="card-header bg-primary text-white">
  //               <strong>{column.title}</strong>
  //             </div>
  //             <div className="card-body">
  //               {column.tasks.length > 0 ? (
  //                 column.tasks.map((task, index) => (
  //                   <div
  //                     key={index}
  //                     className="card mb-2 p-2 shadow-sm border-start border-4 border-primary"
  //                   >
  //                     {task}
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="text-muted">No tasks</p>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
};

export default KanbanBoard;
