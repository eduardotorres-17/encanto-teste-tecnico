import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString({ message: 'A mensagem deve ser um texto válido' })
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia' })
  text: string;
}
