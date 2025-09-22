"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/uth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const schema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  selected_theme: z.string(),
  createdAt: z.string(),
  userRoles: z.array(z.object({
    role: z.object({
      name: z.string(),
    }),
  })),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Arrastar para reordenar</span>
    </Button>
  )
}


function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [editingUser, setEditingUser] = React.useState<z.infer<typeof schema> | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [editedData, setEditedData] = React.useState<Partial<z.infer<typeof schema> & { role?: string }>>({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newUserData, setNewUserData] = React.useState({
    email: '',
    name: '',
    password: '',
    role: '' as 'admin' | 'support' | 'operator' | ''
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [userToDelete, setUserToDelete] = React.useState<z.infer<typeof schema> | null>(null)
  const { user } = useAuth()
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const columns: ColumnDef<z.infer<typeof schema>>[] = React.useMemo(() => [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const isCurrentUser = user?.id === row.original.id;
        return (
          <div className="flex items-center gap-2">
            <span>{row.original.name}</span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                Você
              </Badge>
            )}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="w-48">
          <span className="text-sm text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "userRoles",
      header: "Função",
      cell: ({ row }) => {
        const roles = row.original.userRoles?.map(ur => ur.role.name) || [];
        const primaryRole = roles[0] || 'N/A';

        return (
          <Badge 
            variant="outline" 
            className="px-2 py-1 text-xs font-medium text-muted-foreground"
          >
            {primaryRole}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Data de Criação",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => handleEditUser(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              variant="destructive" 
              onClick={() => handleDeleteUser(row.original)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  function handleEditUser(user: z.infer<typeof schema>) {
    setEditingUser(user)
    setEditedData({}) // Limpa dados editados
    setIsDrawerOpen(true)
  }

  function handleCloseDrawer() {
    setIsDrawerOpen(false)
    setEditingUser(null)
    setEditedData({}) // Limpa dados editados
  }

  function handleFieldChange(field: keyof z.infer<typeof schema> | 'role', value: string) {
    if (!editingUser) return
    
    // Tratamento especial para o campo role
    if (field === 'role') {
      const currentRole = editingUser.userRoles?.[0]?.role.name || ''
      if (value !== currentRole) {
        setEditedData(prev => ({ ...prev, role: value }))
      } else {
        setEditedData(prev => {
          const newData = { ...prev }
          delete newData.role
          return newData
        })
      }
      return
    }
    
    // Só adiciona ao editedData se o valor for diferente do original
    if (value !== editingUser[field]) {
      setEditedData(prev => ({ ...prev, [field]: value }))
    } else {
      // Remove o campo se voltou ao valor original
      setEditedData(prev => {
        const newData = { ...prev }
        delete newData[field]
        return newData
      })
    }
  }

  async function handleSaveUser() {
    if (!editingUser || Object.keys(editedData).length === 0) {
      toast.success("Nenhuma alteração detectada!")
      handleCloseDrawer()
      return
    }

    try {
      await api(`/users/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editedData),
      })

      // Atualiza os dados locais
      setData(prevData => 
        prevData.map(user => {
          if (user.id === editingUser.id) {
            const updatedUser = { ...user, ...editedData };
            
            // Se o campo role foi alterado, atualiza userRoles
            if (editedData.role) {
              updatedUser.userRoles = [{
                role: {
                  name: editedData.role
                }
              }];
              // Remove o campo role do objeto final
              delete updatedUser.role;
            }
            
            return updatedUser;
          }
          return user;
        })
      )

      toast.success("Usuário atualizado com sucesso!")
      handleCloseDrawer()
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      toast.error("Erro ao atualizar usuário. Tente novamente.")
    }
  }

  function handleNewUserFieldChange(field: keyof typeof newUserData, value: string) {
    setNewUserData(prev => ({ ...prev, [field]: value }))
  }

  function handleDeleteUser(user: z.infer<typeof schema>) {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  function handleCancelDelete() {
    setUserToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return

    try {
      console.log('Deletando usuário:', userToDelete.id)
      const deleteResponse = await api(`/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      console.log('Resposta da deleção:', deleteResponse)

      // Busca a lista atualizada de usuários
      const updatedUsers = await api('/users')
      setData(updatedUsers)
      
      // Mostra o toast de sucesso
      toast.success(`${userToDelete.name} deletado com sucesso`)
      
      // Fecha o dialog e limpa o estado
      setUserToDelete(null)
      setIsDeleteDialogOpen(false)
      
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      
      // Captura a mensagem específica da API
      let errorMessage = "Erro ao deletar usuário. Tente novamente."
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  }

  function handleOpenDialog() {
    // Reseta o formulário sempre que abrir o dialog
    setNewUserData({
      email: '',
      name: '',
      password: '',
      role: ''
    })
    setShowPassword(false)
    setIsDialogOpen(true)
  }

  async function handleCreateUser() {
    if (!newUserData.email || !newUserData.name || !newUserData.password) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await api('/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      })

      // Adiciona o novo usuário aos dados locais
      const newUser = {
        id: response.id,
        email: newUserData.email,
        name: newUserData.name,
        selected_theme: 'light',
        createdAt: new Date().toISOString(),
        userRoles: [{
          role: {
            name: newUserData.role,
          },
        }],
      }
      
      setData(prevData => [newUser, ...prevData])
      
      // Mostra o toast de sucesso
      toast.success(`${newUserData.name} criado com sucesso`)
      
      // Limpa o formulário e fecha o dialog
      setNewUserData({
        email: '',
        name: '',
        password: '',
        role: ''
      })
      setShowPassword(false)
      setIsDialogOpen(false)
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      toast.error("Erro ao criar usuário. Tente novamente.")
    }
  }

  return (
    <>
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
    
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >

        {/* Dialog no canto superior direito */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenDialog}>
                <IconPlus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário ao sistema. Preencha os dados abaixo.
                </DialogDescription>
              </DialogHeader>
              <form autoComplete="off" className="grid gap-4 py-4">
                <div className="grid gap-3">
                  <Label htmlFor="new-name">Nome</Label>
                  <Input 
                    id="new-name" 
                    placeholder="Nome"
                    value={newUserData.name}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    onChange={(e) => handleNewUserFieldChange('name', e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="new-email">Email</Label>
                  <Input 
                    id="new-email" 
                    type="email" 
                    placeholder="Email"
                    value={newUserData.email}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    onChange={(e) => handleNewUserFieldChange('email', e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="new-password">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      value={newUserData.password}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      onChange={(e) => handleNewUserFieldChange('password', e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="new-role">Função</Label>
                  <Select 
                    onValueChange={(value) => handleNewUserFieldChange('role', value)}
                  >
                    <SelectTrigger id="new-role" className="w-full">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleCreateUser}>Criar Usuário</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhum resultado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Linhas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para primeira página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para próxima página</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>

    {/* Drawer de Edição */}
    {editingUser && (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent>
          <DrawerHeader className="gap-1">
            <DrawerTitle>Editar Usuário - {editingUser.name}</DrawerTitle>
            <DrawerDescription>
              Atualize as informações do usuário
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="edit-name">Nome</Label>
                <Input 
                  id="edit-name" 
                  defaultValue={editingUser.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  defaultValue={editingUser.email} 
                  type="email"
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="edit-role">Função</Label>
                <Select 
                  defaultValue={editingUser.userRoles?.[0]?.role.name || ''}
                  onValueChange={(value) => handleFieldChange('role', value)}
                >
                  <SelectTrigger id="edit-role" className="w-full">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="edit-createdAt">Data de Criação</Label>
                <Input 
                  id="edit-createdAt" 
                  defaultValue={new Date(editingUser.createdAt).toLocaleString('pt-BR')} 
                  disabled 
                />
              </div>
            </form>
          </div>
          <DrawerFooter>
            <Button 
              onClick={handleSaveUser}
              disabled={Object.keys(editedData).length === 0}
            >
              {Object.keys(editedData).length > 0 ? 'Salvar Alterações' : 'Nenhuma Alteração'}
            </Button>
            <Button variant="outline" onClick={handleCloseDrawer}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )}

    {/* Dialog de Confirmação de Deleção */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Confirmar Exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const isCurrentUser = user?.id === item.id

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                Você
              </Badge>
            )}
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle className="flex items-center gap-2">
            {item.name}
            {isCurrentUser && (
              <Badge variant="secondary" className="text-xs">
                Você
              </Badge>
            )}
          </DrawerTitle>
          <DrawerDescription>
            Detalhes do usuário
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Crescimento de 5,2% este mês{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Mostrando total de visitantes dos últimos 6 meses. Este é apenas
                  um texto de exemplo para testar o layout. Ele se estende por múltiplas linhas
                  e deve quebrar adequadamente.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" defaultValue={item.name} />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={item.email} type="email" />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="role">Função</Label>
              <Select defaultValue={item.userRoles?.[0]?.role.name || ''}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="createdAt">Data de Criação</Label>
              <Input 
                id="createdAt" 
                defaultValue={new Date(item.createdAt).toLocaleString('pt-BR')} 
                disabled 
              />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Salvar</Button>
          <DrawerClose asChild>
            <Button variant="outline">Fechar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
