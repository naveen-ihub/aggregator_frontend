import { baseURL } from "../App";

export const fetchExistingJobs = async (username) => {

    const response = await fetch(
        `https://aggregatorbackend-production.up.railway.app/api/get_existing_jobs?username=${username}`
    );

    if (!response.ok) {
        const text = await response.text(); // Get raw response
        console.log("Raw response:", text); // Debug the response
        const errorData = JSON.parse(text); // Attempt to parse as JSON
        throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();

    return {
        newJobs: data.new_jobs || [],
        allJobs: data.all_jobs || [],
        newFoundJobs: data.new_job_found || false
    }
};