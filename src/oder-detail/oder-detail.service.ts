import { Injectable } from '@nestjs/common';
import { CreateOderDetailDto } from './dto/create-oder-detail.dto';
import { UpdateOderDetailDto } from './dto/update-oder-detail.dto';

@Injectable()
export class OderDetailService {
  create(createOderDetailDto: CreateOderDetailDto) {
    return 'This action adds a new oderDetail';
  }

  findAll() {
    return `This action returns all oderDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oderDetail`;
  }

  update(id: number, updateOderDetailDto: UpdateOderDetailDto) {
    return `This action updates a #${id} oderDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} oderDetail`;
  }
}
