import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        console.log('ProtectedRoute: Checking auth', { user, isLoading });
        const checkStorage = () => {
            try {
                const storedUser = localStorage.getItem('user');
                console.log('ProtectedRoute: localStorage user:', storedUser ? JSON.parse(storedUser) : null);
                setIsChecking(false);
            } catch (error) {
                console.error('ProtectedRoute: Error parsing user from localStorage:', error);
                setIsChecking(false);
            }
        };
        checkStorage();
    }, [user, isLoading]);

    if (isLoading || isChecking) {
        return <div>Loading...</div>;
    }

    if (!user) {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                console.log('ProtectedRoute: Found user in localStorage:', JSON.parse(storedUser));
                return children;
            }
        } catch (error) {
            console.error('ProtectedRoute: Error parsing user from localStorage:', error);
        }
        console.log('ProtectedRoute: No user, redirecting to login');
        toast.error('Please login to access this page');
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;