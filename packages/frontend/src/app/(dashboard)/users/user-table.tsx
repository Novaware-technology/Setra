// src/components/features/users/user-table.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DataTable } from '@/components/features/dashboard/data-table';


interface User {
  id: string;
  name: string;
  email: string;
  selected_theme: string;
  createdAt: string;
}

async function fetchUsers(): Promise<User[]> {
  return api('/users');
}

export function UserTable() {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <div>Carregando usuários...</div>;
  if (isError) return <div>Ocorreu um erro ao buscar os usuários.</div>;

  return (
    <div className='py-6'>
      <DataTable data={users || []} />
    </div>
  );
}