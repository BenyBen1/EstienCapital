import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';

export const logRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
    );

    // Log to database if user is authenticated
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      supabase.auth.getUser(token).then(({ data: { user } }) => {
        if (user) {
          supabase.from('activity_logs').insert([
            {
              user_id: user.id,
              action: `${req.method} ${req.url}`,
              status_code: res.statusCode,
              duration,
              request_body: req.body,
              response_body: body,
              ip_address: req.ip,
              user_agent: req.headers['user-agent'],
            },
          ]);
        }
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

export const logError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  // Log error to database if user is authenticated
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    supabase.auth.getUser(token).then(({ data: { user } }) => {
      if (user) {
        supabase.from('error_logs').insert([
          {
            user_id: user.id,
            error_message: err.message,
            stack_trace: err.stack,
            request_url: req.url,
            request_method: req.method,
            request_body: req.body,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
          },
        ]);
      }
    });
  }

  next(err);
}; 