import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
    selected_theme: true,
    createdAt: true,
  };

  async create(createUserDto: CreateUserDto) {
    const { email, name, password, role: roleName } = createUserDto;

    // 1. Verifica se o e-mail já está em uso (fora da transação para falhar rápido)
    const existingUser = await this.prisma.profile.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Um usuário com este e-mail já existe.');
    }

    // 2. Busca o ID do perfil a ser atribuído
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      throw new BadRequestException(`O perfil "${roleName}" não existe.`);
    }

    // 3. Criptografa a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Executa a criação do usuário e da sua role em uma única transação
    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.profile.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
        },
        select: this.userSelect,
      });

      await tx.userRole.create({
        data: {
          profileId: user.id,
          roleId: role.id,
        },
      });

      return user;
    });

    return createdUser;
  }

  async findAll() {
    return this.prisma.profile.findMany({
      select: this.userSelect,
    });
  }

  // NOVO: Implementação do findOne
  async findOne(id: string) {
    const user = await this.prisma.profile.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    return user;
  }

   // NOVO: Implementação do update
   async update(id: string, updateUserDto: UpdateUserDto) {
    // Primeiro, verifica se o usuário existe
    await this.findOne(id);

    // Se uma nova senha for fornecida, criptografa-a
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }
    
    // Renomeia 'password' para 'passwordHash' para corresponder ao schema
    const { password, ...data } = updateUserDto;
    const dataToUpdate: any = { ...data };
    if (password) {
      dataToUpdate.passwordHash = password;
    }

    const updatedUser = await this.prisma.profile.update({
      where: { id },
      data: dataToUpdate,
      select: this.userSelect,
    });

    return updatedUser;
  }

  // NOVO: Implementação do remove
  async remove(id: string) {
    // Primeiro, verifica se o usuário existe
    await this.findOne(id);

    // Deleta o usuário
    await this.prisma.profile.delete({
      where: { id },
    });

    // Retorna uma confirmação ou nada (status 204 No Content)
    return;
  }
}