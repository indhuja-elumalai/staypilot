export const API_URL = "http://localhost:5001/api";

export const getAuthHeaders = async (getToken: () => Promise<string | null>) => {
    const token = await getToken();
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};