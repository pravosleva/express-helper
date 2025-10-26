import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

/**
 * Загружает один файл из формы и сохраняет его в память.
 *
 * @param value Имя поля формы (атрибут `name`).
 * @returns Middleware для Express, обрабатывающий файл.
 */
export const uploadFileMiddleware = (value: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await new Promise<void>((resolve, reject) => {
        // as any для быстрого исправления конфликта multer и express
        // todo: по возможности исправить корректно
        multer({ storage: storage }).single(value)(req as any, res as any, error => {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};
