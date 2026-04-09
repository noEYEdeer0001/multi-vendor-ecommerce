async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // ❗ Handle network error (VERY IMPORTANT)
    if (!response) {
      throw new Error("Server not responding");
    }

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;

  } catch (error) {
    console.error("API ERROR:", error);

    if (error.message === "Failed to fetch") {
      showToast("Cannot connect to server. Is backend running?", "error");
    } else {
      showToast(error.message, "error");
    }

    throw error;
  }
}