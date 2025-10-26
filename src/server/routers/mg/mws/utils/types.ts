/**
 * API модель загруженного файла.
 *
 */
export interface IUploadedFile {
  /** Имя файла (оригинальное название, переданное клиентом). */
  name: string;

  /** MIME-тип файла, например `image/png` или `application/pdf`. */
  mimeType: string;

  /** Размер файла в байтах. */
  size: number;

  /** Содержимое файла в виде буфера. */
  data: Buffer;
}
