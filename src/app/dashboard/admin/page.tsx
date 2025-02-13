import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => res.json());

const UsersPage = () => {
  const router = useRouter();
  const { data, error, mutate } = useSWR('/api/users', fetcher);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const handleCreateUser = async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ nombre: name, username, password, correo: email, rol: role }),
    });

    if (response.ok) {
      mutate();
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setRole('');
    } else {
      alert('Error creating user');
    }
  };

  if (error) return <div>Error loading users</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users Management</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />
        <button type="submit" onClick={handleCreateUser}>Create User</button>
      </form>
      <ul>
        {data.map((user: any) => (
          <li key={user.id}>
            {user.nombre} - {user.username} - {user.correo} - {user.rol}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;