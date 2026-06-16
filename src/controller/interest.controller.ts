import { Request, Response } from "express";
import { interestService } from "../service/interest.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ListInterestQuery } from "../validation/interest.validation";

export const sendInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const interest = await interestService.send(
      req.user!.userId,
      req.body.toUserId
    );
    res.status(201).json({ success: true, interest });
  }
);

export const respondInterest = asyncHandler(
  async (req: Request, res: Response) => {
    const interest = await interestService.respond(
      req.user!.userId,
      req.params.id,
      req.body.action
    );
    res.json({ success: true, interest });
  }
);

export const sentInterests = asyncHandler(
  async (req: Request, res: Response) => {
    const q = req.query as unknown as ListInterestQuery;
    const result = await interestService.listSent(
      req.user!.userId,
      q.cursor,
      q.limit
    );
    res.json({ success: true, ...result });
  }
);

export const receivedInterests = asyncHandler(
  async (req: Request, res: Response) => {
    const q = req.query as unknown as ListInterestQuery;
    const result = await interestService.listReceived(
      req.user!.userId,
      q.cursor,
      q.limit
    );
    res.json({ success: true, ...result });
  }
);
