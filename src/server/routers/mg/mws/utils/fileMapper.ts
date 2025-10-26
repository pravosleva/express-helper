import { IUploadedFile } from './types';


export const mapMulterFileToUploadedFile = (file: Express.Multer.File): IUploadedFile => ({
  name: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  data: file.buffer
});
