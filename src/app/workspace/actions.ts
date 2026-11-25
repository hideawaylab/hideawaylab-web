"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearCeoSessionCookie,
  clearLoginFailures,
  getClientIp,
  isAuthConfigured,
  isRateLimited,
  recordLoginFailure,
  setCeoSessionCookie,
  verifyEmail,
  verifyPassword,
} from "@/lib/auth";

export interface LoginActionState {
  error: string | null;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (!isAuthConfigured()) {
    return {
      error:
        "서버에 대표자 로그인 환경 변수(.env.local)가 아직 설정되지 않았습니다. 오라클 서버에서 CEO_EMAIL, CEO_PASSWORD_HASH, AUTH_SECRET을 설정해 주세요.",
    };
  }

  const clientIp = await getClientIp();
  if (isRateLimited(clientIp)) {
    return {
      error:
        "로그인 시도가 너무 많습니다. 보안을 위해 15분 뒤에 다시 시도해 주세요.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "이메일과 비밀번호를 모두 입력해 주세요.",
    };
  }

  const expectedEmail = process.env.CEO_EMAIL!.trim();
  const expectedHash = process.env.CEO_PASSWORD_HASH!.trim();

  const isEmailValid = verifyEmail(email, expectedEmail);
  const isPasswordValid = verifyPassword(password, expectedHash);

  if (!isEmailValid || !isPasswordValid) {
    recordLoginFailure(clientIp);
    // Small fixed delay slows automated credential stuffing attempts.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      error: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  clearLoginFailures(clientIp);
  await setCeoSessionCookie(expectedEmail);
  revalidatePath("/workspace");
  redirect("/workspace");
}

export async function logoutAction(): Promise<void> {
  await clearCeoSessionCookie();
  revalidatePath("/workspace");
  redirect("/workspace");
}
