import { Request, Response } from 'express';

export interface IServerController {
  handleIndex(req: Request, res: Response, recursive: boolean): Promise<void>;
  handleViewFile(req: Request, res: Response): Promise<void>;
  handleRawHtml(req: Request, res: Response): Promise<void>;
}