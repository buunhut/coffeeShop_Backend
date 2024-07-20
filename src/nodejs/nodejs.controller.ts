import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NodejsService } from './nodejs.service';
import { CreateNodejDto } from './dto/create-nodej.dto';
import { UpdateNodejDto } from './dto/update-nodej.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('nodejs')
@Controller('nodejs')
export class NodejsController {
  constructor(private readonly nodejsService: NodejsService) {}

  @Post()
  create(@Body() body: CreateNodejDto) {
    return this.nodejsService.create(body);
  }
}
