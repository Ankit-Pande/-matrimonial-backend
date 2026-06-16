import { Request, Response } from "express";
import { authService } from "../service/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";

// Token cookie me nahi — response body me. Web localStorage/memory, Android secure storage
// me rakhta hai. authCheck "Authorization: Bearer" header se padhta hai (web+Android same).

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const demoOtp = await authService.requestOtp(phone);
  // demoOtp tabhi aata hai jab SMS service set nahi (testing/demo deploy).
  res.json({
    success: true,
    message: "OTP sent successfully",
    ...(demoOtp ? { demoOtp } : {}),
  });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const { user, accessToken, refreshToken } =
    await authService.verifyOtpAndLogin(phone, otp);

  res.json({
    success: true,
    user: { id: user.id, phone: user.phone, role: user.role },
    accessToken,
    refreshToken,
  });
});

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("Refresh token required", 401);

    const tokens = await authService.refreshSession(refreshToken);
    res.json({ success: true, ...tokens });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.json({ success: true, message: "Logged out successfully" });
});
