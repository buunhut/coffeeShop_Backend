import { Injectable } from '@nestjs/common';
import { CreateNodejDto } from './dto/create-nodej.dto';
import { PrismaClient } from '@prisma/client';
import { ExtraService } from 'src/service';

const prisma = new PrismaClient();

@Injectable()
export class NodejsService {
  constructor(private readonly extraService: ExtraService) {}

  async create(body: CreateNodejDto) {
    try {
      const create = await prisma.nodejsContact.create({
        data: body,
      });
      return this.extraService.response(200, 'done', body);
    } catch (error) {
      return this.extraService.response(500, 'lỗi BE', error);
    }
  }

  async getTeams() {
    try {
      const listTeams = await prisma.nodejsTeams.findMany({
        where: {
          isDelete: false,
        },
      });
      return this.extraService.response(200, 'list teams', listTeams);
    } catch (error) {
      console.log(error);
    }
  }
}
