"use client"

import * as React from "react"
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconDownload,
  IconEye,
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
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ConversationSummary {
  id: string;
  client: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: string;
  operator: string;
  messageCount: number;
  status: 'closed';
  createdAt: string;
}

async function fetchConversations() {
  return api('/dashboard/conversations');
}

export function ConversationsTable() {
  const router = useRouter();
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const { data: conversations = [], isLoading, error } = useQuery({
    queryKey: ['dashboard-conversations'],
    queryFn: fetchConversations,
  })

  const handleExportConversation = async (conversationId: string, clientName: string) => {
    try {
      // Buscar dados da conversa
      const conversation = await api(`/conversations/${conversationId}`);
      const messages = await api(`/conversations/${conversationId}/messages`);
      
      // Criar CSV
      const headers = ['Data/Hora', 'Origem', 'Operador', 'Mensagem'];
      const csvData = messages.map((message: any) => [
        new Date(message.createdAt).toLocaleString('pt-BR'),
        message.source === 'OPERATOR' ? 'Operador' : 'Cliente',
        message.operatorSender?.name || '',
        `"${message.content.replace(/"/g, '""')}"`
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) => row.join(','))
      ].join('\n');
      
      const fullCsvContent = [
        `Conversa: ${clientName}`,
        `Exportado em: ${new Date().toLocaleString('pt-BR')}`,
        '',
        csvContent
      ].join('\n');

      const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversa-${clientName.replace(/\s+/g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Conversa exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar conversa:', error);
      toast.error('Erro ao exportar conversa');
    }
  };

  const columns: ColumnDef<ConversationSummary>[] = React.useMemo(() => [
    {
      accessorKey: "client",
      header: "Cliente",
      enableHiding: false,
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => (
        <div className="w-32">
          <span className="text-sm text-muted-foreground">
            {row.original.phone}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "lastMessage",
      header: "Última Mensagem",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <span className="text-sm truncate block">
            {row.original.lastMessage}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "operator",
      header: "Operador",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground">
          {row.original.operator}
        </Badge>
      ),
    },
    {
      accessorKey: "messageCount",
      header: "Mensagens",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.messageCount}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary">
          Encerrada
        </Badge>
      ),
    },
    {
      accessorKey: "lastMessageTime",
      header: "Última Atividade",
      cell: ({ row }) => {
        const date = new Date(row.original.lastMessageTime);
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
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => router.push(`/chats?conversation=${row.original.id}`)}>
              <IconEye className="mr-2 h-4 w-4" />
              Ver Conversa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExportConversation(row.original.id, row.original.client)}>
              <IconDownload className="mr-2 h-4 w-4" />
              Exportar CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  const table = useReactTable({
    data: conversations,
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

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-muted-foreground">Carregando conversas...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-destructive">
            <div>Erro ao carregar conversas</div>
            <div className="text-sm text-muted-foreground mt-2">
              Tente recarregar a página
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">Conversas Recentes</h3>
          <Badge variant="secondary">{conversations.length}</Badge>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border">
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhuma conversa encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
    </div>
  )
}
