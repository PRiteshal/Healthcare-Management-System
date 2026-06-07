import axios from "axios";
const API = axios.create({ baseURL: "/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:            (data) => API.post("/auth/login", data),
  register:         (data) => API.post("/auth/register", data),
  me:               ()     => API.get("/auth/me"),
  myPatientProfile: ()     => API.get("/auth/my-patient-profile"), // ✅ naya
  changePassword:   (data) => API.put("/auth/change-password", data),
};

export const patientAPI = {
  getAll:  (params)   => API.get("/patients", { params }),
  getOne:  (id)       => API.get(`/patients/${id}`),
  create:  (data)     => API.post("/patients", data),
  update:  (id, data) => API.put(`/patients/${id}`, data),
  delete:  (id)       => API.delete(`/patients/${id}`),
};

export const appointmentAPI = {
  getAll:   (params)   => API.get("/appointments", { params }),
  getToday: ()         => API.get("/appointments/today"),
  create:   (data)     => API.post("/appointments", data),
  update:   (id, data) => API.put(`/appointments/${id}`, data),
  delete:   (id)       => API.delete(`/appointments/${id}`),
};

export const doctorAPI = {
  getAll:  ()         => API.get("/doctors"),
  getOne:  (id)       => API.get(`/doctors/${id}`),
  create:  (data)     => API.post("/doctors", data),
  update:  (id, data) => API.put(`/doctors/${id}`, data),
  delete:  (id)       => API.delete(`/doctors/${id}`),
};

export const dashboardAPI = {
  getStats: () => API.get("/dashboard/stats"),
};

export default API;
