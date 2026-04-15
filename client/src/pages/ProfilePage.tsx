import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Profile } from '../components/Profile';
import type { AppUser } from '../types/user';

interface ProfilePageProps {
  user: AppUser | null;
}

export const ProfilePage = ({
  user,
}: ProfilePageProps) => {
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
