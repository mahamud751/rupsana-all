import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { diskStorage } from 'multer';
import { AdminOnly } from '../common/decorators/auth.decorator.js';
import { UPLOADS_DIR } from './uploads.constants.js';

class UploadResultEntity {
  /** Path to store in imageUrl fields, e.g. /uploads/abc.jpg */
  url: string;
}

@ApiTags('Admin · Uploads')
@AdminOnly()
@Controller('admin/uploads')
export class UploadsController {
  @Post()
  @ApiOperation({
    summary: 'Upload a product, category or banner image (max 5 MB)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) =>
          cb(
            null,
            `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
          ),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        cb(
          /^image\/(jpeg|png|webp)$/.test(file.mimetype)
            ? null
            : new BadRequestException(
                'Only JPG, PNG or WebP images are allowed',
              ),
          /^image\/(jpeg|png|webp)$/.test(file.mimetype),
        ),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File): UploadResultEntity {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return { url: `/uploads/${file.filename}` };
  }
}
