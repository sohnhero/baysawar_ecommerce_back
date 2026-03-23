import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      // Zod v4 uses .issues, Zod v3 uses .errors — handle both
      console.log("Validation caught an error!");
      console.log("Error keys:", Object.keys(error));
      const issues = error.issues || error.errors;
      if (Array.isArray(issues) && issues.length > 0) {
        const messages = issues.map((e: any) => {
          const path = Array.isArray(e.path) ? e.path.join('.') : '';
          return path ? `${path}: ${e.message}` : e.message;
        }).join(', ');
        console.error("Validation Error [Array]:", messages);
        return res.status(400).json({ error: messages });
      }
      console.error("Validation Error [Generic]:", error.message || error);
      return res.status(400).json({ error: error.message || "Validation failed" });
    }
  };
};
