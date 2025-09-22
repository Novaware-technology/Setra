// src/app/(dashboard)/users/page.tsx
import { UserTable } from "@/app/(dashboard)/users/user-table";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  return (
      <UserTable />
    // <div className="space-y-4">
    //   <div className="flex justify-between items-center">
    //     <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
    //     <Button>Criar Novo Usuário</Button>
    //   </div>
    // </div>
  );
}