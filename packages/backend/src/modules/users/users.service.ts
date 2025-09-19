import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
    const { email, name, password } = createUserDto;

    const existingUser = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Um usuário com este e-mail já existe.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.prisma.profile.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
      },
      select: this.userSelect,
    });

    return user;
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