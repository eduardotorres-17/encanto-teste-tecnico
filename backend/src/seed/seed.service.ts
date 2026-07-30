import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity'; 
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const supportEmail = 'suporte@encanto.com';
    const userExists = await this.usersRepository.findOne({ 
      where: { email: supportEmail } 
    });

    if (!userExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const supportUser = this.usersRepository.create({
        name: 'Suporte Encanto',
        email: supportEmail,
        passwordHash,
        role: 'support',
      });

      await this.usersRepository.save(supportUser);
      console.log('✅ Usuário de suporte criado: suporte@encanto.com | Senha: admin123');
    }
  }
}