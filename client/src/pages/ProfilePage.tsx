import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Profile } from '../components/Profile';

export const ProfilePage = ({
  user,
}: {
  user: { email: string; username?: string } | null;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <main className="relative z-10 flex-1">
      <Profile user={user} />
    </main>
  );
};
