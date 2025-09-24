const API_URL = 'http://localhost:3000'; 

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;

  const res = await fetch(url, { ...options, headers });

  let data:any=null;
  try{
    data=await res.json();
  }catch{

  }

 if (!res.ok) {
    throw new Error(data?.message || `API Error ${res.status}`);
  }

  return data as T;
}
