import axios from "axios";

const api = axios.create({
  baseURL: "https://packaging-j8ui.onrender.com",
  withCredentials: true,
});

export async function createJob({
  jobNo,
  clientName,
  productName,
  quantity,
  deliveryDate,
  priority,
  design,
  plate,
  printing,
  lamination,
  scodix,
  dieCutting,
  boxMaking,
}) {
  try {
    const response = await api.post("/api/jobs/", {
      jobNo,
      clientName,
      productName,
      quantity,
      deliveryDate,
      priority,
      design,
      plate,
      printing,
      lamination,
      scodix,
      dieCutting,
      boxMaking,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function checkJobIdExists(jobNo) {
  try {
    const response = await api.get(
      `/api/jobs/check-job?jobNo=${encodeURIComponent(jobNo)}`,
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateJob(jobId, jobData) {
  try {
    const response = await api.put(`/api/jobs/${jobId}`, jobData);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function fetchJobs() {
  try {
    const response = await api.get("/api/jobs/");
    return response.data;
  } catch (err) {
    console.log(err);
    return { jobs: [] };
  }
}

export async function fetchPlates() {
  try {
    const response = await api.get("/api/plates/");
    return response.data;
  } catch (err) {
    console.log(err);
    return { plates: [] };
  }
}

export async function fetchDies() {
  try {
    const response = await api.get("/api/dies/");
    return response.data;
  } catch (err) {
    console.log(err);
    return { dies: [] };
  }
}

export async function createPlate({ plateNumber, jobId, status }) {
  try {
    const response = await api.post("/api/plates/", {
      plateNumber,
      jobId,
      status,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updatePlate(plateId, data) {
  try {
    const response = await api.put(`/api/plates/${plateId}`, data);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deletePlate(plateId) {
  try {
    const response = await api.delete(`/api/plates/${plateId}`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createDie({ dieNumber, jobId, status }) {
  try {
    const response = await api.post("/api/dies/", {
      dieNumber,
      jobId,
      status,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateDie(dieId, data) {
  try {
    const response = await api.put(`/api/dies/${dieId}`, data);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteDie(dieId) {
  try {
    const response = await api.delete(`/api/dies/${dieId}`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function fetchJobById(jobId) {
  try {
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  } catch (err) {
    console.log(err);
    return { job: null };
  }
}

export async function searchJobs(query) {
  try {
    const response = await api.get(
      `/api/jobs/search?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  } catch (err) {
    console.log(err);
    return { jobs: [] };
  }
}

export async function deleteJob(jobId) {
  try {
    const response = await api.delete(`/api/jobs/${jobId}`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
