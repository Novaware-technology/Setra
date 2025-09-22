import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    userRoles: {
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    },
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

  // `findMySelf` para o operator
  async findMySelf(currentUser: any) {
    return this.findOne(currentUser.userId);
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    const { role: newRoleName, ...profileData } = updateUserDto;

    const userToUpdate = await this.prisma.profile.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!userToUpdate) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    console.log(currentUser);
    console.log(userToUpdate);

    const userToUpdateRoles = userToUpdate.userRoles.map((ur) => ur.role.name);
    const isCurrentUserAnOperator = currentUser.roles.includes('operator');
    const isCurrentUserASupport = currentUser.roles.includes('support');

    // REGRA: Operator só pode atualizar a si mesmo
    if (isCurrentUserAnOperator && currentUser.userId !== id) {
      throw new ForbiddenException('Você não tem permissão para atualizar este usuário.');
    }

    // REGRA: Operator não pode mudar o perfil (role)
    if (isCurrentUserAnOperator && newRoleName) {
      throw new ForbiddenException('Você não tem permissão para alterar seu perfil.');
    }

    // REGRA: Support não pode atualizar um admin
    if (isCurrentUserASupport && userToUpdateRoles.includes('admin')) {
      throw new ForbiddenException('Você não tem permissão para atualizar um administrador.');
    }
    
    // Se uma nova senha for fornecida, criptografa-a
    if (profileData.password) {
      const saltRounds = 10;
      profileData.password = await bcrypt.hash(profileData.password, saltRounds);
    }
    const { password, ...data } = profileData;
    const dataToUpdate: any = { ...data };
    if (password) {
      dataToUpdate.passwordHash = password;
    }

    // Executa as atualizações em uma transação para garantir a integridade
    return this.prisma.$transaction(async (tx) => {
      // 1. Atualiza os dados do perfil (nome, senha, etc.)
      const updatedUser = await tx.profile.update({
        where: { id },
        data: dataToUpdate,
        select: this.userSelect,
      });

      // 2. Se um novo perfil foi informado, atualiza a tabela UserRole
      if (newRoleName) {
        const role = await tx.role.findUnique({ where: { name: newRoleName } });
        if (!role) {
          throw new BadRequestException(`O perfil "${newRoleName}" não existe.`);
        }

        // Apaga o perfil antigo e cria o novo
        await tx.userRole.deleteMany({ where: { profileId: id } });
        await tx.userRole.create({
          data: {
            profileId: id,
            roleId: role.id,
          },
        });
      }
      return updatedUser;
    });
  }

  // NOVO: Implementação do remove
  async remove(id: string, currentUser: any) {
    const userToRemove = await this.prisma.profile.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });

    if (!userToRemove) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }

    const userToRemoveRoles = userToRemove.userRoles.map(ur => ur.role.name);
    const isCurrentUserASupport = currentUser.roles.includes('support');

    // REGRA: Support não pode deletar um admin
    if (isCurrentUserASupport && userToRemoveRoles.includes('admin')) {
      throw new ForbiddenException('Você não tem permissão para deletar um administrador.');
    }

    await this.prisma.profile.delete({ where: { id } });
    return;
  }
}