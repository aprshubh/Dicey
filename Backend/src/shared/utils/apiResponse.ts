import { Response } from 'express';
import { HttpStatusCode, HttpStatus } from '../constants/httpStatus';

export interface IApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: HttpStatusCode = HttpStatus.OK,
    message: string = 'Success',
    data?: T,
    meta?: Record<string, unknown>
  ): Response {
    const responsePayload: IApiResponse<T> = {
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };

    return res.status(statusCode).json(responsePayload);
  }

  static success<T>(
    res: Response,
    message: string = 'Operation successful',
    data?: T,
    meta?: Record<string, unknown>,
    statusCode: HttpStatusCode = HttpStatus.OK
  ): Response {
    return this.send(res, statusCode, message, data, meta);
  }

  static created<T>(
    res: Response,
    message: string = 'Resource created successfully',
    data?: T
  ): Response {
    return this.send(res, HttpStatus.CREATED, message, data);
  }
}
