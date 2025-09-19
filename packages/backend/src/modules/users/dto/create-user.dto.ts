import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';


enum UserRole {
  ADMIN = 'admin',
  SUPPORT = 'support',
  OPERATOR = 'operator',
}
export class CreateUserDto {
  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo nome não pode estar vazio.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo senha não pode estar vazio.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  password: string;

  @IsEnum(UserRole, { message: 'O perfil informado não é válido.' })
  @IsNotEmpty({ message: 'O perfil do usuário deve ser informado.' })
  role: string;
}