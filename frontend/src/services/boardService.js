import axios from "axios";

const API_URL = "/api";

// Get user's board
export const getBoard = async () => {
  try {
    const response = await axios.get(`${API_URL}/board`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update board
export const updateBoard = async (data) => {
  try {
    const response = await axios.put(`${API_URL}/board`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add new column
export const addColumn = async (title) => {
  try {
    const response = await axios.post(
      `${API_URL}/column`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update column
export const updateColumn = async (columnId, data) => {
  try {
    const response = await axios.put(`${API_URL}/column/${columnId}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete column
export const deleteColumn = async (columnId) => {
  try {
    const response = await axios.delete(`${API_URL}/column/${columnId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add new task
export const addTask = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/task`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update task
export const updateTask = async (taskId, data) => {
  try {
    const response = await axios.put(`${API_URL}/task/${taskId}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    const response = await axios.delete(`${API_URL}/task/${taskId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reorder tasks
export const reorderTasks = async (tasks) => {
  try {
    const response = await axios.put(
      `${API_URL}/task/reorder`,
      { tasks },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reorder columns
export const reorderColumns = async (columns) => {
  try {
    const response = await axios.put(
      `${API_URL}/column/reorder`,
      { columns },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
