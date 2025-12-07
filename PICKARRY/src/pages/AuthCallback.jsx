import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { setUserSession } from '../utils/auth';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error retrieving session:', error);
                return;
            }

            const user = data?.session?.user;
            if (user) {
                // Store session locally
                setUserSession('customer', {
                    email: user.email,
                    name: user.user_metadata?.full_name || 'Google User',
                    google_id: user.id,
                });

                // Optionally, insert user into your "customers" table if not already there
                const { data: existing } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('email', user.email)
                    .maybeSingle();

                if (!existing) {
                    await supabase.from('customers').insert([
                        {
                            full_name: user.user_metadata?.full_name || 'Google User',
                            email: user.email,
                            google_id: user.id,
                            email_verified: true,
                            status: 'Active',
                        },
                    ]);
                }

                navigate('/customer/home');
            }
        };

        handleSession();
    }, [navigate]);

    return <p>Signing you in...</p>;
};

export default AuthCallback;
