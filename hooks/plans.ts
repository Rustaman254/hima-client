import { useEffect, useState } from 'react';

export function usePlans() {
    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const baseURL = process.env.NODE_ENV == 'development'? 'http://localhost:8000/api/v1' : "https://hima-g018.onrender.com/api/v1";

    useEffect(() => {
        fetch(`${baseURL}/insurance/plans`).then(res => {
            if (!res.ok) throw new Error("failed to fetch plans");
            return res.json();
        })
        .then(data => {
            setPlans(Array.isArray(data.plans) ? data.plans : []);
            setIsLoading(false)
        })
        .catch(err => {
            setError(err.message);
            setIsLoading(false);
        })
    }, []);

    return [ plans,isLoading, error ]
}