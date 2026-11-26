// En local : "" -> le proxy Vite redirige /api vers http://localhost:3000
// En ligne : VITE_API_URL contient l'adresse du backend
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, ""); // sans "/" final

export async function api(chemin) {
  const reponse = await fetch(`${API_URL}${chemin}`);
  if (!reponse.ok) {
    throw new Error(`Erreur ${reponse.status}`);
  }
  return reponse.json();
}
